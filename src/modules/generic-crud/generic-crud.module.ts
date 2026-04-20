import { Module } from '@nestjs/common';
import { GenericCrudController } from './generic-crud.controller.js';
import { GenericCrud } from './generic-crud.service.js';
import { PrismaService } from '../../prisma.service.js';

@Module({
    controllers: [GenericCrudController],
    providers: [GenericCrud, PrismaService],
})
export class GenericCrudModule {}
