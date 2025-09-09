'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Helper para aplicar a fonte Lufga
const lufgaStyle = (styles: React.CSSProperties) => ({
  ...styles,
  fontFamily: "'Lufga', system-ui, -apple-system, sans-serif"
});

export default function NewTransactionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    status: 'processing' as 'processing' | 'approved' | 'rejected',
    transactionDate: new Date().toISOString().split('T')[0],
    document: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setFormData(prev => ({
      ...prev,
      amount: formattedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!formData.amount || formData.amount === 'R$ 0,00') {
      setError('Valor é obrigatório');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      console.log('Token encontrado:', token ? `${token.substring(0, 20)}...` : 'null');
      
      if (!token) {
        setError('Token de acesso não encontrado');
        return;
      }

      // Converter valor para número
      console.log('Valor original:', formData.amount);
      
      // Remove R$ e espaços, depois remove pontos de milhares e substitui vírgula por ponto
      const cleanAmount = formData.amount
        .replace(/R\$\s*/g, '') // Remove "R$ " e qualquer espaço após
        .replace(/\./g, '') // Remove todos os pontos (separadores de milhares)
        .replace(',', '.'); // Substitui vírgula por ponto (separador decimal)
      
      console.log('Valor limpo:', cleanAmount);
      
      const amountValue = parseFloat(cleanAmount);
      console.log('Valor convertido:', amountValue);
      
      if (isNaN(amountValue) || amountValue <= 0) {
        setError('Valor inválido');
        return;
      }

      // Criar FormData para envio
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('amount', amountValue.toString());
      formDataToSend.append('type', formData.type);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('transactionDate', formData.transactionDate);
      
      if (formData.document) {
        formDataToSend.append('document', formData.document);
      }

      const response = await fetch('http://localhost:3001/api/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar transação');
      }

      // Redirecionar para lista de transações
      router.push('/transactions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar transação');
    } finally {
      setIsLoading(false);
    }
  };

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
              Nova Transação
            </h1>
            <p style={lufgaStyle({ 
              fontSize: '14px', 
              color: '#6b7280',
              margin: 0
            })}>
              Preencha os dados para criar uma nova transação
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '32px',
            border: '1px solid #e5e7eb',
            maxWidth: '600px'
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Título da Transação */}
              <div>
                <label htmlFor="title" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Título da Transação *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  })}
                  placeholder="Ex: Salário mensal"
                  value={formData.title}
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

              {/* Descrição */}
              <div>
                <label htmlFor="description" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'vertical'
                  })}
                  placeholder="Descrição da transação (opcional)"
                  value={formData.description}
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

              {/* Valor da Transação */}
              <div>
                <label htmlFor="amount" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Valor da Transação *
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="text"
                  required
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  })}
                  placeholder="R$ 0,00"
                  value={formData.amount}
                  onChange={handleValueChange}
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

              {/* Tipo da Transação */}
              <div>
                <label htmlFor="type" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Tipo da Transação *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000000';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>


              {/* Data da Transação */}
              <div>
                <label htmlFor="transactionDate" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Data da Transação *
                </label>
                <input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  required
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  })}
                  value={formData.transactionDate}
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


              {/* Status */}
              <div>
                <label htmlFor="status" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={lufgaStyle({
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  })}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#000000';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 0, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="processing">Em processamento</option>
                  <option value="approved">Aprovada</option>
                  <option value="rejected">Negada</option>
                </select>
              </div>

              {/* Documento */}
              <div>
                <label htmlFor="document" style={lufgaStyle({ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151', 
                  marginBottom: '8px'
                })}>
                  Documento (PDF ou Imagem)
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '24px',
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
                onClick={() => document.getElementById('document')?.click()}
                >
                  <input
                    id="document"
                    name="document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <svg style={{ height: '48px', width: '48px', color: '#9ca3af', margin: '0 auto 16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p style={lufgaStyle({ fontSize: '16px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' })}>
                    {formData.document ? formData.document.name : 'Clique para selecionar um arquivo'}
                  </p>
                  <p style={lufgaStyle({ fontSize: '14px', color: '#6b7280', margin: 0 })}>
                    PDF, JPG, PNG até 5MB
                  </p>
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

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => router.push('/transactions')}
                  style={lufgaStyle({
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={lufgaStyle({
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    background: isLoading ? '#6b7280' : '#000000',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  })}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLElement).style.background = '#333333';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      (e.target as HTMLElement).style.background = '#000000';
                    }
                  }}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
