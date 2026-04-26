import { Module } from '@nestjs/common';
import { CrudController } from './crud.controller.js';
import { CrudService } from './crud.service.js';
import { PrismaService } from '../../prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';

@Module({
    controllers: [CrudController],
    providers: [CrudService, PrismaService, LoggerService],
    exports: [CrudService],
})
export class CrudModule {}
