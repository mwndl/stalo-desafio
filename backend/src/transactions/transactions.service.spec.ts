import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionFiltersDto } from './dto/transaction-filters.dto';
import { PaginationDto } from './dto/pagination.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction successfully', async () => {
      const createTransactionDto: CreateTransactionDto = {
        title: 'Test Transaction',
        description: 'Test Description',
        amount: 100.50,
        type: TransactionType.INCOME,
        status: TransactionStatus.PENDING,
        category: 'Test Category',
        transactionDate: '2025-01-15',
      };

      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const mockTransaction = {
        id: 'transaction-123',
        ...createTransactionDto,
        amount: 100.50,
        transactionDate: new Date('2025-01-15'),
        tenantId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        documentPath: null,
      };

      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);

      const result = await service.create(createTransactionDto, tenantId, userId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTransactionDto,
        amount: 100.50,
        transactionDate: new Date('2025-01-15'),
        tenantId,
        userId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTransaction);
      expect(result).toEqual({
        id: 'transaction-123',
        title: 'Test Transaction',
        description: 'Test Description',
        amount: 100.50,
        type: TransactionType.INCOME,
        status: TransactionStatus.PENDING,
        category: 'Test Category',
        transactionDate: new Date('2025-01-15'),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        tenantId,
        userId,
        documentPath: null,
      });
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return paginated transactions with default parameters', async () => {
      const tenantId = 'tenant-123';
      const mockTransactions = [
        {
          id: 'transaction-1',
          title: 'Transaction 1',
          amount: 100,
          type: TransactionType.INCOME,
          status: TransactionStatus.COMPLETED,
          createdAt: new Date('2025-01-15'),
        },
        {
          id: 'transaction-2',
          title: 'Transaction 2',
          amount: 200,
          type: TransactionType.EXPENSE,
          status: TransactionStatus.PENDING,
          createdAt: new Date('2025-01-14'),
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(2);
      mockQueryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.findAll(tenantId);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('transaction');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('transaction.tenant', 'tenant');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('transaction.tenantId = :tenantId', { tenantId });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('transaction.deletedAt IS NULL');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('transaction.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should apply status filter correctly', async () => {
      const tenantId = 'tenant-123';
      const filters: TransactionFiltersDto = {
        status: TransactionStatus.COMPLETED,
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.status = :status',
        { status: TransactionStatus.COMPLETED }
      );
    });

    it('should apply CPF filter correctly', async () => {
      const tenantId = 'tenant-123';
      const filters: TransactionFiltersDto = {
        cpf: '12345678901',
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'user.cpf = :cpf',
        { cpf: '12345678901' }
      );
    });

    it('should apply date range filter correctly', async () => {
      const tenantId = 'tenant-123';
      const filters: TransactionFiltersDto = {
        createdFrom: '2025-01-01',
        createdTo: '2025-01-31',
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(tenantId, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
        }
      );
    });

    it('should apply sorting correctly', async () => {
      const tenantId = 'tenant-123';
      const sorting = {
        sortBy: 'value',
        order: 'asc',
      };

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      await service.findAll(tenantId, {}, {}, sorting);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('transaction.amount', 'ASC');
    });

    it('should handle pagination correctly', async () => {
      const tenantId = 'tenant-123';
      const pagination: PaginationDto = {
        page: 2,
        limit: 5,
      };

      mockQueryBuilder.getCount.mockResolvedValue(15);
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findAll(tenantId, {}, pagination);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 15,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const id = 'transaction-123';
      const tenantId = 'tenant-123';
      const mockTransaction = {
        id,
        title: 'Test Transaction',
        amount: 100,
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETED,
        tenantId,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        documentPath: null,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);

      const result = await service.findOne(id, tenantId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id, tenantId, deletedAt: IsNull() },
        relations: ['user', 'tenant'],
      });
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('getSummary', () => {
    it('should calculate financial summary correctly', async () => {
      const tenantId = 'tenant-123';
      const mockTransactions = [
        {
          type: TransactionType.INCOME,
          amount: 1000,
        },
        {
          type: TransactionType.INCOME,
          amount: 500,
        },
        {
          type: TransactionType.EXPENSE,
          amount: 300,
        },
        {
          type: TransactionType.EXPENSE,
          amount: 200,
        },
      ];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockTransactions);

      const result = await service.getSummary(tenantId);

      expect(result).toEqual({
        totalIncome: 1500,
        totalExpense: 500,
        balance: 1000,
        transactionCount: 4,
      });
    });
  });
});
