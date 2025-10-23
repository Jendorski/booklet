import Redis from 'ioredis';
import { container } from 'tsyringe';
import { Cache } from '../../../cache/Cache';
import { CacheComponents } from '../../../cache/cacheComponents';
import { cacheConnection } from '../../../cache/cacheConnection';
import { CachePrefix } from '../../../cache/CachePrefix';
import { IUser, UserStatus } from '../../../database/models/User.model';
import { Components } from '../../../shared/constants/Components';
import { JWTService } from '../../../shared/jwt/JWTService';
import { registerSharedComponents } from '../../../shared/registerSharedComponents';
import { UserComponents } from '../../user/constants/UserComponent';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { ApartmentRepository } from '../repositories/Apartment.repository';
import { AddApartmentDTO } from '../dtos/AddApartmentDTO';
import { IApartmentAmenities } from '../../../database/models/Apartment.model';
import supertest from 'supertest';
import { server } from '../../..';
import expect from 'expect';

describe('Create Apartment Controller', () => {
    let createUserRepository: CreateUserRepository;
    let jwtService: JWTService;
    let apartmentRepo: ApartmentRepository;
    let user: Partial<IUser>;
    let jwtToken: string;
    let cache: Cache;

    before(async () => {
        registerSharedComponents();

        cache = container.resolve<Cache>(CacheComponents.Cache);

        jwtService = container.resolve<JWTService>(Components.JWTService);
        apartmentRepo = container.resolve<ApartmentRepository>(
            ApartmentComponents.ApartmentRespository
        );

        createUserRepository = container.resolve<CreateUserRepository>(
            UserComponents.CreateUserRepository
        );
        const { hash } = await jwtService.passwordHash('123456');

        user = await createUserRepository.create({
            email: 'john.doe@test.com',
            fullName: 'John Doe',
            password: hash,
            type: 'host',
            emailVerified: true
        });

        jwtToken = (await jwtService.jwtSign({
            payload: {
                userUUID: user.uuid as unknown as string,
                status: user.status as UserStatus
            },
            validity: '10',
            timeUnit: 'm'
        })) as string;

        const key = `${CachePrefix.USER_JWT_TOKEN}/${user.uuid as unknown as string}`;

        await cache.set({
            key,
            value: jwtToken,
            expiryInSeconds: 200
        });
    });

    after(async () => {
        await Promise.all([
            apartmentRepo.truncate(),
            createUserRepository.truncate(),
            (cacheConnection as Redis).flushall()
        ]);
    });

    it('should create an apartment', async () => {
        const newApartmentDTO: AddApartmentDTO = {
            amenities: [
                IApartmentAmenities.AIR_CONDITIONING,
                IApartmentAmenities.CAR_GARAGE,
                IApartmentAmenities.DRYER
            ],
            bathroom: 1,
            bedrooms: 1,
            toilets: 1,
            pricePerNight: 100,
            cautionFee: 10,
            description: 'Exquisite 1-bedroom apartment for short stay',
            title: 'Best Short-stay',
            location: 'Oregun, Ikeja'
        };

        await supertest(server)
            .post('/api/v1/apartment')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(newApartmentDTO)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    status: 'success',
                    message: 'Apartment created successfully'
                });
            });
    });
});
