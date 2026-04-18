type ReviewRole = "client" | "professional";

type ReviewInput = {
  nota: number;
  comentario?: string | null;
  comentario_opcao_id?: string | null;
  comentario_predefinido?: string | null;
  avaliador_auth_user_id: string;
  avaliado_auth_user_id: string;
  avaliador_role: ReviewRole;
  avaliado_role: ReviewRole;
};

type ReviewValidationResult = {
  valid: boolean;
  error?: string;
  data?: {
    nota: number;
    comentario: string | null;
    comentario_opcao_id: string;
    comentario_predefinido: string;
  };
};

function sanitizeComentario(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();

  if (trimmed.length === 0) return null;

  return trimmed.slice(0, 300);
}

function sanitizeTextoObrigatorio(value?: string | null): string {
  return (value || "").trim().slice(0, 300);
}

function isValidNota(nota: number): boolean {
  if (typeof nota !== "number") return false;
  if (Number.isNaN(nota)) return false;
  if (!Number.isInteger(nota)) return false;

  return nota >= 1 && nota <= 5;
}

export function validateReviewInput(
  input: ReviewInput
): ReviewValidationResult {
  if (!input) {
    return {
      valid: false,
      error: "Dados da avaliação inválidos.",
    };
  }

  const {
    nota,
    comentario,
    comentario_opcao_id,
    comentario_predefinido,
    avaliador_auth_user_id,
    avaliado_auth_user_id,
    avaliador_role,
    avaliado_role,
  } = input;

  if (!avaliador_auth_user_id || !avaliado_auth_user_id) {
    return {
      valid: false,
      error: "Usuários inválidos.",
    };
  }

  if (avaliador_auth_user_id === avaliado_auth_user_id) {
    return {
      valid: false,
      error: "Você não pode se autoavaliar.",
    };
  }

  if (!avaliador_role || !avaliado_role) {
    return {
      valid: false,
      error: "Tipo de usuário inválido.",
    };
  }

  if (
    !["client", "professional"].includes(avaliador_role) ||
    !["client", "professional"].includes(avaliado_role)
  ) {
    return {
      valid: false,
      error: "Tipo de usuário inválido.",
    };
  }

  if (avaliador_role === avaliado_role) {
    return {
      valid: false,
      error: "Avaliação inválida entre mesmos perfis.",
    };
  }

  if (!isValidNota(nota)) {
    return {
      valid: false,
      error: "A nota deve ser entre 1 e 5.",
    };
  }

  const comentarioOpcaoIdLimpo = (comentario_opcao_id || "").trim();
  const comentarioPredefinidoLimpo = sanitizeTextoObrigatorio(
    comentario_predefinido
  );
  const comentarioLivreLimpo = sanitizeComentario(comentario);

  if (!comentarioOpcaoIdLimpo) {
    return {
      valid: false,
      error: "Selecione um comentário da lista.",
    };
  }

  if (!comentarioPredefinidoLimpo) {
    return {
      valid: false,
      error: "Comentário pré-definido inválido.",
    };
  }

  if (nota < 5 && comentarioLivreLimpo) {
    return {
      valid: false,
      error: "Comentário livre só pode ser enviado em avaliações de 5 estrelas.",
    };
  }

  return {
    valid: true,
    data: {
      nota,
      comentario: nota === 5 ? comentarioLivreLimpo : null,
      comentario_opcao_id: comentarioOpcaoIdLimpo,
      comentario_predefinido: comentarioPredefinidoLimpo,
    },
  };
}