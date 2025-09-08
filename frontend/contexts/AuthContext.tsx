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
      // Simular chamada para API de login
      // Em um projeto real, você faria uma chamada para o backend
      const mockResponse: AuthResponse = {
        access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: "daec2e84-cab3-42af-8f64-22ca04fe7a6b",
          email: credentials.email,
          name: "John Smith",
          tenantId: "e609bb39-2936-48dd-a7b5-e370188a8146"
        }
      };

      // Salvar tokens e dados do usuário no localStorage
      localStorage.setItem('access_token', mockResponse.access_token);
      localStorage.setItem('refresh_token', mockResponse.refresh_token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      setUser(mockResponse.user);
    } catch (error) {
      console.error('Login error:', error);
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
