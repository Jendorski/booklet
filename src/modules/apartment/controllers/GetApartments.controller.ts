import {
    Controller,
    Get,
    Middlewares,
    Queries,
    Route,
    Tags,
    Request
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import httpStatus from 'http-status';
import { CustomRequest } from '../../../shared/interfaces/CustomRequest';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';

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
    @Middlewares([])
    async get(
        @Request() req: CustomRequest,
        @Queries() queries: { page: number; limit: number }
    ) {
        const { page, limit } = queries;

        const ipAddress = req.ip;

        if (limit > 5) {
            throw new CustomException(
                'limit cannot be more than 5',
                httpStatus.UNPROCESSABLE_ENTITY
            );
        }

        const resp = await this.aptRepo.retrieve({
            page,
            limit,
            ipAddress
        });

        return ResponseDTO.success({
            message: 'Apartments retrieved successfully',
            data: resp
        });
    }
}
