import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { TransactionSeedService } from './transaction-seed.service';

interface SeedTransactionsDto {
  userId: string;
}

@ApiTags('seed')
@Controller('seed')
export class TransactionSeedController {
  constructor(private readonly transactionSeedService: TransactionSeedService) {}

  @Post('transactions')
  @ApiOperation({
    summary: 'Criar transações aleatórias para um usuário',
    description: 'Cria entre 5 e 10 transações aleatórias para o usuário especificado, evitando duplicatas',
  })
  @ApiBody({
    description: 'ID do usuário para criar as transações',
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID do usuário',
          example: '3c42fb24-6bbf-4deb-bc7e-3d851550cd36'
        }
      },
      required: ['userId']
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
      const result = await this.transactionSeedService.seedTransactionsForUser(seedDto.userId);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro interno do servidor',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
