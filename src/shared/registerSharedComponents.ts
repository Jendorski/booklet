import { container } from 'tsyringe';
import { Components } from './constants/Components';
import { IJwtService } from './jwt/interface/IJwtService';
import { JWTService } from './jwt/JWTService';
import { QueueService } from './queue/services/Queue.service';
import { IQueueService } from './queue/interfaces/IQueueService';

export const registerSharedComponents = () => {
    container.register<IJwtService>(Components.JWTService, {
        useClass: JWTService
    });
    container.register<IQueueService>(Components.QueueService, {
        useClass: QueueService
    });
};
