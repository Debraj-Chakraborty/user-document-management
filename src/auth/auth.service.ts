import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User , Role , UserToken } from '../entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(UserToken) private tokenRepo: Repository<UserToken>,
    private jwtService: JwtService,
  ) {}

  async register(username: string, password: string) {
    try {
      const existingUser = await this.userRepo.findOne({ where: { username } });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
      
      const roleId = (await this.userRepo.count()) === 0 ? 1 : parseInt(process.env.DEFAULT_ROLE, 10);
      const user = this.userRepo.create({ username, password, role: roleId });
  
      await user.hashPassword();
  
      return await this.userRepo.save(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error registering user');
    }
  }
  

  async validateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.userRepo.findOne({ where: { username } });

      if (user && (await user.validatePassword(password))) {
        return user;
      }

      throw new UnauthorizedException('Invalid credentials');
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error validating user');
    }
  }

  async login(user: User) {
    try {
      const payload = { username: user.username, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET,expiresIn: process.env.JWT_EXPIRATION });
  
      const existingLogInUser = await this.tokenRepo.findOne({ where: { user: user.id } });
  
      if (existingLogInUser) {
        existingLogInUser.token = token;
        await this.tokenRepo.save(existingLogInUser);
      } else {
        await this.tokenRepo.save({ user: user.id, token });
      }
  
      const userRole = await this.roleRepo.findOne({ where: { id: user.role } });
  
      if (!userRole) {
        throw new InternalServerErrorException(`Role with ID ${user.role} not found`);
      }
  
      return {
        access_token: token,
        username: user.username,
        role: userRole.name,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error during login');
    }
  }
  
  async logout(token: string) {
    await this.tokenRepo.delete({ token });
  }

  validateToken(authorization: string): any {
    if (!authorization) {
      throw new HttpException('Authorization header is missing', HttpStatus.BAD_REQUEST);
    }

    if (!authorization.startsWith('Bearer ')) {
      throw new HttpException('Invalid authorization header format', HttpStatus.BAD_REQUEST);
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new HttpException('Token is missing in authorization header', HttpStatus.BAD_REQUEST);
    }

    try {
      return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new HttpException(
          'Token has expired. Please log in again.',
          HttpStatus.UNAUTHORIZED
        );
      } else {
        throw new HttpException(
          'Invalid or malformed token.',
          HttpStatus.UNAUTHORIZED
        );
      }
    }
  }
}
