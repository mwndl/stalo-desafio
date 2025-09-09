import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppException } from '../common/exceptions/app.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    public readonly repository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw AppException.userNotFound();
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email, isActive: true },
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    
    await this.repository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repository.update(id, { isActive: false });
  }
}
