import { IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionFiltersDto } from './transaction-filters.dto';
import { SortBy, SortOrder } from './sorting.dto';

export class TransactionQueryDto extends TransactionFiltersDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    minimum: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Campo para ordenação',
    enum: SortBy,
    required: false,
  })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy;

  @ApiProperty({
    description: 'Direção da ordenação',
    enum: SortOrder,
    required: false,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder;
}
