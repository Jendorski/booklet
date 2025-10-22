import { inject, injectable } from 'tsyringe';
import UserModel, { IUser } from '../../../database/models/User.model';
import { IUserRepository } from '../interfaces/IUserRepository';
import { Op, QueryTypes } from '@sequelize/core';
import { CachePrefix } from '../../../cache/CachePrefix';
import { CacheComponents } from '../../../cache/cacheComponents';
import { ICache } from '../../../cache/interfaces/ICache';
import { DatabaseComponents } from '../../../database/constants/DatabaseComponents';
import { IDatabaseConnection } from '../../../database/interfaces/IDatabaseConnection';
import { queryBuilder } from '../../../shared/utils/helpers';

@injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @inject(CacheComponents.Cache) private readonly cache: ICache,
        @inject(DatabaseComponents.DatabaseConnection)
        private readonly dbConnect: IDatabaseConnection
    ) {}

    retrieveOne = async (uuid: string): Promise<Partial<IUser> | null> => {
        const cachedKey = `${CachePrefix.A_USER}/${uuid}`;
        const cached = await this.cache.get<Partial<IUser>>(cachedKey);
        if (cached) return cached;

        const user = await this.findOne({ uuid });
        if (!user) return null;

        await this.cache.set<Partial<IUser>>({
            key: cachedKey,
            value: user,
            expiryInSeconds: 12600
        });

        return user;
    };

    count = async (user: {
        uuid?: string;
        email?: string;
    }): Promise<number> => {
        const { uuid, email } = user;

        const count = await UserModel(this.dbConnect.instance()).count({
            where: {
                [Op.or]: [
                    { email: { [Op.like]: `%${email}%` } },
                    { email: { [Op.iRegexp]: email } },
                    { uuid: { [Op.like]: `%${uuid}%` } }
                ]
            }
        });

        return count;
    };

    findOne = async (user: {
        uuid?: string;
        email?: string;
    }): Promise<Partial<IUser> | null> => {
        const { uuid, email } = user;

        const { query } = queryBuilder({ uuid, email }, [], true);

        const exists = await UserModel(this.dbConnect.instance()).findOne({
            where: query.where,
            limit: 1
            // {
            //     [Op.or]: [
            //         { email: { [Op.like]: `%${email}%` } },
            //         { uuid: { [Op.like]: `%${uuid}%` } }
            //     ]
            // }
        });

        if (!exists) return null;

        return exists.dataValues;
    };

    truncate = async (): Promise<void> => {
        const tableName = 'users';
        const sql = `DELETE FROM "${tableName}";`;

        await this.dbConnect.instance().query(sql, { type: QueryTypes.DELETE });
    };
}
