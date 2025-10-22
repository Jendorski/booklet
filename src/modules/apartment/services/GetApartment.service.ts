import { inject, singleton } from 'tsyringe';
import { IApartment } from '../../../database/models/Apartment.model';
import { IGetApartmentService } from '../interfaces/IGetApartmentService';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import httpStatus from 'http-status';

@singleton()
export class GetApartmentService implements IGetApartmentService {
    constructor(
        @inject(ApartmentComponents.ApartmentRespository)
        private readonly aptRepo: IApartmentRepository
    ) {}

    getAnApartment = async (uuid: string): Promise<Partial<IApartment>> => {
        const apartment = await this.aptRepo.findOne({ uuid });
        if (!apartment) {
            throw new CustomException(
                'No such apartment',
                httpStatus.NOT_FOUND
            );
        }

        return apartment;
    };
}
