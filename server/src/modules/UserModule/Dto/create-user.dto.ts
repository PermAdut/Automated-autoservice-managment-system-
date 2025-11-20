import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  IsIn,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User name', type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User login', type: String })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ description: 'User surName', type: String })
  @IsString()
  @IsNotEmpty()
  surName: string;

  @ApiProperty({ description: 'User email', type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User phone', type: String })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'User password', type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User passport identity number', type: String })
  @IsString()
  @IsNotEmpty()
  passportIdentityNumber: string;

  @ApiProperty({ description: 'User passport nationality', type: String })
  @IsString()
  @IsNotEmpty()
  passportNationality: string;

  @ApiProperty({ description: 'User passport birth date', type: Date })
  @IsDateString()
  @IsNotEmpty()
  passportBirthDate: string;

  @ApiProperty({ description: 'User passport gender', enum: ['M', 'F'] })
  @IsString()
  @IsIn(['M', 'F'])
  @IsNotEmpty()
  passportGender: 'M' | 'F';

  @ApiProperty({ description: 'User passport expiry date', type: Date })
  @IsDateString()
  @IsNotEmpty()
  passportExpirationDate: string;
}
