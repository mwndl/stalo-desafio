import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


  @Get('users')
  @ApiOperation({
    summary: 'Listar todos os usuários (desenvolvimento)',
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

  @Post('users')
  @ApiOperation({
    summary: 'Criar usuário (desenvolvimento)',
    description: 'Cria um novo usuário no sistema (apenas para desenvolvimento)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.appService.createUser(userData);
  }
}
