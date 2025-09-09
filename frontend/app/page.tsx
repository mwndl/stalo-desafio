'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isAuthenticated) {
        router.push('/transactions');
      } else {
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
