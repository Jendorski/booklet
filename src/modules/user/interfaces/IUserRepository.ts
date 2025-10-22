import { IUser } from '../../../database/models/User.model';

export interface IUserRepository {
    findOne(user: {
        uuid?: string;
        email?: string;
    }): Promise<Partial<IUser> | null>;

    retrieveOne(uuid: string): Promise<Partial<IUser> | null>;

    count(user: { uuid?: string; email?: string }): Promise<number>;

    truncate(): Promise<void>;
}
