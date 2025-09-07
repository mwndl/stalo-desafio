import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TenantAwareService } from '../common/services/tenant-aware.service';

@Injectable()
export class UsersService extends TenantAwareService<User> {
  constructor(
    @InjectRepository(User)
    public readonly repository: Repository<User>,
  ) {
    super();
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.repository.find({
      where: { tenantId, isActive: true },
      relations: ['tenant'],
    });
  }

  async findOne(id: string, tenantId: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id, tenantId, isActive: true },
      relations: ['tenant'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, tenantId, isActive: true },
      relations: ['tenant'],
    });
  }

  async update(id: string, updateData: Partial<User>, tenantId: string): Promise<User> {
    const user = await this.findOne(id, tenantId);
    
    // Garantir que o tenantId não seja alterado
    const { tenantId: _, ...safeUpdateData } = updateData;
    
    await this.repository.update(id, safeUpdateData);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const user = await this.findOne(id, tenantId);
    await this.repository.update(id, { isActive: false });
  }
}
