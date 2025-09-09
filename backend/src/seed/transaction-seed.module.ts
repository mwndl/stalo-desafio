import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSeedService } from './transaction-seed.service';
import { TransactionSeedController } from './transaction-seed.controller';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [TransactionSeedController],
  providers: [TransactionSeedService],
  exports: [TransactionSeedService],
})
export class TransactionSeedModule {}
