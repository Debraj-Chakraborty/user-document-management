import { Controller, Post, Body, Headers, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Logger } from '@nestjs/common';
import { internalServerError } from 'src/Helper/global-utils/internal-server-error';

@ApiTags('Authentication')
@Controller({
    path: '/auth',
    version: '1',
})
export class AuthController {
    private readonly logger = new Logger('AuthController');

    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 400, description: 'Invalid data provided.' })
    async register(@Body() body: RegisterDto) {
        try {
            const { username, password } = body;
            await this.authService.register(username, password);
            return {
                status: 'SUCCESS',
                time_stamp: new Date(),
                message: 'user registered successfully'
            }
        } catch (error) {
            throw new HttpException(
                internalServerError(`Error in register user:${error}`,HttpStatus.INTERNAL_SERVER_ERROR),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged in.' })
    @ApiResponse({ status: 401, description: 'Invalid credentials.' })
    async login(@Body() body: LoginDto) {
        try {
            const user = await this.authService.validateUser(body.username, body.password);
            const userData = await this.authService.login(user);
            return {
                status: 'SUCCESS',
                time_stamp: new Date(),
                message: 'user loggedin successfully',
                data:userData
            }
        } catch (error) {
            throw new HttpException(internalServerError('Invalid credentials',HttpStatus.UNAUTHORIZED), HttpStatus.UNAUTHORIZED);
        }
    }

    @Post('logout')
    @ApiOperation({ summary: 'Logout a user' })
    @ApiResponse({ status: 200, description: 'User successfully logged out.' })
    @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or expired token.' })
    @ApiResponse({ status: 400, description: 'Bad Request: Invalid authorization header or token.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    async logout(@Headers('authorization') authorization: string): Promise<any> {
        try {
            if (!authorization) {
                throw new Error('Authorization header is missing');
            }

            if (!authorization.startsWith('Bearer ')) {
                throw new Error('Invalid authorization header format');
            }

            const token = authorization.split(' ')[1];
            if (!token) {
                throw new Error('Token is missing in authorization header');
            }

            this.logger.log(`Token: ${token}`);
            await this.authService.logout(token);
            return {
                status: 'SUCCESS',
                time_stamp: new Date(),
                message: 'user logout successfully',
            }
        } catch (error) {
            this.logger.error(`Error logging out: ${error.message}`);
            throw new HttpException(internalServerError(error.message || `Internal Server Error`,HttpStatus.UNAUTHORIZED), HttpStatus.UNAUTHORIZED);

        }
    }
}