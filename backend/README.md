# Backend - Nest.js + PostgreSQL

Este é o backend da aplicação Stalo, desenvolvido com Nest.js e PostgreSQL. O sistema implementa uma arquitetura multi-tenant para gerenciamento de transações financeiras.

## 🚀 Tecnologias

- **Framework**: Nest.js
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Gerenciador de Pacotes**: pnpm
- **Autenticação**: JWT
- **Upload de Arquivos**: MinIO
- **Arquitetura**: Multi-tenant

## 📁 Estrutura

```
backend/
├── src/
│   ├── auth/                     # Módulo de autenticação
│   ├── common/                   # Serviços e guards compartilhados
│   ├── config/                   # Configurações do banco
│   ├── entities/                 # Entidades do banco
│   │   ├── user.entity.ts        # Entidade User
│   │   ├── tenant.entity.ts      # Entidade Tenant
│   │   ├── transaction.entity.ts # Entidade Transaction
│   │   └── refresh-token.entity.ts
│   ├── transactions/             # Módulo de transações
│   ├── users/                    # Módulo de usuários
│   ├── health/                   # Health check
│   ├── seed/                     # Dados de seed
│   └── main.ts                   # Arquivo principal
├── Dockerfile                    # Docker para produção
├── Dockerfile.dev                # Docker para desenvolvimento
└── package.json
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL (ou Docker)

### Configuração

1. **Instalar dependências**
   ```bash
   pnpm install
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Executar localmente**
   ```bash
   pnpm start:dev
   ```

### Com Docker

```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up --build

# Produção
docker-compose up --build
```

## 🌐 Endpoints

### Autenticação
- `POST /v1/auth/login` - Login com email e senha
- `POST /v1/auth/register` - Registro de novo usuário
- `GET /v1/auth/me` - Dados do usuário logado
- `POST /v1/auth/refresh` - Renovar token
- `POST /v1/auth/logout` - Logout

### Transações
- `GET /v1/transactions` - Listar transações (com filtros e paginação)
- `POST /v1/transactions` - Criar transação (com upload de documento)
- `GET /v1/transactions/:id` - Obter transação por ID
- `PUT /v1/transactions/:id` - Atualizar transação
- `DELETE /v1/transactions/:id` - Excluir transação (soft delete)
- `GET /v1/transactions/summary` - Resumo financeiro
- `GET /v1/transactions/documents/:filename` - Download de documento

### Health Check
- `GET /health` - Status da aplicação

### Seed
- `POST /seed/run` - Executar seed do banco de dados

### Exemplo de login:

```bash
curl -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@techcorp-solutions.com", "password": "password123"}'
```

### Exemplo de criação de transação:

```bash
curl -X POST http://localhost:3001/v1/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Salário mensal",
    "amount": 5000.00,
    "type": "income",
    "transactionDate": "2025-01-01",
    "cpf": "12345678901"
  }'
```

## 🗄️ Banco de Dados

### Configuração

- **Host**: localhost (desenvolvimento) / postgres (Docker)
- **Porta**: 5432
- **Banco**: stalo_db
- **Usuário**: stalo_user
- **Senha**: stalo_password

### Entidades

#### User
- `id`: UUID (Primary Key)
- `email`: string (unique)
- `name`: string
- `cpf`: string (unique, nullable)
- `password`: string (nullable)
- `isActive`: boolean
- `tenantId`: UUID (Foreign Key)
- `createdAt`: Date
- `updatedAt`: Date

#### Tenant
- `id`: UUID (Primary Key)
- `name`: string (unique)
- `slug`: string (unique)
- `description`: string (nullable)
- `isActive`: boolean
- `createdAt`: Date
- `updatedAt`: Date

#### Transaction
- `id`: UUID (Primary Key)
- `title`: string
- `description`: string (nullable)
- `amount`: decimal(10,2)
- `type`: enum (income, expense)
- `status`: enum (processing, approved, rejected)
- `category`: string (nullable)
- `transactionDate`: date
- `cpf`: string (nullable)
- `documentPath`: string (nullable)
- `tenantId`: UUID (Foreign Key)
- `userId`: UUID (Foreign Key)
- `createdAt`: Date
- `updatedAt`: Date
- `deletedAt`: Date (nullable, soft delete)

#### RefreshToken
- `id`: UUID (Primary Key)
- `token`: string (unique)
- `userId`: UUID (Foreign Key)
- `expiresAt`: Date
- `createdAt`: Date

## ✨ Funcionalidades Implementadas

### Autenticação
- ✅ Login com email e senha
- ✅ Registro de usuários
- ✅ JWT tokens (access + refresh)
- ✅ Logout e logout de todos os dispositivos
- ✅ Middleware de autenticação

### Multi-tenant
- ✅ Isolamento de dados por tenant
- ✅ Interceptor para scope de tenant
- ✅ Guards para verificação de tenant

### Transações
- ✅ CRUD completo de transações
- ✅ Soft delete
- ✅ Upload de documentos (PDF, imagens)
- ✅ Filtros e paginação
- ✅ Resumo financeiro
- ✅ Verificação de ownership (usuário só pode editar/excluir suas transações)

### Campos da Transação
- ✅ ID (auto incremento)
- ✅ Data de criação (created_at)
- ✅ Usuário criador
- ✅ Valor da transação
- ✅ CPF do portador
- ✅ Documento (upload)
- ✅ Status (Em processamento, Aprovada, Negada)

### Validações
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo (5MB)
- ✅ Validação de dados de entrada
- ✅ Tratamento de erros padronizado

## 📝 Scripts

- `pnpm start` - Inicia o servidor
- `pnpm start:dev` - Inicia em modo desenvolvimento
- `pnpm build` - Build para produção
- `pnpm test` - Executa os testes

## 🔧 Configuração do TypeORM

O TypeORM está configurado para:
- Sincronização automática em desenvolvimento
- Logs habilitados em desenvolvimento
- SSL configurado para produção
- Entidades carregadas automaticamente

## 🐳 Docker

O backend está configurado para rodar com Docker:
- **Desenvolvimento**: Hot reload habilitado
- **Produção**: Build otimizado
- **Banco**: PostgreSQL incluído no docker-compose