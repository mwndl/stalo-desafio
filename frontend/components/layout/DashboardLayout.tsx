'use client';

import { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useApiInterceptor } from '@/hooks/useApiInterceptor';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Interceptador de erros 401
  useApiInterceptor();

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: '#f9fafb'
    }}>
      <Sidebar isMobile={isMobile} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        marginLeft: '0'
      }}>
        <Header 
          showMenuButton={isMobile} 
          onMenuToggle={handleMenuToggle}
        />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}