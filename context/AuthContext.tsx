'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/authApi';
import { AUTH_COOKIE_NAME } from '@/lib/constants';
import { deleteCookie, getCookie, setCookie } from '@/lib/cookies';
import { ApiError, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // true while we check for an existing session on first load
  isLoggingIn: boolean;
  loginError: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = 'pad_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  // On mount, rehydrate the lightweight user profile from localStorage if a
  // token cookie is still present. The token itself never lives in
  // localStorage - only in the cookie the middleware reads.
  useEffect(() => {
    const token = getCookie(AUTH_COOKIE_NAME);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted storage - treat as logged out rather than throwing.
      }
    }
    setIsInitializing(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      setIsLoggingIn(true);
      setLoginError(null);
      try {
        const res = await authApi.login(username, password);
        const { accessToken, ...profile } = res;
        setCookie(AUTH_COOKIE_NAME, accessToken, 1);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
        setUser(profile);
        router.push('/products');
      } catch (err) {
        const apiError = err as ApiError;
        setLoginError(
          apiError.status === 400 || apiError.status === 401
            ? 'Invalid username or password.'
            : apiError.message
        );
        throw err;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    deleteCookie(AUTH_COOKIE_NAME);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      isLoggingIn,
      loginError,
      login,
      logout,
    }),
    [user, isInitializing, isLoggingIn, loginError, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
