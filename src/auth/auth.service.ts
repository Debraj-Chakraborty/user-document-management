import { Injectable, ConflictException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
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
      throw new InternalServerErrorException('Error registering user', error);
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
      const token = this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRATION });
  
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
}
