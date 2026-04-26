import {
    Controller,
    Get,
    Query,
    HttpException,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { LoggerService } from './logger.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
// test

@ApiTags('logs')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth('access-token')
@Controller('logs')
export class LogsController {
    constructor(private readonly loggerService: LoggerService) {}

    @Get()
    @ApiOperation({ summary: 'Retrieve application logs as plain text' })
    @ApiQuery({
        name: 'date',
        required: false,
        description: 'Filter logs by date (YYYY-MM-DD format)',
    })
    @ApiQuery({
        name: 'level',
        required: false,
        description: 'Filter logs by level (info, error, warn, debug, verbose)',
    })
    @ApiResponse({
        status: 200,
        description: 'Logs retrieved successfully as plain text',
    })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    async getLogs(
        @Query('date') date?: string,
        @Query('level') level?: string,
    ) {
        try {
            const logs = await this.loggerService.getLogs(date, level);

            if (logs.length === 0) {
                return 'No logs found for the specified criteria.';
            }

            return logs.join('\n\n');
        } catch (error) {
            throw new HttpException(
                'Failed to retrieve logs:',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
