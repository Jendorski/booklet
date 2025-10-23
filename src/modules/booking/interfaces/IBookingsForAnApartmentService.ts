import { IBooking } from '../../../database/models/Booking.model';
import { PaginatedDataDTO } from '../../../shared/dtos/PaginatedDataDTO';

export interface IBookingsForAnApartmentService {
    apartmentBookings(props: {
        apartmentUUID: string;
        page: number;
        limit: number;
    }): Promise<PaginatedDataDTO<Partial<IBooking>>>;
}
