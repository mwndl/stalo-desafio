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

export default function EditTransactionPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    status: 'processing' as 'processing' | 'approved' | 'rejected',
    category: '',
    transactionDate: '',
    cpf: '',
    document: null as File | null
  });

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
          throw new Error('Erro ao carregar transação');
        }

        const transactionData = await response.json();
        setTransaction(transactionData);

        // Preencher formulário com dados da transação
        setFormData({
          title: transactionData.title || '',
          description: transactionData.description || '',
          amount: transactionData.amount ? formatCurrencyFromNumber(transactionData.amount) : '',
          type: transactionData.type || 'income',
          status: transactionData.status || 'processing',
          category: transactionData.category || '',
          transactionDate: transactionData.transactionDate ? 
            new Date(transactionData.transactionDate).toISOString().split('T')[0] : '',
          cpf: transactionData.cpf || '',
          document: null
        });

      } catch (err) {
        setError('Erro ao carregar transação');
        console.error('Erro:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadTransaction();
    }
  }, [params.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CPF: 000.000.000-00
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return numbers.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (numbers.length <= 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4').substring(0, 14);
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value);
    setFormData(prev => ({
      ...prev,
      cpf: formattedCPF,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      document: file,
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Converte para centavos e formata como moeda
    const amount = parseInt(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatCurrencyFromNumber = (value: number) => {
    // Formata um número diretamente como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setFormData(prev => ({
      ...prev,
      amount: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      // Converter valor para número
      const cleanAmount = formData.amount
        .replace(/R\$\s*/g, '') // Remove "R$ " e qualquer espaço após
        .replace(/\./g, '') // Remove todos os pontos (separadores de milhares)
        .replace(',', '.'); // Substitui vírgula por ponto (separador decimal)
      
      const amountValue = parseFloat(cleanAmount);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Valor inválido');
      }

      // Preparar dados para envio
      const submitData = {
        title: formData.title,
        description: formData.description,
        amount: amountValue,
        type: formData.type,
        status: formData.status,
        category: formData.category,
        transactionDate: formData.transactionDate,
        cpf: formData.cpf || null,
      };

      const response = await fetch(`http://localhost:3001/api/v1/transactions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar transação');
      }

      // Redirecionar para a página de detalhes da transação
      router.push(`/transactions/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar transação');
    } finally {
      setIsSaving(false);
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

  if (error && !transaction) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '400px',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ color: '#e74c3c', fontSize: '48px' }}>⚠️</div>
            <p style={lufgaStyle({ color: '#e74c3c', fontSize: '18px', textAlign: 'center' })}>
              {error}
            </p>
            <button
              onClick={() => router.push('/transactions')}
              style={lufgaStyle({
                padding: '12px 24px',
                backgroundColor: '#000',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              })}
            >
              Voltar para Transações
            </button>
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
            <button
              onClick={() => router.back()}
              style={lufgaStyle({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '16px',
                marginBottom: '16px'
              })}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </button>
            <h1 style={lufgaStyle({ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#000', 
              margin: 0 
            })}>
              Editar Transação
            </h1>
            <p style={lufgaStyle({ 
              fontSize: '16px', 
              color: '#666', 
              margin: '8px 0 0 0' 
            })}>
              Atualize os dados da transação
            </p>
          </div>

          {/* Formulário */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '32px',
            border: '1px solid #e5e7eb'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Título e Tipo */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="Ex: Salário mensal"
                  />
                </div>

                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Tipo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    })}
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
              </div>

              {/* Valor e Data */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Valor *
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount ? formatCurrency(formData.amount) : ''}
                    onChange={handleAmountChange}
                    required
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Data da Transação *
                  </label>
                  <input
                    type="date"
                    name="transactionDate"
                    value={formData.transactionDate}
                    onChange={handleInputChange}
                    required
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    })}
                  />
                </div>
              </div>

              {/* Categoria e Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Categoria
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      boxSizing: 'border-box'
                    })}
                    placeholder="Ex: Salário, Alimentação"
                  />
                </div>

                <div>
                  <label style={lufgaStyle({ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#374151', 
                    marginBottom: '8px' 
                  })}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={lufgaStyle({
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    })}
                  >
                    <option value="processing">Processando</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejected">Rejeitado</option>
                  </select>
                </div>
              </div>

              {/* CPF */}
              <div>
                <label style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                })}>
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  style={lufgaStyle({
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  })}
                  placeholder="000.000.000-00"
                />
              </div>

              {/* Descrição */}
              <div>
                <label style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                })}>
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  style={lufgaStyle({
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  })}
                  placeholder="Descrição adicional da transação..."
                />
              </div>

              {/* Error message */}
              {error && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#dc2626'
                }}>
                  {error}
                </div>
              )}

              {/* Botões */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={lufgaStyle({
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s'
                  })}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={lufgaStyle({
                    padding: '12px 24px',
                    backgroundColor: isSaving ? '#9ca3af' : '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  })}
                >
                  {isSaving ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        WebkitAnimation: 'spin 1s linear infinite',
                        margin: '0 !important',
                        padding: '0 !important',
                        display: 'block !important'
                      }} />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
