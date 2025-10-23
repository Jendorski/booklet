import { IsDefined, IsNumber, IsString, Matches } from 'class-validator';

export class NewBookingDTO {
    @IsDefined({ message: 'apartmentUUID is required' })
    @IsString({ message: 'apartmentUUID must be a string' })
    apartmentUUID: string;

    @IsDefined({ message: 'numberOfNights is required' })
    @IsNumber({}, { message: 'numberOfNights must be a number' })
    numberOfNights: number;

    @IsDefined({ message: 'checkinDate is required' })
    @IsString({ message: 'checkinDate must be a string' })
    @Matches(/^\d{4}(-)(((0)\d)|((1)[0-2]))(-)([0-2]\d|(3)[0-1])$/, {
        message: 'date must be in YYYY-MM-DD format'
    })
    checkInDate: string;

    @IsDefined({ message: 'checkOutDate is required' })
    @IsString({ message: 'checkOutDate must be a string' })
    @Matches(/^\d{4}(-)(((0)\d)|((1)[0-2]))(-)([0-2]\d|(3)[0-1])$/, {
        //[0-9]
        message: 'date must be in YYYY-MM-DD format'
    })
    checkOutDate: string;
}
