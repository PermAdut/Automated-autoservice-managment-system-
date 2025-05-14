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

  @ApiProperty({
    description: 'The position of the employee',
    example: {
      id: 1,
      name: 'Manager',
    },
  })
  @Expose()
  position: PositionResponse;

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
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: true,
    },
  })
  @Expose()
  schedule: ScheduleResponse;

  @ApiProperty({
    description: 'The orders of the employee',
    example: {
      id: 1,
      status: 'Pending',
    },
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
  })
  @IsString()
  @Expose()
  description: string;
}

@Exclude()
export class ScheduleResponse {
  @ApiProperty({
    description: 'The start time of the schedule',
    example: '09:00',
  })
  @IsString()
  @Expose()
  startTime: string;

  @ApiProperty({
    description: 'The end time of the schedule',
    example: '17:00',
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
  })
  @IsString()
  @Expose()
  status: string;
}
