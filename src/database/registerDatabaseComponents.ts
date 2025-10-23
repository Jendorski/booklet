/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { container } from 'tsyringe';
import { DatabaseComponents } from './constants/DatabaseComponents';
import { DatabaseConnection } from './services/DatabaseConnection';
import { IDatabaseConnection } from './interfaces/IDatabaseConnection';
import { IApartmentRepository } from '../modules/apartment/interfaces/IApartmentRepository';
import { ApartmentRepository } from '../modules/apartment/repositories/Apartment.repository';
import { ApartmentComponents } from '../modules/apartment/constants/ApartmentComponents';
import { CacheComponents } from '../cache/cacheComponents';
import { Cache } from '../cache/Cache';
import { ICreateUserRepository } from '../modules/user/interfaces/ICreateUserRepository';
import { UserComponents } from '../modules/user/constants/UserComponent';
import { CreateUserRepository } from '../modules/user/repositories/CreateUser.repository';
import { IUserRepository } from '../modules/user/interfaces/IUserRepository';
import { UserRepository } from '../modules/user/repositories/User.repository';
import { registerCacheComponents } from '../cache/registerCacheComponents';
import { IBookingRepository } from '../modules/booking/interfaces/IBookingRepository';
import { BookingComponents } from '../modules/booking/constants/BookingComponents';
import { BookingRepository } from '../modules/booking/repositories/Booking.repository';
import { JWTService } from '../shared/jwt/JWTService';
import { seededHosts } from '../modules/user/constants/seedUsers';
import { Components } from '../shared/constants/Components';
import { seededApartments } from '../modules/apartment/constants/seedApartments';
import { randomNumberBetween } from '../shared/utils/helpers';
import { IUser } from './models/User.model';

export const registerDatabaseComponents = async (allowMigration: boolean) => {
    container.register<IDatabaseConnection>(
        DatabaseComponents.DatabaseConnection,
        {
            useClass: DatabaseConnection
        }
    );

    const db = new DatabaseConnection();
    const sql = await db.initializePool(allowMigration);

    registerCacheComponents();

    //register the repositories here
    container.register<IApartmentRepository>(
        ApartmentComponents.ApartmentRespository,
        {
            useValue: new ApartmentRepository(
                db,
                container.resolve<Cache>(CacheComponents.Cache)
            )
        }
    );

    container.register<ICreateUserRepository>(
        UserComponents.CreateUserRepository,
        {
            useValue: new CreateUserRepository(db)
        }
    );

    container.register<IUserRepository>(UserComponents.UserRepository, {
        useValue: new UserRepository(
            container.resolve<Cache>(CacheComponents.Cache),
            db
        )
    });

    container.register<IBookingRepository>(
        BookingComponents.BookingRepository,
        {
            useValue: new BookingRepository(
                db,
                container.resolve<Cache>(CacheComponents.Cache)
            )
        }
    );

    return sql;
};

export const seedDefaultInformation = async () => {
    const jwtService = container.resolve<JWTService>(Components.JWTService);

    const apartmentRepo = container.resolve<ApartmentRepository>(
        ApartmentComponents.ApartmentRespository
    );

    const createUserRepository = container.resolve<CreateUserRepository>(
        UserComponents.CreateUserRepository
    );

    const { hash } = await jwtService.passwordHash('123456');

    const newHosts: { fullName: string; uuid: string }[] = [];
    for (const host of seededHosts) {
        console.log({ host });
        const user = await createUserRepository.create({
            email: host.email,
            fullName: host.fullName,
            password: hash,
            type: 'host',
            emailVerified: true
        });
        console.log({ user });
        newHosts.unshift({
            fullName: user.fullName as string,
            uuid: user.uuid as string
        });
    }

    for (const apartment of seededApartments) {
        const rdnm = randomNumberBetween(0, newHosts.length - 1);
        console.log({ rdnm });
        const newUser = newHosts.at(rdnm) as IUser;
        console.log({ newUser });
        await apartmentRepo.add({
            apartment: {
                ...apartment,
                hostName: newUser.fullName,
                hostUUID: newUser.uuid
            }
        });
    }
};
