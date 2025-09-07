import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  async seed(): Promise<{ message: string }> {
    await this.seedService.seed();
    return { message: 'Database seeded successfully!' };
  }
}