'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiFetch, ApiError } from './api';

const TOKEN_KEY = 'ces.admin.token';

export type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN';
};

type LoginResponse = {
  token: string;
  expiresAt: string;
  user: AdminUser;
};

type AuthState = {
  token: string | null;
  user: AdminUser | null;
  /** True until the initial localStorage probe + /me verification finishes. */
  ready: boolean;
};

type AuthContextValue = AuthState & {
  login(email: string, password: string): Promise<void>;
  logout(): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    ready: false,
  });

  // Restore from localStorage on mount, then verify with /me. If the token has
  // been revoked or expired, clear it silently so the gate redirects to login.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setState({ token: null, user: null, ready: true });
      return;
    }
    apiFetch<AdminUser>('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((user) => setState({ token: stored, user, ready: true }))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setState({ token: null, user: null, ready: true });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, res.token);
    setState({ token: res.token, user: res.user, ready: true });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ token: null, user: null, ready: true });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  }
  return ctx;
}

/**
 * Wrapper around {@link apiFetch} that auto-attaches the JWT and surfaces
 * a 401 / 403 by signing the user out — saves every page from re-implementing
 * the same boilerplate.
 */
export async function adminFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
  onUnauthorized?: () => void,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  try {
    return await apiFetch<T>(path, { ...init, headers });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      onUnauthorized?.();
    }
    throw e;
  }
}
