import { supabase } from "@/lib/supabase";
import { getClientCreditsSummary } from "@/lib/services/client-credits-service";

export async function loadClientCreditsSummary(authUserId: string) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .single();

  if (profileError) {
    throw profileError;
  }

  if (!profile?.id) {
    throw new Error("Perfil do cliente não encontrado.");
  }

  return getClientCreditsSummary(profile.id);
}