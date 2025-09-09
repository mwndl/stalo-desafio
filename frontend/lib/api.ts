import { useAuth } from '@/contexts/AuthContext';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const createApiClient = () => {
  const { logout } = useAuth();
  
  const apiCall = async (url: string, options: ApiOptions = {}) => {
    const { requireAuth = true, ...fetchOptions } = options;
    
    // Adicionar token de autorização se necessário
    if (requireAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          'Authorization': `Bearer ${token}`,
        };
      }
    }
    
    try {
      const response = await fetch(url, fetchOptions);
      
      // Interceptar erro 401
      if (response.status === 401) {
        console.log('Erro 401 detectado na API - fazendo logout automático');
        logout();
        window.location.href = '/auth/login';
        throw new Error('Unauthorized');
      }
      
      return response;
    } catch (error) {
      // Se houver erro de rede ou outros erros, verificar se é relacionado a 401
      if (error instanceof Error && error.message.includes('401')) {
        console.log('Erro 401 detectado no catch da API - fazendo logout automático');
        logout();
        window.location.href = '/auth/login';
      }
      throw error;
    }
  };
  
  return apiCall;
};

// Hook para usar a API
export const useApi = () => {
  return createApiClient();
};
