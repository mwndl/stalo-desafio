import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SortBy {
  CREATED_AT = 'createdAt',
  VALUE = 'value',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SortingDto {
  @ApiProperty({
    description: 'Campo para ordenação',
    enum: SortBy,
    required: false,
    default: SortBy.CREATED_AT,
  })
  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({
    description: 'Direção da ordenação',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder = SortOrder.DESC;
}
