import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsISO8601, IsString, IsUUID } from 'class-validator';

@Exclude()
export class QualificationResponse {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsUUID()
  @Expose()
  workTypeId: string;

  @ApiProperty()
  @IsString()
  @Expose()
  workTypeName: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Expose()
  level: number;
}

@Exclude()
export class ContactResponse {
  @ApiProperty({ nullable: true })
  @Expose()
  email?: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  phone?: string | null;
}

@Exclude()
export class BranchResponse {
  @ApiProperty()
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  name: string;

  @ApiProperty()
  @IsBoolean()
  @Expose()
  isPrimary: boolean;
}

@Exclude()
export class EmployeeResponse {
  @ApiProperty({
    description: 'The id of the employee',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({ description: 'First name', example: 'Иван' })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({ description: 'Surname', example: 'Иванов' })
  @IsString()
  @Expose()
  surName: string;

  @ApiProperty({
    description: 'Last name (optional)',
    example: 'Петрович',
    nullable: true,
  })
  @IsString()
  @Expose()
  lastName?: string | null;

  @ApiProperty()
  @IsUUID()
  @Expose()
  positionId: string;

  @ApiProperty({
    description: 'The position of the employee',
    nullable: true,
  })
  @Expose()
  position?: PositionResponse;

  @ApiProperty({
    description: 'The hire date of the employee',
    example: '2021-01-01',
  })
  @IsISO8601()
  @Expose()
  hireDate: string;

  @ApiProperty({
    description: 'The salary of the employee',
    example: 100000,
  })
  @Expose()
  salary: number;

  @ApiProperty({
    description: 'The schedule of the employee',
    nullable: true,
  })
  @Expose()
  schedule?: ScheduleResponse;

  @ApiProperty({
    description: 'The orders of the employee',
    nullable: true,
  })
  @Expose()
  orders?: OrderResponse;

  @ApiProperty({ nullable: true })
  @Expose()
  contact?: ContactResponse;

  @ApiProperty({ nullable: true })
  @Expose()
  branch?: BranchResponse;

  @ApiProperty({ type: [QualificationResponse], nullable: true })
  @Expose()
  qualifications?: QualificationResponse[];
}

@Exclude()
export class PositionResponse {
  @ApiProperty({
    description: 'The id of the position',
  })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The name of the position',
    example: 'Manager',
  })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    description: 'The description of the position',
    example: 'Manager of the company',
    nullable: true,
  })
  @IsString()
  @Expose()
  description: string | null;
}

@Exclude()
export class ScheduleResponse {
  @ApiProperty({
    description: 'The id of the schedule',
  })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The employee id',
  })
  @IsUUID()
  @Expose()
  employeeId: string;

  @ApiProperty({
    description: 'The start time of the schedule',
    example: '2024-01-01T09:00:00Z',
  })
  @IsString()
  @Expose()
  startTime: string;

  @ApiProperty({
    description: 'The end time of the schedule',
    example: '2024-01-01T17:00:00Z',
  })
  @IsString()
  @Expose()
  endTime: string;

  @ApiProperty({
    description: 'The availability of the schedule',
    example: true,
  })
  @IsBoolean()
  @Expose()
  isAvailable: boolean;
}

@Exclude()
export class OrderResponse {
  @ApiProperty({
    description: 'The id of the order',
  })
  @IsUUID()
  @Expose()
  id: string;

  @ApiProperty({
    description: 'The status of the order',
    example: 'Pending',
    nullable: true,
  })
  @IsString()
  @Expose()
  status: string | null;
}
