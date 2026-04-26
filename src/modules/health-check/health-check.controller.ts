import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
    constructor() {}

    @Get()
    async check() {
        return { status: 'ok' };
    }
}
