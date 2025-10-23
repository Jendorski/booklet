import { Controller, Get, Middlewares, Path, Queries, Route, Tags } from 'tsoa';
import { inject, injectable } from 'tsyringe';
import { BookingComponents } from '../constants/BookingComponents';
import { IBookingsForAnApartmentService } from '../interfaces/IBookingsForAnApartmentService';
import { AuthMiddleware } from '../../../shared/middlewares/authenticationMiddleware';
import { ResponseDTO } from '../../../shared/dtos/ResponseDTO';
import { RateLimitMiddleware } from '../../../shared/middlewares/rateLimitMiddleware';

@injectable()
@Route('/booking/apartment')
@Tags('Booking Management')
export class BookingsForAnApartmentController extends Controller {
    constructor(
        @inject(BookingComponents.BookingsForAnApartmentService)
        private readonly bookingsForAnApartmentService: IBookingsForAnApartmentService
    ) {
        super();
    }

    @Get('{apartmentUUID}')
    @Middlewares([AuthMiddleware, RateLimitMiddleware.flexibleRateLimit(1000)])
    async apartmentBookings(
        @Path() apartmentUUID: string,
        @Queries() queries: { page?: number; limit?: number }
    ) {
        const { page, limit } = queries;
        const resp = await this.bookingsForAnApartmentService.apartmentBookings(
            { apartmentUUID, page: page || 1, limit: limit || 5 }
        );

        return ResponseDTO.success({
            message: 'Bookings for an apartment fetched successfully',
            data: resp
        });
    }
}
