import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Transaction, TransactionType, TransactionStatus } from '../src/entities/transaction.entity';
import { User } from '../src/entities/user.entity';
import { Tenant } from '../src/entities/tenant.entity';
import { RefreshToken } from '../src/entities/refresh-token.entity';

describe('Transactions E2E', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;
  let tenantId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test tenant and user
    const tenant = await app.get('TenantRepository').save({
      name: 'Test Tenant',
      slug: 'test-tenant',
      description: 'Test tenant for E2E tests',
      isActive: true,
    });
    tenantId = tenant.id;

    const user = await app.get('UserRepository').save({
      email: 'test@example.com',
      name: 'Test User',
      cpf: '12345678901',
      password: '$2a$10$hashedPassword',
      isActive: true,
      tenantId,
    });
    userId = user.id;

    // Generate JWT token
    accessToken = jwtService.sign({
      sub: userId,
      email: user.email,
      tenantId,
    });
  });

  afterAll(async () => {
    // Clean up test data
    await app.get('TransactionRepository').delete({ tenantId });
    await app.get('UserRepository').delete({ tenantId });
    await app.get('TenantRepository').delete({ id: tenantId });
    await app.close();
  });

  beforeEach(async () => {
    // Create test transactions
    const transactions = [
      {
        title: 'Income Transaction 1',
        description: 'Test income',
        amount: 1000,
        type: TransactionType.INCOME,
        status: TransactionStatus.COMPLETED,
        category: 'Salary',
        transactionDate: new Date('2025-01-15'),
        tenantId,
        userId,
      },
      {
        title: 'Expense Transaction 1',
        description: 'Test expense',
        amount: 300,
        type: TransactionType.EXPENSE,
        status: TransactionStatus.COMPLETED,
        category: 'Food',
        transactionDate: new Date('2025-01-14'),
        tenantId,
        userId,
      },
      {
        title: 'Pending Transaction',
        description: 'Pending transaction',
        amount: 500,
        type: TransactionType.INCOME,
        status: TransactionStatus.PENDING,
        category: 'Bonus',
        transactionDate: new Date('2025-01-13'),
        tenantId,
        userId,
      },
      {
        title: 'Cancelled Transaction',
        description: 'Cancelled transaction',
        amount: 200,
        type: TransactionType.EXPENSE,
        status: TransactionStatus.CANCELLED,
        category: 'Entertainment',
        transactionDate: new Date('2025-01-12'),
        tenantId,
        userId,
      },
    ];

    await app.get('TransactionRepository').save(transactions);
  });

  afterEach(async () => {
    // Clean up transactions after each test
    await app.get('TransactionRepository').delete({ tenantId });
  });

  describe('GET /v1/transactions', () => {
    it('should return paginated transactions with default parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(4);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 4,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should apply pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?page=1&limit=2')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 4,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should apply sorting by createdAt descending (default)', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const transactions = response.body.data;
      expect(transactions[0].title).toBe('Income Transaction 1'); // Most recent
      expect(transactions[3].title).toBe('Cancelled Transaction'); // Oldest
    });

    it('should apply sorting by value ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?sortBy=value&order=asc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const transactions = response.body.data;
      expect(transactions[0].amount).toBe(200); // Lowest value
      expect(transactions[3].amount).toBe(1000); // Highest value
    });

    it('should apply sorting by status ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?sortBy=status&order=asc')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const transactions = response.body.data;
      expect(transactions[0].status).toBe(TransactionStatus.CANCELLED);
      expect(transactions[1].status).toBe(TransactionStatus.COMPLETED);
      expect(transactions[2].status).toBe(TransactionStatus.COMPLETED);
      expect(transactions[3].status).toBe(TransactionStatus.PENDING);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?status=completed')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      response.body.data.forEach((transaction: any) => {
        expect(transaction.status).toBe(TransactionStatus.COMPLETED);
      });
    });

    it('should filter by CPF', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?cpf=12345678901')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(4);
    });

    it('should filter by date range using createdFrom and createdTo', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?createdFrom=2025-01-13&createdTo=2025-01-15')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });

    it('should filter by date range using legacy startDate and endDate', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?startDate=2025-01-13&endDate=2025-01-15')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
    });

    it('should combine multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?status=completed&sortBy=value&order=desc&page=1&limit=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe(TransactionStatus.COMPLETED);
      expect(response.body.data[0].amount).toBe(1000); // Highest value
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return empty result for non-existent CPF', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?cpf=99999999999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should return empty result for date range with no transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?createdFrom=2025-02-01&createdTo=2025-02-28')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?page=0&limit=0')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should handle invalid limit exceeding maximum', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions?limit=101')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/v1/transactions')
        .expect(401);
    });
  });

  describe('GET /v1/transactions/summary', () => {
    it('should return financial summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transactions/summary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalIncome');
      expect(response.body).toHaveProperty('totalExpense');
      expect(response.body).toHaveProperty('balance');
      expect(response.body).toHaveProperty('transactionCount');
      expect(response.body.totalIncome).toBe(1500); // 1000 + 500
      expect(response.body.totalExpense).toBe(500); // 300 + 200
      expect(response.body.balance).toBe(1000); // 1500 - 500
      expect(response.body.transactionCount).toBe(4);
    });
  });
});
