import { supabase } from "@/lib/supabase";

// ======================================
// BUSCAR STATS DO USUÁRIO
// ======================================
export async function getReviewStats(authUserId: string) {
  const { data, error } = await supabase
    .from("review_stats")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar estatísticas.",
      data: null,
    };
  }

  return {
    success: true,
    data: data ?? {
      total_avaliacoes: 0,
      nota_media: 0,
      total_plantoes: 0,
    },
  };
}

// ======================================
// RECALCULAR STATS DO USUÁRIO
// ======================================
export async function recalcularReviewStats({
  authUserId,
  role,
  totalPlantoes,
}: {
  authUserId: string;
  role: "client" | "professional";
  totalPlantoes: number;
}) {
  const { error } = await supabase.rpc("recalculate_review_stats", {
    p_auth_user_id: authUserId,
    p_role: role,
    p_total_plantoes: totalPlantoes,
  });

  if (error) {
    return {
      success: false,
      error: "Erro ao recalcular estatísticas.",
    };
  }

  return {
    success: true,
  };
}