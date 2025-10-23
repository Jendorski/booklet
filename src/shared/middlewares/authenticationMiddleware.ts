import { Request, NextFunction } from 'express';
import { container } from 'tsyringe';
import { CustomException } from '../exceptions/CustomException';
import HttpStatus from 'http-status';
import { CacheComponents } from '../../cache/cacheComponents';
import { CachePrefix } from '../../cache/CachePrefix';
import { Cache } from '../../cache/Cache';
import { Logger } from '../logger/winston';
import { IJwtService, UserAuthToken } from '../jwt/interface/IJwtService';
import { JWTService } from '../jwt/JWTService';
import { Components } from '../constants/Components';
import { UserRepository } from '../../modules/user/repositories/User.repository';
import { UserComponents } from '../../modules/user/constants/UserComponent';
import { IUser, UserStatus } from '../../database/models/User.model';

const TAG = 'middlewares::authentication';

const authLogger = Logger.child({ file: TAG });

export const AuthMiddleware = async (
    request: Request & { user: UserAuthToken },
    _: Response,
    next: NextFunction
) => {
    const authRespLogger = authLogger.child({ file: `${TAG}::AuthMiddleware` });

    const cache = container.resolve<Cache>(CacheComponents.Cache);

    const retrieveAUserRepo: UserRepository = container.resolve<UserRepository>(
        UserComponents.UserRepository
    );
    const jwtService: IJwtService = container.resolve<JWTService>(
        Components.JWTService
    );

    let token = request.headers.authorization;
    token = token?.replace('Bearer ', '');

    if (!token) {
        authRespLogger.error(`token -> ${token}`);
        next(new CustomException('No token provided', HttpStatus.UNAUTHORIZED));
        return;
    }

    const decode = await jwtService.jwtVerify(token);

    if (!decode) {
        authRespLogger.error(`decode -> ${decode}`);
        next(new CustomException('Unauthorized', HttpStatus.UNAUTHORIZED));
        return;
    }

    const user: Partial<IUser> | null = await retrieveAUserRepo.retrieveOne(
        decode.userUUID
    );

    if (!user) {
        authRespLogger.error(`user -> ${JSON.stringify(user)}`);
        next(new CustomException('Unauthorized', HttpStatus.UNAUTHORIZED));
        return;
    }

    if (user.status === UserStatus.ACTIVE) {
        const _cachedToken = await cache.get<string>(
            `${CachePrefix.USER_JWT_TOKEN}/${decode.userUUID}`
        );

        if (!_cachedToken) {
            authRespLogger.error(`_cachedToken -> ${_cachedToken}`);
            next(new CustomException('Unauthorized', HttpStatus.UNAUTHORIZED));
            return;
        }
    }

    request.user = {
        userUUID: decode.userUUID,
        status: decode.status
    };

    next();
};
