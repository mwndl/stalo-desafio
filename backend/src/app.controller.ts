import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './entities/tenant.entity';
import { User } from './entities/user.entity';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('tenants')
  @ApiOperation({
    summary: 'Listar todos os tenants (desenvolvimento)',
    description: 'Retorna todas as organizações/empresas cadastradas no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tenants retornada com sucesso',
    type: [Tenant],
  })
  async getTenants(): Promise<Tenant[]> {
    return this.appService.getTenants();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna todos os usuários do sistema (apenas para desenvolvimento)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [User],
  })
  async getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }

  @Post('tenants')
  @ApiOperation({
    summary: 'Registrar novo tenant (desenvolvimento)',
    description: 'Cria uma nova organização/empresa no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Tenant criado com sucesso',
    type: Tenant,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Slug já está em uso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Slug já está em uso' },
        errorCode: { type: 'string', example: 'TENANT_001' },
        statusCode: { type: 'number', example: 409 },
        description: { type: 'string', example: 'Já existe um tenant com este slug' },
      },
    },
  })
  async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
    return this.appService.createTenant(createTenantDto);
  }
}
