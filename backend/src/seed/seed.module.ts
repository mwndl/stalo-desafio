import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Transaction])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}