import { container } from 'tsyringe';
import { CreateUserRepository } from '../../user/repositories/CreateUser.repository';
import { CreateApartmentService } from './CreateApartments.service';
import { UserComponents } from '../../user/constants/UserComponent';
import { ApartmentComponents } from '../constants/ApartmentComponents';
import { JWTService } from '../../../shared/jwt/JWTService';
import { Components } from '../../../shared/constants/Components';
import { ApartmentRepository } from '../repositories/Apartment.repository';
import expect from 'expect';
import { IUser } from '../../../database/models/User.model';

describe('Add Apartment Service', () => {
    let createUserRepository: CreateUserRepository;
    let addApartmentService: CreateApartmentService;
    let jwtService: JWTService;
    let apartmentRepo: ApartmentRepository;
    let user: Partial<IUser>;

    before(async () => {
        jwtService = container.resolve<JWTService>(Components.JWTService);

        apartmentRepo = container.resolve<ApartmentRepository>(
            ApartmentComponents.ApartmentRespository
        );

        createUserRepository = container.resolve<CreateUserRepository>(
            UserComponents.CreateUserRepository
        );

        addApartmentService = container.resolve<CreateApartmentService>(
            ApartmentComponents.CreateApartmentService
        );
        const { hash } = await jwtService.passwordHash('123456');

        user = await createUserRepository.create({
            email: 'john.doe@test.com',
            fullName: 'John Doe',
            password: hash,
            type: 'host',
            emailVerified: true
        });
    });

    afterEach(async () => {
        //
        await apartmentRepo.truncate();
    });

    after(async () => {
        await Promise.all([
            apartmentRepo.truncate(),
            createUserRepository.truncate()
        ]);
    });

    it('should throw an error if apartment with title exists', async () => {
        await addApartmentService.create({
            userUUID: user.uuid as string,
            payload: {
                title: 'Exquisite 3 bedroom for short stay',
                description:
                    'This 3 bedroom is excellent for a family with 2 kids',
                toilets: 3,
                bedrooms: 3,
                bathroom: 3,
                pricePerNight: 10000,
                location: 'Oregun, Ikeja'
            }
        });

        await expect(
            addApartmentService.create({
                userUUID: user.uuid as string,
                payload: {
                    title: 'Exquisite 3 bedroom for short stay',
                    description:
                        'This 3 bedroom is excellent for a family with 2 kids',
                    toilets: 3,
                    bedrooms: 3,
                    bathroom: 3,
                    pricePerNight: 10000,
                    location: 'Oregun, Ikeja'
                }
            })
        ).rejects.toThrow(
            'Exquisite 3 bedroom for short stay already exists for this host'
        );
    });

    it('should create an apartment', async () => {
        await expect(
            addApartmentService.create({
                userUUID: user.uuid as string,
                payload: {
                    title: 'Exquisite 3 bedroom for short stay',
                    description:
                        'This 3 bedroom is excellent for a family with 2 kids',
                    toilets: 3,
                    bedrooms: 3,
                    bathroom: 3,
                    pricePerNight: 10000,
                    location: 'Oregun, Ikeja'
                }
            })
        ).resolves.toStrictEqual(undefined);
    });
});
