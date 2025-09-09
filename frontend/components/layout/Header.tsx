'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ onMenuToggle, showMenuButton = false }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      opacity: 1,
      zIndex: 9999,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Botão hambúrguer para mobile */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <h1 style={{
          fontSize: '20px',
          fontWeight: '600',
          margin: 0,
          fontFamily: "'Lufga', system-ui, sans-serif"
        }}>
          Stalo Challenge
        </h1>
      </div>
      
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        {/* Ícone de perfil clicável */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            fontFamily: "'Lufga', system-ui, sans-serif",
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#000000';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            minWidth: '200px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {/* Informações do usuário */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 4px 0',
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: '14px',
                margin: 0,
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                {user?.email}
              </div>
            </div>

            {/* Botão de logout */}
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Lufga', system-ui, sans-serif",
                textAlign: 'left',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '';
            }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}