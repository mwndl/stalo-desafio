import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, User, Transaction])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}