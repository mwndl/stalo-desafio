import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, UserDto } from './dto/auth-response.dto';
import { RefreshTokenDto, RefreshResponseDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../entities/user.entity';

@ApiTags('auth')
@Controller('v1/auth')
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
        errorCode: { type: 'string', example: 'AUTH_001' },
        statusCode: { type: 'number', example: 401 },
        description: { type: 'string', example: 'Email ou senha incorretos' },
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

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário e retorna um token JWT',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email já está em uso' },
        errorCode: { type: 'string', example: 'AUTH_002' },
        statusCode: { type: 'number', example: 409 },
        description: { type: 'string', example: 'Já existe um usuário cadastrado com este email' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Tenant não encontrado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Tenant não encontrado' },
        errorCode: { type: 'string', example: 'AUTH_006' },
        statusCode: { type: 'number', example: 404 },
        description: { type: 'string', example: 'Organização não existe ou foi removida' },
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
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

  @Post('refresh')
  @ApiOperation({
    summary: 'Renovar tokens de acesso',
    description: 'Renova o access token usando o refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados com sucesso',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido ou expirado',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Fazer logout',
    description: 'Invalida o refresh token atual',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout realizado com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido',
  })
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    return this.authService.logout(refreshTokenDto);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Fazer logout de todos os dispositivos',
    description: 'Invalida todos os refresh tokens do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout de todos os dispositivos realizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logout de todos os dispositivos realizado com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT inválido ou expirado',
  })
  async logoutAll(@Request() req): Promise<{ message: string }> {
    const user: User = req.user;
    return this.authService.logoutAll(user.id);
  }
}
