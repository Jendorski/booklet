import { container } from 'tsyringe';
import { Components } from './constants/Components';
import { IJwtService } from './jwt/interface/IJwtService';
import { JWTService } from './jwt/JWTService';

export const registerSharedComponents = () => {
    container.register<IJwtService>(Components.JWTService, {
        useClass: JWTService
    });
};
