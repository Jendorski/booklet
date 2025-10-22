import Sequelize, { DataTypes, Model } from '@sequelize/core';
import defineUserModel from './User.model';
import defineBookingModel from './Booking.model';

export interface IApartment {
    uuid?: string;
    hostName: string;
    title: string;
    description: string;
    location: string;
    pricePerNight: number;
    bathrooms: number;
    bedrooms: number;
    toilets: number;
    hostUUID: string;
    amenities: IApartmentAmenities[];
}

export enum IApartmentAmenities {
    GAS_COOKER = 'gas_cooker',
    AIR_CONDITIONING = 'air_conditioning',
    WATER_HEATER = 'water_heater',
    INVERTER = 'inverter',
    CAR_GARAGE = 'car_garage'
}

export enum IApartmentStatus {
    PENDING = 'pending',
    AVAILABLE = 'available',
    BOOKED = 'booked',
    UNAVAILABLE = 'unavailable'
}

const ApartmentModel = (sequelize: Sequelize) => {
    class Apartment extends Model<IApartment> {
        declare uuid: string;
        declare hostName: string;
        declare hostUUID: string;
        declare title: string;
        declare description: string;
        declare location: string;
        declare pricePerNight: number;
        declare bedrooms: number;
        declare bathrooms: number;
        declare toilets: number;
        declare status: string;
        declare amenities: string[];

        static associate(models: Model) {
            //One Apartment has many bookings
            Apartment.belongsTo(defineUserModel(sequelize), {
                foreignKey: 'hostUUID',
                targetKey: 'uuid',
                as: 'apartments'
            });

            Apartment.hasMany(defineBookingModel(sequelize), {});
        }
    }

    Apartment.init(
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: true,
                primaryKey: true,
                unique: true
            },
            hostUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            hostName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: IApartmentStatus.PENDING
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false
            },
            pricePerNight: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            bedrooms: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            bathrooms: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            toilets: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            amenities: {
                type: DataTypes.ARRAY(DataTypes.STRING)
            }
        },
        {
            sequelize,
            timestamps: true,
            modelName: 'apartments',
            tableName: 'apartments',
            paranoid: true
        }
    );

    return Apartment;
};

export default ApartmentModel;
