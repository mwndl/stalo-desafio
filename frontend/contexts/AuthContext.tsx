'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginCredentials } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Durante o SSR ou quando não há provider, retornar valores padrão
    return {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async () => {},
      logout: () => {},
    };
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Verificar se há dados salvos no localStorage
    const savedUser = localStorage.getItem('user');
    const savedAccessToken = localStorage.getItem('access_token');
    
    if (savedUser && savedAccessToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('=== AUTH CONTEXT: LOGIN INICIADO ===');
      console.log('Credenciais recebidas:', credentials);
      
      // Fazer chamada real para o backend
      const response = await fetch('http://localhost:3001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer login');
      }

      const authResponse: AuthResponse = await response.json();
      console.log('Resposta do backend:', authResponse);
      console.log('Token completo:', authResponse.access_token);
      console.log('Tamanho do token:', authResponse.access_token.length);

      // Salvar tokens e dados do usuário no localStorage
      localStorage.setItem('access_token', authResponse.access_token);
      localStorage.setItem('refresh_token', authResponse.refresh_token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      
      // Verificar se foi salvo corretamente
      const savedToken = localStorage.getItem('access_token');
      console.log('Token salvo no localStorage:', savedToken);
      console.log('Tamanho do token salvo:', savedToken?.length);

      console.log('Dados salvos no localStorage');

      setUser(authResponse.user);
      console.log('Usuário definido no estado:', authResponse.user);
      
      console.log('=== AUTH CONTEXT: LOGIN CONCLUÍDO ===');
    } catch (error) {
      console.error('=== AUTH CONTEXT: ERRO NO LOGIN ===', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
