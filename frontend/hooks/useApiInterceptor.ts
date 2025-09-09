import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useApiInterceptor = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const isLoggingOut = useRef(false);

  useEffect(() => {
    // Interceptar fetch globalmente
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Verificar se é erro 401 (Unauthorized) e não está já fazendo logout
        if (response.status === 401 && !isLoggingOut.current) {
          console.log('Erro 401 detectado - fazendo logout automático');
          isLoggingOut.current = true;
          
          // Fazer logout
          logout();
          
          // Redirecionar para login
          router.push('/auth/login');
          
          // Retornar uma resposta vazia para evitar erros
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return response;
      } catch (error) {
        // Se houver erro na requisição, verificar se é relacionado a 401
        if (error instanceof Error && error.message.includes('401')) {
          if (!isLoggingOut.current) {
            console.log('Erro 401 detectado no catch - fazendo logout automático');
            isLoggingOut.current = true;
            
            logout();
            router.push('/auth/login');
          }
        }
        throw error;
      }
    };

    // Cleanup: restaurar fetch original quando componente desmontar
    return () => {
      window.fetch = originalFetch;
      isLoggingOut.current = false;
    };
  }, [logout, router]);
};
