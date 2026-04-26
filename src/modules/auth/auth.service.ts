import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service.js';
import { PasswordService } from './password.service.js';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly passwordService: PasswordService,
        private readonly logger: LoggerService,
    ) {}

    async validateUser(email: string, password: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                this.logger.warn(`User not found: ${email}`, 'AuthService');
                return null;
            }

            this.logger.log(
                `JWT secret: ${this.configService.get<string>('JWT_SECRET')}`,
                'AuthService',
            );

            const isPasswordValid = await this.passwordService.comparePassword(
                password,
                user.password,
            );

            if (!isPasswordValid) {
                this.logger.warn(
                    `Invalid password for user: ${email}`,
                    'AuthService',
                );
                return null;
            }

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            this.logger.error(
                'Error during user validation',
                error.stack,
                'AuthService',
            );
            throw error;
        }
    }

    async login(user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }) {
        try {
            const payload = {
                sub: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            };

            const token = this.jwtService.sign(payload);

            this.logger.log(
                `User logged in successfully: ${user.email}`,
                'AuthService',
            );

            return {
                access_token: token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            };
        } catch (error) {
            this.logger.error('Error during login', error.stack, 'AuthService');
            throw error;
        }
    }

    async refreshToken(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const payload = {
                sub: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            };

            const token = this.jwtService.sign(payload);

            this.logger.log(
                `Token refreshed for user: ${user.email}`,
                'AuthService',
            );

            return {
                access_token: token,
            };
        } catch (error) {
            this.logger.error(
                'Error during token refresh',
                error.stack,
                'AuthService',
            );
            throw error;
        }
    }
}
