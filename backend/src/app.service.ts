import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SeedService } from './seed/seed.service';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private seedService: SeedService,
  ) {}

  async getTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Verificar se o slug já existe
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException({
        message: 'Slug já está em uso',
        errorCode: 'TENANT_001',
        statusCode: 409,
        description: 'Já existe um tenant com este slug',
      });
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async seed(): Promise<{ message: string }> {
    await this.seedService.seed();
    return { message: 'Database seeded successfully!' };
  }
}
