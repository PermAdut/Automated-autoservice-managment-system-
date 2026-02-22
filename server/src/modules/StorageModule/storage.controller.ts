import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3UploadService } from './s3-upload.service';
import { PresignUrlDto } from './dto/presign-url.dto';
import { JwtAuthGuard } from '../AuthModule/guards/jwt-auth.guard';
import { RolesGuard } from '../AuthModule/guards/roles.guard';
import { Roles } from '../AuthModule/decorators/roles.decorator';

@ApiTags('Storage')
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly s3: S3UploadService) {}

  /**
   * Returns a presigned PUT URL.
   * The client uploads the file directly to S3 using this URL.
   * After upload, save the returned `publicUrl` to the entity (user, car, order, etc.)
   */
  @Post('presign')
  @ApiOperation({ summary: 'Get presigned S3 URL for direct browser upload' })
  async getPresignedUrl(@Body() dto: PresignUrlDto) {
    const result = await this.s3.getPresignedUploadUrl({
      category: dto.category,
      filename: dto.filename,
      contentType: dto.contentType,
      expiresIn: dto.expiresIn,
    });

    if (!result) {
      throw new ServiceUnavailableException(
        'File storage not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET.',
      );
    }

    return result;
  }

  /**
   * Deletes a file from S3 by its key.
   * Admin/manager only — prevents users from deleting arbitrary files.
   */
  @Delete(':key(*)')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete a file from S3 by key (admin/manager)' })
  async deleteFile(@Param('key') key: string) {
    await this.s3.deleteFile(key);
    return { deleted: true, key };
  }

  /**
   * Returns S3 configuration status and the CDN domain.
   * Used by the admin Settings panel to show integration status.
   */
  @Get('status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get S3 storage configuration status' })
  getStatus() {
    return {
      configured: this.s3.isConfigured(),
      cdnDomain: process.env.AWS_CLOUDFRONT_DOMAIN ?? null,
      bucket: this.s3.isConfigured() ? process.env.AWS_S3_BUCKET : null,
      region: process.env.AWS_REGION ?? 'us-east-1',
    };
  }
}
