import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import sharp from 'sharp';
import { ENV } from '../config/env.config';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private readonly logger = new Logger(UploadService.name);

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: ENV.R2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  getContentTypeFromExtension(filename: string): string {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  getS3Client(): S3Client {
    return this.s3Client;
  }

  getBucketName(): string {
    return ENV.R2_BUCKET_NAME;
  }

  getCloudFrontUrl(key: string): string {
    const domain = ENV.CLOUDFRONT_DOMAIN;
    const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
    return `${cleanDomain}/${key}`;
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async getPresignedUploadUrl(key: string, contentType?: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: ENV.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async generatePresignedUploadData(filename: string, contentType?: string) {
    if (!filename) {
      throw new Error('Filename is required');
    }
    const uid = crypto.randomBytes(16).toString('hex');
    const extension = filename.includes('.')
      ? filename.substring(filename.lastIndexOf('.'))
      : '';
    const key = `${uid}${extension}`;
    const uploadUrl = await this.getPresignedUploadUrl(key, contentType);
    const finalUrl = this.getCloudFrontUrl(key);
    return {
      uploadUrl,
      key,
      finalUrl,
      baseUrl: ENV.CLOUDFRONT_DOMAIN,
    };
  }

  isImageFile(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  async uploadFile(key: string, buffer: Buffer, originalName: string): Promise<void> {
    const bucketName = this.getBucketName();
    const contentType = this.getContentTypeFromExtension(originalName);

    if (this.isImageFile(contentType) && contentType !== 'image/gif') {
      const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
      const webpKey = key.replace(/\.[^.]+$/, '.webp');
      this.logger.log(`Uploading image as WebP: ${webpKey}`);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: webpKey,
          Body: webpBuffer,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000',
        }),
      );
    } else {
      this.logger.log(`Uploading file: ${key}`);
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000',
        }),
      );
    }
  }

  async uploadFiles(
    files: { key: string; buffer: Buffer; originalName: string }[],
  ): Promise<void> {
    await Promise.all(
      files.map((f) => this.uploadFile(f.key, f.buffer, f.originalName)),
    );
  }
}
