import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role, UserToken } from '../entity';
import { ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
};

const mockRoleRepo = {
  findOne: jest.fn(),
};

const mockTokenRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mockedToken'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
        { provide: getRepositoryToken(UserToken), useValue: mockTokenRepo },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.count.mockResolvedValue(0);
      mockUserRepo.create.mockReturnValue({ username: 'test', password: 'hashedPassword', hashPassword: jest.fn() });
      mockUserRepo.save.mockResolvedValue({ id: 1, username: 'test' });
      
      await expect(authService.register('test', 'password')).resolves.toEqual({ id: 1, username: 'test' });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ username: 'test' });
      
      await expect(authService.register('test', 'password')).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const mockUser = { username: 'test', validatePassword: jest.fn().mockResolvedValue(true) };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      
      await expect(authService.validateUser('test', 'password')).resolves.toEqual(mockUser);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const mockUser = { username: 'test', validatePassword: jest.fn().mockResolvedValue(false) };
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      
      await expect(authService.validateUser('test', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return a token and user details', async () => {
      const mockUser: User = {
        id: 1,
        username: 'test',
        password: 'hashedPassword',
        role: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_on: null,
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      };
  
      mockRoleRepo.findOne.mockResolvedValue({ id: 2, name: 'editor' });
      mockTokenRepo.findOne.mockResolvedValue(null);
      mockTokenRepo.save.mockResolvedValue({});
  
      await expect(authService.login(mockUser)).resolves.toEqual({
        access_token: 'mockedToken',
        username: 'test',
        role: 'editor',
      });
    });
  });  

  describe('logout', () => {
    it('should delete user token', async () => {
      mockTokenRepo.delete.mockResolvedValue({});
      await expect(authService.logout('mockedToken')).resolves.toBeUndefined();
    });
  });
});
