'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Helper para aplicar a fonte Lufga
const lufgaStyle = (styles: React.CSSProperties) => ({
  ...styles,
  fontFamily: "'Lufga', system-ui, -apple-system, sans-serif"
});

// Interface para resumo financeiro
interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

// Interface para transação
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'processing' | 'approved' | 'rejected';
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Carregar dados do dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('Token de acesso não encontrado');
          setIsLoading(false);
          return;
        }

        // Carregar resumo financeiro
        const summaryResponse = await fetch('http://localhost:3001/api/v1/transactions/summary', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        // Carregar transações recentes
        const transactionsResponse = await fetch('http://localhost:3001/api/v1/transactions?limit=5&sortBy=createdAt&order=desc', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData.data || []);
        }

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#16a34a';
      case 'processing':
        return '#d97706';
      case 'rejected':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'processing':
        return 'Em processamento';
      case 'rejected':
        return 'Negada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            padding: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #000000',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={lufgaStyle({ fontSize: '16px', color: '#6b7280' })}>
                Carregando dashboard...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={lufgaStyle({ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#000000',
              margin: '0 0 8px 0'
            })}>
              Dashboard
            </h1>
            <p style={lufgaStyle({ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            })}>
              Resumo financeiro e atividades recentes
            </p>
          </div>

          {/* Cards de Resumo */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Saldo Total */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0f9ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <svg style={{ height: '24px', width: '24px', color: '#0ea5e9' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Saldo Total
                  </p>
                  <p style={lufgaStyle({ fontSize: '24px', fontWeight: '700', color: '#000000', margin: 0 })}>
                    {summary ? formatCurrency(summary.balance) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Receitas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <svg style={{ height: '24px', width: '24px', color: '#22c55e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Receitas
                  </p>
                  <p style={lufgaStyle({ fontSize: '24px', fontWeight: '700', color: '#16a34a', margin: 0 })}>
                    {summary ? formatCurrency(summary.totalIncome) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Despesas */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <svg style={{ height: '24px', width: '24px', color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Despesas
                  </p>
                  <p style={lufgaStyle({ fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: 0 })}>
                    {summary ? formatCurrency(summary.totalExpense) : 'R$ 0,00'}
                  </p>
                </div>
              </div>
            </div>

            {/* Total de Transações */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <svg style={{ height: '24px', width: '24px', color: '#64748b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Transações
                  </p>
                  <p style={lufgaStyle({ fontSize: '24px', fontWeight: '700', color: '#000000', margin: 0 })}>
                    {summary ? summary.transactionCount : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transações Recentes */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={lufgaStyle({ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#000000',
                margin: 0
              })}>
                Transações Recentes
              </h3>
              <button
                onClick={() => router.push('/transactions')}
                style={lufgaStyle({
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                Ver todas
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <svg style={{ height: '48px', width: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 style={lufgaStyle({ fontSize: '16px', fontWeight: '500', color: '#000000', margin: '0 0 8px 0' })}>
                  Nenhuma transação encontrada
                </h3>
                <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' })}>
                  Comece criando uma nova transação.
                </p>
                <button
                  onClick={() => router.push('/transactions/new')}
                  style={lufgaStyle({
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    background: '#000000',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  })}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#000000';
                  }}
                >
                  <svg style={{ height: '20px', width: '20px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Nova Transação
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      border: '1px solid #f3f4f6',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.borderColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.borderColor = '#f3f4f6';
                    }}
                    onClick={() => router.push(`/transactions/${transaction.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: transaction.type === 'income' ? '#f0fdf4' : '#fef2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px'
                      }}>
                        <svg style={{ 
                          height: '20px', 
                          width: '20px', 
                          color: transaction.type === 'income' ? '#22c55e' : '#ef4444' 
                        }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {transaction.type === 'income' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          )}
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={lufgaStyle({ fontSize: '14px', fontWeight: '500', color: '#000000', margin: '0 0 4px 0' })}>
                          {transaction.title}
                        </p>
                        <p style={lufgaStyle({ fontSize: '12px', color: '#6b7280', margin: 0 })}>
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(transaction.status) + '20',
                        color: getStatusColor(transaction.status)
                      }}>
                        {getStatusLabel(transaction.status)}
                      </span>
                      <p style={lufgaStyle({ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: transaction.type === 'income' ? '#16a34a' : '#dc2626',
                        margin: 0
                      })}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
