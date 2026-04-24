import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';
import { GenericCrudModule } from './modules/generic-crud/generic-crud.module.js';
import { LogsModule } from './modules/logger/logger.module.js';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        GenericCrudModule,
        LogsModule,
    ],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule {}
