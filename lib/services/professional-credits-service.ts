import { supabase } from "../supabase";
import {
  buildProfessionalCreditPurchasePayload,
  ProfessionalCreditPackage,
} from "../credits/professional-credits-engine";

type PurchaseCreditsParams = {
  profileId: string;
  packageData: ProfessionalCreditPackage;
  paymentMethod?: string;
};

export async function purchaseProfessionalCredits({
  profileId,
  packageData,
  paymentMethod,
}: PurchaseCreditsParams) {
  const payload = buildProfessionalCreditPurchasePayload({
    profileId,
    packageData,
    paymentMethod: paymentMethod || null,
  });

  const { data, error } = await supabase
    .from("professional_credit_purchases")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Não foi possível salvar a compra de créditos.");
  }

  return data;
}