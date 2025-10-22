import { IUser } from '../../../database/models/User.model';

export interface ICreateUserRepository {
    create(user: Partial<IUser>): Promise<Partial<IUser>>;
    truncate(): Promise<void>;
}
