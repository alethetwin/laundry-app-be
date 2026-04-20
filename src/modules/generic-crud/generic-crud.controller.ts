/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiResponse,
} from '@nestjs/swagger';

import { GenericCrud, ModelName } from './generic-crud.service.js';

@ApiTags('Generic CRUD')
@Controller('generic')
export class GenericCrudController {
    constructor(private readonly crud: GenericCrud) {}

    /*
   =========================
   FIND ALL
   =========================
  */

    @Get(':model')
    @ApiOperation({
        summary: 'Find many records',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiQuery({
        name: 'where',
        required: false,
        example: '{"email":"test@mail.com"}',
    })
    @ApiQuery({
        name: 'include',
        required: false,
        example: '{"profile":true}',
    })
    @ApiQuery({
        name: 'select',
        required: false,
        example: '{"id":true}',
    })
    @ApiQuery({
        name: 'orderBy',
        required: false,
        example: '{"createdAt":"desc"}',
    })
    @ApiQuery({
        name: 'skip',
        required: false,
        example: 0,
    })
    @ApiQuery({
        name: 'take',
        required: false,
        example: 10,
    })
    @ApiResponse({
        status: 200,
        description: 'Records retrieved',
    })
    async findAll(@Param('model') model: ModelName, @Query() query: any) {
        const args = this.parseQuery(query);

        return this.crud.findAll(model, args);
    }

    /*
   =========================
   FIND ONE
   =========================
  */

    @Get(':model/one')
    @ApiOperation({
        summary: 'Find one record',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiQuery({
        name: 'where',
        required: true,
        example: '{"id":"uuid"}',
    })
    async findOne(
        @Param('model') model: ModelName,
        @Query('where') where: string,
    ) {
        return this.crud.findOne(model, {
            where: this.safeJson(where),
        });
    }

    /*
   =========================
   CREATE
   =========================
  */

    @Post(':model')
    @ApiOperation({
        summary: 'Create record',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiBody({
        schema: {
            example: {
                data: {
                    email: 'test@mail.com',
                    password: '123',
                },
            },
        },
    })
    async create(@Param('model') model: ModelName, @Body() body: any) {
        return this.crud.create(model, {
            data: body.data,
        });
    }

    /*
   =========================
   UPDATE
   =========================
  */

    @Patch(':model')
    @ApiOperation({
        summary: 'Update record',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiBody({
        schema: {
            example: {
                where: {
                    id: 'uuid',
                },
                data: {
                    name: 'Updated',
                },
            },
        },
    })
    async update(@Param('model') model: ModelName, @Body() body: any) {
        return this.crud.update(model, {
            where: body.where,
            data: body.data,
        });
    }

    /*
   =========================
   DELETE
   =========================
  */

    @Delete(':model')
    @ApiOperation({
        summary: 'Delete record',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiBody({
        schema: {
            example: {
                where: {
                    id: 'uuid',
                },
            },
        },
    })
    async delete(@Param('model') model: ModelName, @Body() body: any) {
        return this.crud.delete(model, {
            where: body.where,
        });
    }

    /*
   =========================
   COUNT
   =========================
  */

    @Get(':model/count')
    @ApiOperation({
        summary: 'Count records',
    })
    @ApiParam({
        name: 'model',
        enum: ModelName,
    })
    @ApiQuery({
        name: 'where',
        required: false,
        example: '{"active":true}',
    })
    async count(@Param('model') model: ModelName, @Query() query: any) {
        const args = this.parseQuery(query);

        return this.crud.count(model, args);
    }

    /*
   =========================
   HELPERS
   =========================
  */

    private parseQuery(query: any) {
        const args: any = {};

        if (query.where) args.where = this.safeJson(query.where);

        if (query.include) args.include = this.safeJson(query.include);

        if (query.select) args.select = this.safeJson(query.select);

        if (query.orderBy) args.orderBy = this.safeJson(query.orderBy);

        if (query.skip) args.skip = Number(query.skip);

        if (query.take) args.take = Number(query.take);

        return args;
    }

    private safeJson(value?: string) {
        if (!value) return undefined;

        try {
            return JSON.parse(value);
        } catch {
            throw new Error('Invalid JSON in query parameter');
        }
    }
}
