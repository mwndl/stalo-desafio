import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TransactionSeedService } from './transaction-seed.service';

interface SeedTransactionsDto {
  email: string;
}

@ApiTags('seed')
@Controller('seed')
export class TransactionSeedController {
  constructor(private readonly transactionSeedService: TransactionSeedService) {}

  @Post('transactions')
  @ApiOperation({
    summary: 'Criar transações aleatórias para um usuário',
    description: 'Cria entre 5 e 10 transações aleatórias para o usuário especificado por email, evitando duplicatas',
  })
  @ApiBody({
    description: 'Email do usuário para criar as transações',
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email do usuário',
          example: 'maria@example.com'
        }
      },
      required: ['email']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Transações criadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Criadas 8 transações para o usuário João Silva' },
        transactionsCreated: { type: 'number', example: 8 }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Usuário não encontrado',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Usuário não encontrado' }
      }
    }
  })
  async seedTransactions(@Body() seedDto: SeedTransactionsDto) {
    try {
      const result = await this.transactionSeedService.seedTransactionsForUser(seedDto.email);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro interno do servidor',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
