import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto, RefreshResponseDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['tenant'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar se o tenant existe
    const tenant = await this.tenantRepository.findOne({
      where: { id: registerDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    // Verificar se o email já existe
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Criar o usuário
    const user = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      tenantId: registerDto.tenantId,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Gerar tokens
    const { accessToken, refreshToken } = await this.generateTokens(savedUser);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        tenantId: savedUser.tenantId,
      },
    };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['tenant'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Gerar access token (15 minutos)
    const accessPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      type: 'access',
    };
    const accessToken = this.jwtService.sign(accessPayload, { expiresIn: '15m' });

    // Gerar refresh token (7 dias)
    const refreshTokenValue = crypto.randomBytes(64).toString('hex');
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    // Salvar refresh token no banco
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: refreshExpiresAt,
      isActive: true,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<RefreshResponseDto> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { 
        token: refreshTokenDto.refresh_token,
        isActive: true,
      },
      relations: ['user'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = refreshToken.user;
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Invalidar o refresh token atual
    await this.refreshTokenRepository.update(refreshToken.id, { isActive: false });

    // Gerar novos tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.refresh_token },
    });

    if (refreshToken) {
      await this.refreshTokenRepository.update(refreshToken.id, { isActive: false });
    }

    return { message: 'Logout realizado com sucesso' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.refreshTokenRepository.update(
      { userId, isActive: true },
      { isActive: false }
    );

    return { message: 'Logout de todos os dispositivos realizado com sucesso' };
  }
}
