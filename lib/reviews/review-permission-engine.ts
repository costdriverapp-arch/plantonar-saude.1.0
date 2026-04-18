export type ReviewRole = "client" | "professional";

export type ReviewPermissionInput = {
  plantaoEncerrado: boolean;
  jaExisteReview: boolean;
  avaliadorAuthUserId: string;
  avaliadoAuthUserId: string;
  avaliadorRole: ReviewRole;
  avaliadoRole: ReviewRole;
};

export type ReviewPermissionResult = {
  allowed: boolean;
  error?: string;
};

export function canCreateReview(
  input: ReviewPermissionInput
): ReviewPermissionResult {
  if (!input) {
    return {
      allowed: false,
      error: "Dados da avaliação inválidos.",
    };
  }

  const {
    plantaoEncerrado,
    jaExisteReview,
    avaliadorAuthUserId,
    avaliadoAuthUserId,
    avaliadorRole,
    avaliadoRole,
  } = input;

  if (!avaliadorAuthUserId || !avaliadoAuthUserId) {
    return {
      allowed: false,
      error: "Usuários inválidos.",
    };
  }

  if (avaliadorAuthUserId === avaliadoAuthUserId) {
    return {
      allowed: false,
      error: "Você não pode se autoavaliar.",
    };
  }

  if (!avaliadorRole || !avaliadoRole) {
    return {
      allowed: false,
      error: "Tipo de usuário inválido.",
    };
  }

  if (
    !["client", "professional"].includes(avaliadorRole) ||
    !["client", "professional"].includes(avaliadoRole)
  ) {
    return {
      allowed: false,
      error: "Tipo de usuário inválido.",
    };
  }

  if (avaliadorRole === avaliadoRole) {
    return {
      allowed: false,
      error: "Avaliação inválida entre mesmos perfis.",
    };
  }

  if (!plantaoEncerrado) {
    return {
      allowed: false,
      error: "A avaliação só pode ser feita após o encerramento do plantão.",
    };
  }

  if (jaExisteReview) {
    return {
      allowed: false,
      error: "Esta avaliação já foi enviada.",
    };
  }

  return {
    allowed: true,
  };
}