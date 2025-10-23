import { Controller, Get, Route, Tags } from 'tsoa';

@Route('/health')
@Tags('Health')
export class HealthEndpointController extends Controller {
    @Get('')
    async getMessage() {
        const promise = await Promise.resolve({
            message: 'healthy',
            date: new Date().toISOString()
        });
        return promise;
    }
}
