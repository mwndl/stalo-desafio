import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Request,
  UseInterceptors as UseFileInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { SortBy, SortOrder } from './dto/sorting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantScopeInterceptor } from '../common/interceptors/tenant-scope.interceptor';
import { TenantId } from '../common/decorators/tenant.decorator';
import { UserId } from '../common/decorators/user.decorator';
import {
  TransactionType,
  TransactionStatus,
} from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { UploadService } from '../common/services/upload.service';
import { AppException } from '../common/exceptions/app.exception';
import { FileAccessGuard } from '../common/guards/file-access.guard';
import type { Response } from 'express';

@ApiTags('transactions')
@Controller('v1/transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TenantScopeInterceptor)
@ApiBearerAuth('JWT-auth')
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseFileInterceptors(
    FileInterceptor('document', {
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'image/png',
          'image/jpeg',
          'image/jpg',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(AppException.fileTypeNotAllowed(), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @ApiOperation({
    summary: 'Criar transação',
    description:
      'Cria uma nova transação para o tenant do usuário logado com documento opcional',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Transação criada com sucesso',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @UploadedFile() file: Express.Multer.File,
    @TenantId() tenantId: string,
    @Request() req,
  ): Promise<TransactionResponseDto> {
    const user: User = req.user;

    // Se houver arquivo, validar e fazer upload para MinIO
    if (file) {
      this.uploadService.validateFile(file);
      const minioKey = await this.uploadService.uploadToMinIO(
        file,
        tenantId,
        user.id,
      );
      createTransactionDto.documentPath = minioKey;
    }

    return this.transactionsService.create(
      createTransactionDto,
      tenantId,
      user.id,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Listar transações',
    description:
      'Retorna todas as transações do tenant do usuário logado com filtros, paginação e ordenação',
  })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  @ApiQuery({ name: 'status', enum: TransactionStatus, required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({
    name: 'cpf',
    required: false,
    description: 'CPF do usuário (busca exata)',
  })
  @ApiQuery({
    name: 'createdFrom',
    required: false,
    description: 'Data inicial do período',
  })
  @ApiQuery({
    name: 'createdTo',
    required: false,
    description: 'Data final do período',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial (legacy)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final (legacy)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (máximo 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    enum: SortBy,
    required: false,
    description: 'Campo para ordenação',
  })
  @ApiQuery({
    name: 'order',
    enum: SortOrder,
    required: false,
    description: 'Direção da ordenação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de transações retornada com sucesso',
    type: PaginatedResponseDto<TransactionResponseDto>,
  })
  async findAll(
    @Query() query: TransactionQueryDto,
    @TenantId() tenantId: string,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    const { page, limit, sortBy, order, ...filters } = query;
    return this.transactionsService.findAll(
      tenantId,
      filters,
      { page, limit },
      { sortBy, order },
    );
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Resumo financeiro',
    description: 'Retorna resumo financeiro das transações do tenant',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Resumo financeiro retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        totalIncome: { type: 'number', example: 5000.0 },
        totalExpense: { type: 'number', example: 3200.5 },
        balance: { type: 'number', example: 1799.5 },
        transactionCount: { type: 'number', example: 25 },
      },
    },
  })
  async getSummary(
    @Query('userId') userId?: string,
    @TenantId() tenantId?: string,
  ) {
    return this.transactionsService.getSummary(tenantId!, userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter transação por ID',
    description: 'Retorna uma transação específica do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação encontrada',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  async findOne(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.findOne(id, tenantId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar transação',
    description: 'Atualiza uma transação do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação atualizada com sucesso',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionsService.update(id, updateTransactionDto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Excluir transação (soft delete)',
    description:
      'Exclui uma transação do tenant do usuário logado (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Transação excluída com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Transação excluída com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transação não encontrada',
  })
  async remove(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ): Promise<{ message: string }> {
    return this.transactionsService.remove(id, tenantId, userId);
  }

  @Get('documents/:filename')
  @UseGuards(JwtAuthGuard, FileAccessGuard)
  @ApiOperation({
    summary: 'Baixar documento da transação',
    description:
      'Baixa um documento anexado a uma transação do tenant do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo retornado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Arquivo não encontrado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado',
  })
  async downloadDocument(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    // O filename agora é a chave completa do MinIO
    const signedUrl = await this.uploadService.getSignedDownloadUrl(filename);

    // Redirecionar para a URL assinada do MinIO
    res.redirect(signedUrl);
  }
}
