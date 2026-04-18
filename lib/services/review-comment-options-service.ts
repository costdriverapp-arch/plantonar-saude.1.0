import { supabase } from "@/lib/supabase";

export type ReviewRole = "client" | "professional";

export type ReviewCommentOption = {
  id: string;
  role_avaliador: ReviewRole;
  role_avaliado: ReviewRole;
  nota: number;
  label: string;
  ativo: boolean;
  ordem: number;
  created_at?: string;
  updated_at?: string;
};

type GetReviewCommentOptionsParams = {
  roleAvaliador: ReviewRole;
  roleAvaliado: ReviewRole;
  nota: number;
};

function isValidRole(value: string): value is ReviewRole {
  return value === "client" || value === "professional";
}

function isValidNota(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export async function getReviewCommentOptions({
  roleAvaliador,
  roleAvaliado,
  nota,
}: GetReviewCommentOptionsParams) {
  if (!isValidRole(roleAvaliador) || !isValidRole(roleAvaliado)) {
    return {
      success: false,
      error: "Tipo de usuário inválido.",
      data: [] as ReviewCommentOption[],
    };
  }

  if (roleAvaliador === roleAvaliado) {
    return {
      success: false,
      error: "Combinação de perfis inválida.",
      data: [] as ReviewCommentOption[],
    };
  }

  if (!isValidNota(nota)) {
    return {
      success: false,
      error: "Nota inválida.",
      data: [] as ReviewCommentOption[],
    };
  }

  const { data, error } = await supabase
    .from("review_comment_options")
    .select("*")
    .eq("role_avaliador", roleAvaliador)
    .eq("role_avaliado", roleAvaliado)
    .eq("nota", nota)
    .eq("ativo", true)
    .order("ordem", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar comentários da avaliação.",
      data: [] as ReviewCommentOption[],
    };
  }

  return {
    success: true,
    data: (data ?? []) as ReviewCommentOption[],
  };
}

export async function getReviewCommentOptionById(id: string) {
  const optionId = (id || "").trim();

  if (!optionId) {
    return {
      success: false,
      error: "Opção de comentário inválida.",
      data: null as ReviewCommentOption | null,
    };
  }

  const { data, error } = await supabase
    .from("review_comment_options")
    .select("*")
    .eq("id", optionId)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    return {
      success: false,
      error: "Erro ao buscar opção de comentário.",
      data: null as ReviewCommentOption | null,
    };
  }

  return {
    success: true,
    data: (data as ReviewCommentOption | null) ?? null,
  };
}