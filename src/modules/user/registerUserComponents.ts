import { container } from 'tsyringe';
import { IRegisterUserService } from './interfaces/IRegisterUserService';
import { UserComponents } from './constants/UserComponent';
import { RegisterUserService } from './services/RegisterUser.service';
import { ILoginUserService } from './interfaces/ILoginUserService';
import { LoginUserService } from './services/LoginUser.service';

export const registerUserComponents = () => {
    container.register<IRegisterUserService>(
        UserComponents.RegisterUserService,
        {
            useClass: RegisterUserService
        }
    );

    container.register<ILoginUserService>(UserComponents.LoginUserService, {
        useClass: LoginUserService
    });
};
