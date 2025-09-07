import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar saúde da aplicação',
    description: 'Retorna o status de saúde da aplicação e suas dependências',
  })
  @ApiResponse({
    status: 200,
    description: 'Status de saúde retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-01-09T21:15:59.000Z' },
        uptime: { type: 'number', example: 123.456 },
        database: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            responseTime: { type: 'number', example: 15.2 },
          },
        },
      },
    },
  })
  async check() {
    return this.healthService.check();
  }
}
