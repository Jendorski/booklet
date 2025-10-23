/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConnectionOptions, Queue } from 'bullmq';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { container } from 'tsyringe';
import { Config } from '../config/Config';
import { cacheConnection } from '../../cache/cacheConnection';

export const queueRouter = express.Router();

const config = container.resolve(Config);
const BASIC_AUTH_CHALLENGE = config.get<string>(
    'BASIC_AUTH_CHALLENGE'
) as string;

const serverAdapter = new ExpressAdapter();
const queues = ['email_queue', 'sms_queue'].map(
    (name) =>
        new BullMQAdapter(
            new Queue(name, {
                connection: cacheConnection as ConnectionOptions
            })
        )
);

serverAdapter.setBasePath('/letts/qb');

createBullBoard({ queues, serverAdapter });

queueRouter.use(
    basicAuth({
        challenge: true,
        users: { qs: BASIC_AUTH_CHALLENGE }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    }),
    serverAdapter.getRouter()
);
