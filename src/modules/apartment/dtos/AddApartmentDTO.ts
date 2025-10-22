import {
    IsArray,
    IsDefined,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min
} from 'class-validator';
import { IApartmentAmenities } from '../../../database/models/Apartment.model';

export class AddApartmentDTO {
    @IsString({ message: 'title must be a string' })
    @IsDefined({ message: 'title is required' })
    @MaxLength(200, { message: 'title cannot be more than 200 characters' })
    title: string;

    @IsDefined({ message: 'description is required' })
    @IsString({ message: 'description must be a string' })
    @MaxLength(5000, {
        message: 'description cannot be more than 5000 characters'
    })
    description: string;

    @IsDefined({ message: 'pricePerNight is required' })
    pricePerNight: number;

    @IsDefined({ message: 'location is required' })
    location: string;

    @IsOptional({ message: 'amenities is required' })
    @IsEnum(IApartmentAmenities, {
        message: `amenities is any of ${Object.values(IApartmentAmenities).join(',')}`
    })
    @IsArray({ message: 'amenities must be an array' })
    amenities?: IApartmentAmenities[];

    @IsDefined()
    @Min(1, { message: 'bedrooms minimum of 1' })
    @IsNumber({}, { message: 'bedrooms must be a number' })
    bedrooms: number;

    @IsDefined()
    @Min(1, { message: 'toilets minimum of 1' })
    @IsNumber({}, { message: 'toilets must be a number' })
    toilets: number;

    @IsDefined()
    @Min(1, { message: 'bathroom minimum of 1' })
    @IsNumber({}, { message: 'bathroom must be a number' })
    bathroom: number;
}
