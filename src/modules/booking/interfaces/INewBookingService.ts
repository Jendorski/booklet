import { NewBookingDTO } from '../dtos/NewBookingDTO';

export interface INewBookingService {
    addNewBooking(props: {
        userUUID: string;
        payload: NewBookingDTO;
    }): Promise<{ reference: string; totalAmountToPay: number }>;
}
