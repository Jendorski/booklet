import { IApartment } from '../../../database/models/Apartment.model';

export interface IGetApartmentService {
    getAnApartment(uuid: string): Promise<Partial<IApartment>>;
}
