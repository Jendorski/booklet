import { container } from 'tsyringe';
import { IRegisterUserService } from './interfaces/IRegisterUserService';
import { UserComponents } from './constants/UserComponent';
import { RegisterUserService } from './services/RegisterUser.service';

export const registerUserComponents = () => {
    container.register<IRegisterUserService>(
        UserComponents.RegisterUserService,
        {
            useClass: RegisterUserService
        }
    );
};
