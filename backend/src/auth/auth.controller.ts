import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Realizar login',
    description: 'Autentica um usuário com email e senha, retornando um token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Credenciais inválidas' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter dados do usuário logado',
    description: 'Retorna os dados do usuário autenticado baseado no token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso',
    type: UserDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  async getProfile(@Request() req): Promise<UserDto> {
    const user: User = req.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
    };
  }
}
