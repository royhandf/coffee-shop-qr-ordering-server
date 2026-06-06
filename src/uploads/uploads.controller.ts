import {
  Controller,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// multer simpan di memori dulu (bukan disk)
const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/avif',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Format file tidak didukung. Gunakan JPG, JPEG, PNG, WebP, atau AVIF',
        ),
        false,
      );
    }
  },
};

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // POST /api/uploads?format=webp  →  upload & convert ke WebP (default)
  // POST /api/uploads?format=avif  →  upload & convert ke AVIF
  // Form-data key: "file" (type: File)

  // Response: { "url": "http://localhost:3000/uploads/uuid.webp" }
  // Gunakan URL ini sebagai nilai image_url saat buat/update menu

  @Post()
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('format') format: string = 'webp',
    @Req() req: Request,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    if (format === 'avif') {
      return this.uploadsService.convertToAvif(file, baseUrl);
    }
    return this.uploadsService.convertToWebp(file, baseUrl);
  }
}
