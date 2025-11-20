import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
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

  @ApiProperty({ description: 'User password for verification', type: String })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password: string;
}
