"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types/auth";
import { loginApi, registerApi, getProfileApi, updateProfileApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: { full_name?: string; bio?: string; profile_image?: string | null }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on initial client render
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("auth_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Silently verify or refresh latest user profile
          try {
            const freshUser = await getProfileApi(storedToken);
            setUser(freshUser);
            localStorage.setItem("auth_user", JSON.stringify(freshUser));
          } catch {
            // If token expired, clear session
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Failed to restore auth session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    const res = await registerApi({ full_name: fullName, email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("auth_token", res.token);
      localStorage.setItem("auth_user", JSON.stringify(res.user));
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUserProfile = async (data: {
    full_name?: string;
    bio?: string;
    profile_image?: string | null;
  }) => {
    if (!token) throw new Error("Not authenticated");
    const updated = await updateProfileApi(token, data);
    setUser(updated);
    localStorage.setItem("auth_user", JSON.stringify(updated));
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const freshUser = await getProfileApi(token);
      setUser(freshUser);
      localStorage.setItem("auth_user", JSON.stringify(freshUser));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
