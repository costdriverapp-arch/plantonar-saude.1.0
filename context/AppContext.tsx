import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Application, JobVacancy, Notification, ProfessionalProfile } from "@/types";
import { useAuth } from "./AuthContext";

interface AppContextData {
  vacancies: JobVacancy[];
  myApplications: Application[];
  notifications: Notification[];
  unreadCount: number;
  credits: number;
  loadVacancies: () => Promise<void>;
  loadMyApplications: () => Promise<void>;
  loadNotifications: () => Promise<void>;
  applyToVacancy: (vacancyId: string, counterProposal?: number) => Promise<{ success: boolean; error?: string }>;
  cancelApplication: (applicationId: string) => Promise<void>;
  createVacancy: (data: Omit<JobVacancy, "id" | "clientId" | "createdAt" | "status" | "applicationsCount">) => Promise<{ success: boolean; error?: string }>;
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
const CREDITS_KEY = "@plantonar:credits_v2";
const USERS_KEY = "@plantonar:users_v2";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [myVacancies, setMyVacancies] = useState<JobVacancy[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [credits, setCredits] = useState(1);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (user) {
      loadCredits();
      loadVacancies();
      loadNotifications();
      if (user.role === "professional") loadMyApplications();
      if (user.role === "client") loadMyVacancies();
    }
  }, [user]);

  const loadCredits = useCallback(async () => {
    if (!user) return;
    try {
      const key = `${CREDITS_KEY}:${user.id}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        setCredits(parseInt(stored, 10));
      } else {
        await AsyncStorage.setItem(key, "1");
        setCredits(1);
      }
    } catch {}
  }, [user]);

  const loadVacancies = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(VACANCIES_KEY);
      const all: JobVacancy[] = stored ? JSON.parse(stored) : getSampleVacancies();
      if (!stored) await AsyncStorage.setItem(VACANCIES_KEY, JSON.stringify(getSampleVacancies()));
      setVacancies(all.filter((v) => v.status === "open"));
    } catch {}
  }, []);

  const loadMyVacancies = useCallback(async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(VACANCIES_KEY);
      const all: JobVacancy[] = stored ? JSON.parse(stored) : [];
      setMyVacancies(all.filter((v) => v.clientId === user.id));
    } catch {}
  }, [user]);

  const loadMyApplications = useCallback(async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];
      const mine = all.filter((a) => a.professionalId === user.id);

      const vStored = await AsyncStorage.getItem(VACANCIES_KEY);
      const vAll: JobVacancy[] = vStored ? JSON.parse(vStored) : [];

      const enriched = mine.map((a) => ({
        ...a,
        vacancy: vAll.find((v) => v.id === a.vacancyId),
      }));
      setMyApplications(enriched);
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

  const applyToVacancy = useCallback(async (vacancyId: string, counterProposal?: number) => {
    if (!user) return { success: false, error: "Não autenticado." };
    try {
      const creditKey = `${CREDITS_KEY}:${user.id}`;
      const creditStored = await AsyncStorage.getItem(creditKey);
      const currentCredits = creditStored !== null ? parseInt(creditStored, 10) : 1;
      if (currentCredits < 1) {
        return { success: false, error: "Você não possui créditos suficientes." };
      }

      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];

      const alreadyApplied = all.find(
        (a) => a.vacancyId === vacancyId && a.professionalId === user.id && a.status !== "cancelled"
      );
      if (alreadyApplied) {
        return { success: false, error: "Você já se candidatou a esta vaga." };
      }

      const newApplication: Application = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        vacancyId,
        professionalId: user.id,
        counterProposal,
        status: "pending",
        appliedAt: new Date().toISOString(),
      };
      all.push(newApplication);
      await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));

      const newCredit = currentCredits - 1;
      await AsyncStorage.setItem(creditKey, newCredit.toString());
      setCredits(newCredit);

      const vStored = await AsyncStorage.getItem(VACANCIES_KEY);
      const vAll: JobVacancy[] = vStored ? JSON.parse(vStored) : [];
      const vIdx = vAll.findIndex((v) => v.id === vacancyId);
      if (vIdx !== -1) {
        vAll[vIdx].applicationsCount = (vAll[vIdx].applicationsCount || 0) + 1;
        await AsyncStorage.setItem(VACANCIES_KEY, JSON.stringify(vAll));
      }

      await loadMyApplications();
      return { success: true };
    } catch {
      return { success: false, error: "Erro ao candidatar. Tente novamente." };
    }
  }, [user, loadMyApplications]);

  const cancelApplication = useCallback(async (applicationId: string) => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((a) => a.id === applicationId);
      if (idx !== -1) {
        if (all[idx].status === "pending") {
          const creditKey = `${CREDITS_KEY}:${user?.id}`;
          const creditStored = await AsyncStorage.getItem(creditKey);
          const currentCredits = creditStored !== null ? parseInt(creditStored, 10) : 0;
          await AsyncStorage.setItem(creditKey, (currentCredits + 1).toString());
          setCredits(currentCredits + 1);
        }
        all[idx].status = "cancelled";
        await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));
      }
      await loadMyApplications();
    } catch {}
  }, [user, loadMyApplications]);

  const createVacancy = useCallback(async (data: Omit<JobVacancy, "id" | "clientId" | "createdAt" | "status" | "applicationsCount">) => {
    if (!user) return { success: false, error: "Não autenticado." };
    try {
      const stored = await AsyncStorage.getItem(VACANCIES_KEY);
      const all: JobVacancy[] = stored ? JSON.parse(stored) : [];
      const newVacancy: JobVacancy = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        clientId: user.id,
        createdAt: new Date().toISOString(),
        status: "open",
        applicationsCount: 0,
      };
      all.push(newVacancy);
      await AsyncStorage.setItem(VACANCIES_KEY, JSON.stringify(all));
      await loadVacancies();
      await loadMyVacancies();
      return { success: true };
    } catch {
      return { success: false, error: "Erro ao criar vaga. Tente novamente." };
    }
  }, [user, loadVacancies, loadMyVacancies]);

  const markNotificationsRead = useCallback(async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const all: Notification[] = stored ? JSON.parse(stored) : [];
      const updated = all.map((n) => (n.userId === user.id ? { ...n, read: true } : n));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      setNotifications(updated.filter((n) => n.userId === user.id));
    } catch {}
  }, [user]);

  const getVacancyApplications = useCallback(async (vacancyId: string): Promise<Application[]> => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];
      const uStored = await AsyncStorage.getItem(USERS_KEY);
      const users: ProfessionalProfile[] = uStored ? JSON.parse(uStored) : [];
      return all
        .filter((a) => a.vacancyId === vacancyId && a.status !== "cancelled")
        .map((a) => ({
          ...a,
          professional: users.find((u) => u.id === a.professionalId) as ProfessionalProfile,
        }));
    } catch {
      return [];
    }
  }, []);

  const acceptApplication = useCallback(async (applicationId: string) => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((a) => a.id === applicationId);
      if (idx === -1) return;

      const vacancyId = all[idx].vacancyId;
      const acceptedProfessionalId = all[idx].professionalId;

      all[idx].status = "accepted";

      const rejected = all.filter(
        (a) => a.vacancyId === vacancyId && a.id !== applicationId && a.status === "pending"
      );
      rejected.forEach((a) => { a.status = "vacancy_filled"; });

      await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));

      const vStored = await AsyncStorage.getItem(VACANCIES_KEY);
      const vAll: JobVacancy[] = vStored ? JSON.parse(vStored) : [];
      const vIdx = vAll.findIndex((v) => v.id === vacancyId);
      if (vIdx !== -1) {
        vAll[vIdx].status = "filled";
        await AsyncStorage.setItem(VACANCIES_KEY, JSON.stringify(vAll));
      }

      const nStored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const nAll: Notification[] = nStored ? JSON.parse(nStored) : [];
      nAll.push({
        id: Date.now().toString(),
        userId: acceptedProfessionalId,
        title: "Candidatura Aceita!",
        message: "Sua candidatura foi aceita. Entre em contato com o cliente.",
        type: "accepted",
        read: false,
        createdAt: new Date().toISOString(),
        vacancyId,
      });
      for (const r of rejected) {
        nAll.push({
          id: Date.now().toString() + r.professionalId,
          userId: r.professionalId,
          title: "Vaga Preenchida",
          message: "Infelizmente a vaga já foi preenchida com outro profissional.",
          type: "vacancy_filled",
          read: false,
          createdAt: new Date().toISOString(),
          vacancyId,
        });
      }
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nAll));
      await loadMyVacancies();
    } catch {}
  }, [loadMyVacancies]);

  const rejectApplication = useCallback(async (applicationId: string) => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_KEY);
      const all: Application[] = stored ? JSON.parse(stored) : [];
      const idx = all.findIndex((a) => a.id === applicationId);
      if (idx === -1) return;
      const vacancyId = all[idx].vacancyId;
      const professionalId = all[idx].professionalId;
      all[idx].status = "rejected";
      await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(all));

      const nStored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const nAll: Notification[] = nStored ? JSON.parse(nStored) : [];
      nAll.push({
        id: Date.now().toString() + professionalId,
        userId: professionalId,
        title: "Candidatura Recusada",
        message: "Sua candidatura foi recusada pelo cliente.",
        type: "rejected",
        read: false,
        createdAt: new Date().toISOString(),
        vacancyId,
      });
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nAll));
    } catch {}
  }, []);

  const getProfessional = useCallback(async (professionalId: string): Promise<ProfessionalProfile | null> => {
    try {
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const users: ProfessionalProfile[] = stored ? JSON.parse(stored) : [];
      return users.find((u) => u.id === professionalId) || null;
    } catch {
      return null;
    }
  }, []);

  const addCredits = useCallback(async (amount: number) => {
    if (!user) return;
    try {
      const key = `${CREDITS_KEY}:${user.id}`;
      const newAmount = credits + amount;
      await AsyncStorage.setItem(key, newAmount.toString());
      setCredits(newAmount);
    } catch {}
  }, [user, credits]);

  return (
    <AppContext.Provider
      value={{
        vacancies, myApplications, notifications, unreadCount, credits,
        loadVacancies, loadMyApplications, loadNotifications,
        applyToVacancy, cancelApplication, createVacancy,
        markNotificationsRead, getVacancyApplications,
        acceptApplication, rejectApplication, myVacancies,
        loadMyVacancies, getProfessional, addCredits,
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
  return [
    {
      id: "sample1",
      clientId: "client1",
      title: "ENFERMEIRO(A)",
      profession: "Enfermagem",
      city: "Belo Horizonte",
      state: "MG",
      neighborhood: "Santo Agostinho",
      cep: "30190-110",
      workHours: "19:00 às 07:00",
      shiftDate: "15/04/2026",
      description: "Profissional de enfermagem para cuidados de idoso de 72 anos com patologia simples e cuidados especializados.",
      tasks: "Cuidar do idoso, troca de fraldas, preparo de alimentos leves e lanches do paciente, cuidados com a higiene do paciente e do leito.",
      value: 200,
      status: "open",
      createdAt: new Date().toISOString(),
      applicationsCount: 3,
    },
    {
      id: "sample2",
      clientId: "client1",
      title: "CUIDADOR(A) DE IDOSO",
      profession: "Cuidador",
      city: "Belo Horizonte",
      state: "MG",
      neighborhood: "Funcionários",
      cep: "30140-110",
      workHours: "07:00 às 19:00",
      shiftDate: "16/04/2026",
      description: "Cuidador para idoso de 80 anos com mobilidade reduzida, necessitando de auxílio para atividades diárias.",
      tasks: "Auxiliar na higiene pessoal, preparar refeições, acompanhar em atividades físicas leves, monitorar medicamentos.",
      value: 180,
      status: "open",
      createdAt: new Date().toISOString(),
      applicationsCount: 1,
    },
  ];
}
