import { Body, Controller, Middlewares, Post, Route, Tags } from 'tsoa';
import { inject, singleton } from 'tsyringe';
import { UserComponents } from '../constants/UserComponent';
import { ILoginUserService } from '../interfaces/ILoginUserService';
import { validatePayload } from '../../../shared/middlewares/validatePayload';
import { LoginUserDTO } from '../dtos/LoginUserDTO';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';

@singleton()
@Route('/auth/login')
@Tags('Authentication')
export class LoginUserController extends Controller {
    constructor(
        @inject(UserComponents.LoginUserService)
        private readonly loginUserService: ILoginUserService
    ) {
        super();
    }

    @Post('')
    @Middlewares([
        validatePayload({ targetClass: LoginUserDTO, section: 'body' })
    ])
    async login(@Body() payload: LoginUserDTO) {
        const { email, password } = payload;
        const login = await this.loginUserService.login({ email, password });

        return ResponseDTO.success({
            message: 'Logged in successfully',
            data: login
        });
    }
}
