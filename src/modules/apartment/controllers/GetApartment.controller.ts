import { Controller, Get, Middlewares, Path, Route, Tags } from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IGetApartmentService } from '../interfaces/IGetApartmentService';
import { AuthMiddleware } from '../../../shared/middlewares/authenticationMiddleware';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';

@injectable()
@Route('/apartment')
@Tags('Apartment Management')
export class GetApartmentController extends Controller {
    constructor(
        @inject(ApartmentComponents.GetApartmentService)
        private readonly getAptService: IGetApartmentService
    ) {
        super();
    }

    @Get('{uuid}')
    @Middlewares([AuthMiddleware])
    async getAnApartment(@Path() uuid: string) {
        const resp = await this.getAptService.getAnApartment(uuid);

        return ResponseDTO.success({
            message: 'Apartment retrieved successfully',
            data: resp
        });
    }
}
