import { inject, singleton } from 'tsyringe';
import { IApartment } from '../../../database/models/Apartment.model';
import { AddApartmentDTO } from '../dtos/AddApartmentDTO';
import { ICreateApartmentService } from '../interfaces/ICreateApartmentsService';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { IApartmentRepository } from '../interfaces/IApartmentRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import httpStatus from 'http-status';
import { UserComponents } from '../../user/constants/UserComponent';
import { IUserRepository } from '../../user/interfaces/IUserRepository';

@singleton()
export class CreateApartmentService implements ICreateApartmentService {
    constructor(
        @inject(ApartmentComponents.ApartmentRespository)
        private readonly apartmentRepo: IApartmentRepository,
        @inject(UserComponents.UserRepository)
        private readonly userRepo: IUserRepository
    ) {}

    create = async (props: {
        userUUID: string;
        payload: AddApartmentDTO;
    }): Promise<void> => {
        const { userUUID, payload } = props;

        const { title } = payload;

        const [exists, user] = await Promise.all([
            this.apartmentRepo.count({
                hostUUID: userUUID,
                title
            }),
            this.userRepo.findOne({ uuid: userUUID })
        ]);

        if (!user) {
            throw new CustomException('No such user', httpStatus.NOT_FOUND);
        }

        if (exists > 0) {
            throw new CustomException(
                `${title} already exists for this host`,
                httpStatus.CONFLICT
            );
        }

        const apartment: Partial<IApartment> = {
            hostName: user.fullName,
            hostUUID: userUUID,
            title,
            description: payload.description,
            amenities: payload.amenities,
            bedrooms: payload.bedrooms,
            bathrooms: payload.bathroom,
            toilets: payload.toilets,
            location: payload.location,
            pricePerNight: payload.pricePerNight,
            cautionFee: payload.cautionFee
        };

        await this.apartmentRepo.add({ apartment });
    };
}
