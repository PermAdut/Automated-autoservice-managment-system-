import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserRequestDto {
  @ApiProperty({
    description: 'User name',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'User login',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'User surName',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  surName: string;

  @ApiProperty({
    description: 'User email',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User phone',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'User password',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User passport identity number',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  passportIdentityNumber: string;

  @ApiProperty({
    description: 'User passport nationality',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  passportNationality: string;

  @ApiProperty({
    description: 'User passport birth date',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  passportBirthDate: Date;

  @ApiProperty({
    description: 'User passport gender',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  passportGender: 'M' | 'F';

  @ApiProperty({
    description: 'User passport expiry date',
    type: Date,
  })
  @IsDate()
  @IsNotEmpty()
  passportExpirationDate: Date;
}
