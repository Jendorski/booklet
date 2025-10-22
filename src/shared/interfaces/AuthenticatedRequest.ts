import { UserAuthToken } from '../jwt/interface/IJwtService';
import { CustomRequest } from './CustomRequest';

export interface AuthenticatedRequest extends CustomRequest {
    user: UserAuthToken;
}
