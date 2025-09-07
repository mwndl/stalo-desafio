import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
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

    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
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

    // Gerar token JWT
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      tenantId: savedUser.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
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
}
