'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: string | number;
  type: 'income' | 'expense';
  status: 'approved' | 'processing' | 'rejected';
  cpf: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  userId: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('Token de acesso não encontrado');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:3001/api/v1/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar transações');
        }

        const data = await response.json();
        setTransactions(data.data || []);
      } catch (err) {
        setError('Erro ao carregar transações');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '5px solid #e5e7eb',
              borderTop: '5px solid #000000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{
              color: '#6b7280',
              fontSize: '16px',
              margin: 0,
              fontFamily: "'Lufga', system-ui, sans-serif"
            }}>
              Carregando transações...
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <p style={{
              color: '#dc2626',
              fontSize: '16px',
              margin: 0,
              fontFamily: "'Lufga', system-ui, sans-serif"
            }}>
              {error}
            </p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#000000',
            margin: '0 0 30px 0',
            fontFamily: "'Lufga', system-ui, sans-serif"
          }}>
            Transações
          </h1>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <p style={{
                fontSize: '16px',
                margin: 0,
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                Nenhuma transação encontrada
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '20px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '14px',
                color: '#374151',
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                <div>Data/Hora</div>
                <div>Valor</div>
                <div>Ações</div>
              </div>
              
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '20px',
                    padding: '20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'white';
                  }}
                >
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}>
                    {formatDate(transaction.createdAt)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: transaction.type === 'income' ? '#16a34a' : '#dc2626',
                    fontWeight: '500',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#374151',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}>
                    {transaction.cpf}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: getStatusColor(transaction.status),
                    fontWeight: '500',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}>
                    {getStatusLabel(transaction.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}