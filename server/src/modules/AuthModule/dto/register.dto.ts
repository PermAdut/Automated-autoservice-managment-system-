import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsDateString,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  login: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  surName: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsString()
  passportIdentityNumber: string;

  @IsDateString()
  passportBirthDate: string;

  @IsIn(['M', 'F'])
  passportGender: 'M' | 'F';
}
