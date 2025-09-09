import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { TransactionsService } from '../../transactions/transactions.service';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class FileAccessGuard implements CanActivate {
  constructor(private readonly transactionsService: TransactionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const filename = request.params.filename;

    if (!user?.id) {
      throw AppException.userNotFound();
    }

    // O filename agora é a chave completa do MinIO (ex: transactions/userId/filename)
    // Vamos buscar a transação pelo documentPath que contém a chave do MinIO
    try {
      // Buscar transação pelo documentPath (que agora é a chave do MinIO)
      const transaction = await this.transactionsService.repository.findOne({
        where: {
          documentPath: filename, // filename é a chave completa do MinIO
          userId: user.id,
          deletedAt: IsNull(),
        },
      });
      
      if (!transaction) {
        throw AppException.fileNotFound();
      }

      return true;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw AppException.fileNotFound();
    }
  }
}
