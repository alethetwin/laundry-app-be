import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { LoggerService } from './logger.service.js';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve application logs as plain text' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter logs by date (YYYY-MM-DD format)' })
  @ApiQuery({ name: 'level', required: false, description: 'Filter logs by level (info, error, warn, debug, verbose)' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully as plain text' })
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
        "Failed to retrieve logs:" ,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Test logging functionality' })
  @ApiResponse({ status: 200, description: 'Test log entries created' })
  async testLogging() {
    this.loggerService.log('This is a test info log', 'LogsController');
    this.loggerService.warn('This is a test warning log', 'LogsController');
    this.loggerService.error('This is a test error log', 'test-stack-trace', 'LogsController');
    this.loggerService.debug('This is a test debug log', 'LogsController');
    this.loggerService.verbose('This is a test verbose log', 'LogsController');

    return {
      success: true,
      message: 'Test log entries created successfully',
    };
  }
}
