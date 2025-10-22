import { inject, injectable } from 'tsyringe';
import { Body, Controller, Middlewares, Post, Route, Tags } from 'tsoa';
import { UserComponents } from '../constants/UserComponent';
import { IRegisterUserService } from '../interfaces/IRegisterUserService';
import { validatePayload } from '../../../shared/middlewares/validatePayload';
import { RegisterUserDTO } from '../dtos/RegisterUserDTO';

@injectable()
@Route('/auth/register')
@Tags('Authentication')
export class RegisterUserController extends Controller {
    constructor(
        @inject(UserComponents.RegisterUserService)
        private readonly registerUserService: IRegisterUserService
    ) {
        super();
    }

    @Post('')
    @Middlewares([
        validatePayload({ targetClass: RegisterUserDTO, section: 'body' })
    ])
    async register(@Body() body: RegisterUserDTO) {
        await this.registerUserService.registerUser(body);
    }
}
