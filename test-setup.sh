#!/bin/bash

echo "Setup Projeto Stalo"
echo "========================================"

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo "-> Verificando pré-requisitos..."
if ! command_exists docker; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Verificar se os arquivos existem
echo "-> Verificando arquivos do projeto..."
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ docker-compose.dev.yml não encontrado"
    exit 1
fi

if [ ! -f "env.example" ]; then
    echo "❌ env.example não encontrado"
    exit 1
fi

echo "✅ Arquivos do projeto encontrados"

# Configurar .env se não existir
if [ ! -f ".env" ]; then
    echo "-> Configurando variáveis de ambiente..."
    cp env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

# Subir apenas o banco de dados primeiro (mais rápido)
echo "-> Subindo banco de dados..."
docker-compose -f docker-compose.dev.yml up postgres -d

# Aguardar o banco estar pronto
echo "-> Aguardando banco de dados ficar pronto..."
sleep 10

# Verificar se o banco está rodando
echo "-> Verificando se o banco está rodando..."
if docker-compose -f docker-compose.dev.yml ps postgres | grep -q "Up"; then
    echo "✅ Banco de dados rodando"
else
    echo "❌ Banco de dados não está rodando"
    exit 1
fi

# Subir o backend
echo "-> Subindo backend..."
docker-compose -f docker-compose.dev.yml up backend -d

# Aguardar o backend estar pronto
echo "-> Aguardando backend ficar pronto..."
sleep 15

# Testar health check
echo "-> Testando health check..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend respondendo"
else
    echo "❌ Backend não está respondendo"
    echo "-> Logs do backend:"
    docker-compose -f docker-compose.dev.yml logs backend --tail=20
    exit 1
fi

# Executar seed
echo "-> Executando seed do banco de dados..."
if curl -s -X POST http://localhost:3001/api/seed > /dev/null; then
    echo "✅ Seed executado com sucesso"
else
    echo "❌ Erro ao executar seed"
    exit 1
fi

# Testar login
echo "-> Testando autenticação..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.smith@techcorp-solutions.com", "password": "password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Login funcionando"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "-> Token obtido: ${TOKEN:0:20}..."
else
    echo "❌ Login falhou"
    echo "Resposta: $LOGIN_RESPONSE"
    exit 1
fi

# Testar listagem de transações
echo "-> Testando listagem de transações..."
if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/transactions > /dev/null; then
    echo "✅ Listagem de transações funcionando"
else
    echo "❌ Listagem de transações falhou"
    exit 1
fi

# Subir frontend
echo "-> Subindo frontend..."
docker-compose -f docker-compose.dev.yml up frontend -d

# Aguardar frontend
echo "-> Aguardando frontend ficar pronto..."
sleep 10

# Verificar frontend
echo "-> Testando frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend respondendo"
else
    echo "⚠️  Frontend pode não estar disponível"
fi

echo ""
echo "SETUP CONCLUÍDO COM SUCESSO!"
echo "================================"
echo "-> Frontend: http://localhost:3000"
echo "-> Backend: http://localhost:3001"
echo "-> API Docs: http://localhost:3001/docs"
echo "-> Health: http://localhost:3001/api/health"
echo ""
echo "-> Usuários de teste:"
echo "   john.smith@techcorp-solutions.com (senha: password123)"
echo "   john.smith@green-energy-co.com (senha: password123)"
echo "   john.smith@creative-agency.com (senha: password123)"
echo ""
echo "🛑 Para parar: docker-compose -f docker-compose.dev.yml down"
