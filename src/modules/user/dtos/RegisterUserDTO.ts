/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    IsDefined,
    IsEmail,
    IsOptional,
    IsString,
    IsStrongPassword,
    MaxLength,
    ValidateIf
} from 'class-validator';
import { IUserType } from '../../../database/models/User.model';
import { Match } from '../../../shared/customValidator/Match';

export class RegisterUserDTO {
    @IsDefined({ message: 'Email is required' })
    @IsString({ message: 'Email must be a string' })
    @IsEmail({}, { message: 'Must be a correct email address' })
    email: string;

    @IsString({ message: 'First name must be a string' })
    @IsOptional()
    firstName?: string;

    @IsString({ message: 'Last name must be a string' })
    @IsOptional()
    lastName?: string;

    @IsDefined({ message: 'fullName is required' })
    @IsString({ message: 'fullName must be a string' })
    fullName: string;

    @IsOptional()
    @IsString({ message: 'userName must be a string' })
    userName?: string;

    @IsDefined({ message: 'password is required' })
    @IsString({ message: 'password must be a string' })
    @MaxLength(20, { message: 'Maximum length for the password is 20' })
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        },
        {
            message:
                'minimum length is 8, minimum of one lowercase, one uppercase, one number and one symbol'
        }
    )
    password: string;

    @IsDefined({ message: 'confirmPassword is required' })
    @IsString({ message: 'confirmPassword must be a string' })
    @Match('password', { message: 'password and confirmPassword must match' })
    @ValidateIf((o: RegisterUserDTO) => o.password !== o.confirmPassword, {
        message:
            'minimum length is 8, minimum of one lowercase, one uppercase, one number and one symbol'
    })
    confirmPassword: string;

    @IsDefined({ message: 'type is required' })
    @IsString({ message: 'type must be a string' })
    type: IUserType;
}
