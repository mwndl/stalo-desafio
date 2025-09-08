import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { UploadService } from '../common/services/upload.service';
import { FileAccessGuard } from '../common/guards/file-access.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionsController],
  providers: [TransactionsService, UploadService, FileAccessGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
