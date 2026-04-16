export type ProfessionalCreditPackage = {
  code: string;
  name: string;
  credits: number;
  bonusCredits?: number;
  price: number;
  description?: string;
};

export type ProfessionalCreditPurchaseInput = {
  profileId: string;
  packageData: ProfessionalCreditPackage;
  paymentMethod?: string | null;
  gateway?: string | null;
  gatewayReference?: string | null;
};

export type ProfessionalCreditPurchasePayload = {
  profile_id: string;
  credits_amount: number;
  bonus_credits: number;
  price_original: number;
  price_paid: number;
  payment_status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  payment_method: string | null;
  gateway: string | null;
  gateway_reference: string | null;
  package_code: string;
  package_name: string;
  description: string | null;
  paid_at: string | null;
};

export function buildProfessionalCreditPurchasePayload(
  input: ProfessionalCreditPurchaseInput
): ProfessionalCreditPurchasePayload {
  const credits = Number(input.packageData.credits || 0);
  const bonusCredits = Number(input.packageData.bonusCredits || 0);
  const price = Number(input.packageData.price || 0);

  if (!input.profileId) {
    throw new Error("Profile ID é obrigatório.");
  }

  if (!input.packageData.code?.trim()) {
    throw new Error("Código do pacote é obrigatório.");
  }

  if (!input.packageData.name?.trim()) {
    throw new Error("Nome do pacote é obrigatório.");
  }

  if (credits <= 0) {
    throw new Error("Quantidade de créditos inválida.");
  }

  if (price < 0) {
    throw new Error("Preço do pacote inválido.");
  }

  return {
    profile_id: input.profileId,
    credits_amount: credits,
    bonus_credits: bonusCredits,
    price_original: price,
    price_paid: price,
    payment_status: "paid",
    payment_method: input.paymentMethod ?? null,
    gateway: input.gateway ?? null,
    gateway_reference: input.gatewayReference ?? null,
    package_code: input.packageData.code.trim(),
    package_name: input.packageData.name.trim(),
    description: input.packageData.description?.trim() || null,
    paid_at: new Date().toISOString(),
  };
}

export function getProfessionalCreditsTotal(
  pkg: Pick<ProfessionalCreditPackage, "credits" | "bonusCredits">
) {
  return Number(pkg.credits || 0) + Number(pkg.bonusCredits || 0);
}