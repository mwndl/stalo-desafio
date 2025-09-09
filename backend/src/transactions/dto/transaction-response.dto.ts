import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../entities/transaction.entity';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'ID único da transação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Título da transação',
    example: 'Salário mensal',
  })
  title: string;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Salário do mês de setembro',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Valor da transação',
    example: 5000.00,
  })
  amount: number;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Status da transação',
    enum: TransactionStatus,
    example: TransactionStatus.PROCESSING,
  })
  status: TransactionStatus;

  @ApiProperty({
    description: 'Categoria da transação',
    example: 'Salary',
    nullable: true,
  })
  category: string | null;

  @ApiProperty({
    description: 'Data da transação',
    example: '2025-09-01',
  })
  transactionDate: Date;

  @ApiProperty({
    description: 'CPF do portador da transação',
    example: '12345678901',
    nullable: true,
  })
  cpf: string | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-07T22:48:48.160Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2025-09-07T22:48:48.160Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Data de exclusão (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;


  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Caminho do documento anexado',
    example: 'uploads/transaction-123-1234567890-123456789.pdf',
    nullable: true,
  })
  documentPath?: string;
}
