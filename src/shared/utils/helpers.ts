/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Op, sql } from '@sequelize/core';
import { CustomException } from '../exceptions/CustomException';
import crypto from 'node:crypto';
import { Logger } from '../logger/winston';

export type IAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export const formatObjectToString = (
    param: string | Record<string, IAny>
): string => {
    if (typeof param === 'string') {
        return param;
    }

    if (param instanceof Error) {
        return param.stack ? param.stack : JSON.stringify(param);
    }

    return JSON.stringify(param);
};

const awaitTimeout = (delay: number, reason: string) =>
    new Promise((resolve, reject) =>
        setTimeout(() => {
            reason.length > 0 ? resolve(true) : reject(reason);
        }, delay)
    );

export const getBoolean = (value: IAny) => {
    switch (value) {
        case true:
        case 'true':
        case 1:
        case 'ON':
        case 'on':
        case 'yes':
        case 'YES':
            return true;
        default:
            return false;
    }
};

export const awaitOrTimeout = (
    promise: Promise<IAny>,
    delay: number,
    reason = 'Timed out'
) => Promise.race([promise, awaitTimeout(delay, reason)]);

export const randomFixedInteger = (length: number) => {
    const power10minus1 = 10 ** (length - 1);
    const power10 = 10 ** length;
    let rand = Math.floor(
        power10minus1 + Math.random() * (power10 - power10minus1 - 1)
    );
    if (String(rand).slice(0, 1) === '0') {
        rand = Math.floor(Math.random() * 899999 + 100000);
    }
    return rand;
};

export const randomNumberBetween = (min = 0, max = 20) => {
    return Math.ceil(Math.random() * (max - min) + min);
};

export const splitEmail = (email: string) => {
    const splits: string[] = email.split('@');

    const name: string = splits[0];

    const domainName: string = splits[1];

    const regEx = /[(,),.,/,\-,_,!,%,#,+,-,;,,',",,*,^,$,`,~,@, ,]/g;
    const boolean = regEx.test(name);

    let newName = name;

    if (boolean) {
        newName = name.replace(regEx, '');
    }

    return newName + '@' + domainName;
};

export const toLowerTrim = (str: string) => {
    return str ? String(str).toLowerCase().trim() : '';
};

export const toUpperTrim = (str: string) => {
    return str ? String(str).toUpperCase().trim() : '';
};

//To be noted, this does not work for Dates as objects
export const isEmpty = (value: unknown) => {
    return (
        value === null ||
        value === undefined ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' &&
            value === '' &&
            value.trim().length === 0) ||
        value === 'undefined' ||
        value === 'null'
    );
};

export const generateCode = (length: number) => {
    let result = '';
    const characters =
        '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
};

