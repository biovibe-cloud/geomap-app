"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
  sessionExpired: boolean;
}

export interface AuthContextValue extends AuthState {
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => void;
  expireSession: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const INITIAL: AuthState = { token: null, userId: null, email: null, sessionExpired: false };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        throw new Error("No se pudo conectar con el servidor.");
      }
      if (res.status === 401) throw new Error("Email o contraseña incorrectos.");
      if (!res.ok) throw new Error("No se pudo iniciar sesión. Inténtalo de nuevo.");
      const data = await res.json();
      if (!data.access_token) throw new Error("Respuesta inesperada del servidor.");
      setState({
        token: data.access_token,
        userId: data.user_id ?? null,
        email: data.email ?? email,
        sessionExpired: false,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // register NO guarda token — el backend devuelve {message, user_id} sin access_token
  // El usuario debe confirmar su email y luego hacer login
  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        throw new Error("No se pudo conectar con el servidor.");
      }
      if (res.status === 409) throw new Error("Ya existe una cuenta con ese email.");
      if (!res.ok) throw new Error("No se pudo crear la cuenta. Inténtalo de nuevo.");
      return { needsConfirmation: true };
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => { setState(INITIAL); setError(null); }, []);
  const expireSession = useCallback(() => {
    setState((s) => ({ ...INITIAL, sessionExpired: s.token ? true : s.sessionExpired }));
  }, []);
  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, loading, error, login, register, logout, expireSession, clearError }),
    [state, loading, error, login, register, logout, expireSession, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() debe usarse dentro de <AuthProvider>.");
  return ctx;
}