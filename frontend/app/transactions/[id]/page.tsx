'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Helper para aplicar a fonte Lufga
const lufgaStyle = (styles: React.CSSProperties) => ({
  ...styles,
  fontFamily: "'Lufga', system-ui, -apple-system, sans-serif"
});

// Interface para transação
interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: string | number;
  type: 'income' | 'expense';
  status: 'processing' | 'approved' | 'rejected';
  category?: string;
  transactionDate: string;
  cpf?: string;
  documentPath?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export default function TransactionViewPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Carregar transação da API
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('Token de acesso não encontrado');
          setIsLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3001/api/v1/transactions/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Transação não encontrada');
          } else {
            throw new Error('Erro ao carregar transação');
          }
          return;
        }

        const data = await response.json();
        setTransaction(data);
      } catch (err) {
        setError('Erro ao carregar transação');
        console.error('Erro ao carregar transação:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransaction();
  }, [params.id]);

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

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'N/A';
    
    // Remove tudo que não é dígito
    const numbers = cpf.replace(/\D/g, '');
    
    // Aplica a máscara do CPF: 000.000.000-00
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf; // Retorna o CPF original se não tiver 11 dígitos
  };

  const handleEdit = () => {
    router.push(`/transactions/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Token de acesso não encontrado');
          return;
        }

        const response = await fetch(`http://localhost:3001/api/v1/transactions/${params.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao excluir transação');
        }

        // Redirecionar para lista de transações
        router.push('/transactions');
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação. Tente novamente.');
      }
    }
  };

  const handleDownloadDocument = async () => {
    if (!transaction?.documentPath) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Token de acesso não encontrado');
        return;
      }

      // Fazer requisição para o endpoint de download com o token
      const response = await fetch(
        `http://localhost:3001/api/v1/transactions/documents?path=${encodeURIComponent(transaction.documentPath)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao baixar documento');
      }

      // Obter o blob do arquivo
      const blob = await response.blob();
      
      // Criar URL temporária para o blob
      const url = window.URL.createObjectURL(blob);
      
      // Criar elemento de link temporário para download
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento-${transaction.id}.pdf`; // Nome do arquivo
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL temporária
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento. Tente novamente.');
    }
  };

  const handleUploadDocument = async (file: File) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Token de acesso não encontrado');
        return;
      }

      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch(`http://localhost:3001/api/v1/transactions/${params.id}/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upload do documento');
      }

      // Recarregar a transação para mostrar o documento
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      alert('Erro ao fazer upload do documento. Tente novamente.');
    }
  };

  const handleRemoveDocument = async () => {
    if (!confirm('Tem certeza que deseja remover o documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Token de acesso não encontrado');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/v1/transactions/${params.id}/document`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover documento');
      }

      // Recarregar a transação para remover o documento da tela
      window.location.reload();
    } catch (error) {
      console.error('Erro ao remover documento:', error);
      alert('Erro ao remover documento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ minHeight: '400px' }}>
            <LoadingSpinner size="medium" />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !transaction) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <svg style={{ height: '48px', width: '48px', color: '#dc2626', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 style={lufgaStyle({ fontSize: '18px', fontWeight: '500', color: '#000000', margin: '0 0 8px 0' })}>
                Transação não encontrada
              </h3>
              <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 24px 0' })}>
                A transação solicitada não foi encontrada.
              </p>
              <button
                onClick={() => router.push('/transactions')}
                style={lufgaStyle({
                  padding: '12px 24px',
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
                  (e.target as HTMLElement).style.background = '#333333';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = '#000000';
                }}
              >
                Voltar para Transações
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => router.push('/transactions')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  marginRight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <svg style={{ height: '20px', width: '20px', color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 style={lufgaStyle({ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#000000',
                margin: 0
              })}>
                Transação #{transaction.id}
              </h1>
            </div>
            <p style={lufgaStyle({ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            })}>
              Detalhes da transação
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Informações da Transação */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              padding: '24px',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={lufgaStyle({ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#000000',
                margin: '0 0 20px 0'
              })}>
                Informações da Transação
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Título
                  </p>
                  <p style={lufgaStyle({ fontSize: '16px', fontWeight: '600', color: '#000000', margin: 0 })}>
                    {transaction.title}
                  </p>
                </div>

                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Valor
                  </p>
                  <p style={lufgaStyle({ fontSize: '20px', fontWeight: '600', color: '#000000', margin: 0 })}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>

                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Tipo
                  </p>
                  <p style={lufgaStyle({ fontSize: '16px', color: '#000000', margin: 0 })}>
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </p>
                </div>

                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    CPF
                  </p>
                  <p style={lufgaStyle({ fontSize: '16px', color: '#000000', margin: 0 })}>
                    {formatCPF(transaction.cpf)}
                  </p>
                </div>

                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Status
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: getStatusColor(transaction.status) + '20',
                    color: getStatusColor(transaction.status)
                  }}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>

                <div>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' })}>
                    Data de Criação
                  </p>
                  <p style={lufgaStyle({ fontSize: '16px', color: '#000000', margin: 0 })}>
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Documento */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '24px',
            border: '1px solid #e5e7eb',
            marginTop: '24px'
          }}>
            <h2 style={lufgaStyle({ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#000000',
              margin: '0 0 20px 0'
            })}>
              Documento
            </h2>
            
            {transaction.documentPath ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb'
              }}>
                <svg style={{ height: '24px', width: '24px', color: '#dc2626', marginRight: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <div style={{ flex: 1 }}>
                  <p style={lufgaStyle({ fontSize: '14px', fontWeight: '500', color: '#000000', margin: '0 0 4px 0' })}>
                    Documento da Transação
                  </p>
                  <p style={lufgaStyle({ fontSize: '12px', color: '#6b7280', margin: 0 })}>
                    PDF • 245 KB
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleDownloadDocument}
                    style={lufgaStyle({
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-block'
                    })}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#f3f4f6';
                      (e.target as HTMLElement).style.borderColor = '#9ca3af';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'white';
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                    }}
                  >
                    Baixar
                  </button>
                  <button
                    onClick={handleRemoveDocument}
                    style={lufgaStyle({
                      padding: '8px 12px',
                      border: '1px solid #dc2626',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#dc2626',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-block'
                    })}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = '#fef2f2';
                      (e.target as HTMLElement).style.borderColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.backgroundColor = 'white';
                      (e.target as HTMLElement).style.borderColor = '#dc2626';
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.borderColor = '#000000';
                (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.borderColor = '#d1d5db';
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
              onClick={() => document.getElementById('document-upload')?.click()}
              >
                <input
                  id="document-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadDocument(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <svg style={{ height: '48px', width: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p style={lufgaStyle({ fontSize: '16px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' })}>
                  Clique para fazer upload de um documento
                </p>
                <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: 0 })}>
                  PDF, JPG, PNG até 5MB
                </p>
              </div>
            )}
          </div>

          {/* Ações */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '24px',
            border: '1px solid #e5e7eb',
            marginTop: '24px'
          }}>
            <h2 style={lufgaStyle({ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#000000',
              margin: '0 0 20px 0'
            })}>
              Ações
            </h2>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={handleEdit}
                style={lufgaStyle({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                })}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#f9fafb';
                  (e.target as HTMLElement).style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'white';
                  (e.target as HTMLElement).style.borderColor = '#d1d5db';
                }}
              >
                <svg style={{ height: '16px', width: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              
              <button
                onClick={handleDelete}
                style={lufgaStyle({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                })}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#fef2f2';
                  (e.target as HTMLElement).style.borderColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'white';
                  (e.target as HTMLElement).style.borderColor = '#dc2626';
                }}
              >
                <svg style={{ height: '16px', width: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
