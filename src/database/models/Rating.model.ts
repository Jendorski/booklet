import Sequelize, { DataTypes, Model } from '@sequelize/core';

export interface IRating {
    uuid?: string;
    bookingUUID: string;
    appartmentUUID: string;
    overallRating: number;
    review: string;
    valueRating: number;
    locationRating: number;
    communicationRating: number;
    cleanlinessRating: number;
    checkinRating: number;
}

const RatingModel = (sequelize: Sequelize) => {
    class Rating extends Model<IRating> {
        declare uuid: string;
        declare apartmentUUID: string;
        declare bookingUUID: string;
        declare overallRating: number;
        declare review: string;
        declare valueRating: number;
        declare locationRating: number;
        declare communicationRating: number;
        declare cleanlinessRating: number;
        declare checkinRating: number;

        static associate(models: Model) {
            // define association here
            // Rating.hasOne(defineApartmentModel(sequelize), {
            //     as: 'apartment',
            //     foreignKey: 'uuid',
            //     sourceKey: 'apartmentUUID'
            // });
            // Booking.belongsTo(defineUserModel(sequelize), {
            //     foreignKey: 'guestUUID',
            //     targetKey: 'uuid',
            //     as: 'bookings'
            // });
        }
    }

    Rating.init(
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
            bookingUUID: {
                type: DataTypes.UUID,
                allowNull: false
            },
            overallRating: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            checkinRating: {
                type: DataTypes.FLOAT
            },
            cleanlinessRating: {
                type: DataTypes.FLOAT
            },
            communicationRating: {
                type: DataTypes.FLOAT
            },
            review: {
                type: DataTypes.TEXT
            },
            locationRating: {
                type: DataTypes.FLOAT
            },
            valueRating: {
                type: DataTypes.FLOAT
            }
        },
        {
            sequelize,
            timestamps: true,
            modelName: 'ratings',
            tableName: 'ratings',
            paranoid: true
        }
    );

    return Rating;
};

export default RatingModel;
