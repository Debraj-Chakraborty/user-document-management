import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export class RegisterDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'Admin',
    required: true,
  })
  @IsString()
  @IsNotEmpty({message: 'Username is required'})
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'admin@123!',
    required: true,
  })
  @IsString()
  @IsNotEmpty({message: 'Password is required'})
  password: string;
}
