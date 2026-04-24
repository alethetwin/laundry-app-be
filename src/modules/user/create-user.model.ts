import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        type: String,
    })
    @IsString()
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        type: String,
    })
    @IsString()
    lastName: string;

    @ApiProperty({
        description: 'Email address of the user',
        example: 'john.doe@example.com',
        type: String,
        format: 'email',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password for the user account',
        example: 'SecurePassword123!',
        type: String,
        format: 'password',
        minLength: 8,
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]/,
        {
            message:
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password: string;
}
