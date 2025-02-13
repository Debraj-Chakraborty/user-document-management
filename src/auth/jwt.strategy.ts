import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { internalServerErrorFormatter } from 'src/Helper/global-utils/internal-server-error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      return { id: payload.sub, username: payload.username, role: payload.role };
    } catch (error) {
      throw new HttpException(internalServerErrorFormatter('Token expired or invalid',HttpStatus.UNAUTHORIZED),HttpStatus.UNAUTHORIZED);
    }
  }
}