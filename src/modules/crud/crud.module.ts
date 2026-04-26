import { Module, forwardRef } from '@nestjs/common';
import { CrudController } from './crud.controller.js';
import { CrudService } from './crud.service.js';
import { PrismaService } from '../../prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
    imports: [forwardRef(() => AuthModule)],
    controllers: [CrudController],
    providers: [CrudService, PrismaService, LoggerService],
    exports: [CrudService],
})
export class CrudModule {}
