import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { UserResponseDto } from './dto/user-response.dto';

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
    type: [UserResponseDto],
  })
  async getUsers(): Promise<UserResponseDto[]> {
    return this.appService.getUsers();
  }


}
