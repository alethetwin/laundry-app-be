import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service.js';
import { LogsController } from './logger.controller.js';

@Module({
  controllers: [LogsController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LogsModule {}
