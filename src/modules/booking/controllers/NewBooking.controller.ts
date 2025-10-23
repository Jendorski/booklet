import {
    Body,
    Controller,
    Middlewares,
    Post,
    Route,
    Request,
    Tags
} from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BookingComponents } from '../constants/BookingComponents';
import { INewBookingService } from '../interfaces/INewBookingService';
import { validatePayload } from '../../../shared/middlewares/validatePayload';
import { NewBookingDTO } from '../dtos/NewBookingDTO';
import { AuthMiddleware } from '../../../shared/middlewares/authenticationMiddleware';
import { AuthenticatedRequest } from '../../../shared/interfaces/AuthenticatedRequest';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';

@injectable()
@Route('/booking/new')
@Tags('Booking Management')
export class NewBookingController extends Controller {
    constructor(
        @inject(BookingComponents.NewBookingService)
        private readonly newBookingService: INewBookingService
    ) {
        super();
    }

    @Post('')
    @Middlewares([
        validatePayload({ targetClass: NewBookingDTO, section: 'body' }),
        AuthMiddleware
    ])
    async newBooking(
        @Request() req: AuthenticatedRequest,
        @Body() body: NewBookingDTO
    ) {
        const { user } = req;
        const resp = await this.newBookingService.addNewBooking({
            userUUID: user.userUUID,
            payload: body
        });

        return ResponseDTO.success({
            message: 'Apartment booked successfully',
            data: resp
        });
    }
}
