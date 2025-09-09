import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { User } from '../../entities/user.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user: User }>();
    const user: User | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Para transações, verificar se o usuário é o dono da transação
    const transactionId = request.params.id;
    if (transactionId) {
      // A verificação de ownership será feita no serviço
      // Este guard apenas garante que há um usuário autenticado
      return true;
    }

    return true;
  }
}
