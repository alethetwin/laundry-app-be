import {
    Body,
    Controller,
    Get,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../generated/nestjs-dto/create-user.dto.js';
import { CrudService, ModelName } from '../crud/crud.service.js';
import { AuthService } from './auth.service.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly crudService: CrudService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({
        status: 409,
        description: 'User with this email already exists.',
    })
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.crudService.create(ModelName.USER, {
            data: createUserDto,
        });
        return {
            message: 'User registered successfully',
            user,
        };
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in.',
        type: AuthResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );

        if (!user) {
            throw new Error('Invalid credentials');
        }

        return this.authService.login(user);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully.',
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getProfile(@Request() req) {
        return {
            message: 'Profile retrieved successfully',
            user: req.user,
        };
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user.id);
    }
}
