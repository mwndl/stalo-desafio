# Backend - Nest.js + PostgreSQL

Este é o backend da aplicação Stalo, desenvolvido com Nest.js e PostgreSQL.

## 🚀 Tecnologias

- **Framework**: Nest.js
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Gerenciador de Pacotes**: pnpm

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── database.config.ts    # Configuração do banco
│   ├── entities/
│   │   └── user.entity.ts        # Entidade User
│   ├── app.controller.ts         # Controller principal
│   ├── app.service.ts            # Service principal
│   └── app.module.ts             # Módulo principal
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

- `GET /` - Hello World
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário

### Exemplo de criação de usuário:

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João", "email": "joao@example.com"}'
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
- `password`: string (nullable)
- `createdAt`: Date
- `updatedAt`: Date

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