import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MinioInitService implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
      },
      forcePathStyle: true,
    });
    this.bucketName = process.env.MINIO_BUCKET || 'stalo-documents';
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      // Verificar se o bucket existe
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log(`✅ Bucket '${this.bucketName}' já existe`);
    } catch (error) {
      if (error.name === 'NotFound') {
        try {
          // Criar o bucket se não existir
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          console.log(`✅ Bucket '${this.bucketName}' criado com sucesso`);
        } catch (createError) {
          console.error(`❌ Erro ao criar bucket '${this.bucketName}':`, createError);
        }
      } else {
        console.error(`❌ Erro ao verificar bucket '${this.bucketName}':`, error);
      }
    }
  }
}


