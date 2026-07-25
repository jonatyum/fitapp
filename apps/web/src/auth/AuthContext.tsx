import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiAuthConfig,
  apiGoogleLogin,
  apiLogin,
  apiMe,
  apiRegister,
  getToken,
  setToken,
} from "../api";
import type { User } from "../types";
import "./google"; // window.google typings

interface AuthValue {
  user: User | null;
  /** true until the stored token has been checked against the API */
  ready: boolean;
  /** non-null when the server has Google sign-in configured */
  googleClientId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  useEffect(() => {
    apiAuthConfig()
      .then((c) => setGoogleClientId(c.googleClientId))
      .catch(() => setGoogleClientId(null));
  }, []);

  // Resume the session from the stored token, if it is still valid.
  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }
    apiMe()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await apiRegister(email, password, name);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await apiGoogleLogin(credential);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    // Stop Google from silently re-signing the user in on the next visit.
    window.google?.accounts.id.disableAutoSelect();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, googleClientId, login, register, loginWithGoogle, logout }),
    [user, ready, googleClientId, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
