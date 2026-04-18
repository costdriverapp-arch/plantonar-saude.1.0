import { supabase } from "@/lib/supabase";
import { validateReviewInput } from "@/lib/reviews/review-validation-engine";
import { canCreateReview } from "@/lib/reviews/review-permission-engine";

type ReviewRole = "client" | "professional";

type CreateReviewParams = {
  vagaId: string;
  plantaoId?: string | null;
  contratacaoId?: string | null;

  avaliadorAuthUserId: string;
  avaliadoAuthUserId: string;

  avaliadorRole: ReviewRole;
  avaliadoRole: ReviewRole;

  nota: number;

  comentarioOpcaoId: string;
  comentarioPredefinido: string;
  comentario?: string | null;

  cargo?: string | null;
  plantaoEncerrado: boolean;
};

type CheckReviewExistenteParams = {
  plantaoId?: string | null;
  contratacaoId?: string | null;
  avaliadorAuthUserId: string;
  avaliadoAuthUserId: string;
};

function normalizarTexto(value?: string | null) {
  const texto = (value || "").trim();
  return texto.length > 0 ? texto : null;
}

export async function criarReview(params: CreateReviewParams) {
  const {
    vagaId,
    plantaoId,
    contratacaoId,
    avaliadorAuthUserId,
    avaliadoAuthUserId,
    avaliadorRole,
    avaliadoRole,
    nota,
    comentarioOpcaoId,
    comentarioPredefinido,
    comentario,
    cargo,
    plantaoEncerrado,
  } = params;

  const validation = validateReviewInput({
    nota,
    comentario,
    comentario_opcao_id: comentarioOpcaoId,
    comentario_predefinido: comentarioPredefinido,
    avaliador_auth_user_id: avaliadorAuthUserId,
    avaliado_auth_user_id: avaliadoAuthUserId,
    avaliador_role: avaliadorRole,
    avaliado_role: avaliadoRole,
  });

  if (!validation.valid || !validation.data) {
    return {
      success: false,
      error: validation.error || "Dados da avaliação inválidos.",
    };
  }

  const jaExisteReview = await checkReviewExistente({
    plantaoId,
    contratacaoId,
    avaliadorAuthUserId,
    avaliadoAuthUserId,
  });

  const permission = canCreateReview({
    plantaoEncerrado,
    jaExisteReview,
    avaliadorAuthUserId,
    avaliadoAuthUserId,
    avaliadorRole,
    avaliadoRole,
  });

  if (!permission.allowed) {
    return {
      success: false,
      error: permission.error,
    };
  }

  const payload = {
    vaga_id: vagaId,
    plantao_id: plantaoId ?? null,
    contratacao_id: contratacaoId ?? null,
    avaliador_auth_user_id: avaliadorAuthUserId,
    avaliado_auth_user_id: avaliadoAuthUserId,
    avaliador_role: avaliadorRole,
    avaliado_role: avaliadoRole,
    nota: validation.data.nota,
    comentario_opcao_id: validation.data.comentario_opcao_id,
    comentario_predefinido: validation.data.comentario_predefinido,
    comentario: validation.data.comentario,
    cargo: normalizarTexto(cargo),
  };

  const { data, error } = await supabase
    .from("reviews")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: "Erro ao salvar avaliação.",
      data: null,
    };
  }

  return {
    success: true,
    data,
  };
}

export async function getReviewsRecebidas(authUserId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("avaliado_auth_user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar avaliações.",
      data: [],
    };
  }

  return {
    success: true,
    data: data ?? [],
  };
}

export async function getReviewsRecebidasComComentario(authUserId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("avaliado_auth_user_id", authUserId)
    .not("comentario_predefinido", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar avaliações.",
      data: [],
    };
  }

  return {
    success: true,
    data: data ?? [],
  };
}

export async function getReviewsFeitas(authUserId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("avaliador_auth_user_id", authUserId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar avaliações.",
      data: [],
    };
  }

  return {
    success: true,
    data: data ?? [],
  };
}

export async function checkReviewExistente({
  plantaoId,
  contratacaoId,
  avaliadorAuthUserId,
  avaliadoAuthUserId,
}: CheckReviewExistenteParams) {
  let query = supabase
    .from("reviews")
    .select("id")
    .eq("avaliador_auth_user_id", avaliadorAuthUserId)
    .eq("avaliado_auth_user_id", avaliadoAuthUserId);

  if (plantaoId) {
    query = query.eq("plantao_id", plantaoId);
  } else if (contratacaoId) {
    query = query.eq("contratacao_id", contratacaoId);
  } else {
    return false;
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return false;
  }

  return !!data;
}