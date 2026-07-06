import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as crypto from 'crypto';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * GET /files/url/:key
   * Returns a pre-signed GET URL for accessing a private R2 object
   */
  @Get('url/:key')
  async getPresignedUrl(@Param('key') key: string) {
    const url = await this.uploadService.getPresignedUrl(key);
    return { url };
  }

  /**
   * POST /files/upload
   * Server-side multipart upload — converts images to WebP automatically
   */
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const filename = file.originalname;
        const uid = crypto.randomBytes(16).toString('hex');
        const extension = filename.includes('.')
          ? filename.substring(filename.lastIndexOf('.'))
          : '';
        const key = `${uid}${extension}`;
        await this.uploadService.uploadFile(key, file.buffer, filename);
        const finalKey =
          this.uploadService.isImageFile(file.mimetype) &&
          file.mimetype !== 'image/gif' &&
          !filename.toLowerCase().endsWith('.webp')
            ? key.replace(/\.[^.]+$/, '.webp')
            : key;
        const url = this.uploadService.getCloudFrontUrl(finalKey);
        return {
          key: finalKey,
          url,
          originalName: filename,
        };
      }),
    );

    return { files: uploadedFiles };
  }

  /**
   * POST /files/presigned-url  (Public — no guard)
   * Returns a pre-signed PUT URL so the browser can upload directly to R2
   */
  @Post('presigned-url')
  async getPresignedUploadUrl(
    @Body() body: { filename: string; contentType?: string },
  ) {
    if (!body.filename) {
      throw new BadRequestException('filename is required');
    }
    return this.uploadService.generatePresignedUploadData(
      body.filename,
      body.contentType,
    );
  }
}
