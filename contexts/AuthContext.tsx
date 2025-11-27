'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData: any = await api.auth.getMe();
        setUser(userData.user as User);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response: any = await api.auth.login({ email, password });
    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
  }

  async function register(email: string, password: string, name: string) {
    const response: any = await api.auth.register({ email, password, name });
    localStorage.setItem('auth_token', response.token);
    setUser(response.user);
  }

  async function logout() {
    try {
      await api.auth.logout();
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
