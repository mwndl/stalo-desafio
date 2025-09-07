# Stalo - Full Stack Challenge

Este é um projeto full-stack desenvolvido com Next.js (React 19) no frontend e Nest.js no backend, totalmente dockerizado.

## 🚀 Tecnologias

- **Frontend**: Next.js 14+ com React 19, TypeScript, Tailwind CSS
- **Backend**: Nest.js com TypeScript
- **Containerização**: Docker e Docker Compose
- **Gerenciador de Pacotes**: pnpm

## 📁 Estrutura do Projeto

```
stalo/
├── frontend/                 # Next.js (React 19)
├── backend/                  # Nest.js
├── docker-compose.yml        # Produção
├── docker-compose.dev.yml    # Desenvolvimento
├── env.example              # Variáveis de ambiente
└── README.md
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker e Docker Compose

### Configuração Inicial

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd stalo
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Inicialize os projetos**
   ```bash
   # Frontend
   cd frontend
   pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
   
   # Backend
   cd ../backend
   pnpm create nest-app@latest . --package-manager pnpm
   ```

### Executando com Docker

**Desenvolvimento:**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Produção:**
```bash
docker-compose up --build
```

### Executando localmente

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

**Backend:**
```bash
cd backend
pnpm install
pnpm start:dev
```

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📝 Scripts Disponíveis

### Frontend
- `pnpm dev` - Inicia o servidor de desenvolvimento
- `pnpm build` - Build para produção
- `pnpm start` - Inicia o servidor de produção
- `pnpm lint` - Executa o linter

### Backend
- `pnpm start` - Inicia o servidor
- `pnpm start:dev` - Inicia o servidor em modo desenvolvimento
- `pnpm build` - Build para produção
- `pnpm test` - Executa os testes
- `pnpm seed` - Executa o seed do banco de dados

## 🌱 Sistema de Seed

O projeto inclui um sistema completo de seed para popular o banco de dados com dados de exemplo para desenvolvimento e testes.

### Como Funciona

O sistema de seed é composto por:

- **SeedService**: Lógica principal de criação de dados
- **SeedController**: Endpoint HTTP para executar o seed
- **SeedRunner**: Script standalone para executar o seed via linha de comando
- **SeedModule**: Módulo Nest.js que configura as dependências

### Dados Criados

O seed cria automaticamente:

1. **3 Tenants** (empresas):
   - TechCorp Solutions
   - Green Energy Co
   - Creative Agency

2. **21 Usuários** (7 por tenant):
   - Dados realistas com nomes e emails únicos por tenant
   - Senhas padrão para desenvolvimento

3. **Transações** (3-8 por usuário):
   - Tipos: Income (40%) e Expense (60%)
   - Valores aleatórios entre $10-$1010
   - Categorias: Food, Transportation, Entertainment, Utilities, Shopping, Healthcare, Education
   - Status aleatórios
   - Datas dos últimos 90 dias

### Executando o Seed

**Via linha de comando:**
```bash
cd backend
pnpm seed
```

**Via endpoint HTTP:**
```bash
curl -X POST http://localhost:3001/seed
```

### Segurança

- O seed só funciona em modo desenvolvimento (`NODE_ENV=development`)
- Limpa todos os dados existentes antes de criar novos
- Respeita as constraints de foreign key durante a limpeza

### Estrutura dos Arquivos

```
backend/src/seed/
├── seed.service.ts      # Lógica principal
├── seed.controller.ts   # Endpoint HTTP
├── seed.module.ts       # Configuração do módulo
└── seed-runner.ts       # Script standalone
```

## 🐳 Docker

O projeto está configurado para rodar completamente dockerizado:

- **Desenvolvimento**: Hot reload habilitado com volumes
- **Produção**: Build otimizado para produção