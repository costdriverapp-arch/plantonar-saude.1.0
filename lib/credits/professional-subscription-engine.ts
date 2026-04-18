export type CreateProfessionalSubscriptionInput = {
  profileId: string;
};

export type ProfessionalSubscriptionPayload = {
  profile_id: string;
  plan_code: string;
  plan_name: string;
  status: "active";
  billing_cycle: "monthly";
  price_original: number;
  price_paid: number;
  discount_percent: number;
  discount_starts_at: string;
  discount_ends_at: string;
  started_at: string;
  expires_at: string;
  gateway: string;
  gateway_reference: string | null;
  notes: string;
};

export function buildProfessionalSubscriptionPayload(
  input: CreateProfessionalSubscriptionInput
): ProfessionalSubscriptionPayload {
  if (!input.profileId) {
    throw new Error("Profile ID é obrigatório.");
  }

  const now = new Date();

  const discountEndsAt = new Date(now);
  discountEndsAt.setFullYear(discountEndsAt.getFullYear() + 1);

  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  return {
    profile_id: input.profileId,
    plan_code: "unlimited_monthly_launch",
    plan_name: "Plano ilimitado",
    status: "active",
    billing_cycle: "monthly",
    price_original: 359.9,
    price_paid: 179.9,
    discount_percent: 50,
    discount_starts_at: now.toISOString(),
    discount_ends_at: discountEndsAt.toISOString(),
    started_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    gateway: "internal",
    gateway_reference: null,
    notes: "Condição especial de lançamento com 50% OFF por 12 meses.",
  };
}