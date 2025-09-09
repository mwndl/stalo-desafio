import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Create users
    const users = await this.createUsers();
    console.log(`✅ Created ${users.length} users`);

    // Create transactions for each user
    let totalTransactions = 0;
    for (const user of users) {
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
    console.log('🧹 Cleared existing data');
  }

  private async createUsers(): Promise<User[]> {
    const userData = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        cpf: '12345678901',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        cpf: '12345678902',
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        cpf: '12345678903',
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        cpf: '12345678904',
      },
      {
        name: 'David Brown',
        email: 'david.brown@example.com',
        cpf: '12345678905',
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        cpf: '12345678906',
      },
      {
        name: 'Robert Taylor',
        email: 'robert.taylor@example.com',
        cpf: '12345678907',
      },
    ];

    const users: User[] = [];
    for (const data of userData) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = this.userRepository.create({
        ...data,
        password: hashedPassword,
      });
      const savedUser = await this.userRepository.save(user);
      users.push(savedUser);
    }

    return users;
  }

  private async createTransactionsForUser(user: User): Promise<Transaction[]> {
    const transactionCount = Math.floor(Math.random() * 6) + 3; // 3-8 transactions
    const categories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Utilities',
      'Shopping',
      'Healthcare',
      'Education',
    ];
    const statuses = Object.values(TransactionStatus);

    const transactions: Transaction[] = [];
    for (let i = 0; i < transactionCount; i++) {
      const isIncome = Math.random() > 0.6; // 40% chance of income
      const amount = Math.floor(Math.random() * 1000) + 10; // $10-$1010
      const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
      const transactionDate = new Date();
      transactionDate.setDate(transactionDate.getDate() - daysAgo);

      const transaction = this.transactionRepository.create({
        title: this.generateTransactionTitle(
          isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
        ),
        description: this.generateTransactionDescription(),
        amount: isIncome ? amount : -amount,
        type: isIncome ? TransactionType.INCOME : TransactionType.EXPENSE,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        transactionDate,
        cpf: user.cpf,
        userId: user.id,
      });

      const savedTransaction =
        await this.transactionRepository.save(transaction);
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

    const titles =
      type === TransactionType.INCOME ? incomeTitles : expenseTitles;
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
