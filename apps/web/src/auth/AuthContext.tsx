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
  apiChangePassword,
  apiDeleteAccount,
  apiGoogleLogin,
  apiLogin,
  apiMe,
  apiRegister,
  apiUpdateProfile,
  getToken,
  setToken,
} from "../api";
import type { AuthConfig } from "../api";
import type { User } from "../types";
import "./google"; // window.google typings

interface AuthValue {
  user: User | null;
  /** true once both the stored token and the server config have been resolved */
  ready: boolean;
  /** non-null when the server has Google sign-in configured */
  googleClientId: string | null;
  /** the whole app is behind sign-in and only invited accounts get in */
  closedBeta: boolean;
  /** the email + password form is offered at all */
  passwordAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateName: (name: string) => Promise<void>;
  /** Sin `currentPassword` cuando la cuenta aún no tiene ninguna. */
  changePassword: (input: { currentPassword?: string; newPassword: string }) => Promise<void>;
  deleteAccount: (input: { password?: string; confirm?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  // Un fallo de red se trata como beta cerrada: sin API no hay nada que
  // enseñar, y abrir la app por defecto sería el error caro de los dos.
  const [config, setConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    apiAuthConfig()
      .then(setConfig)
      .catch(() => setConfig({ googleClientId: null, closedBeta: true, passwordAuth: false }));
  }, []);

  // Resume the session from the stored token, if it is still valid.
  useEffect(() => {
    if (!getToken()) {
      setSessionReady(true);
      return;
    }
    apiMe()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setSessionReady(true));
  }, []);

  // Las dos respuestas deciden juntas qué se pinta: dar por lista sólo la
  // sesión enseñaría la pantalla de acceso sin saber aún cómo se entra.
  const ready = sessionReady && config !== null;

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

  const updateName = useCallback(async (name: string) => {
    setUser(await apiUpdateProfile(name));
  }, []);

  // La respuesta trae el usuario ya actualizado, así que `hasPassword` deja de
  // ser false en cuanto la cuenta de Google crea la suya.
  const changePassword = useCallback(
    async (input: { currentPassword?: string; newPassword: string }) => {
      setUser(await apiChangePassword(input));
    },
    [],
  );

  const deleteAccount = useCallback(
    async (input: { password?: string; confirm?: string }) => {
      await apiDeleteAccount(input);
      logout();
    },
    [logout],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      googleClientId: config?.googleClientId ?? null,
      closedBeta: config?.closedBeta ?? true,
      passwordAuth: config?.passwordAuth ?? false,
      login,
      register,
      loginWithGoogle,
      logout,
      updateName,
      changePassword,
      deleteAccount,
    }),
    [
      user,
      ready,
      config,
      login,
      register,
      loginWithGoogle,
      logout,
      updateName,
      changePassword,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
