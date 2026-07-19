import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await AuthService.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (e) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = useCallback((userData, token) => {
    if (token) localStorage.setItem('token', token);
    setUser(userData);
    setError(null);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    AuthService.logout().catch((err) => {
      console.error('Logout error in background:', err);
    });
  }, []);

  const register = useCallback((userData, token) => {
    if (token) localStorage.setItem('token', token);
    setUser(userData);
    setError(null);
  }, []);

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    setIsLoading,
    setError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
