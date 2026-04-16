import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { User, UserRole } from "@/types";

const supabaseUrl = "https://ggosddngopzcxrcvhtns.supabase.co";
const supabaseAnonKey = "sb_publishable_yBbTgIvyY-xKPikbbBmfsg_h2zwG17z";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; role?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signInAsAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  cpf: string;
}

type ProfileRow = {
  id: string;
  auth_user_id: string;
  role: UserRole;
  email: string;
  cpf: string | null;
  rg: string | null;
  full_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  birth_date: string | null;
  avatar: string | null;
  is_verified: boolean | null;
  is_blocked: boolean | null;
  status: string | null;
  accepted_terms_at?: string | null;
  city?: string | null;
  state?: string | null;
  gender?: string | null;
  social_name?: string | null;
  cep?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  profession?: string | null;
  other_profession?: string | null;
  experience?: string | null;
  criminal_record_status?: string | null;
  education?: any;
  professional_references?: any;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const CURRENT_USER_KEY = "@plantonar:current_user_v2";

function mapProfileToUser(profile: ProfileRow): User {
  return {
    id: profile.auth_user_id,
    email: profile.email,
    role: profile.role,

    firstName: profile.full_name ?? "",
    lastName: "",

    phone: profile.phone ?? "",
    whatsapp: profile.whatsapp ?? "",

    cpf: profile.cpf ?? "",
    rg: profile.rg ?? "",

    birthDate: profile.birth_date ?? "",
    avatar: profile.avatar ?? undefined,

    createdAt: new Date().toISOString(),

    isVerified: !!profile.is_verified,
    isBlocked: !!profile.is_blocked,
    status: (profile.status as any) ?? "pending",
    acceptedTermsAt: profile.accepted_terms_at ?? "",

    city: profile.city ?? "",
    state: profile.state ?? "",

    gender: profile.gender ?? "",
    socialName: profile.social_name ?? "",

    cep: profile.cep ?? "",
    street: profile.street ?? "",
    number: profile.number ?? "",
    complement: profile.complement ?? "",
    neighborhood: profile.neighborhood ?? "",

    profession: profile.profession ?? "",
    otherProfession: profile.other_profession ?? "",
    experience: profile.experience ?? "",
    criminalRecordStatus: profile.criminal_record_status ?? "",

    education: profile.education ?? [],
    references: profile.professional_references ?? [],
  } as any;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (authUserId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    if (error || !data) {
      return null;
    }

    return mapProfileToUser(data as ProfileRow);
  }, []);

  const loadStoredUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        return;
      }

      const profileUser = await loadProfile(session.user.id);

      if (profileUser) {
        setUser(profileUser);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileUser));
      } else {
        setUser(null);
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (error) {
      console.log("LOAD STORED USER ERROR:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile]);

  useEffect(() => {
    loadStoredUser();
  }, [loadStoredUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error || !data?.user) {
          return {
            success: false,
            error: error?.message || "E-mail ou senha incorretos.",
          };
        }

        const profileUser = await loadProfile(data.user.id);

        if (!profileUser) {
          return {
            success: false,
            error: "Perfil não encontrado para este usuário.",
          };
        }

        if ((profileUser as any).isBlocked) {
          return {
            success: false,
            error: "Sua conta está bloqueada. Entre em contato com o suporte.",
          };
        }

        setUser(profileUser);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileUser));

        return { success: true, role: profileUser.role };
      } catch (error: any) {
        console.log("SIGN IN ERROR:", error);
        return {
          success: false,
          error: error?.message || "Erro ao fazer login. Tente novamente.",
        };
      }
    },
    [loadProfile]
  );

  const signUp = useCallback(async (data: SignUpData) => {
    try {
      const cpfDigits = data.cpf.replace(/\D/g, "");

      if (cpfDigits.length !== 11) {
        return { success: false, error: "Informe um CPF válido." };
      }

      const response = await fetch(
        "https://ggosddngopzcxrcvhtns.functions.supabase.co/register-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            email: data.email.trim().toLowerCase(),
            password: data.password,
            cpf: cpfDigits,
            role: data.role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        return {
          success: false,
          error: result?.error || "Erro ao criar conta.",
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || "Erro ao criar conta.",
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log("SIGN OUT ERROR:", error);
    }

    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const nextUser = {
        ...prev,
        ...data,
      };

      AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(nextUser)).catch((error) => {
        console.log("UPDATE USER STORAGE ERROR:", error);
      });

      return nextUser;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setUser(null);
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        return;
      }

      const profileUser = await loadProfile(session.user.id);

      if (profileUser) {
        setUser(profileUser);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profileUser));
      }
    } catch (error) {
      console.log("REFRESH USER ERROR:", error);
    }
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signInAsAdmin: async () => {},
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}