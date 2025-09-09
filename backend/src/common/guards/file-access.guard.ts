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
    const path = request.query.path;

    if (!user?.id) {
      throw AppException.userNotFound();
    }

    if (!path) {
      throw AppException.fileNotFound();
    }
    
    try {
      // Buscar transação pelo documentPath (que é a chave completa do MinIO)
      const transaction = await this.transactionsService.repository.findOne({
        where: {
          documentPath: path, // path é a chave completa do MinIO
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
