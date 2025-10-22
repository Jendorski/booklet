import { IBooking } from '../../../database/models/Booking.model';
import { IAny } from '../../../shared/utils/helpers';

export interface IBookingRepository {
    newBooking(payload: Partial<IBooking>): Promise<Partial<IBooking>>;

    retrieveOne(bookingUUID: string): Promise<Partial<IBooking> | null>;

    findBookings(
        query: Record<string, IAny>
    ): Promise<{ total: number; bookings: Partial<IBooking>[] }>;

    retrieveBookingsForAnApartment(
        apartmentUUID: string
    ): Promise<{ total: number; bookings: Partial<IBooking>[] }>;

    truncate(): Promise<void>;
}
