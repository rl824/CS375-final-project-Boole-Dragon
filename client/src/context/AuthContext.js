import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.NODE_ENV === 'production'
  ? ''
  : (process.env.REACT_APP_API_URL || 'http://localhost:3000');

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (username, email, password) => {
    const response = await axios.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', {
      email,
      password,
    });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const verifyEmail = async (verificationToken) => {
    const response = await axios.post('/api/auth/verify-email', {
      token: verificationToken,
    });
    return response.data;
  };

  const forgotPassword = async (email) => {
    const response = await axios.post('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  };

  const resetPassword = async (resetToken, newPassword) => {
    const response = await axios.post('/api/auth/reset-password', {
      token: resetToken,
      newPassword,
    });
    return response.data;
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
