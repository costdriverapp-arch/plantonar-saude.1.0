import { supabase } from "../supabase";

export async function createProfessionalSubscription(profileId: string) {
  if (!profileId) {
    throw new Error("Perfil profissional não encontrado.");
  }

  const now = new Date();

  const discountEndsAt = new Date(now);
  discountEndsAt.setFullYear(discountEndsAt.getFullYear() + 1);

  const expiresAt = new Date(now);
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const payload = {
    profile_id: profileId,
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

  console.log("CREATE PROFESSIONAL SUBSCRIPTION PAYLOAD:", payload);

  const { data, error } = await supabase
    .from("professional_subscriptions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.log("CREATE PROFESSIONAL SUBSCRIPTION ERROR:", error);
    throw new Error(error.message || "Não foi possível criar a assinatura.");
  }

  console.log("CREATE PROFESSIONAL SUBSCRIPTION SUCCESS:", data);

  return data;
}

export async function cancelProfessionalSubscription(subscriptionId: string) {
  const { data, error } = await supabase
    .from("professional_subscriptions")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível cancelar a assinatura.");
  }

  return data;
}