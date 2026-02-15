import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsString,
  IsUUID,
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

  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsNumber()
  @Min(0)
  salary: number;
}
