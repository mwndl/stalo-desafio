import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { FileAccessGuard } from '../common/guards/file-access.guard';
import { MinioInitService } from '../common/services/minio-init.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [TransactionsController],
  providers: [TransactionsService, UploadService, FileAccessGuard, MinioInitService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
