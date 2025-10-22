import { inject, singleton } from 'tsyringe';
import { IUser, UserStatus } from '../../../database/models/User.model';
import { IRegisterUserService } from '../interfaces/IRegisterUserService';
import { RegisterUserDTO } from '../dtos/RegisterUserDTO';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import { UserComponents } from '../constants/UserComponent';
import { ICreateUserRepository } from '../interfaces/ICreateUserRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CachePrefix } from '../../../cache/CachePrefix';
import httpStatus from 'http-status';
import { Components } from '../../../shared/constants/Components';
import { IJwtService } from '../../../shared/jwt/interface/IJwtService';

@singleton()
export class RegisterUserService implements IRegisterUserService {
    constructor(
        @inject(CacheComponents.Cache) private readonly cache: ICache,
        @inject(Components.JWTService) private readonly jwtService: IJwtService,
        @inject(UserComponents.CreateUserRepository)
        private readonly createUserRepo: ICreateUserRepository,
        @inject(UserComponents.UserRepository)
        private readonly userRepo: IUserRepository
    ) {}

    registerUser = async (
        payload: RegisterUserDTO
    ): Promise<
        Partial<IUser & { bearerTokenExpiry: number; bearerToken: string }>
    > => {
        const { email, password, confirmPassword, fullName, type } = payload;

        if (password !== confirmPassword) {
            throw new CustomException('password does not match');
        }

        const exists = await this.userRepo.findOne({ email });

        if (exists) {
            throw new CustomException(
                'User already exists',
                httpStatus.CONFLICT
            );
        }

        const { isError, hash } = await this.jwtService.passwordHash(password);

        if (isError) {
            throw new CustomException(
                'Internal Server Error',
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }

        const newUser: Partial<IUser> = {
            fullName,
            email,
            emailVerified: true,
            password: hash,
            type
        };

        const complete = await this.createUserRepo.create(newUser);
        console.log({ complete });
        const jwtPayload = this.jwtService.jwtPayload({
            uuid: complete.uuid,
            status: UserStatus.ACTIVE
        });

        const bearerToken = await this.jwtService.jwtSign({
            payload: jwtPayload,
            validity: '7d'
        });

        if (!bearerToken) {
            throw new CustomException(
                'Internal Server Error',
                httpStatus.INTERNAL_SERVER_ERROR
            );
        }

        await this.cache.set({
            key: `${CachePrefix.USER_JWT_TOKEN}/${complete.uuid}`,
            value: bearerToken,
            expiryInSeconds: 604800
        });

        return {
            bearerTokenExpiry: 604800, //7 days
            bearerToken
        };
    };
}
