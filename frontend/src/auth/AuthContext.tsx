import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiRequestError, api, type Role, type SessionView } from '../api/client';

interface AuthValue {
  session: SessionView | null;
  loading: boolean;
  error: boolean;
  setSession: (session: SessionView | null) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const unaffiliatedAuth: AuthValue = {
  session: null,
  loading: false,
  error: false,
  setSession: () => undefined,
  refresh: async () => undefined,
  signOut: async () => undefined,
};

const AuthContext = createContext<AuthValue>(unaffiliatedAuth);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSession(await api.request<SessionView>('/api/auth/session'));
    } catch (failure) {
      if (failure instanceof ApiRequestError && failure.detail.status === 401) setSession(null);
      else setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void api.request<SessionView>('/api/auth/session').then(
      (nextSession) => {
        if (active) setSession(nextSession);
      },
      (failure: unknown) => {
        if (!active) return;
        if (failure instanceof ApiRequestError && failure.detail.status === 401) setSession(null);
        else setError(true);
      },
    ).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    await api.request<void>('/api/auth/session', { method: 'DELETE' });
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loading, error, setSession, refresh, signOut }),
    [session, loading, error, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}

export function hasRole(session: SessionView | null, ...roles: Role[]): boolean {
  return session !== null && roles.includes(session.role);
}
