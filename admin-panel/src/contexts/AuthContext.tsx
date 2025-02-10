import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { Admin } from "../types/admin";

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (token) {
        const response = await api.get("/admin/profile");
        setAdmin(response.data);
      }
    } catch (error) {
      localStorage.removeItem("admin_token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/admin/login", { email, password });
    localStorage.setItem("admin_token", response.data.token);
    setAdmin(response.data.admin);
  };

  const logout = async () => {
    localStorage.removeItem("admin_token");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
