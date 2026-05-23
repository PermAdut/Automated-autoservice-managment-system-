import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ description: 'User name', type: String, required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'User surName', type: String, required: false })
  @IsString()
  @IsOptional()
  surName?: string;

  @ApiProperty({ description: 'User email', type: String, required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'User phone', type: String, required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'User password for verification',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: 'User role id', type: String, required: false })
  @IsOptional()
  @IsUUID()
  roleId?: string;

  @ApiProperty({ description: 'Block user account', type: Boolean, required: false })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;

  @ApiProperty({ description: 'Profile avatar URL', type: String, required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
