import { IBooking } from '../../../database/models/Booking.model';

export interface IBookingRepository {
    newBooking(payload: Partial<IBooking>): Promise<Partial<IBooking>>;

    truncate(): Promise<void>;
}
