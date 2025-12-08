import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsISO8601, IsString } from 'class-validator';

@Exclude()
export class EmployeeResponse {
  @ApiProperty({
    description: 'The id of the employee',
    example: 1,
  })
  @IsInt()
  @Expose()
  id: number;

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

  @ApiProperty({
    description: 'The position of the employee',
    example: {
      id: 1,
      name: 'Manager',
    },
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
  @IsInt()
  @Expose()
  salary: number;

  @ApiProperty({
    description: 'The schedule of the employee',
    example: {
      id: 1,
      employeeId: 1,
      startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T17:00:00Z',
      isAvailable: true,
    },
    nullable: true,
  })
  @Expose()
  schedule?: ScheduleResponse;

  @ApiProperty({
    description: 'The orders of the employee',
    example: {
      id: 1,
      status: 'Pending',
    },
    nullable: true,
  })
  @Expose()
  orders?: OrderResponse;
}

@Exclude()
export class PositionResponse {
  @ApiProperty({
    description: 'The id of the position',
    example: 1,
  })
  @IsInt()
  @Expose()
  id: number;

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
    example: 1,
  })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({
    description: 'The employee id',
    example: 1,
  })
  @IsInt()
  @Expose()
  employeeId: number;

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
    example: 1,
  })
  @IsInt()
  @Expose()
  id: number;

  @ApiProperty({
    description: 'The status of the order',
    example: 'Pending',
    nullable: true,
  })
  @IsString()
  @Expose()
  status: string | null;
}
