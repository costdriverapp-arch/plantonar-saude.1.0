import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Application, JobVacancy, Notification, ProfessionalProfile } from "@/types";
import { useAuth } from "./AuthContext";
import { getProfessionalCredits } from "@/lib/services/professional-credits-service";
import { supabase } from "@/lib/supabase";
import { loadClientCreditsSummary } from "@/lib/services/client-credits-summary-service";
import { carregarVagasDoCliente } from "@/lib/vagas/vaga-service";

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

const VACANCIES_KEY = "@plantonar:vacancies_v2";
const APPLICATIONS_KEY = "@plantonar:applications_v2";
const NOTIFICATIONS_KEY = "@plantonar:notifications_v2";
const USERS_KEY = "@plantonar:users_v2";

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
    if (!user?.id || user.role !== "client") {
      setClientPlanType("free");
      setClientCandidateLimit(3);
      setClientJobDurationHours(72);
      return;
    }

    try {
      const summary = await loadClientCreditsSummary(user.id);
      setClientPlanType(summary.planType);
      setClientCandidateLimit(summary.candidateLimit);
      setClientJobDurationHours(summary.jobDurationHours);
    } catch {
      setClientPlanType("free");
      setClientCandidateLimit(3);
      setClientJobDurationHours(72);
    }
  }, [user]);

  const loadVacancies = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(VACANCIES_KEY);
      const all: JobVacancy[] = stored ? JSON.parse(stored) : getSampleVacancies();

      if (!stored) {
        await AsyncStorage.setItem(VACANCIES_KEY, JSON.stringify(getSampleVacancies()));
      }

      setVacancies(all.filter((v) => v.status === "open"));
    } catch {}
  }, []);

  // ✅ AQUI ESTÁ A CORREÇÃO REAL
  const loadMyVacancies = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await carregarVagasDoCliente(user.id);

      if (!result.success) {
        console.log("ERRO AO CARREGAR VAGAS:", result.error);
        setMyVacancies([]);
        return;
      }

      setMyVacancies(result.data);
    } catch (err) {
      console.log("LOAD MY VACANCIES ERROR:", err);
      setMyVacancies([]);
    }
  }, [user]);

  const loadMyApplications = useCallback(async () => {
    if (!user) return;

    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];

      setMyApplications(all.filter((a) => a.professionalId === user.id));
    } catch {}
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const all: Notification[] = stored ? JSON.parse(stored) : [];
      setNotifications(all.filter((n) => n.userId === user.id));
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
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
    } else {
      setCredits(0);
      setVacancies([]);
      setMyApplications([]);
      setMyVacancies([]);
      setNotifications([]);
    }
  }, [user]);

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
        applyToVacancy: async () => ({ success: false }),
        cancelApplication: async () => {},
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

function getSampleVacancies(): JobVacancy[] {
  return [];
}