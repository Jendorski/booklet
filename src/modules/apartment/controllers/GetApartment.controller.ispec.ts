import { container } from 'tsyringe';
import { IUser, UserStatus } from '../../../database/models/User.model';
import { Components } from '../../../shared/constants/Components';
import { JWTService } from '../../../shared/jwt/JWTService';
import { registerSharedComponents } from '../../../shared/registerSharedComponents';
import { UserComponents } from '../../user/constants/UserComponent';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { ApartmentRepository } from '../repositories/Apartment.repository';
import supertest from 'supertest';
import { server } from '../../..';
import { CachePrefix } from '../../../cache/CachePrefix';
import { Cache } from '../../../cache/Cache';
import { CacheComponents } from '../../../cache/cacheComponents';
import { cacheConnection } from '../../../cache/cacheConnection';
import Redis from 'ioredis';
import expect from 'expect';

describe('Get Apartment Controller', () => {
    let createUserRepository: CreateUserRepository;
    let apartmentUUID: string;
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

        const { apartmentUUID: _aUUID } = await apartmentRepo.add({
            apartment: {
                title: 'Exquisite 3 bedroom for short stay',
                description:
                    'This 3 bedroom is excellent for a family with 2 kids',
                toilets: 3,
                bedrooms: 3,
                bathrooms: 3,
                pricePerNight: 10000,
                location: 'Oregun, Ikeja',
                cautionFee: 30000,
                hostName: user.fullName,
                hostUUID: user.uuid as string
            }
        });
        apartmentUUID = _aUUID;
    });

    beforeEach(async () => {
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

    afterEach(async () => {
        await apartmentRepo.truncate();
    });

    after(async () => {
        await Promise.all([
            apartmentRepo.truncate(),
            createUserRepository.truncate(),
            (cacheConnection as Redis).flushall()
        ]);
    });

    it('should fetch details of an apartment', async () => {
        await supertest(server)
            .get(`/api/v1/apartment/${apartmentUUID}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    status: 'success',
                    message: 'Apartment retrieved successfully',
                    data: {
                        bathrooms: 3,
                        bedrooms: 3,
                        cautionFee: 30000,
                        createdAt: expect.any(String),
                        description:
                            'This 3 bedroom is excellent for a family with 2 kids',
                        hostName: 'John Doe',
                        hostUUID: expect.any(String),
                        location: 'Oregun, Ikeja',
                        pricePerNight: 10000,
                        status: 'available',
                        title: 'Exquisite 3 bedroom for short stay',
                        toilets: 3,
                        updatedAt: expect.any(String)
                    }
                });
            });
    });
});
