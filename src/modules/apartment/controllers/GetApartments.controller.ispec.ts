import Redis from 'ioredis';
import { container } from 'tsyringe';
import { cacheConnection } from '../../../cache/cacheConnection';
import { IUser } from '../../../database/models/User.model';
import { Components } from '../../../shared/constants/Components';
import { JWTService } from '../../../shared/jwt/JWTService';
import { registerSharedComponents } from '../../../shared/registerSharedComponents';
import { BookingComponents } from '../../booking/constants/BookingComponents';
import { registerBookingComponents } from '../../booking/registerBookingComponents';
import { BookingRepository } from '../../booking/repositories/Booking.repository';
import { UserComponents } from '../../user/constants/UserComponent';
import { registerUserComponents } from '../../user/registerUserComponents';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { registerApartmentComponents } from '../registerApartmentComponents';
import { ApartmentRepository } from '../repositories/Apartment.repository';
import { seededHosts } from '../../user/constants/seedUsers';
import { randomNumberBetween } from '../../../shared/utils/helpers';
import { seededApartments } from '../constants/seedApartments';
import supertest from 'supertest';
import { server } from '../../..';
import expect from 'expect';

describe('Get Apartments Controller ', () => {
    let createUserRepository: CreateUserRepository;
    let jwtService: JWTService;
    let apartmentRepo: ApartmentRepository;
    let bookingRepo: BookingRepository;

    before(async () => {
        registerSharedComponents();
        registerUserComponents();
        registerApartmentComponents();
        registerBookingComponents();

        apartmentRepo = container.resolve<ApartmentRepository>(
            ApartmentComponents.ApartmentRespository
        );

        bookingRepo = container.resolve<BookingRepository>(
            BookingComponents.BookingRepository
        );

        createUserRepository = container.resolve<CreateUserRepository>(
            UserComponents.CreateUserRepository
        );

        jwtService = container.resolve<JWTService>(Components.JWTService);

        const { hash } = await jwtService.passwordHash('123456');

        const newHosts: { fullName: string; uuid: string }[] = [];
        for (const host of seededHosts) {
            const user = await createUserRepository.create({
                email: host.email,
                fullName: host.fullName,
                password: hash,
                type: 'host',
                emailVerified: true
            });
            newHosts.unshift({
                fullName: user.fullName as string,
                uuid: user.uuid as string
            });
        }

        for (const apartment of seededApartments) {
            const rdnm = randomNumberBetween(0, newHosts.length - 1);
            const newUser = newHosts.at(rdnm) as IUser;
            await apartmentRepo.add({
                apartment: {
                    ...apartment,
                    hostName: newUser.fullName,
                    hostUUID: newUser.uuid
                }
            });
        }
    });

    after(async () => {
        await Promise.all([
            apartmentRepo.truncate(),
            createUserRepository.truncate(),
            bookingRepo.truncate(),
            (cacheConnection as Redis).flushall()
        ]);
    });

    it('should fetch a list of apartments between the minPrice of 100 to 300, with a limit of 5', async () => {
        const query = 'minPrice=100&maxPrice=300&limit=5';
        await supertest(server)
            .get(`/api/v1/apartments?${query}`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    status: 'success',
                    message: 'Apartments retrieved successfully',
                    data: {
                        total: expect.any(Number),
                        records: expect.any(Array)
                    }
                });
            });
    });
});
