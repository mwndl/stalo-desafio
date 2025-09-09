import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { UploadService } from '../common/services/upload.service';
import { TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;
  let uploadService: UploadService;

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
  };

  const mockUploadService = {
    validateFile: jest.fn(),
    uploadToMinIO: jest.fn(),
    getSignedDownloadUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
    uploadService = module.get<UploadService>(UploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a transaction without file', async () => {
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
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '12345678901',
        password: 'hashedPassword',
        isActive: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockResponse: TransactionResponseDto = {
        id: 'transaction-123',
        title: 'Test Transaction',
        description: 'Test Description',
        amount: 100.50,
        type: TransactionType.INCOME,
        status: TransactionStatus.PENDING,
        category: 'Test Category',
        transactionDate: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tenantId,
        userId: 'user-123',
        documentPath: null,
      };

      mockTransactionsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        createTransactionDto,
        null,
        tenantId,
        { user },
      );

      expect(service.create).toHaveBeenCalledWith(
        createTransactionDto,
        tenantId,
        'user-123',
      );
      expect(result).toEqual(mockResponse);
    });

    it('should create a transaction with file upload', async () => {
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
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        cpf: '12345678901',
        password: 'hashedPassword',
        isActive: true,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFile: Express.Multer.File = {
        fieldname: 'document',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test content'),
        stream: null,
        destination: '',
        filename: '',
        path: '',
      };

      const mockResponse: TransactionResponseDto = {
        id: 'transaction-123',
        title: 'Test Transaction',
        description: 'Test Description',
        amount: 100.50,
        type: TransactionType.INCOME,
        status: TransactionStatus.PENDING,
        category: 'Test Category',
        transactionDate: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        tenantId,
        userId: 'user-123',
        documentPath: 'tenant-123/user-123/test.pdf',
      };

      mockUploadService.uploadToMinIO.mockResolvedValue('tenant-123/user-123/test.pdf');
      mockTransactionsService.create.mockResolvedValue(mockResponse);

      const result = await controller.create(
        createTransactionDto,
        mockFile,
        tenantId,
        { user },
      );

      expect(uploadService.validateFile).toHaveBeenCalledWith(mockFile);
      expect(uploadService.uploadToMinIO).toHaveBeenCalledWith(
        mockFile,
        tenantId,
        'user-123',
      );
      expect(service.create).toHaveBeenCalledWith(
        { ...createTransactionDto, documentPath: 'tenant-123/user-123/test.pdf' },
        tenantId,
        'user-123',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions with default parameters', async () => {
      const tenantId = 'tenant-123';
      const query: TransactionQueryDto = {};

      const mockResponse: PaginatedResponseDto<TransactionResponseDto> = {
        data: [
          {
            id: 'transaction-1',
            title: 'Transaction 1',
            description: 'Description 1',
            amount: 100,
            type: TransactionType.INCOME,
            status: TransactionStatus.COMPLETED,
            category: 'Category 1',
            transactionDate: new Date('2025-01-15'),
            createdAt: new Date('2025-01-15'),
            updatedAt: new Date('2025-01-15'),
            deletedAt: null,
            tenantId,
            userId: 'user-1',
            documentPath: null,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockTransactionsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(
        tenantId,
        {},
        { page: undefined, limit: undefined },
        { sortBy: undefined, order: undefined },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should apply filters correctly', async () => {
      const tenantId = 'tenant-123';
      const query: TransactionQueryDto = {
        status: TransactionStatus.COMPLETED,
        cpf: '12345678901',
        page: 2,
        limit: 20,
        sortBy: 'value',
        order: 'asc',
      };

      const mockResponse: PaginatedResponseDto<TransactionResponseDto> = {
        data: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: true,
        },
      };

      mockTransactionsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(
        tenantId,
        {
          status: TransactionStatus.COMPLETED,
          cpf: '12345678901',
        },
        { page: 2, limit: 20 },
        { sortBy: 'value', order: 'asc' },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle date range filters', async () => {
      const tenantId = 'tenant-123';
      const query: TransactionQueryDto = {
        createdFrom: '2025-01-01',
        createdTo: '2025-01-31',
      };

      const mockResponse: PaginatedResponseDto<TransactionResponseDto> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockTransactionsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query, tenantId);

      expect(service.findAll).toHaveBeenCalledWith(
        tenantId,
        {
          createdFrom: '2025-01-01',
          createdTo: '2025-01-31',
        },
        { page: undefined, limit: undefined },
        { sortBy: undefined, order: undefined },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const id = 'transaction-123';
      const tenantId = 'tenant-123';
      const mockResponse: TransactionResponseDto = {
        id,
        title: 'Test Transaction',
        description: 'Test Description',
        amount: 100,
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETED,
        category: 'Test Category',
        transactionDate: new Date('2025-01-15'),
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        deletedAt: null,
        tenantId,
        userId: 'user-123',
        documentPath: null,
      };

      mockTransactionsService.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(id, tenantId);

      expect(service.findOne).toHaveBeenCalledWith(id, tenantId);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSummary', () => {
    it('should return financial summary', async () => {
      const tenantId = 'tenant-123';
      const userId = 'user-123';

      const mockSummary = {
        totalIncome: 1500,
        totalExpense: 500,
        balance: 1000,
        transactionCount: 10,
      };

      mockTransactionsService.getSummary.mockResolvedValue(mockSummary);

      const result = await controller.getSummary(userId, tenantId);

      expect(service.getSummary).toHaveBeenCalledWith(tenantId, userId);
      expect(result).toEqual(mockSummary);
    });
  });
});
