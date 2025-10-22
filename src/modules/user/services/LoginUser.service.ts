import { inject, singleton } from 'tsyringe';
import { IUser } from '../../../database/models/User.model';
import { UserComponents } from '../constants/UserComponent';
import { IUserRepository } from '../interfaces/IUserRepository';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import { Components } from '../../../shared/constants/Components';
import { IJwtService } from '../../../shared/jwt/interface/IJwtService';
import { CustomException } from '../../../shared/exceptions/CustomException';
import httpStatus from 'http-status';
import { CachePrefix } from '../../../cache/CachePrefix';
import { ILoginUserService } from '../interfaces/ILoginUserService';

@singleton()
export class LoginUserService implements ILoginUserService {
    constructor(
        @inject(UserComponents.UserRepository)
        private readonly userRepo: IUserRepository,
        @inject(CacheComponents.Cache) private readonly cache: ICache,
        @inject(Components.JWTService) private readonly jwtService: IJwtService
    ) {}

    login = async (props: {
        email: string;
        password: string;
    }): Promise<
        Partial<IUser> & { bearerToken: string; bearerTokenExpiry: number }
    > => {
        const { email, password } = props;

        const user = await this.userRepo.findOne({ email });

        if (!user) {
            throw new CustomException('No such user', httpStatus.NOT_FOUND);
        }

        const correctPassword = await this.jwtService.comparePasswordHash(
            user.password as string,
            password
        );

        if (!correctPassword) {
            throw new CustomException(
                'Invalid Credentials!',
                httpStatus.UNAUTHORIZED
            );
        }

        const jwtPayload = this.jwtService.jwtPayload({
            uuid: user.uuid,
            status: user.status
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
            key: `${CachePrefix.USER_JWT_TOKEN}/${user.uuid}`,
            value: bearerToken,
            expiryInSeconds: 604800
        });

        return { uuid: user.uuid, bearerToken, bearerTokenExpiry: 604800 };
    };
}
