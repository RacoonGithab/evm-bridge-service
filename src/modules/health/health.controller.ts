import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller({ path: 'health' })
export class HealthController {
    constructor(private readonly healthService: HealthService) { }

    @Get()
    health(): Readonly<{ status: string, timestamp: string }> {
        return this.healthService.getHealth();
    }
}