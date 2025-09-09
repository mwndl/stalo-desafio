import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
      },
      forcePathStyle: true, // Importante para MinIO
    });
    this.bucketName = process.env.MINIO_BUCKET || 'stalo-documents';
  }

  getMulterConfig(): MulterOptions {
    return {
      storage: memoryStorage(), // Usar memory storage para MinIO
      fileFilter: (req, file, cb) => {
        if (this.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(AppException.fileTypeNotAllowed(), false);
        }
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw AppException.fileNotProvided();
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw AppException.fileTypeNotAllowed();
    }

    if (file.size > this.maxFileSize) {
      throw AppException.fileTooLarge();
    }
  }

  async uploadToMinIO(file: Express.Multer.File, userId: string): Promise<string> {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    const filename = `transaction-${uniqueSuffix}${ext}`;
    
    // Estrutura: userId/filename (isolamento por usuário)
    const key = `transactions/${userId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId,
        originalName: file.originalname,
      },
    });

    await this.s3Client.send(command);
    return key; // Retorna apenas a chave, não a URL completa
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getFileMetadata(key: string): Promise<any> {
    const command = new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return this.s3Client.send(command);
  }

  // Métodos de compatibilidade (para não quebrar código existente)
  getRelativePath(filename: string): string {
    return filename; // Agora retorna a chave do MinIO
  }

  getFilePath(filename: string): string {
    return filename; // Agora retorna a chave do MinIO
  }
}