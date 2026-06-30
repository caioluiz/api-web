import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import * as authService from "../services/authService";
import type { AuthUser, LoginResponse, ValidarTokenResponse } from "../types";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isChecking: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  validateCurrentToken: () => Promise<ValidarTokenResponse | null>;
}

const TOKEN_KEY = "sisext_token";
const USER_KEY = "sisext_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function userFromLogin(response: LoginResponse): AuthUser {
  return {
    usuarioId: response.usuarioId,
    nome: response.nome,
    email: response.email,
    perfil: response.perfil,
    status: response.status
  };
}

function readStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isChecking, setIsChecking] = useState(Boolean(token));

  const signOut = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const persistSession = useCallback((jwt: string, authUser: AuthUser) => {
    sessionStorage.setItem(TOKEN_KEY, jwt);
    sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setToken(jwt);
    setUser(authUser);
  }, []);

  const signIn = useCallback(
    async (email: string, senha: string) => {
      const response = await authService.login({ email, senha });
      persistSession(response.accessToken, userFromLogin(response));
    },
    [persistSession]
  );

  const validateCurrentToken = useCallback(async () => {
    const currentToken = sessionStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      signOut();
      return null;
    }

    const response = await authService.validarToken(currentToken);

    if (!response.valido || !response.usuarioId || !response.perfil || !response.status) {
      signOut();
      return response;
    }

    persistSession(currentToken, {
      usuarioId: response.usuarioId,
      nome: response.nome || "",
      email: response.email || "",
      perfil: response.perfil,
      status: response.status
    });

    return response;
  }, [persistSession, signOut]);

  useEffect(() => {
    if (!token) {
      setIsChecking(false);
      return;
    }

    let active = true;

    validateCurrentToken()
      .catch(() => {
        if (active) {
          signOut();
        }
      })
      .finally(() => {
        if (active) {
          setIsChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [signOut, token, validateCurrentToken]);

  const value = useMemo(
    () => ({
      token,
      user,
      isChecking,
      signIn,
      signOut,
      validateCurrentToken
    }),
    [isChecking, signIn, signOut, token, user, validateCurrentToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
