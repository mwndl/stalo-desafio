import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { User } from './entities/user.entity';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}


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


}
