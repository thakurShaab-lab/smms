'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { loginRequest, logoutRequest, refreshRequest } from '@/services/authApi';
import { setAccessToken } from '@/lib/tokenStore';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const result = await refreshRequest();
        if (cancelled) return;
        setUser(result.user);
        connectSocket(result.accessToken);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginRequest({ email, password });
    setAccessToken(result.accessToken);
    setUser(result.user);
    connectSocket(result.accessToken);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
      disconnectSocket();
    }
  }, []);

  const hasPermission = useCallback(
    (...permissions) => {
      if (!user) return false;
      return permissions.some((permission) => user.permissions?.includes(permission));
    },
    [user]
  );

  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      hasPermission,
      hasRole
    }),
    [user, isBootstrapping, login, logout, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
