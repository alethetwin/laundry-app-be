import {
    Body,
    Controller,
    Post,
    ValidationPipe,
    UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service.js';
import { CreateUserDto } from './create-user.model.js';
import { User } from '../../generated/nestjs-dto/user.entity.js';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    @UsePipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    )
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        type: User,
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - Validation failed',
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User with this email already exists',
    })
    async register(@Body() newUser: CreateUserDto) {
        return this.userService.register(newUser);
    }
}
