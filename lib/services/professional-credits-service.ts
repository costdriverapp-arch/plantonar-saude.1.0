import { supabase } from "../supabase";

export async function getProfessionalCredits(profileId: string): Promise<number> {
  if (!profileId) return 0;

  const { data, error } = await supabase
    .from("professional_credit_purchases")
    .select("credits_amount, bonus_credits")
    .eq("profile_id", profileId)
    .eq("payment_status", "paid");

  if (error) {
    console.log("GET CREDITS ERROR:", error);
    return 0;
  }

  if (!data || data.length === 0) return 0;

  const total = data.reduce((acc, item) => {
    return acc + (item.credits_amount || 0) + (item.bonus_credits || 0);
  }, 0);

  return total;
}