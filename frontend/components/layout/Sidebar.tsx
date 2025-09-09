'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transações', href: '/transactions' },
  { name: 'Nova Transação', href: '/transactions/new' },
];

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isMobile, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Fechar sidebar ao clicar em um link no mobile
  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '280px' : '250px',
        backgroundColor: 'white',
        borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
        padding: '20px 0',
        position: isMobile ? 'fixed' : 'relative',
        top: isMobile ? 0 : 'auto',
        left: isMobile ? (isOpen ? 0 : '-280px') : 'auto',
        height: isMobile ? '100vh' : 'auto',
        zIndex: 10000,
        transition: 'left 0.3s ease',
        boxShadow: isMobile ? '2px 0 10px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: 0,
            fontFamily: "'Lufga', system-ui, sans-serif"
          }}>
            Menu
          </h2>
        </div>
        
        <nav style={{ padding: '0 10px' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                style={{
                  display: 'block',
                  padding: '12px 15px',
                  marginBottom: '5px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive ? '#000000' : '#6b7280',
                  backgroundColor: isActive ? '#f3f4f6' : '',
                  fontFamily: "'Lufga', system-ui, sans-serif",
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.color = '#000000';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}