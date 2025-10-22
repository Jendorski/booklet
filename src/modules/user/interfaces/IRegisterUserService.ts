import { IUser } from '../../../database/models/User.model';
import { RegisterUserDTO } from '../dtos/RegisterUserDTO';

export interface IRegisterUserService {
    registerUser(payload: RegisterUserDTO): Promise<
        Partial<
            IUser & {
                bearerTokenExpiry: number;
                brearToken: string;
            }
        >
    >;
}
