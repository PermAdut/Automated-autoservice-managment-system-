import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class QualificationItemDto {
  @IsUUID()
  workTypeId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  level: number;
}

export class SetEmployeeQualificationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationItemDto)
  qualifications: QualificationItemDto[];
}