export const regexEmail = (email: string) => {
    if (!email.includes('@')) {
        throw new CustomException('Invalid email format: missing @ symbol');
    }

    const [localPart, domain] = email.split('@');

    if (!localPart || !domain) {
        throw new CustomException(
            'Invalid email format: empty local part or domain'
        );
    }

    // Make existing dots optional in local part
    const emailRegex = /[(,),.,/,\-,_,!,%,#,*,^,$,`,~,@, ,]/;
    const flexibleLocalPart = localPart.replace(emailRegex, '\\.?');

    // Escape dots in domain
    const escapedDomain = domain.replace(/\./g, '\\.');

    return `^${flexibleLocalPart}@${escapedDomain}$`;
};

export const buildEmailRegex = (email: string): RegExp => {
    if (!email.includes('@')) {
        throw new Error('Invalid email format: missing @ symbol');
    }

    const [localPart, domain] = email.toLowerCase().split('@');
    if (!localPart || !domain) {
        throw new Error('Invalid email format: empty local part or domain');
    }

    // Strip out "+" aliases and dots for matching purposes
    const baseLocal = localPart.split('+')[0].replace(/\./g, '');

    // Escape the domain for regex
    const escapedDomain = domain.replace(/\./g, '\\.');

    // Build a regex that matches any email that normalizes to the same
    return new RegExp(
        `^${baseLocal.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')}[+\\w.-]*@${escapedDomain}$`,
        'i'
    );
};

export const generateReference = (data: string) => {
    const generateNumber = randomFixedInteger(12);

    const unhashedOrderNumber = generateNumber + '-' + data;

    const buffer = Buffer.from(unhashedOrderNumber, 'utf8');

    const hashedResult = buffer.toString('hex');

    const hash = crypto.createHash('md5').update(hashedResult).digest('hex');

    return hash;
};

export const cachePagination = (props: {
    page: number;
    limit: number;
}): { start: number; stop: number } => {
    const { page, limit } = props;
    const start = page === 1 ? page - 1 : limit * (page - 1);
    const stop = page === 1 ? limit - 1 : start + (limit - 1);

    return { start, stop };
};

export interface QuerySubstance {
    where: Record<string, unknown>;
    attributes?: Record<string, IAny>; //IAny[];
    include?: Record<string, unknown>[];
    limit: number;
    offset?: number;
    distinct?: boolean;
    order?: string[][];
    group?: string[];
    subQuery?: boolean;
    required?: boolean;
    raw?: boolean;
}

export const queryBuilder = (
    query: Record<string, IAny>,
    excludedAttributes?: string[],
    or = false
) => {
    const andedArray: unknown[] = [];
    const querySubstance: QuerySubstance = {
        where: {
            [or ? Op.or : Op.and]: andedArray
        },
        limit: 10,
        offset: 0,
        distinct: true,
        attributes: {
            exclude: excludedAttributes
        }
    };
    try {
        const {
            search,
            email,
            fullName,
            hostUUID,
            guestUUID,
            bookingUUID,
            apartmentUUID,
            title,
            description,
            uuid,
            status,
            excluded,
            page: _page,
            limit: _limit,
            orderBy,
            distinct: _distinct
        } = query;

        const page = isEmpty(_page) ? Number(1) : Number(_page);
        const limit = isEmpty(_limit) ? Number(10) : Number(_limit);
        querySubstance.limit = limit;
        const offset = (page - 1) * limit;

        const distinct = _distinct && !isEmpty(_distinct) ? _distinct : true;

        querySubstance.limit = limit;
        querySubstance.distinct = distinct;
        querySubstance.offset = offset;

        if (search) {
            const querySubstance: QuerySubstance = {
                where: {
                    [or ? Op.or : Op.and]: [
                        sql.where(sql.cast(sql.col('id'), 'TEXT'), {
                            [Op.iLike]: '%' + search + '%' //`%${search}%`,
                        }),
                        sql.where(sql.cast(sql.col('uuid'), 'TEXT'), {
                            [Op.iLike]: '%' + search + '%' //`%${search}%`,
                        }),
                        { email: { [Op.iLike]: '%' + search + '%' } },
                        { status: { [Op.iLike]: '%' + search + '%' } },
                        { firstName: { [Op.iLike]: '%' + search + '%' } }, //[search]
                        { lastName: { [Op.iLike]: '%' + search + '%' } },
                        { otherNames: { [Op.iLike]: '%' + search + '%' } },
                        { userName: { [Op.iLike]: '%' + search + '%' } }
                    ]
                },
                limit,
                offset,
                distinct,
                order: [['createdAt', 'DESC']],
                attributes: {
                    exclude: excludedAttributes
                }
            };

            const cleanedUpQ = cleanedUpQuery(querySubstance);

            return { query: cleanedUpQ, limit, page };
        }

        if (email) {
            andedArray.push({ email: { [Op.iLike]: '%' + email + '%' } });
        }

        if (uuid) {
            andedArray.push(
                sql.where(sql.cast(sql.col('uuid'), 'TEXT'), {
                    [Op.iLike]: `%${uuid}%`
                })
            );
        }

        if (title) {
            andedArray.push({
                title: { [Op.iLike]: `%${title}%` }
            });
        }

        if (description) {
            andedArray.push({
                description: { [Op.iLike]: `%${description}%` }
            });
        }

        if (fullName) {
            andedArray.push({
                fullName: { [Op.iLike]: `%${fullName}%` }
            });
        }

        if (status) {
            andedArray.push({ status: { [Op.iLike]: '%' + status + '%' } });
        }

        if (hostUUID) {
            andedArray.push(
                sql.where(sql.cast(sql.col('hostUUID'), 'TEXT'), {
                    [Op.like]: `%${hostUUID}%`
                })
                // Sequelize.where(
                //     Sequelize.cast(Sequelize.col('hostUUID'), 'TEXT'),
                //     {
                //         [Op.like]: `%${hostUUID}%`
                //     }
                // )
            );
        }
        if (bookingUUID) {
            andedArray.push(
                sql.where(sql.cast(sql.col('bookingUUID'), 'TEXT'), {
                    [Op.like]: `%${bookingUUID}%`
                })
            );
        }
        if (apartmentUUID) {
            andedArray.push(
                sql.where(sql.cast(sql.col('apartmentUUID'), 'TEXT'), {
                    [Op.like]: `%${apartmentUUID}%`
                })
            );
        }
        if (guestUUID) {
            andedArray.push(
                sql.where(sql.cast(sql.col('guestUUID'), 'TEXT'), {
                    [Op.like]: `%${guestUUID}%`
                })
            );
        }

        if (orderBy) {
            const str = orderBy.split(':');
            const [key, value] = str;
            if (key && value) {
                const trimmedVal = value.trim().toUpperCase();
                if (trimmedVal === 'DESC' || trimmedVal === 'ASC') {
                    const ord = [[key, trimmedVal === 'DESC' ? 'DESC' : 'ASC']];
                    querySubstance.order = ord;
                }
            }
        }

        if (excluded && Array.isArray(excluded)) {
            querySubstance.attributes = { exclude: excluded };
        }

        const order = Array.isArray(querySubstance.order)
            ? querySubstance.order
            : [];
        if (order.length === 0) {
            const ord = ['createdAt', 'DESC'];
            querySubstance.order = [ord];
        }

        const cleanedUpQ = cleanedUpQuery(querySubstance);

        return { query: cleanedUpQ, limit, page, offset };
    } catch (error: unknown) {
        Logger.warn(`Error occurred in getting query builder ${String(error)}`);
        return { query: querySubstance, limit: 10, page: 1, offset: 0 };
    }
};

const cleanedUpQuery = (querySubstance: QuerySubstance) => {
    try {
        const latestQuery: QuerySubstance = querySubstance;

        latestQuery.limit = querySubstance.limit;
        latestQuery.offset = querySubstance.offset;
        latestQuery.distinct = querySubstance.distinct;

        const attributes = Array.isArray(querySubstance.attributes)
            ? querySubstance.attributes
            : [];
        const include = Array.isArray(querySubstance.include)
            ? querySubstance.include
            : [];
        const order = Array.isArray(querySubstance.order)
            ? querySubstance.order
            : [];

        if (attributes.length > 0) {
            latestQuery.attributes = querySubstance.attributes;
        }
        if (include.length > 0) {
            //we are supposed to get here
            latestQuery.include = querySubstance.include;
        }
        if (order.length > 0) {
            latestQuery.order = querySubstance.order;
        }
        if (!isEmpty(querySubstance.where)) {
            latestQuery.where = querySubstance.where;
        }

        return latestQuery;
    } catch (err) {
        console.error({ err });
        throw new CustomException(
            `Error cleaning up the query -> ${String(err)}`
        );
    }
};
