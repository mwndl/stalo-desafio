import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AppException } from '../common/exceptions/app.exception';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { SortBy, SortOrder } from './dto/sorting.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    public readonly repository: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto, 
    userId: string
  ): Promise<TransactionResponseDto> {
    // Buscar o usuário para obter o CPF automaticamente
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw AppException.userNotFound();
    }

    const transaction = this.repository.create({
      ...createTransactionDto,
      amount: typeof createTransactionDto.amount === 'string' 
        ? parseFloat(createTransactionDto.amount) 
        : createTransactionDto.amount,
      userId,
      cpf: createTransactionDto.cpf || user.cpf, // Usar CPF fornecido ou do usuário
      transactionDate: new Date(createTransactionDto.transactionDate),
    });

    const savedTransaction = await this.repository.save(transaction);
    return this.mapToResponseDto(savedTransaction);
  }

  async findAll(
    filters: TransactionFiltersDto = {}, 
    pagination: PaginationDto = {},
    sorting: { sortBy?: string; order?: string } = {},
    userId?: string
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const { sortBy = 'createdAt', order = 'desc' } = sorting;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .where('transaction.deletedAt IS NULL');

    // Filtrar por usuário se userId for fornecido
    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

    // Aplicar filtros
    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
    }
    if (filters.cpf) {
      queryBuilder.andWhere('user.cpf = :cpf', { cpf: filters.cpf });
    }

    // Aplicar filtros de data (priorizar createdFrom/createdTo, fallback para startDate/endDate)
    const startDate = filters.createdFrom || filters.startDate;
    const endDate = filters.createdTo || filters.endDate;
    
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Aplicar ordenação
    const sortField = this.getSortField(sortBy);
    const sortDirection = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(sortField, sortDirection);

    // Contar total de registros
    const total = await queryBuilder.getCount();

    // Aplicar paginação
    const transactions = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      data: transactions.map(transaction => this.mapToResponseDto(transaction)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string): Promise<TransactionResponseDto> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        userId,
        deletedAt: IsNull(),
      },
      relations: ['user'],
    });

    if (!transaction) {
      throw AppException.transactionNotFound();
    }

    return this.mapToResponseDto(transaction);
  }

  async update(
    id: string, 
    updateTransactionDto: UpdateTransactionDto, 
    userId: string
  ): Promise<TransactionResponseDto> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!transaction) {
      throw AppException.transactionNotFound();
    }

    // Garantir que o userId não seja alterado
    const { userId: _, ...safeUpdateData } = updateTransactionDto as any;
    
    // Converter transactionDate se fornecido
    if (safeUpdateData.transactionDate) {
      safeUpdateData.transactionDate = new Date(safeUpdateData.transactionDate);
    }

    await this.repository.update(id, safeUpdateData);
    
    const updatedTransaction = await this.repository.findOne({
      where: { id, userId },
      relations: ['user'],
    });

    return this.mapToResponseDto(updatedTransaction!);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        userId,
        deletedAt: IsNull(),
      },
    });

    if (!transaction) {
      throw AppException.transactionNotFound();
    }

    // Soft delete - apenas marcar como deletado
    await this.repository.update(id, { deletedAt: new Date() });

    return { message: 'Transação excluída com sucesso' };
  }

  async getSummary(userId: string): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.deletedAt IS NULL');

    const transactions = await queryBuilder.getMany();

    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = Math.abs(transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0));

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    };
  }

  private getSortField(sortBy: string): string {
    switch (sortBy) {
      case 'createdAt':
        return 'transaction.createdAt';
      case 'value':
        return 'transaction.amount';
      case 'status':
        return 'transaction.status';
      default:
        return 'transaction.createdAt';
    }
  }

  private mapToResponseDto(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      title: transaction.title,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      status: transaction.status,
      category: transaction.category,
      transactionDate: transaction.transactionDate,
      cpf: transaction.cpf,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deletedAt: transaction.deletedAt,
      userId: transaction.userId,
      documentPath: transaction.documentPath,
    };
  }

  async updateDocumentPath(transactionId: string, userId: string, documentPath: string): Promise<void> {
    const transaction = await this.repository.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    transaction.documentPath = documentPath;
    await this.repository.save(transaction);
  }

  async removeDocument(transactionId: string, userId: string): Promise<{ message: string }> {
    const transaction = await this.repository.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transação não encontrada');
    }

    transaction.documentPath = undefined;
    await this.repository.save(transaction);

    return { message: 'Documento removido com sucesso' };
  }
}
