import Sequelize, { DataTypes, Model } from '@sequelize/core';
import defineApartmentModel from './Apartment.model';
import defineUserModel from './User.model';

export enum IBookingStatus {
    SCHEDULED = 'scheduled',
    ONGOING = 'ongoing',
    COMPLETED = 'completed'
}

export interface IBooking {
    uuid?: string;
    apartmentUUID: string;
    reference: string;
    guestUUID: string;
    bookingDate: string | Date;
    totalAmountPaid: number;
    cautionFee: number;
    numberOfNights: number;
    bookingCost: number;
    checkOutDate: string | Date;
    checkInDate: string | Date;
    status: IBookingStatus;
}

export interface IBookingsFilters {
    page: number;
    limit: number;
    apartmentUUID: string;
    guestUUID: string;
}

const BookingModel = (sequelize: Sequelize) => {
    class Booking extends Model<IBooking> {
        declare uuid: string;
        declare apartmentUUID: string;
        declare reference: string;
        declare guestUUID: string;
        declare bookingDate: string | Date;
        declare checkoutDate: string | Date;
        declare numberOfNights: number;
        declare totalAmountPaid: number;
        declare cautionFee: number;
        declare status: string;
        declare checkinDate: string | Date;

        static associate(models: Model) {
            // define association here
            Booking.hasOne(defineApartmentModel(sequelize), {
                as: 'bookings',
                foreignKey: 'uuid',
                sourceKey: 'apartmentUUID'
            });

            Booking.belongsTo(defineUserModel(sequelize), {
                foreignKey: 'guestUUID',
                targetKey: 'uuid',
                as: 'bookings'
            });
        }
    }

    Booking.init(
        {
            uuid: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
                unique: true
            },
            apartmentUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            reference: {
                type: DataTypes.STRING,
                allowNull: false
            },
            guestUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            bookingDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            checkInDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            checkOutDate: {
                type: DataTypes.DATE,
                allowNull: false
            },
            bookingCost: {
                type: DataTypes.INTEGER
            },
            numberOfNights: {
                type: DataTypes.INTEGER,
                defaultValue: 1
            },
            totalAmountPaid: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            cautionFee: {
                type: DataTypes.FLOAT,
                allowNull: true
            }
        },
        {
            sequelize,
            timestamps: true,
            modelName: 'bookings',
            tableName: 'bookings',
            paranoid: true
        }
    );

    return Booking;
};
export default BookingModel;
