/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';

export enum ModelName {
    USER = 'USER',
    CARE_INSTRUCTION = 'CARE_INSTRUCTION',
    CLOTH_CARE_INSTRUCTION = 'CLOTH_CARE_INSTRUCTION',
    CLOTH = 'CLOTH',
    CLOSET = 'CLOSET',
    WASHING_MACHINE = 'WASHING_MACHINE',
    WASHING_INSTRUCTIONS = 'WASHING_INSTRUCTIONS',
    LAUNDRY_BATCH = 'LAUNDRY_BATCH',
}

type ModelMap = {
    [ModelName.USER]: PrismaService['user'];

    [ModelName.CARE_INSTRUCTION]: PrismaService['careInstruction'];

    [ModelName.CLOTH_CARE_INSTRUCTION]: PrismaService['clothCareInstruction'];

    [ModelName.CLOTH]: PrismaService['cloth'];

    [ModelName.CLOSET]: PrismaService['closet'];

    [ModelName.WASHING_MACHINE]: PrismaService['washingMachine'];

    [ModelName.WASHING_INSTRUCTIONS]: PrismaService['washingInstruccions'];

    [ModelName.LAUNDRY_BATCH]: PrismaService['laundryBatch'];
};

@Injectable()
export class GenericCrud {
    private readonly models: ModelMap;

    constructor(private readonly prisma: PrismaService) {
        this.models = {
            [ModelName.USER]: this.prisma.user,

            [ModelName.CARE_INSTRUCTION]: this.prisma.careInstruction,

            [ModelName.CLOTH_CARE_INSTRUCTION]:
                this.prisma.clothCareInstruction,

            [ModelName.CLOTH]: this.prisma.cloth,

            [ModelName.CLOSET]: this.prisma.closet,

            [ModelName.WASHING_MACHINE]: this.prisma.washingMachine,

            [ModelName.WASHING_INSTRUCTIONS]: this.prisma.washingInstruccions,

            [ModelName.LAUNDRY_BATCH]: this.prisma.laundryBatch,
        };
    }

    private getModel<T extends ModelName>(model: T): ModelMap[T] {
        const selectedModel = this.models[model];

        if (!selectedModel) {
            throw new Error(`Model ${model} not supported`);
        }

        return selectedModel;
    }

    async findAll<T extends ModelName>(
        model: T,
        args?: Parameters<ModelMap[T]['findMany']>[0],
    ): Promise<ReturnType<ModelMap[T]['findMany']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).findMany(args);
    }

    async findOne<T extends ModelName>(
        model: T,
        args: Parameters<ModelMap[T]['findUnique']>[0],
    ): Promise<ReturnType<ModelMap[T]['findUnique']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).findUnique(args);
    }

    async create<T extends ModelName>(
        model: T,
        args: Parameters<ModelMap[T]['create']>[0],
    ): Promise<ReturnType<ModelMap[T]['create']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).create(args);
    }

    async update<T extends ModelName>(
        model: T,
        args: Parameters<ModelMap[T]['update']>[0],
    ): Promise<ReturnType<ModelMap[T]['update']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).update(args);
    }

    async delete<T extends ModelName>(
        model: T,
        args: Parameters<ModelMap[T]['delete']>[0],
    ): Promise<ReturnType<ModelMap[T]['delete']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).delete(args);
    }

    async count<T extends ModelName>(
        model: T,
        args?: Parameters<ModelMap[T]['count']>[0],
    ): Promise<ReturnType<ModelMap[T]['count']>> {
        // @ts-expect-error error por generico
        return await this.getModel(model).count(args);
    }
}
