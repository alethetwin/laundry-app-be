# JWT Authentication Documentation

This document explains how to use the JWT authentication system implemented in the laundry-app-be NestJS application.

## Overview

The application uses JSON Web Tokens (JWT) for authentication. The authentication system includes:
- User registration and login
- JWT token generation and validation
- Protected routes with authentication guards
- Password hashing with bcrypt

## Environment Variables

Make sure to configure these environment variables in your `.env` file:

```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
```

## API Endpoints

### Authentication Endpoints

#### Register User
- **POST** `/auth/register`
- **Body**: 
  ```json
  {
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object without password

#### Login User
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
  ```

#### Get Profile (Protected)
- **GET** `/auth/profile`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Current user profile

#### Refresh Token (Protected)
- **POST** `/auth/refresh`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: New access token

### User Endpoints

#### Get User Profile (Protected)
- **GET** `/user/profile`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: Current user profile

## Using JWT Tokens

### Making Authenticated Requests

To access protected routes, include the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:3000/auth/profile
```

### Token Format

The JWT token is a bearer token that should be included in the Authorization header:
```
Authorization: Bearer <token>
```

## Protecting Routes

To protect any route in your controllers, use the `JwtAuthGuard`:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('example')
export class ExampleController {
  @Get('protected')
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Request() req) {
    // req.user contains the authenticated user information
    return { message: 'This is protected', user: req.user };
  }
}
```

## User Information in Protected Routes

When a route is protected with `JwtAuthGuard`, the authenticated user information is available in the request object:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  // req.user contains:
  // {
  //   id: string,
  //   email: string,
  //   firstName: string,
  //   lastName: string,
  //   createdAt: Date,
  //   updatedAt: Date
  // }
  return req.user;
}
```

## Security Considerations

1. **JWT Secret**: Always use a strong, unique JWT secret in production
2. **Token Expiration**: Set appropriate token expiration times
3. **HTTPS**: Always use HTTPS in production to protect tokens in transit
4. **Password Security**: Passwords are hashed using bcrypt with 10 salt rounds
5. **Input Validation**: All inputs are validated using class-validator

## Error Handling

Common authentication errors:

- **401 Unauthorized**: Invalid credentials, missing or invalid token
- **409 Conflict**: User with email already exists (during registration)
- **400 Bad Request**: Validation errors in input data

## Testing the Authentication

You can test the authentication system using the following steps:

1. **Register a user**:
   ```bash
   curl -X POST http://localhost:3000/auth/register \
        -H "Content-Type: application/json" \
        -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
   ```

2. **Login to get token**:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"john@example.com","password":"password123"}'
   ```

3. **Access protected route**:
   ```bash
   curl -H "Authorization: Bearer <token-from-step-2>" \
        http://localhost:3000/auth/profile
   ```

## Swagger Documentation

The API includes comprehensive Swagger documentation. Visit `http://localhost:3000/api` to explore the interactive API documentation.

## Implementation Details

### Files Created/Modified

- `src/modules/auth/` - New authentication module
  - `auth.module.ts` - Module configuration
  - `auth.service.ts` - Authentication business logic
  - `auth.controller.ts` - Authentication endpoints
  - `jwt.strategy.ts` - JWT passport strategy
  - `jwt-auth.guard.ts` - JWT authentication guard
  - `password.service.ts` - Password hashing service
  - `dto/` - Data transfer objects
    - `login.dto.ts` - Login validation
    - `auth-response.dto.ts` - Authentication response

- `src/modules/user/user.controller.ts` - Modified to include protected profile endpoint
- `src/app.module.ts` - Updated to include AuthModule
- `.env` - Added JWT configuration

### Dependencies Added

- `@nestjs/jwt` - JWT token handling
- `@nestjs/passport` - Passport authentication framework
- `passport` - Authentication middleware
- `passport-jwt` - JWT strategy for Passport
- `@types/passport-jwt` - TypeScript definitions

The JWT authentication system is now fully integrated and ready for use!
