import {
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
    IsStrongPassword
} from 'class-validator';

export class LoginUserDTO {
    @IsOptional()
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'email must be in the proper format' })
    email: string;

    @IsDefined({ message: 'password is required' })
    @IsString({ message: 'password must be a string' })
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    password: string;
}
