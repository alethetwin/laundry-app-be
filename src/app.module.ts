import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { PrismaService } from './prisma.service.js';
import { CrudModule } from './modules/crud/crud.module.js';
import { LogsModule } from './modules/logger/logger.module.js';
import { UserModule } from './modules/user/user.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        LogsModule,
        CrudModule,
        UserModule,
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
