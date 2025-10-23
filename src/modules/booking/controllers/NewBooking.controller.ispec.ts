/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Redis from 'ioredis';
import { container } from 'tsyringe';
import { cacheConnection } from '../../../cache/cacheConnection';
import {
    IApartment,
    IApartmentAmenities,
    IApartmentStatus
} from '../../../database/models/Apartment.model';
import { IUser, UserStatus } from '../../../database/models/User.model';
import { Components } from '../../../shared/constants/Components';
import { JWTService } from '../../../shared/jwt/JWTService';
import { registerSharedComponents } from '../../../shared/registerSharedComponents';
import Moment from '../../../shared/utils/momentHelper';
import { ApartmentComponents } from '../../apartment/constants/ApartmentComponents';
import { registerApartmentComponents } from '../../apartment/registerApartmentComponents';
import { ApartmentRepository } from '../../apartment/repositories/Apartment.repository';
import { UserComponents } from '../../user/constants/UserComponent';
import { registerUserComponents } from '../../user/registerUserComponents';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { BookingComponents } from '../constants/BookingComponents';
import { NewBookingDTO } from '../dtos/NewBookingDTO';
import { registerBookingComponents } from '../registerBookingComponents';
import { BookingRepository } from '../repositories/Booking.repository';
import expect from 'expect';
import supertest from 'supertest';
import { server } from '../../..';
import { CachePrefix } from '../../../cache/CachePrefix';
import { Cache } from '../../../cache/Cache';
import { CacheComponents } from '../../../cache/cacheComponents';

describe('New Booking Controller', () => {
    let createUserRepository: CreateUserRepository;
    let jwtService: JWTService;
    let apartmentRepo: ApartmentRepository;
    let host: Partial<IUser>;
    let guest: Partial<IUser>;
    let apartment: Partial<IApartment>;
    let bookingRepo: BookingRepository;
    let cache: Cache;
    let jwtToken: string;

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

    it('should throw a custom exception if the check-in date is behind the current date', async () => {
        const bookingPayload: NewBookingDTO = new NewBookingDTO();
        bookingPayload.apartmentUUID = apartment.uuid as string;
        bookingPayload.checkInDate = Moment.subtract(new Date(), 2, 'd').format(
            'YYYY-MM-DD'
        );
        bookingPayload.checkOutDate =
            Moment.thisDayToCome(7).format('YYYY-MM-DD');
        bookingPayload.numberOfNights = 7;

        await supertest(server)
            .post('/api/v1/booking/new')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(bookingPayload)
            .expect(417, {
                status: 'error',
                message:
                    'The checkInDate must be today or sometime in the future',
                data: {}
            });
    });

    it('should throw a custom exception if the check-out date is behind the current date', async () => {
        const bookingPayload: NewBookingDTO = new NewBookingDTO();
        bookingPayload.apartmentUUID = apartment.uuid as string;
        bookingPayload.checkInDate =
            Moment.thisDayToCome(7).format('YYYY-MM-DD');
        bookingPayload.checkOutDate = Moment.subtract(
            new Date(),
            2,
            'd'
        ).format('YYYY-MM-DD');
        bookingPayload.numberOfNights = 7;

        await supertest(server)
            .post('/api/v1/booking/new')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(bookingPayload)
            .expect(417, {
                status: 'error',
                message: 'The checkOutDate must be sometime in the future',
                data: {}
            });
    });

    it('should book an apartment', async () => {
        const { apartmentUUID } = await apartmentRepo.add({
            apartment: {
                status: IApartmentStatus.AVAILABLE,
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

        const bookingPayload: NewBookingDTO = new NewBookingDTO();
        bookingPayload.apartmentUUID = apartmentUUID;
        bookingPayload.checkInDate =
            Moment.thisDayToCome(1).format('YYYY-MM-DD');
        bookingPayload.checkOutDate =
            Moment.thisDayToCome(8).format('YYYY-MM-DD');
        bookingPayload.numberOfNights = 7;

        await supertest(server)
            .post('/api/v1/booking/new')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send(bookingPayload)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    message: 'Apartment booked successfully',
                    data: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        reference: expect.any(String),
                        totalAmountToPay: expect.any(Number)
                    },
                    status: 'success'
                });
            });
    });
});
