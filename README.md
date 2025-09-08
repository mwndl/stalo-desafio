# Stalo - Sistema de Gestão Financeira Multi-tenant

Sistema full-stack de gestão financeira com arquitetura multi-tenant, desenvolvido com Next.js (React 19) no frontend e Nest.js no backend, totalmente dockerizado.

## 🚀 Tecnologias

- **Frontend**: Next.js 14+ com React 19, TypeScript, Tailwind CSS
- **Backend**: Nest.js com TypeScript, PostgreSQL, MinIO
- **Containerização**: Docker e Docker Compose
- **Gerenciador de Pacotes**: pnpm
- **Documentação**: Swagger/OpenAPI (apenas em desenvolvimento)

## 📁 Estrutura do Projeto

```
stalo/
├── frontend/                 # Next.js (React 19)
├── backend/                  # Nest.js
├── docker-compose.yml        # Produção
├── docker-compose.dev.yml    # Desenvolvimento
├── env.example              # Variáveis de ambiente
├── Stalo-API.postman_collection.json  # Coleção Postman
├── Stalo-API-Insomnia.json  # Coleção Insomnia
└── README.md
```

## 🐳 Como Subir com Docker

### Pré-requisitos

- Docker e Docker Compose instalados
- Git (para clonar o repositório)

### Configuração Rápida (< 10 minutos)

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd stalo
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite o arquivo .env se necessário (valores padrão funcionam para desenvolvimento)
   ```

3. **Suba os serviços**
   ```bash
   # Para desenvolvimento (com hot reload)
   docker-compose -f docker-compose.dev.yml up --build
   
   # Para produção
   docker-compose up --build
   ```

4. **Execute o seed do banco de dados**
   ```bash
   # Via endpoint HTTP
   curl -X POST http://localhost:3001/api/seed
   
   # Ou via container
   docker-compose exec backend pnpm seed
   ```

5. **Acesse as aplicações**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - API Documentation: http://localhost:3001/docs (apenas em desenvolvimento)
   - Health Check: http://localhost:3001/api/health

### Serviços Incluídos

- **Backend**: Nest.js API (porta 3001)
- **Frontend**: Next.js (porta 3000)
- **PostgreSQL**: Banco de dados (porta 5432)
- **MinIO**: Armazenamento de arquivos (portas 9000/9001)

## 🗄️ Migrations e Seeds

### Executando Migrations

```bash
# Via container
docker-compose exec backend pnpm migration:run

# Localmente (se tiver Node.js instalado)
cd backend
pnpm migration:run
```

### Executando Seeds

O sistema inclui um seed completo que popula o banco com dados de exemplo:

```bash
# Via endpoint HTTP (recomendado)
curl -X POST http://localhost:3001/api/seed

# Via container
docker-compose exec backend pnpm seed

# Localmente
cd backend
pnpm seed
```

### Dados Criados pelo Seed

O seed cria automaticamente:

1. **3 Tenants (empresas)**:
   - TechCorp Solutions
   - Green Energy Co
   - Creative Agency

2. **21 Usuários** (7 por tenant):
   - Dados realistas com nomes e emails únicos por tenant
   - Senha padrão: `password123`

3. **Transações** (3-8 por usuário):
   - Tipos: Income (40%) e Expense (60%)
   - Valores aleatórios entre $10-$1010
   - Categorias: Food, Transportation, Entertainment, Utilities, Shopping, Healthcare, Education
   - Status aleatórios
   - Datas dos últimos 90 dias

## 👥 Usuários de Teste por Tenant

### TechCorp Solutions
- **john.smith@techcorp-solutions.com** (senha: password123)
- **sarah.johnson@techcorp-solutions.com** (senha: password123)
- **mike.wilson@techcorp-solutions.com** (senha: password123)
- **emily.davis@techcorp-solutions.com** (senha: password123)
- **david.brown@techcorp-solutions.com** (senha: password123)
- **lisa.anderson@techcorp-solutions.com** (senha: password123)
- **robert.taylor@techcorp-solutions.com** (senha: password123)

### Green Energy Co
- **john.smith@green-energy-co.com** (senha: password123)
- **sarah.johnson@green-energy-co.com** (senha: password123)
- **mike.wilson@green-energy-co.com** (senha: password123)
- **emily.davis@green-energy-co.com** (senha: password123)
- **david.brown@green-energy-co.com** (senha: password123)
- **lisa.anderson@green-energy-co.com** (senha: password123)
- **robert.taylor@green-energy-co.com** (senha: password123)

### Creative Agency
- **john.smith@creative-agency.com** (senha: password123)
- **sarah.johnson@creative-agency.com** (senha: password123)
- **mike.wilson@creative-agency.com** (senha: password123)
- **emily.davis@creative-agency.com** (senha: password123)
- **david.brown@creative-agency.com** (senha: password123)
- **lisa.anderson@creative-agency.com** (senha: password123)
- **robert.taylor@creative-agency.com** (senha: password123)

## 🔄 Fluxo para Demonstrar Multi-tenant

### 1. Login em Diferentes Tenants

```bash
# Login no TechCorp Solutions
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@techcorp-solutions.com", "password": "password123"}'

