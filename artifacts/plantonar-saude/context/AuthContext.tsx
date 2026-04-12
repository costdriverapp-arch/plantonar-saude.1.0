import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signInAsAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const USERS_KEY = "@plantonar:users_v2";
const CURRENT_USER_KEY = "@plantonar:current_user_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  async function loadStoredUser() {
    try {
      const stored = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!found) {
        return { success: false, error: "E-mail ou senha incorretos." };
      }
      if (found.isBlocked) {
        return { success: false, error: "Sua conta está bloqueada. Entre em contato com o suporte." };
      }
      const { password: _pwd, ...userWithoutPwd } = found;
      setUser(userWithoutPwd as User);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPwd));
      return { success: true, role: found.role };
    } catch {
      return { success: false, error: "Erro ao fazer login. Tente novamente." };
    }
  }, []);

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
      const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (exists) {
        return { success: false, error: "Este e-mail já está cadastrado." };
      }
      const newUser: User & { password: string } = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: "",
        lastName: "",
        phone: "",
        whatsapp: "",
        cpf: "",
        rg: "",
        birthDate: "",
        avatar: undefined,
        createdAt: new Date().toISOString(),
        isVerified: false,
        isBlocked: false,
        status: "pending",
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      const { password: _pwd, ...userWithoutPwd } = newUser;
      setUser(userWithoutPwd as User);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPwd));
      return { success: true };
    } catch {
      return { success: false, error: "Erro ao criar conta. Tente novamente." };
    }
  }, []);

  const signInAsAdmin = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
      let admin = users.find((u) => u.role === "admin");
      if (!admin) {
        admin = {
          id: "admin_default",
          email: "admin@plantonar.com",
          password: "admin123",
          role: "admin",
          firstName: "Administrador",
          lastName: "",
          phone: "",
          whatsapp: "",
          cpf: "",
          rg: "",
          birthDate: "",
          avatar: undefined,
          createdAt: new Date().toISOString(),
          isVerified: true,
          isBlocked: false,
          status: "active",
        };
        users.push(admin);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const { password: _pwd, ...adminWithoutPwd } = admin;
      setUser(adminWithoutPwd as User);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminWithoutPwd));
    } catch {}
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: (User & { password: string })[] = stored ? JSON.parse(stored) : [];
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      const updated = { ...user, ...data };
      setUser(updated);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    } catch {}
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signUp, signInAsAdmin, signOut, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
