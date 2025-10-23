import { inject, singleton } from 'tsyringe';
import { NewBookingDTO } from '../dtos/NewBookingDTO';
import { INewBookingService } from '../interfaces/INewBookingService';
import { BookingComponents } from '../constants/BookingComponents';
import { IBookingRepository } from '../interfaces/IBookingRepository';
import { ApartmentComponents } from '../../apartment/constants/ApartmentComponents';
import { IApartmentRepository } from '../../apartment/interfaces/IApartmentRepository';
import { CustomException } from '../../../shared/exceptions/CustomException';
import { IApartmentStatus } from '../../../database/models/Apartment.model';
import {
    IBooking,
    IBookingStatus
} from '../../../database/models/Booking.model';
import { generateCode, generateReference } from '../../../shared/utils/helpers';
import { Components } from '../../../shared/constants/Components';
import { IQueueService } from '../../../shared/queue/interfaces/IQueueService';
import JOB_NAMES from '../../../shared/queue/types';

@singleton()
export class NewBookingService implements INewBookingService {
    constructor(
        @inject(BookingComponents.BookingRepository)
        private readonly bookingRepo: IBookingRepository,
        @inject(ApartmentComponents.ApartmentRespository)
        private readonly apartmentRepo: IApartmentRepository,
        @inject(Components.QueueService)
        private readonly queueService: IQueueService
    ) {}

    addNewBooking = async (props: {
        userUUID: string;
        payload: NewBookingDTO;
    }): Promise<{ reference: string; totalAmountToPay: number }> => {
        const { userUUID, payload } = props;
        const { apartmentUUID, numberOfNights, checkOutDate, checkInDate } =
            payload;

        const datedCheckIn = new Date(checkInDate);
        const datedCheckOut = new Date(checkOutDate);

        const checkInIsPast = datedCheckIn < new Date();
        const checkOutIsPast = datedCheckOut < new Date();

        if (checkInIsPast) {
            throw new CustomException(
                'The checkInDate must be today or sometime in the future'
            );
        }

        if (checkOutIsPast) {
            throw new CustomException(
                'The checkOutDate must be sometime in the future'
            );
        }

        const anApartment = await this.apartmentRepo.findOne({
            uuid: apartmentUUID
        });

        if (!anApartment) {
            throw new CustomException('No such apartment');
        }

        if (anApartment.status !== IApartmentStatus.AVAILABLE) {
            throw new CustomException(
                `Apartment is currently ${anApartment.status}`
            );
        }

        const { cautionFee, pricePerNight } = anApartment;

        const bookingCost = numberOfNights * Number(pricePerNight);

        const total = bookingCost + Number(cautionFee);

        const reference = generateReference(
            JSON.stringify({
                totalAmountPaid: total,
                bookingCost,
                checkInDate,
                checkOutDate,
                apartmentUUID,
                guestUUID: userUUID,
                status: IBookingStatus.SCHEDULED,
                bookingDate: new Date(),
                cautionFee: Number(cautionFee),
                numberOfNights,
                randomData: `${generateCode(40)}*${Date.now()}`
            })
        );

        const newBooking: IBooking = {
            totalAmountPaid: total,
            bookingCost,
            checkInDate,
            checkOutDate,
            apartmentUUID,
            guestUUID: userUUID,
            status: IBookingStatus.SCHEDULED,
            reference,
            bookingDate: new Date(),
            cautionFee: Number(cautionFee),
            numberOfNights
        };

        await Promise.all([
            this.bookingRepo.newBooking(newBooking),
            this.prepareCheckInQueue({ checkInDate, apartmentUUID, reference }),
            this.prepareCheckOutQueue({
                checkOutDate,
                apartmentUUID,
                reference
            })
        ]);

        //queue service to mark the apartment as available with the checkout date

        return { reference, totalAmountToPay: total };
    };

    private readonly prepareCheckInQueue = async (props: {
        checkInDate: string;
        apartmentUUID: string;
        reference: string;
    }) => {
        const { checkInDate, apartmentUUID, reference } = props;
        const delayCheckin =
            new Date(checkInDate).getMilliseconds() - Date.now();

        //queue service to mark the apartment as booked with the checkin date
        const { queue: checkInQueue } = this.queueService.create({
            name: JOB_NAMES.APARTMENT_CHECK_IN_PROCESSING,
            processor: async () => {
                await Promise.all([
                    this.apartmentRepo.updateOne({
                        apartmentUUID,
                        update: { status: IApartmentStatus.BOOKED }
                    }),
                    this.bookingRepo.updateOne({
                        reference,
                        update: { status: IBookingStatus.ONGOING }
                    })
                ]);
            },
            options: {
                delay: delayCheckin
            }
        });

        await checkInQueue.add(
            JOB_NAMES.APARTMENT_CHECK_IN_PROCESSING,
            {
                apartmentUUID
            },
            { removeOnComplete: true }
        );
    };
    private readonly prepareCheckOutQueue = async (props: {
        checkOutDate: string;
        apartmentUUID: string;
        reference: string;
    }) => {
        const { checkOutDate, apartmentUUID, reference } = props;
        const delayCheckout =
            new Date(checkOutDate).getMilliseconds() - Date.now();

        //queue service to mark the apartment as booked with the checkin date
        const { queue: checkInQueue } = this.queueService.create({
            name: JOB_NAMES.APARTMENT_CHECK_IN_PROCESSING,
            processor: async () => {
                await Promise.all([
                    this.apartmentRepo.updateOne({
                        apartmentUUID,
                        update: {
                            status: IApartmentStatus.AVAILABLE
                        }
                    }),
                    this.bookingRepo.updateOne({
                        reference,
                        update: {
                            status: IBookingStatus.COMPLETED
                        }
                    })
                ]);
            },
            options: {
                delay: delayCheckout
            }
        });

        await checkInQueue.add(
            JOB_NAMES.APARTMENT_CHECK_IN_PROCESSING,
            {
                apartmentUUID
            },
            { removeOnComplete: true }
        );
    };
}
