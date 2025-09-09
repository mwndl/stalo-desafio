'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <h1 style={{
        fontSize: '20px',
        fontWeight: '600',
        color: '#000000',
        margin: 0,
        fontFamily: "'Lufga', system-ui, sans-serif"
      }}>
        Stalo Challenge
      </h1>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            backgroundColor: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: "'Lufga', system-ui, sans-serif"
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#000000',
              margin: 0,
              fontFamily: "'Lufga', system-ui, sans-serif"
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0,
              fontFamily: "'Lufga', system-ui, sans-serif"
            }}>
              {user?.email}
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            color: '#6b7280',
            fontSize: '16px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
          }}
        >
          Sair
        </button>
      </div>
    </header>
  );
}