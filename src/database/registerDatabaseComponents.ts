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

    return sql;
};
