import { IsEnum, IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../entities/transaction.entity';

export class TransactionFiltersDto {
  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    required: false,
  })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiProperty({
    description: 'Status da transação',
    enum: TransactionStatus,
    required: false,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiProperty({
    description: 'Categoria da transação',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'ID do usuário',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'CPF do usuário (busca exata)',
    example: '12345678901',
    required: false,
  })
  @IsString()
  @IsOptional()
  cpf?: string;

  @ApiProperty({
    description: 'Data inicial do período',
    example: '2025-09-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  createdFrom?: string;

  @ApiProperty({
    description: 'Data final do período',
    example: '2025-09-30',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  createdTo?: string;

  @ApiProperty({
    description: 'Data inicial (legacy - mantido para compatibilidade)',
    example: '2025-09-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Data final (legacy - mantido para compatibilidade)',
    example: '2025-09-30',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
