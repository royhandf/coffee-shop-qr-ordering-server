import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';

@Injectable()
export class UploadsService {
  // Konversi gambar ke WebP dan simpan ke /uploads
  async convertToWebp(
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('File tidak ditemukan');

    const filename = `${randomUUID()}.webp`;
    const outputPath = join(process.cwd(), 'uploads', filename);

    try {
      await sharp(file.buffer).webp({ quality: 80 }).toFile(outputPath);
    } catch {
      throw new BadRequestException('Gagal memproses gambar');
    }

    const url = `${baseUrl}/uploads/${filename}`;
    return { url };
  }

  // Alternatif: konversi ke AVIF
  async convertToAvif(
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<{ url: string }> {
    if (!file) throw new BadRequestException('File tidak ditemukan');

    const filename = `${randomUUID()}.avif`;
    const outputPath = join(process.cwd(), 'uploads', filename);

    try {
      await sharp(file.buffer).avif({ quality: 60 }).toFile(outputPath);
    } catch {
      throw new BadRequestException('Gagal memproses gambar');
    }

    const url = `${baseUrl}/uploads/${filename}`;
    return { url };
  }

  // Hapus file lama
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filename = fileUrl.split('/uploads/').pop();
      if (!filename) return;
      const filePath = join(process.cwd(), 'uploads', filename);
      await unlink(filePath);
    } catch {}
  }
}
