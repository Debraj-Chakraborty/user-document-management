import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const dto: RegisterDto = { username: 'testuser', password: 'password123' };
      jest.spyOn(authService, 'register').mockResolvedValue(undefined);

      await expect(authController.register(dto)).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'user registered successfully',
      });
    });

    it('should throw an error if registration fails', async () => {
      const dto: RegisterDto = { username: 'testuser', password: 'password123' };
      jest.spyOn(authService, 'register').mockRejectedValue(new Error('Registration failed'));

      await expect(authController.register(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const dto: LoginDto = { username: 'testuser', password: 'password123' };
      const userData = { access_token: 'jwt-token', username:'testuser', role: 'user' };
      const mockUser = { 
        id: 1, 
        username: 'testuser', 
        password: 'hashedpassword', 
        role: 'user', 
        is_active: true, 
        created_at: new Date(), 
        updated_at: new Date() 
      } as any;
      
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'login').mockResolvedValue({ 
        access_token: 'jwt-token', 
        username: 'testuser',
        role: 'user'
      });
      

      await expect(authController.login(dto)).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'user loggedin successfully',
        data: userData,
      });
    });

    it('should throw an error if login fails', async () => {
      const dto: LoginDto = { username: 'testuser', password: 'wrongpassword' };
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(dto)).rejects.toThrow(HttpException);
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);
      const authHeader = 'Bearer jwt-token';

      await expect(authController.logout(authHeader)).resolves.toEqual({
        status: 'SUCCESS',
        time_stamp: expect.any(Date),
        message: 'user logout successfully',
      });
    });

    it('should throw an error if authorization header is missing', async () => {
      await expect(authController.logout('')).rejects.toThrow(HttpException);
    });

    it('should throw an error if token is invalid', async () => {
      jest.spyOn(authService, 'logout').mockRejectedValue(new Error('Invalid token'));
      await expect(authController.logout('Bearer invalid-token')).rejects.toThrow(HttpException);
    });
  });
});