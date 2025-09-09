'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  console.log('🏠 Home render:', { isAuthenticated, isLoading, mounted });

  useEffect(() => {
    console.log('🏠 Definindo mounted como true');
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('🏠 Home useEffect:', { isAuthenticated, mounted });
    if (mounted) {
      if (isAuthenticated) {
        console.log('🏠 Usuário autenticado, redirecionando para /transactions');
        router.push('/transactions');
      } else {
        console.log('🏠 Usuário não autenticado, redirecionando para /auth/login');
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, mounted, router]);

  // Mostrar loading até o componente estar montado
  if (!mounted) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  // Fallback caso algo dê errado
  return (
    <div style={{ 
      height: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <LoadingSpinner size="medium" />
    </div>
  );
}
