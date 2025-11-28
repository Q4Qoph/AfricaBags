'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;                // new
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;                  // new – lets components clear the error
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error whenever a new auth operation starts
  const clearError = () => setError(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    clearError();
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const userData: any = await api.auth.getMe();
        setUser(userData.user as User);
      }
    } catch (err: any) {
      localStorage.removeItem('auth_token');
      // You can customize the message based on the error if you want
      setError(err?.response?.data?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    clearError();
    setLoading(true);
    try {
      const response: any = await api.auth.login({ email, password });
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
      throw err; // re-throw so forms can also catch it if they want
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string, name: string) {
    clearError();
    setLoading(true);
    try {
      const response: any = await api.auth.register({ email, password, name });
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Try again.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    clearError();
    try {
      await api.auth.logout();
    } catch (err) {
      // logout usually shouldn't fail critically
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}