import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, MinLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TransactionType, TransactionStatus } from '../../entities/transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Título da transação',
    example: 'Salário mensal',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Salário do mês de setembro',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 5000.00,
    minimum: 0.01,
  })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Status da transação',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Categoria da transação',
    example: 'Salary',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Data da transação',
    example: '2025-09-01',
    format: 'date',
  })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({
    description: 'Caminho do documento anexado',
    example: 'uploads/transaction-123-1234567890-123456789.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentPath?: string;
}
