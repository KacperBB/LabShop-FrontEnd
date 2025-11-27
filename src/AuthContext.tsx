import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthState {
  token: string | null;
  email: string | null;
  roles: string[];
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, email: string, roles: string[]) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      try {
        const data = JSON.parse(stored) as AuthState;
        setToken(data.token);
        setEmail(data.email);
        setRoles(data.roles);
      } catch {
        // ignore
      }
    }
  }, []);

  const persist = (token: string | null, email: string | null, roles: string[]) => {
    if (token) {
      localStorage.setItem("auth", JSON.stringify({ token, email, roles }));
    } else {
      localStorage.removeItem("auth");
    }
  };

  const login = (t: string, e: string, r: string[]) => {
    setToken(t);
    setEmail(e);
    setRoles(r);
    persist(t, e, r);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setRoles([]);
    persist(null, null, []);
  };

  const isAuthenticated = !!token;
  const isAdmin = roles.includes("Admin") || roles.includes("Moderator");

  const value: AuthContextValue = {
    token,
    email,
    roles,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
