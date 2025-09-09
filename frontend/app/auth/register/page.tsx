'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Helper para aplicar a fonte Lufga
const lufgaStyle = (styles: React.CSSProperties) => ({
  ...styles,
  fontFamily: "'Lufga', system-ui, -apple-system, sans-serif"
});

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    tenantId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.tenantId) {
      setError('ID do tenant é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        tenantId: formData.tenantId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      margin: '0 !important',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={lufgaStyle({ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#000000', 
            margin: 0
          })}>Stalo Challenge</h1>
        </div>

        {/* Card de Registro */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          padding: '48px',
          border: '1px solid #e5e7eb',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={lufgaStyle({ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#000000', 
              margin: 0
            })}>Criar Conta</h2>
            <p style={lufgaStyle({ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#6b7280'
            })}>
              Preencha os dados para criar sua conta
            </p>
          </div>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {/* Nome */}
              <div style={{ width: '100%' }}>
                <label htmlFor="name" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Nome Completo
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    style={lufgaStyle({
                      display: 'block',
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ width: '100%' }}>
                <label htmlFor="email" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Email
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    style={lufgaStyle({
                      display: 'block',
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Tenant ID */}
              <div style={{ width: '100%' }}>
                <label htmlFor="tenantId" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  ID do Tenant
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <input
                    id="tenantId"
                    name="tenantId"
                    type="text"
                    required
                    style={lufgaStyle({
                      display: 'block',
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="123e4567-e89b-12d3-a456-426614174000"
                    value={formData.tenantId}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div style={{ width: '100%' }}>
                <label htmlFor="password" style={lufgaStyle({ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' })}>
                  Senha
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    style={lufgaStyle({
                      display: 'block',
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Confirmar Senha */}
              <div style={{ width: '100%' }}>
                <label htmlFor="confirmPassword" style={lufgaStyle({ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' })}>
                  Confirmar Senha
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none'
                  }}>
                    <svg style={{ height: '20px', width: '20px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    style={lufgaStyle({
                      display: 'block',
                      width: '100%',
                      paddingLeft: '40px',
                      paddingRight: '12px',
                      paddingTop: '12px',
                      paddingBottom: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex' }}>
                  <div style={{ flexShrink: 0 }}>
                    <svg style={{ height: '20px', width: '20px', color: '#f87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    <p style={lufgaStyle({ fontSize: '14px', color: '#991b1b' })}>{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={lufgaStyle({
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '14px',
                paddingBottom: '14px',
                paddingLeft: '16px',
                paddingRight: '16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: isLoading ? '#6b7280' : '#000000',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                transform: isLoading ? 'none' : 'scale(1)'
              })}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#333333';
                  e.target.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#000000';
                  e.target.style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <svg style={{
                    animation: 'spin 1s linear infinite',
                    marginRight: '12px',
                    height: '20px',
                    width: '20px',
                    color: 'white'
                  }} fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando conta...
                </div>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <div style={{ 
            paddingTop: '32px', 
            textAlign: 'center',
            marginTop: '32px'
          }}>
            <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280' })}>
              Já tem uma conta?{' '}
              <a
                href="/auth/login"
                style={lufgaStyle({
                  color: '#000000',
                  textDecoration: 'none',
                  fontWeight: '600'
                })}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                Fazer login
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={lufgaStyle({ fontSize: '12px', color: '#9ca3af' })}>
            © 2025 Stalo Challenge. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
