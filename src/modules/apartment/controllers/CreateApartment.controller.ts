import {
    Body,
    Controller,
    Middlewares,
    Post,
    Route,
    Tags,
    Request
} from 'tsoa';
import { AddApartmentDTO } from '../dtos/AddApartmentDTO';
import { inject, injectable } from 'tsyringe';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { ICreateApartmentService } from '../interfaces/ICreateApartmentsService';
import { validatePayload } from '../../../shared/middlewares/validatePayload';
import { AuthMiddleware } from '../../../shared/middlewares/authenticationMiddleware';
import { AuthenticatedRequest } from '../../../shared/interfaces/AuthenticatedRequest';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';

@injectable()
@Route('/apartment')
@Tags('Apartment Management')
export class CreateApartmentController extends Controller {
    constructor(
        @inject(ApartmentComponents.CreateApartmentService)
        private readonly createApartmentService: ICreateApartmentService
    ) {
        super();
    }

    @Post('')
    @Middlewares([
        validatePayload({ targetClass: AddApartmentDTO, section: 'body' }),
        AuthMiddleware
    ])
    async create(
        @Request() req: AuthenticatedRequest,
        @Body() body: AddApartmentDTO
    ) {
        const { user } = req;

        const resp = await this.createApartmentService.create({
            userUUID: user.userUUID,
            payload: body
        });

        return ResponseDTO.success({
            message: 'Apartment created successfully',
            data: resp
        });
    }
}
