'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: string | number;
  type: 'income' | 'expense';
  status: 'approved' | 'processing' | 'rejected';
  transactionDate: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId: string;
  documentPath?: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Verificar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          setError('Token de acesso não encontrado');
          setIsLoading(false);
          return;
        }
        
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy: 'createdAt',
          order: 'desc'
        });
        
        const response = await fetch(`http://localhost:3001/api/v1/transactions?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Verificar se é erro 401 (token expirado)
        if (response.status === 401) {
          console.log('Token expirado - fazendo logout automático');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
          return;
        }

        if (!response.ok) {
          throw new Error('Erro ao carregar transações');
        }

        const data = await response.json();
        setTransactions(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      } catch (err) {
        setError('Erro ao carregar transações');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage, itemsPerPage]);

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

  // Funções para paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ height: '400px' }}>
            <LoadingSpinner size="medium" />
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
            margin: '0 0 30px 0',
            fontFamily: "'Lufga', system-ui, sans-serif"
          }}>
            Transações
          </h1>

          {transactions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <p style={{
                fontSize: '16px',
                margin: 0,
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                Nenhuma transação encontrada
              </p>
            </div>
          ) : isMobile ? (
            // Layout Mobile - Cards
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  {/* Header do card */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        lineHeight: '1.3'
                      }}>
                        {transaction.title}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      color: transaction.type === 'income' ? '#16a34a' : '#dc2626',
                      whiteSpace: 'nowrap',
                      marginLeft: '12px'
                    }}>
                      {transaction.type === 'income' ? '+' : '‑'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                  
                  {/* Detalhes do card */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>CPF:</strong> {formatCPF(transaction.cpf)}
                      </div>
                      <div>
                        <strong>Data:</strong> {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: getStatusColor(transaction.status),
                      backgroundColor: getStatusColor(transaction.status) + '20'
                    }}>
                      {getStatusLabel(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Layout Desktop - Tabela
            <div style={{
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              {/* Cabeçalho da tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                gap: '20px',
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '14px',
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                <div>Transação</div>
                <div style={{ textAlign: 'center' }}>Valor</div>
                <div>CPF</div>
                <div style={{ textAlign: 'center' }}>Status</div>
                <div>Data</div>
              </div>
              
              {/* Linhas da tabela */}
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                    gap: '20px',
                    padding: '20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}
                  onClick={() => router.push(`/transactions/${transaction.id}`)}
                  onMouseEnter={(e) => {
                    const row = e.currentTarget;
                    row.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    const row = e.currentTarget;
                    row.style.backgroundColor = '';
                  }}
                >
                  {/* Coluna Transação */}
                  <div style={{ fontSize: '14px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                      {transaction.title}
                    </div>
                  </div>
                  
                  {/* Coluna Valor */}
                  <div style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <span style={{ color: transaction.type === 'income' ? '#16a34a' : '#dc2626' }}>
                      {transaction.type === 'income' ? '+' : '‑'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  
                  {/* Coluna CPF */}
                  <div style={{ fontSize: '14px' }}>
                    {formatCPF(transaction.cpf)}
                  </div>
                  
                  {/* Coluna Status */}
                  <div style={{ fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
                    <span style={{ color: getStatusColor(transaction.status) }}>
                      {getStatusLabel(transaction.status)}
                    </span>
                  </div>
                  
                  {/* Coluna Data */}
                  <div style={{ fontSize: '14px' }}>
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Controles de Paginação */}
          {transactions.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '20px' : '0',
              marginTop: '30px',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              {/* Informações da paginação */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'center',
                gap: isMobile ? '12px' : '20px',
                fontFamily: "'Lufga', system-ui, sans-serif"
              }}>
                <span style={{
                  fontSize: '14px',
                  textAlign: isMobile ? 'center' : 'left',
                  fontFamily: "'Lufga', system-ui, sans-serif"
                }}>
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} transações
                </span>
                
                {/* Seletor de itens por página */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  <label style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: "'Lufga', system-ui, sans-serif"
                  }}>
                    Itens por página:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: "'Lufga', system-ui, sans-serif",
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Navegação de páginas */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-end',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
              }}>
                {/* Botão anterior */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}>
                  {currentPage > 1 && (
                    <button
                      onClick={goToPreviousPage}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Números das páginas */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '4px',
                  borderRadius: '16px',
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                    let pageNumber;
                    const maxVisible = isMobile ? 3 : 5;
                    
                    if (totalPages <= maxVisible) {
                      pageNumber = i + 1;
                    } else if (currentPage <= Math.ceil(maxVisible / 2)) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
                      pageNumber = totalPages - maxVisible + 1 + i;
                    } else {
                      pageNumber = currentPage - Math.floor(maxVisible / 2) + i;
                    }

                    const isActive = currentPage === pageNumber;

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          padding: '8px 14px',
                          border: 'none',
                          borderRadius: '12px',
                          backgroundColor: isActive ? '#000000' : 'transparent',
                          color: isActive ? '#ffffff' : '#64748b',
                          fontWeight: isActive ? '600' : '500',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: "'Lufga', system-ui, sans-serif",
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          minWidth: '40px',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.target as HTMLElement).style.backgroundColor = '#e2e8f0';
                            (e.target as HTMLElement).style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent';
                            (e.target as HTMLElement).style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Botão próximo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}>
                  {currentPage < totalPages && (
                    <button
                      onClick={goToNextPage}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}