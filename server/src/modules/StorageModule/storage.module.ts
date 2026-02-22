import { Module } from '@nestjs/common';
import { S3UploadService } from './s3-upload.service';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [S3UploadService],
  exports: [S3UploadService],
})
export class StorageModule {}
