import { Module } from '@nestjs/common';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';
import { PasswordService } from '../auth/password.service.js';
import { PrismaService } from '../../prisma.service.js';
import { LogsModule } from '../logger/logger.module.js';

@Module({
    imports: [LogsModule],
    controllers: [UserController],
    providers: [UserService, PasswordService, PrismaService],
    exports: [UserService],
})
export class UserModule {}
