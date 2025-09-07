import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantScopeInterceptor } from '../common/interceptors/tenant-scope.interceptor';
import { TenantId } from '../common/decorators/tenant.decorator';
import { User } from '../entities/user.entity';

@ApiTags('users')
@Controller('v1/users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantScopeInterceptor)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar usuários do tenant',
    description: 'Retorna todos os usuários ativos do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [User],
  })
  async findAll(@TenantId() tenantId: string): Promise<User[]> {
    return this.usersService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter usuário por ID',
    description: 'Retorna um usuário específico do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string): Promise<User> {
    return this.usersService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza um usuário do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @TenantId() tenantId: string,
  ): Promise<User> {
    return this.usersService.update(id, updateData, tenantId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Desativar usuário',
    description: 'Desativa um usuário do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário desativado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  async remove(@Param('id') id: string, @TenantId() tenantId: string): Promise<{ message: string }> {
    await this.usersService.remove(id, tenantId);
    return { message: 'Usuário desativado com sucesso' };
  }
}
