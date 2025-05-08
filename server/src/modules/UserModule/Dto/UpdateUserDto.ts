import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  surName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  roleId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  password?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(8)
  @MaxLength(32)
  confirmPassword?: string;
}
