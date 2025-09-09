import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class TransactionSeedService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedTransactionsForUser(email: string): Promise<{ message: string; transactionsCreated: number }> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const userId = user.id;

    // Buscar transações existentes do usuário
    const existingTransactions = await this.transactionRepository.find({
      where: { userId },
      select: ['title', 'amount', 'type', 'transactionDate']
    });

    // Gerar pool de transações possíveis
    const possibleTransactions = this.generateTransactionPool();
    
    // Filtrar transações que já existem
    const availableTransactions = possibleTransactions.filter(possible => 
      !existingTransactions.some(existing => 
        existing.title === possible.title && 
        existing.amount === possible.amount &&
        existing.type === possible.type
      )
    );

    if (availableTransactions.length === 0) {
      return { 
        message: 'Todas as transações possíveis já foram criadas para este usuário', 
        transactionsCreated: 0 
      };
    }

    // Selecionar entre 5 e 10 transações aleatórias
    const numberOfTransactions = Math.min(
      Math.floor(Math.random() * 6) + 5, // 5-10 transações
      availableTransactions.length
    );

    const selectedTransactions = this.shuffleArray(availableTransactions).slice(0, numberOfTransactions);

    // Criar as transações
    const transactions: Transaction[] = [];
    for (const transactionData of selectedTransactions) {
      const transaction = this.transactionRepository.create({
        ...transactionData,
        userId,
        status: this.getRandomStatus(),
        cpf: this.generateRandomCPF(),
        transactionDate: this.generateRandomDate(),
        description: this.generateRandomDescription(),
      });
      
      const savedTransaction = await this.transactionRepository.save(transaction);
      transactions.push(savedTransaction);
    }

    return {
      message: `Criadas ${transactions.length} transações para o usuário ${user.name}`,
      transactionsCreated: transactions.length
    };
  }

  private generateTransactionPool() {
    const transactions = [];

    // Transações de Receita
    const incomeTransactions = [
      { title: 'Salário Mensal', amount: 5000, type: TransactionType.INCOME, category: 'Salário' },
      { title: 'Salário Mensal', amount: 3500, type: TransactionType.INCOME, category: 'Salário' },
      { title: 'Salário Mensal', amount: 4200, type: TransactionType.INCOME, category: 'Salário' },
      { title: 'Freelance - Desenvolvimento Web', amount: 1200, type: TransactionType.INCOME, category: 'Freelance' },
      { title: 'Freelance - Consultoria', amount: 800, type: TransactionType.INCOME, category: 'Freelance' },
      { title: 'Freelance - Design Gráfico', amount: 600, type: TransactionType.INCOME, category: 'Freelance' },
      { title: 'Bônus de Performance', amount: 1500, type: TransactionType.INCOME, category: 'Bônus' },
      { title: 'Bônus de Performance', amount: 800, type: TransactionType.INCOME, category: 'Bônus' },
      { title: 'Rendimento de Investimento', amount: 300, type: TransactionType.INCOME, category: 'Investimentos' },
      { title: 'Rendimento de Investimento', amount: 450, type: TransactionType.INCOME, category: 'Investimentos' },
      { title: 'Dividendos', amount: 200, type: TransactionType.INCOME, category: 'Investimentos' },
      { title: 'Aluguel de Imóvel', amount: 1800, type: TransactionType.INCOME, category: 'Aluguel' },
      { title: 'Comissão de Vendas', amount: 700, type: TransactionType.INCOME, category: 'Comissão' },
      { title: 'Reembolso de Despesa', amount: 150, type: TransactionType.INCOME, category: 'Reembolso' },
      { title: 'Cashback', amount: 80, type: TransactionType.INCOME, category: 'Cashback' },
      { title: 'Presente em Dinheiro', amount: 500, type: TransactionType.INCOME, category: 'Presente' },
      { title: 'Venda de Produto', amount: 250, type: TransactionType.INCOME, category: 'Venda' },
      { title: 'Consultoria Técnica', amount: 900, type: TransactionType.INCOME, category: 'Consultoria' },
      { title: 'Aulas Particulares', amount: 400, type: TransactionType.INCOME, category: 'Educação' },
      { title: 'Indenização', amount: 2000, type: TransactionType.INCOME, category: 'Indenização' },
    ];

    // Transações de Despesa
    const expenseTransactions = [
      { title: 'Compras no Supermercado', amount: 350, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Compras no Supermercado', amount: 280, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Compras no Supermercado', amount: 420, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Posto de Combustível', amount: 180, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Posto de Combustível', amount: 220, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Restaurante', amount: 85, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Restaurante', amount: 120, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Restaurante', amount: 65, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Compra Online - Amazon', amount: 150, type: TransactionType.EXPENSE, category: 'Compras' },
      { title: 'Compra Online - Mercado Livre', amount: 200, type: TransactionType.EXPENSE, category: 'Compras' },
      { title: 'Conta de Luz', amount: 120, type: TransactionType.EXPENSE, category: 'Utilidades' },
      { title: 'Conta de Telefone', amount: 80, type: TransactionType.EXPENSE, category: 'Utilidades' },
      { title: 'Conta de Internet', amount: 90, type: TransactionType.EXPENSE, category: 'Utilidades' },
      { title: 'Café da Manhã', amount: 25, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Café da Manhã', amount: 18, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Ingresso de Cinema', amount: 35, type: TransactionType.EXPENSE, category: 'Entretenimento' },
      { title: 'Academia', amount: 120, type: TransactionType.EXPENSE, category: 'Saúde' },
      { title: 'Consulta Médica', amount: 200, type: TransactionType.EXPENSE, category: 'Saúde' },
      { title: 'Farmácia', amount: 85, type: TransactionType.EXPENSE, category: 'Saúde' },
      { title: 'Uber/Taxi', amount: 45, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Uber/Taxi', amount: 32, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Netflix', amount: 45, type: TransactionType.EXPENSE, category: 'Entretenimento' },
      { title: 'Spotify', amount: 25, type: TransactionType.EXPENSE, category: 'Entretenimento' },
      { title: 'Amazon Prime', amount: 15, type: TransactionType.EXPENSE, category: 'Entretenimento' },
      { title: 'Manutenção do Carro', amount: 300, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Roupas', amount: 180, type: TransactionType.EXPENSE, category: 'Compras' },
      { title: 'Livros', amount: 60, type: TransactionType.EXPENSE, category: 'Educação' },
      { title: 'Presente', amount: 100, type: TransactionType.EXPENSE, category: 'Presente' },
      { title: 'Viagem', amount: 800, type: TransactionType.EXPENSE, category: 'Viagem' },
      { title: 'Conta de Água', amount: 60, type: TransactionType.EXPENSE, category: 'Utilidades' },
      { title: 'Gás de Cozinha', amount: 40, type: TransactionType.EXPENSE, category: 'Utilidades' },
      { title: 'Seguro do Carro', amount: 200, type: TransactionType.EXPENSE, category: 'Transporte' },
      { title: 'Plano de Saúde', amount: 350, type: TransactionType.EXPENSE, category: 'Saúde' },
      { title: 'Curso Online', amount: 150, type: TransactionType.EXPENSE, category: 'Educação' },
      { title: 'Jantar Especial', amount: 200, type: TransactionType.EXPENSE, category: 'Alimentação' },
      { title: 'Teatro', amount: 80, type: TransactionType.EXPENSE, category: 'Entretenimento' },
      { title: 'Dentista', amount: 300, type: TransactionType.EXPENSE, category: 'Saúde' },
      { title: 'Material de Escritório', amount: 120, type: TransactionType.EXPENSE, category: 'Compras' },
      { title: 'Assinatura de Software', amount: 50, type: TransactionType.EXPENSE, category: 'Tecnologia' },
      { title: 'Celular Novo', amount: 1200, type: TransactionType.EXPENSE, category: 'Tecnologia' },
      { title: 'Roupas de Trabalho', amount: 300, type: TransactionType.EXPENSE, category: 'Compras' },
    ];

    return [...incomeTransactions, ...expenseTransactions];
  }

  private getRandomStatus(): TransactionStatus {
    const statuses = Object.values(TransactionStatus);
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateRandomCPF(): string {
    // Gerar CPF aleatório (apenas para exemplo)
    const cpf = Math.floor(Math.random() * 90000000000) + 10000000000;
    return cpf.toString();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateRandomDate(): Date {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90); // Últimos 90 dias
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  private generateRandomDescription(): string {
    const descriptions = [
      'Pagamento mensal recorrente',
      'Compra única',
      'Despesa de emergência',
      'Compra planejada',
      'Renovação de assinatura',
      'Taxa de serviço',
      'Custo de manutenção',
      'Despesa de viagem',
      'Despesa de negócios',
      'Despesa pessoal',
      'Transferência bancária',
      'Pagamento via PIX',
      'Cartão de crédito',
      'Dinheiro em espécie',
      'Transferência automática',
      'Pagamento em dinheiro',
      'Débito automático',
      'Boleto bancário',
      'Compra no cartão',
      'Saque em caixa eletrônico',
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
}
