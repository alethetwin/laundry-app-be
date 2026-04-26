import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { PrismaService } from './prisma.service.js';
import { CrudModule } from './modules/crud/crud.module.js';
import { LogsModule } from './modules/logger/logger.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthCheckModule } from './modules/health-check/health-check.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        HealthCheckModule,
        LogsModule,
        AuthModule,
        CrudModule,
    ],
    controllers: [],
    providers: [
        PrismaService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        },
    ],
})
export class AppModule {}
