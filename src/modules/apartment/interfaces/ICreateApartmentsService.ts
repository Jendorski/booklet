import { AddApartmentDTO } from '../dtos/AddApartmentDTO';

export interface ICreateApartmentService {
    create(props: {
        userUUID: string;
        payload: AddApartmentDTO;
    }): Promise<void>;
}
