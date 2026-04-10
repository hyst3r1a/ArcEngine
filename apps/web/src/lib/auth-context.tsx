import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { UserSummary } from "@arc/shared";
import { api, setToken, getToken } from "./api.js";

type AuthState = {
  user: UserSummary | null;
  loading: boolean;
  login: (inviteCode: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (inviteCode: string) => {
    const data = await api.login(inviteCode);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
