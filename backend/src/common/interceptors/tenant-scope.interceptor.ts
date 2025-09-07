import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

export const TENANT_SCOPE_KEY = 'tenantScope';

export function TenantScope() {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(TENANT_SCOPE_KEY, true, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class TenantScopeInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant não identificado no token');
    }

    // Adicionar tenantId ao contexto da requisição
    request.tenantId = user.tenantId;

    return next.handle();
  }
}
