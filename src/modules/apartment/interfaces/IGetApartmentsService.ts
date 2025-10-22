import { IApartment } from '../../../database/models/Apartment.model';
import { PaginatedDataDTO } from '../../../shared/dtos/PaginatedDataDTO';
import { IAny } from '../../../shared/utils/helpers';

export interface IGetApartmentsService {
    getApartments(
        props: { page: number; limit: number } & Record<string, IAny>
    ): Promise<PaginatedDataDTO<Partial<IApartment>>>;
}
