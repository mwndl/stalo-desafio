import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { TransactionsService } from '../../transactions/transactions.service';

@Injectable()
export class FileAccessGuard implements CanActivate {
  constructor(private readonly transactionsService: TransactionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const filename = request.params.filename;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant não identificado');
    }

    // O filename agora é a chave completa do MinIO (ex: transactions/tenantId/userId/filename)
    // Vamos buscar a transação pelo documentPath que contém a chave do MinIO
    try {
      // Buscar transação pelo documentPath (que agora é a chave do MinIO)
      const transaction = await this.transactionsService.repository.findOne({
        where: {
          documentPath: filename, // filename é a chave completa do MinIO
          tenantId: user.tenantId,
          deletedAt: IsNull(),
        },
      });
      
      if (!transaction) {
        throw new NotFoundException('Arquivo não encontrado');
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Arquivo não encontrado');
    }
  }
}
