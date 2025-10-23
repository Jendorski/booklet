import { container } from 'tsyringe';
import { Cache } from '../../../cache/Cache';
import {
    IApartment,
    IApartmentAmenities
} from '../../../database/models/Apartment.model';
import { IUser, UserStatus } from '../../../database/models/User.model';
import { JWTService } from '../../../shared/jwt/JWTService';
import { registerSharedComponents } from '../../../shared/registerSharedComponents';
import { registerApartmentComponents } from '../../apartment/registerApartmentComponents';
import { ApartmentRepository } from '../../apartment/repositories/Apartment.repository';
import { registerUserComponents } from '../../user/registerUserComponents';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { registerBookingComponents } from '../registerBookingComponents';
import { BookingRepository } from '../repositories/Booking.repository';
import { ApartmentComponents } from '../../apartment/constants/ApartmentComponents';
import { BookingComponents } from '../constants/BookingComponents';
import { UserComponents } from '../../user/constants/UserComponent';
import { CacheComponents } from '../../../cache/cacheComponents';
import { Components } from '../../../shared/constants/Components';
import { CachePrefix } from '../../../cache/CachePrefix';
import Redis from 'ioredis';
import { cacheConnection } from '../../../cache/cacheConnection';
import { NewBookingService } from '../services/NewBooking.service';
import Moment from '../../../shared/utils/momentHelper';
import expect from 'expect';
import supertest from 'supertest';
import { server } from '../../..';

describe('Bookings for An Apartment Controller', () => {
    let createUserRepository: CreateUserRepository;
    let jwtService: JWTService;
    let apartmentRepo: ApartmentRepository;
    let host: Partial<IUser>;
    let guest: Partial<IUser>;
    let apartment: Partial<IApartment>;
    let bookingService: NewBookingService;
    let cache: Cache;
    let jwtToken: string;
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

        bookingService = container.resolve<NewBookingService>(
            BookingComponents.NewBookingService
        );

        createUserRepository = container.resolve<CreateUserRepository>(
            UserComponents.CreateUserRepository
        );

        cache = container.resolve<Cache>(CacheComponents.Cache);

        jwtService = container.resolve<JWTService>(Components.JWTService);

        const { hash } = await jwtService.passwordHash('123456');

        host = await createUserRepository.create({
            email: 'john.doe@test.com',
            fullName: 'John Doe',
            password: hash,
            type: 'host',
            emailVerified: true
        });

        guest = await createUserRepository.create({
            email: 'alice.bob@test.com',
            fullName: 'Alice Bob',
            password: hash,
            type: 'guest',
            emailVerified: true
        });

        const { apartmentUUID } = await apartmentRepo.add({
            apartment: {
                title: 'The Havana',
                description:
                    'Discover peace and comfort in this beautifully designed two-bedroom apartment.',
                bedrooms: 2,
                toilets: 2,
                bathrooms: 1,
                amenities: [
                    IApartmentAmenities.AIR_CONDITIONING,
                    IApartmentAmenities.WIFI,
                    IApartmentAmenities.GAS_COOKER,
                    IApartmentAmenities.INVERTER,
                    IApartmentAmenities.KITCHEN
                ],
                location: 'Lekki, Lagos',
                cautionFee: 50000,
                pricePerNight: 200000,
                hostName: host.fullName,
                hostUUID: host.uuid
            }
        });
        apartment = { uuid: apartmentUUID };
    });

    beforeEach(async () => {
        jwtToken = (await jwtService.jwtSign({
            payload: {
                userUUID: guest.uuid as unknown as string,
                status: guest.status as UserStatus
            },
            validity: '10',
            timeUnit: 'm'
        })) as string;

        const key = `${CachePrefix.USER_JWT_TOKEN}/${guest.uuid as unknown as string}`;

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
            bookingRepo.truncate(),
            (cacheConnection as Redis).flushall()
        ]);
    });

    it('should fetch the bookings for an apartment', async () => {
        await bookingService.addNewBooking({
            userUUID: guest.uuid as string,
            payload: {
                apartmentUUID: apartment.uuid as string,
                checkInDate: Moment.thisDayToCome(1).format('YYYY-MM-DD'),
                checkOutDate: Moment.thisDayToCome(8).format('YYYY-MM-DD'),
                numberOfNights: 7
            }
        });

        await supertest(server)
            .get(`/api/v1/booking/apartment/${apartment.uuid}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    message: 'Bookings for an apartment fetched successfully',
                    data: {
                        data: expect.any(Array),
                        first: true,
                        last: true,
                        limit: 5,
                        page: 1,
                        pages: 1,
                        total: 1
                    },
                    status: 'success'
                });
            });
    });
});
