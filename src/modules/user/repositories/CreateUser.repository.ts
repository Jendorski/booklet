import { inject, injectable } from 'tsyringe';
import UserModel, {
    IUser,
    IUserType,
    UserStatus
} from '../../../database/models/User.model';
import { ICreateUserRepository } from '../interfaces/ICreateUserRepository';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { QueryTypes, Transaction } from '@sequelize/core';
import { IAny } from '../../../shared/utils/helpers';
import { CustomException } from '../../../shared/exceptions/CustomException';

@injectable()
export class CreateUserRepository implements ICreateUserRepository {
    constructor(
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection
    ) {}

    create = async (user: Partial<IUser>): Promise<Partial<IUser>> => {
        const createUser: IUser = {
            fullName: user.fullName as string,
            email: user.email as string,
            password: user.password as string,
            type: user.type as IUserType,
            status: UserStatus.ACTIVE
        };

        let usr: IAny = {};
        const creationProcess = async (transaction: Transaction) => {
            usr = await UserModel(this.dbConnect.instance()).create(
                createUser,
                { transaction }
            );
        };

        const resp = await this.dbConnect.executeTransaction(creationProcess);
        if (resp.error) {
            throw new CustomException(resp.message);
        }

        return usr as Partial<IUser>;
    };

    truncate = async (): Promise<void> => {
        const tableName = 'users';
        const sql = `DELETE FROM "${tableName}";`;

        await this.dbConnect.instance().query(sql, { type: QueryTypes.DELETE });
    };
}
