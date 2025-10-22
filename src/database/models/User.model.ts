import Sequelize, { DataTypes, Model } from '@sequelize/core';
import defineApartmentModel from './Apartment.model';

export type IUserType = 'host' | 'guest';

export interface IUser {
    uuid?: string;
    fullName?: string;
    email?: string;
    password?: string;
    type?: IUserType;
    emailVerified?: boolean;
    status: UserStatus;
}

export enum UserStatus {
    ACTIVE = 'active'
}

const UserModel = (sequelize: Sequelize) => {
    class User extends Model<IUser> {
        declare uuid: string;
        declare fullName: string;
        declare email: string;
        declare password: string;
        declare type: string;
        declare emailVerified: boolean;
        declare status: UserStatus;

        static associate(models: Model) {
            // define association here
            User.hasOne(defineApartmentModel(sequelize), {
                as: 'apartment',
                foreignKey: 'hostUUID',
                sourceKey: 'uuid'
            });
        }
    }

    User.init(
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            type: {
                type: DataTypes.STRING,
                defaultValue: 'tenant',
                allowNull: false
            },
            emailVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            status: {
                type: DataTypes.ENUM(UserStatus.ACTIVE),
                defaultValue: UserStatus.ACTIVE
            }
        },
        {
            tableName: 'users',
            modelName: 'users',
            sequelize,
            paranoid: true,
            timestamps: true
        }
    );

    return User;
};

export default UserModel;
