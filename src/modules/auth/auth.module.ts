import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { PasswordService } from './password.service.js';
import { PrismaService } from '../../prisma.service.js';
import { LogsModule } from '../logger/logger.module.js';
import { CrudModule } from '../crud/crud.module.js';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: {
                expiresIn: '24h',
            },
        }),
        LogsModule,
        CrudModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PasswordService, PrismaService],
    exports: [AuthService, JwtStrategy, PasswordService],
})
export class AuthModule {}
