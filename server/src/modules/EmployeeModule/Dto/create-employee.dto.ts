import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsString,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  surName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  @IsNotEmpty()
  positionId: number;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsNumber()
  @Min(0)
  salary: number;
}
