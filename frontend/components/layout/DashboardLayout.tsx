'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      backgroundColor: '#f9fafb'
    }}>
      <Sidebar />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <Header />
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