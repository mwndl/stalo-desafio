import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { TenantAwareService } from '../common/services/tenant-aware.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { PaginationDto, PaginatedResponseDto } from './dto/pagination.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class TransactionsService extends TenantAwareService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    public readonly repository: Repository<Transaction>,
  ) {
    super();
  }

  async create(
    createTransactionDto: CreateTransactionDto, 
    tenantId: string, 
    userId: string
  ): Promise<TransactionResponseDto> {
    const transaction = this.repository.create({
      ...createTransactionDto,
      amount: typeof createTransactionDto.amount === 'string' 
        ? parseFloat(createTransactionDto.amount) 
        : createTransactionDto.amount,
      tenantId,
      userId,
      transactionDate: new Date(createTransactionDto.transactionDate),
    });

    const savedTransaction = await this.repository.save(transaction);
    return this.mapToResponseDto(savedTransaction);
  }

  async findAll(
    tenantId: string, 
    filters: TransactionFiltersDto = {}, 
    pagination: PaginationDto = {}
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository.createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.tenant', 'tenant')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.deletedAt IS NULL');

    // Aplicar filtros
    if (filters.type) {
      queryBuilder.andWhere('transaction.type = :type', { type: filters.type });
    }
    if (filters.status) {
      queryBuilder.andWhere('transaction.status = :status', { status: filters.status });
    }
    if (filters.category) {
      queryBuilder.andWhere('transaction.category = :category', { category: filters.category });
    }
    if (filters.userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId: filters.userId });
    }
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('transaction.transactionDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    // Ordenar por data de transação (mais recente primeiro)
    queryBuilder.orderBy('transaction.transactionDate', 'DESC');

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

  async findOne(id: string, tenantId: string): Promise<TransactionResponseDto> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        tenantId,
        deletedAt: IsNull(),
      },
      relations: ['user', 'tenant'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return this.mapToResponseDto(transaction);
  }

  async update(
    id: string, 
    updateTransactionDto: UpdateTransactionDto, 
    tenantId: string
  ): Promise<TransactionResponseDto> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    // Garantir que o tenantId e userId não sejam alterados
    const { tenantId: _, userId: __, ...safeUpdateData } = updateTransactionDto as any;
    
    // Converter transactionDate se fornecido
    if (safeUpdateData.transactionDate) {
      safeUpdateData.transactionDate = new Date(safeUpdateData.transactionDate);
    }

    await this.repository.update(id, safeUpdateData);
    
    const updatedTransaction = await this.repository.findOne({
      where: { id, tenantId },
      relations: ['user', 'tenant'],
    });

    return this.mapToResponseDto(updatedTransaction!);
  }

  async remove(id: string, tenantId: string): Promise<{ message: string }> {
    const transaction = await this.repository.findOne({
      where: { 
        id, 
        tenantId,
        deletedAt: IsNull(),
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    // Soft delete - apenas marcar como deletado
    await this.repository.update(id, { deletedAt: new Date() });

    return { message: 'Transação excluída com sucesso' };
  }

  async getSummary(tenantId: string, userId?: string): Promise<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('transaction')
      .where('transaction.tenantId = :tenantId', { tenantId })
      .andWhere('transaction.deletedAt IS NULL');

    if (userId) {
      queryBuilder.andWhere('transaction.userId = :userId', { userId });
    }

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
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      deletedAt: transaction.deletedAt,
      tenantId: transaction.tenantId,
      userId: transaction.userId,
      documentPath: transaction.documentPath,
    };
  }
}
