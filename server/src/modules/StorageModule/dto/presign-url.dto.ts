import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString, Matches, Max } from 'class-validator';
import { sanitizeUploadFilename } from '../utils/sanitize-filename';

export type S3FileCategory = 'profiles' | 'cars' | 'orders' | 'documents' | 'warranties' | 'employees';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/octet-stream',
];

const ALLOWED_CATEGORIES: S3FileCategory[] = [
  'profiles',
  'cars',
  'orders',
  'documents',
  'warranties',
  'employees',
];

export class PresignUrlDto {
  @ApiProperty({ enum: ALLOWED_CATEGORIES, description: 'File category / S3 folder prefix' })
  @IsIn(ALLOWED_CATEGORIES)
  category: S3FileCategory;

  @ApiProperty({ description: 'Original filename (used for extension extraction)', example: 'photo.jpg' })
  @Transform(({ value, obj }) =>
    sanitizeUploadFilename(String(value ?? ''), obj?.contentType),
  )
  @IsString()
  @Matches(/^[\w\-. ]+$/, { message: 'Filename contains invalid characters' })
  filename: string;

  @ApiProperty({ enum: ALLOWED_MIME_TYPES, description: 'MIME content type' })
  @IsIn(ALLOWED_MIME_TYPES)
  contentType: string;

  @ApiPropertyOptional({ description: 'Presigned URL validity in seconds (max 3600)', default: 300 })
  @IsOptional()
  @IsPositive()
  @Max(3600)
  expiresIn?: number;
}
