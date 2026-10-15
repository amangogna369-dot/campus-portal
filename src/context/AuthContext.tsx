import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: any) => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('campus_news_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('campus_news_token'));
  const [isLoading, setIsLoading] = useState<boolean>(() => !localStorage.getItem('campus_news_user'));

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res && res.data) {
          setUser(res.data);
          localStorage.setItem('campus_news_user', JSON.stringify(res.data));
        }
      } catch (err) {
        console.warn('Session verification notice:', err);
        // Retain existing session if user is present in localStorage
        const savedUser = localStorage.getItem('campus_news_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {}
        } else {
          localStorage.removeItem('campus_news_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      const userData = res.data.user;
      const tokenData = res.data.token;
      localStorage.setItem('campus_news_token', tokenData);
      localStorage.setItem('campus_news_user', JSON.stringify(userData));
      setToken(tokenData);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(userData);
      const userObj = res.data.user;
      const tokenData = res.data.token;
      localStorage.setItem('campus_news_token', tokenData);
      localStorage.setItem('campus_news_user', JSON.stringify(userObj));
      setToken(tokenData);
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campus_news_token');
    localStorage.removeItem('campus_news_user');
    setToken(null);
    setUser(null);
  };

  const updateUserProfile = async (profileData: any) => {
    const res = await api.updateProfile(profileData);
    setUser(res.data);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
