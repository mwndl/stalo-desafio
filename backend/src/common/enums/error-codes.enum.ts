export enum ErrorCode {
  // Autenticação
  INVALID_CREDENTIALS = 'AUTH_001',
  EMAIL_ALREADY_EXISTS = 'AUTH_002',
  USER_NOT_FOUND = 'AUTH_003',
  INVALID_REFRESH_TOKEN = 'AUTH_004',
  USER_INACTIVE = 'AUTH_005',
  TENANT_NOT_FOUND = 'AUTH_006',

  // Transações
  TRANSACTION_NOT_FOUND = 'TRANS_001',

  // Arquivos
  FILE_TYPE_NOT_ALLOWED = 'FILE_001',
  FILE_NOT_PROVIDED = 'FILE_002',
  FILE_TOO_LARGE = 'FILE_003',
  FILE_NOT_FOUND = 'FILE_004',

  // Tenant/Acesso
  TENANT_NOT_IDENTIFIED = 'TENANT_001',
  TENANT_NOT_IDENTIFIED_IN_TOKEN = 'TENANT_002',
  RESOURCE_NOT_BELONGS_TO_TENANT = 'TENANT_003',

  // Validação
  VALIDATION_ERROR = 'VALID_001',

  // Sistema
  INTERNAL_SERVER_ERROR = 'SYS_001',
  DATABASE_CONNECTION_FAILED = 'SYS_002',
}

export interface ErrorDetails {
  message: string;
  statusCode: number;
  description?: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, ErrorDetails> = {
  // Autenticação
  [ErrorCode.INVALID_CREDENTIALS]: {
    message: 'Credenciais inválidas',
    statusCode: 401,
    description: 'Email ou senha incorretos',
  },
  [ErrorCode.EMAIL_ALREADY_EXISTS]: {
    message: 'Email já está em uso',
    statusCode: 409,
    description: 'Já existe um usuário cadastrado com este email',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    message: 'Usuário não encontrado',
    statusCode: 401,
    description: 'Usuário não existe ou foi removido',
  },
  [ErrorCode.INVALID_REFRESH_TOKEN]: {
    message: 'Refresh token inválido ou expirado',
    statusCode: 401,
    description: 'Token de renovação inválido ou expirado',
  },
  [ErrorCode.USER_INACTIVE]: {
    message: 'Usuário inativo',
    statusCode: 401,
    description: 'Conta de usuário está desativada',
  },
  [ErrorCode.TENANT_NOT_FOUND]: {
    message: 'Tenant não encontrado',
    statusCode: 404,
    description: 'Organização não existe ou foi removida',
  },

  // Transações
  [ErrorCode.TRANSACTION_NOT_FOUND]: {
    message: 'Transação não encontrada',
    statusCode: 404,
    description: 'Transação não existe ou foi removida',
  },

  // Arquivos
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: {
    message: 'Tipo de arquivo não permitido. Apenas PDF, PNG, JPG e JPEG são aceitos',
    statusCode: 400,
    description: 'Formato de arquivo não suportado',
  },
  [ErrorCode.FILE_NOT_PROVIDED]: {
    message: 'Arquivo não fornecido',
    statusCode: 400,
    description: 'Nenhum arquivo foi enviado na requisição',
  },
  [ErrorCode.FILE_TOO_LARGE]: {
    message: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
    statusCode: 400,
    description: 'Arquivo excede o limite de tamanho',
  },
  [ErrorCode.FILE_NOT_FOUND]: {
    message: 'Arquivo não encontrado',
    statusCode: 404,
    description: 'Arquivo solicitado não existe',
  },

  // Tenant/Acesso
  [ErrorCode.TENANT_NOT_IDENTIFIED]: {
    message: 'Tenant não identificado',
    statusCode: 403,
    description: 'Não foi possível identificar a organização',
  },
  [ErrorCode.TENANT_NOT_IDENTIFIED_IN_TOKEN]: {
    message: 'Tenant não identificado no token',
    statusCode: 403,
    description: 'Token JWT não contém informações do tenant',
  },
  [ErrorCode.RESOURCE_NOT_BELONGS_TO_TENANT]: {
    message: 'Acesso negado: recurso não pertence ao tenant',
    statusCode: 403,
    description: 'Usuário não tem permissão para acessar este recurso',
  },

  // Validação
  [ErrorCode.VALIDATION_ERROR]: {
    message: 'Dados de entrada inválidos',
    statusCode: 400,
    description: 'Os dados fornecidos não atendem aos critérios de validação',
  },

  // Sistema
  [ErrorCode.INTERNAL_SERVER_ERROR]: {
    message: 'Erro interno do servidor',
    statusCode: 500,
    description: 'Ocorreu um erro inesperado no servidor',
  },
  [ErrorCode.DATABASE_CONNECTION_FAILED]: {
    message: 'Falha na conexão com o banco de dados',
    statusCode: 500,
    description: 'Não foi possível conectar ao banco de dados',
  },
};
