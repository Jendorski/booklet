import { IUser, UserStatus } from '../../../database/models/User.model';
import { IJWTkeyProps } from '../JWTService';
import { TimeUnit } from '../../utils/momentHelper';

export interface UserAuthToken {
    userUUID: string;
    status: UserStatus;
    expiry?: Date;
    email?: string;
}

export interface IJwtService {
    jwtSign(props: {
        payload: UserAuthToken;
        validity: string | number;
        timeUnit?: TimeUnit;
    }): Promise<string | null>;
    jwtVerify(token: string): Promise<UserAuthToken | null>;
    jwtPayload(user: Partial<IUser>): UserAuthToken;
    generateJWTSecret: () => Promise<IJWTkeyProps>;
    passwordHash: (
        password: string
    ) => Promise<{ isError: boolean; hash: string }>;
    comparePasswordHash(
        hashed: string,
        plainPassword: string
    ): Promise<boolean>;
    genericHash(toHash: string): Promise<{ isError: boolean; hash: string }>;
    compareGenericHash(hashed: string, plain: string): Promise<boolean>;
    jwtPayload(user: Partial<IUser>): UserAuthToken;
}
