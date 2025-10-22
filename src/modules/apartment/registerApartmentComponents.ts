import { container } from 'tsyringe';
import { ICreateApartmentService } from './interfaces/ICreateApartmentsService';
import { ApartmentComponents } from './constants/ApartmentComponents';
import { CreateApartmentService } from './services/CreateApartments.service';
import { GetApartmentsService } from './services/GetApartments.service';
import { IGetApartmentsService } from './interfaces/IGetApartmentsService';
import { GetApartmentService } from './services/GetApartment.service';
import { IGetApartmentService } from './interfaces/IGetApartmentService';

export const registerApartmentComponents = () => {
    container.register<ICreateApartmentService>(
        ApartmentComponents.CreateApartmentService,
        {
            useClass: CreateApartmentService
        }
    );
    container.register<IGetApartmentsService>(
        ApartmentComponents.GetApartmentsService,
        {
            useClass: GetApartmentsService
        }
    );
    container.register<IGetApartmentService>(
        ApartmentComponents.GetApartmentService,
        {
            useClass: GetApartmentService
        }
    );
};
