import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Create tenants
    const tenants = await this.createTenants();
    console.log(`✅ Created ${tenants.length} tenants`);

    // Create users for each tenant
    const allUsers: User[] = [];
    for (const tenant of tenants) {
      const users = await this.createUsersForTenant(tenant);
      allUsers.push(...users);
    }
    console.log(`✅ Created ${allUsers.length} users`);

    // Create transactions for each user
    let totalTransactions = 0;
    for (const user of allUsers) {
      const transactions = await this.createTransactionsForUser(user);
      totalTransactions += transactions.length;
    }
    console.log(`✅ Created ${totalTransactions} transactions`);

    console.log('🎉 Database seeding completed successfully!');
  }

  private async clearDatabase(): Promise<void> {
    // Delete in reverse order to respect foreign key constraints
    await this.transactionRepository.query('DELETE FROM transactions');
    await this.userRepository.query('DELETE FROM users');
    await this.tenantRepository.query('DELETE FROM tenants');
    console.log('🧹 Cleared existing data');
  }

  private async createTenants(): Promise<Tenant[]> {
    const tenantData = [
      {
        name: 'TechCorp Solutions',
        slug: 'techcorp-solutions',
        description: 'Leading technology solutions provider',
      },
      {
        name: 'Green Energy Co',
        slug: 'green-energy-co',
        description: 'Sustainable energy solutions',
      },
      {
        name: 'Creative Agency',
        slug: 'creative-agency',
        description: 'Full-service creative marketing agency',
      },
    ];

    const tenants: Tenant[] = [];
    for (const data of tenantData) {
      const tenant = this.tenantRepository.create(data);
      const savedTenant = await this.tenantRepository.save(tenant);
      tenants.push(savedTenant);
    }

    return tenants;
  }

  private async createUsersForTenant(tenant: Tenant): Promise<User[]> {
    const userData = [
      {
        name: 'John Smith',
        email: `john.smith@${tenant.slug}.com`,
      },
      {
        name: 'Sarah Johnson',
        email: `sarah.johnson@${tenant.slug}.com`,
      },
      {
        name: 'Mike Wilson',
        email: `mike.wilson@${tenant.slug}.com`,
      },
      {
        name: 'Emily Davis',
        email: `emily.davis@${tenant.slug}.com`,
      },
      {
        name: 'David Brown',
        email: `david.brown@${tenant.slug}.com`,
      },
      {
        name: 'Lisa Anderson',
        email: `lisa.anderson@${tenant.slug}.com`,
      },
      {
        name: 'Robert Taylor',
        email: `robert.taylor@${tenant.slug}.com`,
      },
    ];

    const users: User[] = [];
    for (const data of userData) {
      const user = this.userRepository.create({
        ...data,
        tenantId: tenant.id,
        password: 'hashed_password_123', // In real app, this would be properly hashed
      });
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
    }

    return users;
  }

  private async createTransactionsForUser(user: User): Promise<Transaction[]> {
    const transactionCount = Math.floor(Math.random() * 6) + 3; // 3-8 transactions
    const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education'];
    const statuses = Object.values(TransactionStatus);
    const types = Object.values(TransactionType);

    const transactions: Transaction[] = [];
    for (let i = 0; i < transactionCount; i++) {
      const isIncome = Math.random() > 0.6; // 40% chance of income
      const amount = Math.floor(Math.random() * 1000) + 10; // $10-$1010
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      const transaction = this.transactionRepository.create({
        title: this.generateTransactionTitle(isIncome ? TransactionType.INCOME : TransactionType.EXPENSE),
        description: this.generateTransactionDescription(),
        amount: isIncome ? amount : -amount,
        type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        transactionDate,
        tenantId: user.tenantId,
        userId: user.id,
      });

      const savedTransaction = await this.transactionRepository.save(transaction);
      transactions.push(savedTransaction);
    }

    return transactions;
  }

  private generateTransactionTitle(type: TransactionType): string {
    const incomeTitles = [
      'Salary Payment',
      'Freelance Work',
      'Investment Return',
      'Bonus Payment',
      'Consulting Fee',
      'Rental Income',
      'Refund',
    ];

    const expenseTitles = [
      'Grocery Shopping',
      'Gas Station',
      'Restaurant Bill',
      'Online Purchase',
      'Utility Bill',
      'Phone Bill',
      'Coffee Shop',
      'Movie Ticket',
      'Gym Membership',
      'Medical Checkup',
    ];

    const titles = type === TransactionType.INCOME ? incomeTitles : expenseTitles;
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateTransactionDescription(): string {
    const descriptions = [
      'Monthly recurring payment',
      'One-time purchase',
      'Emergency expense',
      'Planned purchase',
      'Subscription renewal',
      'Service fee',
      'Maintenance cost',
      'Travel expense',
      'Business expense',
      'Personal expense',
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}