import { inject, singleton } from 'tsyringe';
import { IApartment } from '../../../database/models/Apartment.model';
import { PaginatedDataDTO } from '../../../shared/dtos/PaginatedDataDTO';
import { IGetApartmentsService } from '../interfaces/IGetApartmentsService';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';

@singleton()
export class GetApartmentsService implements IGetApartmentsService {
    constructor(
        @inject(ApartmentComponents.ApartmentRespository)
        private readonly apartmentRepo: IApartmentRepository
    ) {}

    getApartments = async (
        props: {
            page: number;
            limit: number;
            userUUID: string;
        } & Partial<IApartment>
    ): Promise<PaginatedDataDTO<Partial<IApartment>>> => {
        const { page, limit } = props;
        const { total, records } = await this.apartmentRepo.retrieve({
            ...props
        });

        return new PaginatedDataDTO({ data: records, page, limit, total });
    };
}
