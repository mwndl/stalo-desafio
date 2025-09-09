'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { LoginCredentials } from '@/types/auth';

export default function LoginPage() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  // Helper para aplicar fonte Lufga
  const lufgaStyle = (baseStyle: any) => ({
    ...baseStyle,
    fontFamily: 'Lufga, system-ui, -apple-system, sans-serif'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('=== FORMULÁRIO SUBMETIDO ===');
    console.log('Credenciais:', credentials);
    console.log('isLoading antes:', isLoading);
    
    setIsLoading(true);
    setError(null);
    
    console.log('isLoading depois:', true);

    try {
      console.log('=== CHAMANDO FUNÇÃO LOGIN ===');
      await login(credentials);
      console.log('=== LOGIN REALIZADO COM SUCESSO ===');
      console.log('=== REDIRECIONANDO PARA DASHBOARD ===');
      router.push('/dashboard');
    } catch (error) {
      console.error('=== ERRO NO LOGIN ===', error);
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      console.log('=== FINALIZANDO LOADING ===');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
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
        gap: '20px'
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

        {/* Card de Login */}
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
            })}>Entrar</h2>
            <p style={lufgaStyle({ 
              marginTop: '8px', 
              fontSize: '14px', 
              color: '#6b7280'
            })}>
              Acesse sua conta
            </p>
          </div>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
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
                    value={credentials.email}
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
                    autoComplete="current-password"
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
                    value={credentials.password}
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


            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                console.log('=== BOTÃO CLICADO ===');
                console.log('Evento:', e);
                console.log('isLoading:', isLoading);
                console.log('credentials:', credentials);
              }}
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
                  (e.target as HTMLElement).style.background = '#333333';
                  (e.target as HTMLElement).style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  (e.target as HTMLElement).style.background = '#000000';
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    WebkitAnimation: 'spin 1s linear infinite'
                  }} />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div style={{ 
            textAlign: 'center'
          }}>
            <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280' })}>
              Não tem uma conta?{' '}
              <a
                href="/auth/register"
                style={lufgaStyle({
                  fontWeight: '500',
                  color: '#000000',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                })}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#333333'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#000000'}
              >
                Cadastre-se aqui
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