/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response, NextFunction } from 'express';
import { CustomException } from '../exceptions/CustomException';
import httpStatus from 'http-status';
import { isEmpty } from '../utils/helpers';
import { container } from 'tsyringe';
import { CacheComponents } from '../../cache/cacheComponents';
import { Cache } from '../../cache/Cache';
import { Logger } from '../logger/winston';

const TAG = 'middlewares:rateLimit';

const rateLimitTag = Logger.child({ file: TAG });

export const RateLimitMiddleware = {
    flexibleRateLimit: (countDownInMilliseconds: number) => {
        const flexibleTag = rateLimitTag.child({
            file: `${TAG}::flexibleRateLimit`
        });
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const redisClient = container.resolve<Cache>(
                    CacheComponents.Cache
                );

                const {
                    url,
                    originalUrl,
                    ip,
                    body,
                    query: { limit }
                } = req;

                if (limit && parseFloat(limit as string) > 5) {
                    next(
                        new CustomException(
                            'limit cannot be more than 5',
                            httpStatus.FORBIDDEN
                        )
                    );
                }
                const currentTime = Date.now();

                const reqData = btoa(
                    JSON.stringify({ url, originalUrl, ip, body })
                );

                const exists = await redisClient.get(reqData);

                if (exists) {
                    const lastRequestTime = Number(exists);
                    const elapsedTime = currentTime - lastRequestTime;

                    if (elapsedTime < countDownInMilliseconds)
                        next(
                            new CustomException(
                                'Too many retries',
                                httpStatus.TOO_MANY_REQUESTS
                            )
                        );
                }

                const expirySecs = countDownInMilliseconds / 1000;

                await redisClient.set({
                    key: reqData,
                    value: String(currentTime),
                    expiryInSeconds: Math.ceil(expirySecs)
                });

                next();
            } catch (error: unknown) {
                flexibleTag.error(
                    `Error occurred fetching the flexible rate limit ${String(error)}`
                );
                next(
                    new CustomException(
                        httpStatus['500_MESSAGE'],
                        httpStatus.INTERNAL_SERVER_ERROR
                    )
                );
            }
        };
    },
    fixedRateLimit: async (req: Request, res: Response, next: NextFunction) => {
        const fixedTag = rateLimitTag.child({ file: `${TAG}::fixedRateLimit` });
        try {
            const redisClient = container.resolve<Cache>(CacheComponents.Cache);

            const { ip, originalUrl, url, method, body } = req;

            const reqUrl = originalUrl || url;

            const reqName =
                method.trim().toLowerCase() === 'get'
                    ? 'GET_RATE_LIMIT_MAX_COUNTER'
                    : 'POST_RATE_LIMIT_MAX_COUNTER';

            const _maxCounter = 1;
            const _maxRateLimit = 10;

            const encoder = new TextEncoder();
            // 1: split the UTF-16 string into an array of bytes
            const charCodes = encoder.encode(JSON.stringify(body));
            // 2: concatenate byte data to create a binary string
            const theBody = String.fromCharCode(...charCodes);

            const reqData = btoa(
                JSON.stringify({
                    url: reqUrl,
                    body: theBody,
                    ip
                })
            );
            const requestLimitCount = `${reqData}_count`;
            const reqLimitTime = `${reqName}_time`;

            const [cacheName, limitCount, limitTime] = await Promise.all([
                redisClient.get<string>(reqData),
                redisClient.get<string>(requestLimitCount),
                redisClient.get<string>(reqLimitTime)
            ]);

            const currentTime = Date.now();

            const reqCounter = limitCount ? parseFloat(limitCount) : 0;

            const reqTimeEx = limitTime ? parseFloat(limitTime) : _maxRateLimit;

            if (cacheName && !isEmpty(cacheName)) {
                const firstRequestTime = Number(cacheName);
                const elapsedTime = currentTime - firstRequestTime;

                if (reqCounter >= _maxCounter) {
                    if (elapsedTime <= reqTimeEx) {
                        next(
                            new CustomException(
                                'Too many requests, try again later',
                                httpStatus.TOO_MANY_REQUESTS
                            )
                        );
                    }
                }

                const nextEstimateExp = reqTimeEx / 1000;
                const nextCounter = String(reqCounter + 1);
                await redisClient.set({
                    key: requestLimitCount,
                    value: nextCounter,
                    expiryInSeconds: nextEstimateExp
                });
            } else {
                const nextEstimateExp = reqTimeEx / 1000;
                const nextCounter = String(1);
                void Promise.all([
                    redisClient.set({
                        key: requestLimitCount,
                        value: nextCounter,
                        expiryInSeconds: nextEstimateExp
                    }),
                    redisClient.set({
                        key: reqData,
                        value: String(currentTime),
                        expiryInSeconds: nextEstimateExp
                    })
                ]);
            }
            next();
        } catch (error: unknown) {
            fixedTag.error(`Error -> ${String(error)}`);
            next(
                new CustomException(
                    'Internal Server Error',
                    httpStatus.INTERNAL_SERVER_ERROR
                )
            );
        }
    }
};
