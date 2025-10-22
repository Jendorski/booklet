import { IUser } from '../../../database/models/User.model';

export interface ILoginUserService {
    login(props: {
        email: string;
        password: string;
    }): Promise<
        Partial<IUser> & { bearerToken: string; bearerTokenExpiry: number }
    >;
}
