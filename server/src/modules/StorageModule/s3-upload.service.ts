import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { S3FileCategory } from './dto/presign-url.dto';

export interface PresignResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}

/**
 * AWS S3 file upload service.
 *
 * Provides two upload modes:
 *  1. Presigned URL — client uploads directly to S3 (no bandwidth through the server).
 *  2. Server-side buffer upload — for generated files like invoices, reports, certificates.
 *
 * Falls back gracefully when AWS credentials are not configured.
 *
 * AWS IAM policy required:
 *   s3:PutObject, s3:GetObject, s3:DeleteObject on AWS_S3_BUCKET/*
 *
 * For CDN delivery, set AWS_CLOUDFRONT_DOMAIN — files will be served via CloudFront.
 * For local development, use MinIO (S3-compatible) with AWS_S3_ENDPOINT.
 */
@Injectable()
export class S3UploadService {
  private readonly logger = new Logger(S3UploadService.name);

  // Lazy-loaded SDK clients to avoid startup failure when SDK is not installed
  private s3Client: any = null;
  private readonly bucket = process.env.AWS_S3_BUCKET;
  private readonly region = process.env.AWS_REGION || 'us-east-1';
  private readonly cdnDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

  async onModuleInit() {
    await this.initClient();
  }

  private async initClient() {
    const keyId = process.env.AWS_ACCESS_KEY_ID;
    const secret = process.env.AWS_SECRET_ACCESS_KEY;

    if (!keyId || !secret || !this.bucket) {
      this.logger.warn(
        'S3 not configured (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET missing). ' +
        'File uploads will be disabled. Set these env vars to enable.',
      );
      return;
    }

    try {
      const { S3Client } = await import('@aws-sdk/client-s3');
      this.s3Client = new S3Client({
        region: this.region,
        credentials: { accessKeyId: keyId, secretAccessKey: secret },
        ...(process.env.AWS_S3_ENDPOINT && {
          endpoint: process.env.AWS_S3_ENDPOINT,
          forcePathStyle: true, // Required for MinIO/LocalStack
        }),
      });
      this.logger.log(`S3 initialized: bucket=${this.bucket}, region=${this.region}`);
    } catch {
      this.logger.warn(
        '@aws-sdk/client-s3 not installed. Run: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner',
      );
    }
  }

  isConfigured(): boolean {
    return this.s3Client !== null;
  }

  /**
   * Generate a presigned PUT URL for direct browser-to-S3 upload.
   * Browser sends the file directly to S3 — no bandwidth overhead on the server.
   *
   * Flow:
   *   1. Client calls POST /storage/presign -> gets { uploadUrl, key, publicUrl }
   *   2. Client PUTs the file to uploadUrl
   *   3. Client saves publicUrl to their entity (user, car, order, etc.)
   */
  async getPresignedUploadUrl(params: {
    category: S3FileCategory;
    filename: string;
    contentType: string;
    expiresIn?: number;
  }): Promise<PresignResult | null> {
    if (!this.s3Client || !this.bucket) return null;

    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

      const ext = params.filename.split('.').pop()?.toLowerCase() ?? 'bin';
      const key = `${params.category}/${randomUUID()}.${ext}`;
      const expiresIn = params.expiresIn ?? 300;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: params.contentType,
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return { uploadUrl, key, publicUrl: this.getPublicUrl(key), expiresIn };
    } catch (err) {
      this.logger.error(`Failed to create presigned URL: ${err}`);
      return null;
    }
  }

  /**
   * Upload a buffer directly from the server.
   * Use for server-generated files: invoices (PDF), warranty certificates, reports.
   */
  async uploadBuffer(params: {
    buffer: Buffer;
    category: S3FileCategory;
    filename: string;
    contentType: string;
  }): Promise<UploadResult | null> {
    if (!this.s3Client || !this.bucket) return null;

    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');

      const ext = params.filename.split('.').pop()?.toLowerCase() ?? 'bin';
      const key = `${params.category}/${randomUUID()}.${ext}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: params.buffer,
          ContentType: params.contentType,
        }),
      );

      this.logger.log(`Uploaded to S3: ${key} (${params.buffer.length} bytes)`);
      return { key, publicUrl: this.getPublicUrl(key) };
    } catch (err) {
      this.logger.error(`S3 upload failed: ${err}`);
      return null;
    }
  }

  /**
   * Delete a file from S3 by its key.
   * Call this when a user replaces their photo or deletes an order.
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.s3Client || !this.bucket || !key) return;

    try {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted from S3: ${key}`);
    } catch (err) {
      this.logger.error(`S3 delete failed for key "${key}": ${err}`);
    }
  }

  /**
   * Build the public URL for a stored file.
   * Uses CloudFront domain if configured, otherwise direct S3 URL.
   */
  getPublicUrl(key: string): string {
    if (this.cdnDomain) {
      return `https://${this.cdnDomain}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
