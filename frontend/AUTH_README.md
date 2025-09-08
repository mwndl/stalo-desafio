# Sistema de Autenticação - Frontend

Este documento descreve o sistema de autenticação implementado no frontend do Stalo.

## Estrutura

### Tipos TypeScript
- `types/auth.ts`: Define as interfaces `User`, `AuthResponse` e `LoginCredentials`

### Contexto de Autenticação
- `contexts/AuthContext.tsx`: Gerencia o estado global de autenticação
  - `useAuth()`: Hook para acessar dados de autenticação
  - `login()`: Função para fazer login
  - `logout()`: Função para fazer logout
  - `isAuthenticated`: Estado de autenticação
  - `isLoading`: Estado de carregamento

### Componentes
- `components/auth/ProtectedRoute.tsx`: Componente para proteger rotas
- `components/layout/Header.tsx`: Cabeçalho com informações do usuário
- `components/layout/Sidebar.tsx`: Menu lateral de navegação
- `components/layout/DashboardLayout.tsx`: Layout principal do dashboard

### Páginas
- `app/auth/login/page.tsx`: Página de login
- `app/dashboard/page.tsx`: Página do dashboard (protegida)

## Funcionalidades

### Login
- Formulário com campos de email e senha
- Validação de campos obrigatórios
- Simulação de chamada para API (dados mockados)
- Salvamento de tokens no localStorage
- Redirecionamento automático para dashboard

### Dashboard
- Layout responsivo com cabeçalho e sidebar
- Informações do usuário no cabeçalho
- Menu de navegação lateral
- Cards de resumo financeiro
- Seção de atividade recente

### Proteção de Rotas
- Redirecionamento automático para login se não autenticado
- Loading state durante verificação de autenticação
- Proteção do dashboard e outras rotas sensíveis

## Dados Salvos no Browser

O sistema salva os seguintes dados no localStorage:
- `access_token`: Token de acesso JWT
- `refresh_token`: Token de refresh JWT
- `user`: Dados do usuário (id, email, name, tenantId)

## Como Usar

1. Acesse a aplicação - será redirecionado para `/auth/login`
2. Preencha email e senha (qualquer valor funciona no modo mock)
3. Após login, será redirecionado para `/dashboard`
4. Use o menu lateral para navegar entre páginas
5. Clique no botão de logout no cabeçalho para sair

## Próximos Passos

Para integrar com o backend real:
1. Substituir a função `login()` mockada por uma chamada real para a API
2. Implementar refresh token automático
3. Adicionar tratamento de erros mais robusto
4. Implementar interceptors para adicionar tokens nas requisições
