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
    OmitType,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../generated/nestjs-dto/create-user.dto.js';
import { CrudService, ModelName } from '../crud/crud.service.js';
import { AuthService } from './auth.service.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { PasswordService } from './password.service.js';
import { UserDto } from '../../generated/nestjs-dto/user.dto.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly crudService: CrudService,
        private readonly passwordService: PasswordService,
    ) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({
        status: 409,
        description: 'User with this email already exists.',
    })
    async register(@Body() createUserDto: CreateUserDto) {
        // Hash the password
        const hashedPassword = await this.passwordService.hashPassword(
            createUserDto.password,
        );

        // Create user with hashed password and default USER role
        const user = await this.crudService.create(ModelName.USER, {
            data: {
                ...createUserDto,
                password: hashedPassword,
                role: 'USER',
            },
        });

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
            message: 'User registered successfully',
            user: userWithoutPassword,
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
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'Profile retrieved successfully.',
        type: OmitType(UserDto, ['password']),
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getProfile(@Request() req) {
        return req.user;
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Refresh JWT token' })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully.',
        schema: {
            type: 'object',
            properties: {
                access_token: {
                    type: 'string',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async refreshToken(@Request() req) {
        return this.authService.refreshToken(req.user.id);
    }
}