# Login no Green Energy Co
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@green-energy-co.com", "password": "password123"}'
```

### 2. Verificar Isolamento de Dados

```bash
# Com token do TechCorp, listar transações
curl -X GET http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer <token_techcorp>"

# Com token do Green Energy, listar transações
curl -X GET http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer <token_green_energy>"
```

### 3. Criar Transações em Diferentes Tenants

```bash
# Criar transação no TechCorp
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer <token_techcorp>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TechCorp Transaction",
    "description": "Transaction in TechCorp tenant",
    "amount": 100.50,
    "type": "EXPENSE",
    "status": "PENDING",
    "category": "Food",
    "transactionDate": "2024-01-15"
  }'

# Criar transação no Green Energy
curl -X POST http://localhost:3001/api/v1/transactions \
  -H "Authorization: Bearer <token_green_energy>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Green Energy Transaction",
    "description": "Transaction in Green Energy tenant",
    "amount": 200.75,
    "type": "INCOME",
    "status": "COMPLETED",
    "category": "Utilities",
    "transactionDate": "2024-01-15"
  }'
```

### 4. Verificar Isolamento

- As transações criadas em cada tenant só aparecem para usuários daquele tenant
- Usuários de um tenant não conseguem acessar dados de outros tenants
- O sistema automaticamente filtra dados baseado no tenant do usuário logado

## 📚 Documentação da API

### Swagger/OpenAPI

A documentação completa da API está disponível em:
- **Desenvolvimento**: http://localhost:3001/docs
- **Produção**: Não disponível (apenas em desenvolvimento)

### Coleções de Teste

- **Postman**: `Stalo-API.postman_collection.json`
- **Insomnia**: `Stalo-API-Insomnia.json`

### Endpoints Principais

#### Autenticação
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Registro
- `GET /api/v1/auth/me` - Perfil do usuário
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Logout

#### Usuários
- `GET /api/v1/users` - Listar usuários do tenant
- `GET /api/v1/users/:id` - Obter usuário por ID
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Desativar usuário

#### Transações
- `POST /api/v1/transactions` - Criar transação
- `GET /api/v1/transactions` - Listar transações (com filtros e paginação)
- `GET /api/v1/transactions/summary` - Resumo financeiro
- `GET /api/v1/transactions/:id` - Obter transação por ID
- `PUT /api/v1/transactions/:id` - Atualizar transação
- `DELETE /api/v1/transactions/:id` - Excluir transação

#### Sistema
- `GET /api/health` - Health check
- `POST /api/seed` - Executar seed (desenvolvimento)

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- pnpm
- PostgreSQL (ou usar Docker)

### Configuração

```bash
# Frontend
cd frontend
pnpm install
pnpm dev

# Backend
cd backend
pnpm install
pnpm start:dev
```

### Scripts Disponíveis

#### Frontend
- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Inicia o servidor de produção
- `pnpm lint` - Executa o linter

#### Backend
- `pnpm start` - Inicia o servidor
- `pnpm start:dev` - Inicia o servidor em modo desenvolvimento
- `pnpm build` - Build para produção
- `pnpm test` - Executa os testes
- `pnpm seed` - Executa o seed do banco de dados
- `pnpm migration:run` - Executa migrations
- `pnpm migration:generate` - Gera nova migration

## 🔒 Segurança

- Autenticação JWT com refresh tokens
- Isolamento completo de dados por tenant
- Validação de entrada com class-validator
- CORS configurado
- Helmet para headers de segurança
- Rate limiting configurado

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs (apenas em desenvolvimento)
- **Health Check**: http://localhost:3001/api/health
- **MinIO Console**: http://localhost:9001 (usuário: minioadmin, senha: minioadmin123)

## 📝 Notas Importantes

- O seed só funciona em modo desenvolvimento (`NODE_ENV=development`)
- A documentação Swagger só está disponível em desenvolvimento
- Todos os dados são isolados por tenant automaticamente
- O sistema suporta upload de documentos para transações via MinIO
- As senhas dos usuários de teste são todas `password123`

## 🚀 Deploy

Para produção, configure as variáveis de ambiente apropriadas e use:

```bash
docker-compose up --build
```

Certifique-se de alterar as senhas padrão e chaves JWT em produção.