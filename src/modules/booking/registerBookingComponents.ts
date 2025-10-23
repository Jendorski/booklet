import { container } from 'tsyringe';
import { BookingComponents } from './constants/BookingComponents';
import { NewBookingService } from './services/NewBooking.service';
import { INewBookingService } from './interfaces/INewBookingService';
import { IBookingsForAnApartmentService } from './interfaces/IBookingsForAnApartmentService';
import { BookingsForAnApartmentService } from './services/BookingsForAnApartment.service';

export const registerBookingComponents = () => {
    container.register<INewBookingService>(
        BookingComponents.NewBookingService,
        {
            useClass: NewBookingService
        }
    );
    container.register<IBookingsForAnApartmentService>(
        BookingComponents.BookingsForAnApartmentService,
        {
            useClass: BookingsForAnApartmentService
        }
    );
};
