import { inject, singleton } from 'tsyringe';
import { IBooking } from '../../../database/models/Booking.model';
import { PaginatedDataDTO } from '../../../shared/dtos/PaginatedDataDTO';
import { IBookingsForAnApartmentService } from '../interfaces/IBookingsForAnApartmentService';
import { BookingComponents } from '../constants/BookingComponents';
import { IBookingRepository } from '../interfaces/IBookingRepository';

@singleton()
export class BookingsForAnApartmentService
    implements IBookingsForAnApartmentService
{
    constructor(
        @inject(BookingComponents.BookingRepository)
        private readonly bookingRepo: IBookingRepository
    ) {}

    apartmentBookings = async (props: {
        apartmentUUID: string;
        page: number;
        limit: number;
    }): Promise<PaginatedDataDTO<Partial<IBooking>>> => {
        const { apartmentUUID, page, limit } = props;
        const { total, bookings } =
            await this.bookingRepo.findBookingsForAnApartment({
                apartmentUUID,
                page,
                limit
            });

        return new PaginatedDataDTO({ data: bookings, page, limit, total });
    };
}
