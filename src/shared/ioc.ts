import { IocContainer } from 'tsoa';
import { container } from 'tsyringe';

export const iocContainer: IocContainer = {
    get: <T>(controller: unknown): T => container.resolve<T>(controller as never)
};
