/* eslint-disable @stylistic/quotes */
import compression from 'compression';
import { RegisterRoutes } from './routes';
import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { container } from 'tsyringe';
import { Config } from './shared/config/Config';
import { registerSharedComponents } from './shared/registerSharedComponents';
import { queueRouter } from './shared/queue/router';
import swaggerUi from 'swagger-ui-express';
import { errorMiddlewareFn } from './shared/middlewares/error.handler';
import { RateLimitMiddleware } from './shared/middlewares/rateLimitMiddleware';
import morganMiddleware from './shared/logger/morgan';

registerSharedComponents();

const config = container.resolve(Config);

export const server = express();

// Disable detailed errors
server.set('trust proxy', 1);
server.disable('x-powered-by');

server.use(compression());

server.use(express.json());
server.use(morgan('tiny'));
server.use(express.static('public'));

server.use(morganMiddleware);

server.use(
    json({
        limit: '50mb',
        verify(req, _, buf) {
            (req as unknown as { rawBody: Buffer }).rawBody = buf;
        }
    })
);

server.use(
    helmet({
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        originAgentCluster: false,
        referrerPolicy: {
            policy: 'no-referrer'
        },
        hsts: {
            maxAge: 7776000 //90 days
        },
        noSniff: false,
        frameguard: {
            action: 'deny'
        },
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:']
            }
        },
        ieNoOpen: false,
        xssFilter: true,
        hidePoweredBy: false,
        permittedCrossDomainPolicies: {
            permittedPolicies: 'none'
        }
    })
);
server.use(urlencoded({ extended: true }));

//Get back to this later
server.use(
    cors({
        origin: (origin, callback) => {
            if (config.get('ENV') !== 'production') {
                callback(null, origin);
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: true,
        optionsSuccessStatus: 200,
        allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept'
    })
);
server.options('*', cors());

server.use('/letts/qb', queueRouter);
server.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(undefined, {
        explorer: true,
        swaggerOptions: {
            url: '/swagger.json'
        }
    })
);

RegisterRoutes(server);

//server.use(router)
server.use(errorMiddlewareFn());
server.use(RateLimitMiddleware.fixedRateLimit);
