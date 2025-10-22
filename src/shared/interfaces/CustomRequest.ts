import { UserAuthToken } from '../jwt/interface/IJwtService';
import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: UserAuthToken;
}
