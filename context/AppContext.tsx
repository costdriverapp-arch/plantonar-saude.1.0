import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Application, JobVacancy, Notification, ProfessionalProfile } from "@/types";
import { useAuth } from "./AuthContext";
import { getProfessionalCredits } from "@/lib/services/professional-credits-service";
import { supabase } from "@/lib/supabase";
import { loadClientCreditsSummary } from "@/lib/services/client-credits-summary-service";
import {
  carregarVagasDoCliente,
  carregarVagasPublicasParaProfissional,
} from "@/lib/vagas/vaga-service";

interface AppContextData {
  vacancies: JobVacancy[];
  myApplications: Application[];
  notifications: Notification[];
  unreadCount: number;
  credits: number;
  loadCredits: () => Promise<void>;

  clientPlanType: "free" | "monthly" | "yearly";
  clientCandidateLimit: number;
  clientJobDurationHours: number;
  loadClientData: () => Promise<void>;

  loadVacancies: () => Promise<void>;
  loadMyApplications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  applyToVacancy: (
    vacancyId: string,
    counterProposal?: number
  ) => Promise<{ success: boolean; error?: string }>;
  cancelApplication: (applicationId: string) => Promise<void>;
  createVacancy: (
    data: Omit<JobVacancy, "id" | "clientId" | "createdAt" | "status" | "applicationsCount">
  ) => Promise<{ success: boolean; error?: string }>;
  markNotificationsRead: () => Promise<void>;
  getVacancyApplications: (vacancyId: string) => Promise<Application[]>;
  acceptApplication: (applicationId: string) => Promise<void>;
  rejectApplication: (applicationId: string) => Promise<void>;
  myVacancies: JobVacancy[];
  loadMyVacancies: () => Promise<void>;
  getProfessional: (professionalId: string) => Promise<ProfessionalProfile | null>;
  addCredits: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myVacancies, setMyVacancies] = useState<JobVacancy[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [credits, setCredits] = useState(0);

  const [clientPlanType, setClientPlanType] = useState<"free" | "monthly" | "yearly">("free");
  const [clientCandidateLimit, setClientCandidateLimit] = useState(3);
  const [clientJobDurationHours, setClientJobDurationHours] = useState(72);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(0);
      return;
    }

    try {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!data?.id) {
        setCredits(0);
        return;
      }

      const totalPurchasedCredits = await getProfessionalCredits(data.id);
      setCredits(totalPurchasedCredits);
    } catch {
      setCredits(0);
    }
  }, [user]);

  const loadClientData = useCallback(async () => {
    if (!user?.id || user.role !== "client") return;

    try {
      const summary = await loadClientCreditsSummary(user.id);
      setClientPlanType(summary.planType);
      setClientCandidateLimit(summary.candidateLimit);
      setClientJobDurationHours(summary.jobDurationHours);
    } catch {}
  }, [user]);

  const loadVacancies = useCallback(async () => {
    try {
      const result = await carregarVagasPublicasParaProfissional();

      if (!result.success) {
        setVacancies([]);
        return;
      }

      setVacancies(result.data);
    } catch {
      setVacancies([]);
    }
  }, []);

  const loadMyVacancies = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await carregarVagasDoCliente(user.id);
      console.log("LOAD MY VACANCIES RESULT:", result);

      if (!result.success) {
        setMyVacancies([]);
        return;
      }

      console.log("LOAD MY VACANCIES DATA:", result.data);
      setMyVacancies(result.data);
    } catch (error) {
      console.log("LOAD MY VACANCIES ERROR:", error);
      setMyVacancies([]);
    }
  }, [user]);

  const loadMyApplications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("vaga_candidaturas")
        .select(
          `
            *,
            vaga:vagas (*)
          `
        )
        .eq("profissional_auth_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMyApplications([]);
        return;
      }

      setMyApplications((data || []) as Application[]);
    } catch {
      setMyApplications([]);
    }
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const stored = await AsyncStorage.getItem("@plantonar:notifications_v2");
      const all: Notification[] = stored ? JSON.parse(stored) : [];
      setNotifications(all.filter((n) => n.userId === user.id));
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadVacancies();
    loadNotifications();

    if (user.role === "professional") {
      loadCredits();
      loadMyApplications();
    }

    if (user.role === "client") {
      loadMyVacancies();
      loadClientData();
    }
  }, [user, loadVacancies, loadNotifications, loadCredits, loadMyApplications, loadMyVacancies, loadClientData]);

  return (
    <AppContext.Provider
      value={{
        vacancies,
        myApplications,
        notifications,
        unreadCount,
        credits,
        loadCredits,
        clientPlanType,
        clientCandidateLimit,
        clientJobDurationHours,
        loadClientData,
        loadVacancies,
        loadMyApplications,
        loadNotifications,

        applyToVacancy: async (vacancyId: string, counterProposal?: number) => {
          try {
            if (!user?.id) {
              return { success: false, error: "Usuário não autenticado" };
            }

            if ((credits ?? 0) < 1) {
              return { success: false, error: "Sem créditos" };
            }

            const { data: vaga, error: vagaError } = await supabase
              .from("vagas")
              .select("*")
              .eq("id", vacancyId)
              .single();

            if (vagaError || !vaga) {
              return { success: false, error: "Vaga não encontrada." };
            }

            if (!vaga.aceita_candidaturas) {
              return { success: false, error: "Vaga não aceita mais candidaturas." };
            }

            if (vaga.vaga_preenchida) {
              return { success: false, error: "Vaga já foi preenchida." };
            }

            if (vaga.auth_user_id === user.id) {
              return {
                success: false,
                error: "Você não pode se candidatar à própria vaga.",
              };
            }

            const { data: existente, error: existenteError } = await supabase
  .from("vaga_candidaturas")
  .select("id, status")
  .eq("vaga_id", vacancyId)
  .eq("profissional_auth_user_id", user.id)
  .maybeSingle();

            if (existenteError) {
              return {
                success: false,
                error: existenteError.message || "Erro ao verificar candidatura existente.",
              };
            }

           if (existente) {
  if (existente.status === "cancelled") {
    const { error: updateError } = await supabase
      .from("vaga_candidaturas")
      .update({
        status: "pending",
        valor_contraproposta: counterProposal ?? null,
      })
      .eq("id", existente.id)
      .eq("profissional_auth_user_id", user.id);

    if (updateError) {
      return {
        success: false,
        error: "Erro ao reativar candidatura.",
      };
    }

    setCredits((prev) => (prev ?? 0) - 1);
    await loadMyApplications();

    return { success: true };
  }

  return { success: false, error: "Você já se candidatou a esta vaga." };
}

            const { error: insertError } = await supabase
              .from("vaga_candidaturas")
              .insert({
                vaga_id: vacancyId,
                profissional_auth_user_id: user.id,
                mensagem: "Tenho interesse nessa vaga",
                valor_contraproposta: counterProposal ?? null,
              });

            if (insertError) {
              return {
                success: false,
                error: insertError.message || "Erro ao criar candidatura.",
              };
            }

            setCredits((prev) => (prev ?? 0) - 1);
            await loadMyApplications();

            return { success: true };
          } catch (err: any) {
            return {
              success: false,
              error: err?.message || "Erro ao se candidatar.",
            };
          }
        },

        cancelApplication: async (applicationId: string) => {
  try {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("vaga_candidaturas")
      .select("*")
      .eq("id", applicationId)
      .eq("profissional_auth_user_id", user.id)
      .single();

    if (error || !data) return;

    if (data.status !== "pending") {
      return;
    }

    const { error: updateError } = await supabase
      .from("vaga_candidaturas")
      .update({ status: "cancelled" })
      .eq("id", applicationId)
      .eq("profissional_auth_user_id", user.id);

    if (updateError) return;

    // devolve crédito
    setCredits((prev) => (prev ?? 0) + 1);

    // atualiza lista
    await loadMyApplications();
  } catch {}
},
        createVacancy: async () => ({ success: false }),
        markNotificationsRead: async () => {},
        getVacancyApplications: async () => [],
        acceptApplication: async () => {},
        rejectApplication: async () => {},
        myVacancies,
        loadMyVacancies,
        getProfessional: async () => null,
        addCredits: async () => {},
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}