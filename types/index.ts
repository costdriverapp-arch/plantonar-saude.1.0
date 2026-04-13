export type UserRole = "professional" | "client" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  cpf: string;
  rg: string;
  birthDate: string;
  avatar?: string;
  createdAt: string;
  isVerified: boolean;
  isBlocked: boolean;
  status: "active" | "pending" | "blocked" | "review" | "notified";
}

export interface ProfessionalProfile extends User {
  profession: string;
  coren?: string;
  specialties: string[];
  city: string;
  neighborhood: string;
  state: string;
  cep: string;
  documentsVerified: boolean;
  professionalVerified: boolean;
  credits: number;
}

export interface ClientProfile extends User {
  city: string;
  neighborhood: string;
  state: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
}

export interface JobVacancy {
  id: string;
  clientId: string;
  title: string;
  profession: string;
  city: string;
  state: string;
  neighborhood: string;
  cep: string;
  workHours: string;
  shiftDate: string;
  description: string;
  tasks: string;
  value: number;
  status: "open" | "filled" | "cancelled";
  createdAt: string;
  applicationsCount: number;
}

export interface Application {
  id: string;
  vacancyId: string;
  professionalId: string;
  counterProposal?: number;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "vacancy_filled";
  appliedAt: string;
  vacancy?: JobVacancy;
  professional?: ProfessionalProfile;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "accepted" | "rejected" | "cancelled" | "vacancy_filled" | "new_application";
  read: boolean;
  createdAt: string;
  vacancyId?: string;
}
