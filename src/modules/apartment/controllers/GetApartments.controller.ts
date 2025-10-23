import {
    Controller,
    Get,
    Queries,
    Route,
    Tags,
    Request,
    Middlewares
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import httpStatus from 'http-status';
import { CustomRequest } from '../../../shared/interfaces/CustomRequest';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';
import { IApartmentAmenities } from '../../../database/models/Apartment.model';
import { isEmpty } from '../../../shared/utils/helpers';
import { RateLimitMiddleware } from '../../../shared/middlewares/rateLimitMiddleware';

@injectable()
@Route('/apartments')
@Tags('Apartment Management')
export class GetApartmentsController extends Controller {
    constructor(
        @inject(ApartmentComponents.ApartmentRespository)
        private readonly aptRepo: IApartmentRepository
    ) {
        super();
    }

    @Get('')
    @Middlewares([RateLimitMiddleware.flexibleRateLimit(1000)])
    async getApartments(
        @Request() req: CustomRequest,
        @Queries()
        queries: {
            page?: number;
            limit?: number;
            uuid?: string;
            hostUUID?: string;
            title?: string;
            minPrice?: string;
            maxPrice?: string;
            amenities?: string[];
        }
    ) {
        const { limit, amenities, maxPrice, minPrice } = queries;

        const ipAddress = req.ip;

        if (limit && limit > 5) {
            throw new CustomException(
                'limit cannot be more than 5',
                httpStatus.UNPROCESSABLE_ENTITY
            );
        }

        const resp = await this.aptRepo.retrieve({
            ...queries,
            ipAddress,
            amenities: amenities as IApartmentAmenities[],
            maxPrice:
                maxPrice && !isEmpty(maxPrice)
                    ? Number.parseFloat(maxPrice)
                    : 0,
            minPrice:
                minPrice && !isEmpty(minPrice) ? Number.parseFloat(minPrice) : 0
        });

        return ResponseDTO.success({
            message: 'Apartments retrieved successfully',
            data: resp
        });
    }
}
