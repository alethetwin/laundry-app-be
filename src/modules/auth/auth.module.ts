import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtStrategy } from './jwt.strategy.js';
import { PasswordService } from './password.service.js';
import { AdminGuard } from './guards/admin.guard.js';
import { PrismaService } from '../../prisma.service.js';
import { LogsModule } from '../logger/logger.module.js';
import { CrudModule } from '../crud/crud.module.js';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => {
                const jwtSecret = configService.get<string>('JWT_SECRET');
                if (!jwtSecret) {
                    throw new Error(
                        'JWT_SECRET environment variable is not set. Please set it in your .env file.',
                    );
                }
                return {
                    secret: jwtSecret,
                    signOptions: {
                        expiresIn: (configService.get<string>(
                            'JWT_EXPIRES_IN',
                        ) || 24 * 60 * 60) as number,
                    },
                };
            },
            inject: [ConfigService],
        }),
        LogsModule,
        forwardRef(() => CrudModule),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        PasswordService,
        PrismaService,
        AdminGuard,
    ],
    exports: [AuthService, JwtStrategy, PasswordService, AdminGuard],
})
export class AuthModule {}
