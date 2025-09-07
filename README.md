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

## 🐳 Docker

O projeto está configurado para rodar completamente dockerizado:

- **Desenvolvimento**: Hot reload habilitado com volumes
- **Produção**: Build otimizado para produção