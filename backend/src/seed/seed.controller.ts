import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('seed')
@Controller('v1/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({
    summary: 'Executar seed do banco de dados',
    description: 'Popula o banco de dados com dados de exemplo (apenas em desenvolvimento)',
  })
  @ApiResponse({
    status: 200,
    description: 'Seed executado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Database seeded successfully!' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async seed(): Promise<{ message: string }> {
    await this.seedService.seed();
    return { message: 'Database seeded successfully!' };
  }
}