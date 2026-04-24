import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { PasswordService } from '../auth/password.service.js';
import { CreateUserDto } from './create-user.model.js';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
        private readonly passwordService: PasswordService,
    ) {}

    private async create(newUser: PrismaService['user']['create']) {
        try {
            this.logger.log('Creating user', 'UserService');
            // @ts-expect-error error por generico
            const result = await this.prisma.user.create(newUser);
            this.logger.log(
                `User created successfully with ID: ${result.id}`,
                'UserService',
            );
            return result;
        } catch (error) {
            this.logger.error(
                'Error creating user',
                error.stack,
                'UserService',
            );
            throw error;
        }
    }

    async register(createUserDto: CreateUserDto) {
        try {
            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException(
                    'User with this email already exists',
                );
            }

            // Hash the password
            const hashedPassword = await this.passwordService.hashPassword(
                createUserDto.password,
            );

            // Create user with hashed password
            const newUser = await this.prisma.user.create({
                data: {
                    firstName: createUserDto.firstName,
                    lastName: createUserDto.lastName,
                    email: createUserDto.email,
                    password: hashedPassword,
                },
            });

            // Remove password from response
            const { password, ...userWithoutPassword } = newUser;

            this.logger.log(
                `User registered successfully: ${userWithoutPassword.email}`,
                'UserService',
            );

            return userWithoutPassword;
        } catch (error) {
            this.logger.error(
                'Error during user registration',
                error.stack,
                'UserService',
            );
            throw error;
        }
    }
}
