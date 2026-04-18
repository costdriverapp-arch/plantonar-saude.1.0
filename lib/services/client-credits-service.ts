import { supabase } from "@/lib/supabase";
import {
  ClientPlanType,
  getClientCapabilities,
  getClientPlanType,
  isSubscriptionActive,
} from "@/lib/credits/client-credits-engine";

export type ClientSubscriptionRow = {
  id: string;
  profile_id: string;
  plan_type: "monthly" | "yearly";
  status: "pending" | "active" | "canceled" | "expired";
  amount_paid: number;
  candidate_limit: 5 | 10;
  starts_at: string | null;
  ends_at: string | null;
  canceled_at: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientPaymentPurchaseRow = {
  id: string;
  profile_id: string;
  purchase_type: "job_post" | "unlock_professional_data";
  status: "pending" | "paid" | "canceled" | "refunded" | "expired";
  amount_paid: number;
  currency: "BRL";
  job_id: string | null;
  expires_at: string | null;
  candidate_limit: number | null;
  professional_profile_id: string | null;
  paid_at: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type ClientCreditsSummary = {
  planType: ClientPlanType;
  subscriptionActive: boolean;
  candidateLimit: number;
  jobDurationHours: number;
  hasActiveSubscription: boolean;
  activeSubscription: ClientSubscriptionRow | null;
};

export async function getActiveClientSubscription(profileId: string) {
  const { data, error } = await supabase
    .from("client_subscriptions")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ClientSubscriptionRow | null) ?? null;
}

export async function getClientCreditsSummary(
  profileId: string
): Promise<ClientCreditsSummary> {
  const subscription = await getActiveClientSubscription(profileId);

  const subscriptionActive = isSubscriptionActive(subscription);
  const planType = getClientPlanType(subscription);
  const capabilities = getClientCapabilities(planType);

  return {
    planType,
    subscriptionActive,
    candidateLimit: capabilities.candidateLimit,
    jobDurationHours: capabilities.jobDurationHours,
    hasActiveSubscription: subscriptionActive,
    activeSubscription: subscriptionActive ? subscription : null,
  };
}

export async function createClientJobPostPurchase(params: {
  profileId: string;
  jobId: string;
}) {
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const payload = {
    profile_id: params.profileId,
    purchase_type: "job_post" as const,
    status: "paid" as const,
    amount_paid: 19.9,
    currency: "BRL" as const,
    job_id: params.jobId,
    expires_at: expiresAt,
    candidate_limit: 3,
    paid_at: new Date().toISOString(),
    metadata: {},
  };

  const { data, error } = await supabase
    .from("client_payment_purchases")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ClientPaymentPurchaseRow;
}

export async function createClientUnlockPurchase(params: {
  profileId: string;
  jobId: string;
  professionalProfileId: string;
  amountPaid: number;
}) {
  const payload = {
    profile_id: params.profileId,
    purchase_type: "unlock_professional_data" as const,
    status: "paid" as const,
    amount_paid: params.amountPaid,
    currency: "BRL" as const,
    job_id: params.jobId,
    professional_profile_id: params.professionalProfileId,
    paid_at: new Date().toISOString(),
    metadata: {},
  };

  const { data, error } = await supabase
    .from("client_payment_purchases")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ClientPaymentPurchaseRow;
}

export async function createClientSubscription(params: {
  profileId: string;
  planType: "monthly" | "yearly";
}) {
  const startsAt = new Date();
  const endsAt = new Date(startsAt);

  if (params.planType === "monthly") {
    endsAt.setMonth(endsAt.getMonth() + 1);
  } else {
    endsAt.setFullYear(endsAt.getFullYear() + 1);
  }

  const payload = {
    profile_id: params.profileId,
    plan_type: params.planType,
    status: "active" as const,
    amount_paid: params.planType === "monthly" ? 199.9 : 759.9,
    currency: "BRL" as const,
    candidate_limit: params.planType === "monthly" ? 5 : 10,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    activated_at: startsAt.toISOString(),
    metadata: {},
  };

  const { data, error } = await supabase
    .from("client_subscriptions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ClientSubscriptionRow;
}