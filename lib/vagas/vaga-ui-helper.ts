import type { VagaValidationResult } from "@/lib/vagas/vaga-validation-engine";

function buildModalFromValidation(
  result: VagaValidationResult
): {
  title: string;
  message: string;
} {
  if (!result.errors.length) {
    return {
      title: "Erro",
      message: "Verifique os dados informados.",
    };
  }

  return {
    title: "Atenção",
    message: result.errors[0].message,
  };
}

function buildConflictModal(message?: string | null) {
  return {
    title: "Conflito de horário",
    message:
      message ||
      "Já existe uma vaga para este paciente, endereço e data. Ajuste o horário.",
  };
}

function buildGenericErrorModal(message?: string | null) {
  return {
    title: "Erro",
    message: message || "Ocorreu um erro inesperado. Tente novamente.",
  };
}

function buildSuccessCreateModal() {
  return {
    title: "Vaga criada",
    message: "Sua vaga foi criada com sucesso.",
  };
}

function buildPublishModal() {
  return {
    title: "Publicar vaga",
    message: "Deseja publicar esta vaga agora?",
  };
}

function buildExpiredModal() {
  return {
    title: "Vaga expirada",
    message: "Esta vaga expirou e não está mais disponível.",
  };
}

function buildBlockedPastDateModal() {
  return {
    title: "Data inválida",
    message: "Não é permitido criar vaga em data passada.",
  };
}

function buildEnderecoNaoEncontradoModal() {
  return {
    title: "Endereço não encontrado",
    message:
      "Não encontramos um endereço cadastrado no seu perfil. Complete seu cadastro primeiro.",
  };
}

function buildPagamentoNecessarioModal(valor?: number) {
  return {
    title: "Pagamento necessário",
    message: valor
      ? `Para publicar esta vaga é necessário o pagamento de R$ ${valor.toFixed(
          2
        )}.`
      : "Para publicar esta vaga é necessário realizar o pagamento.",
  };
}

function buildAssinanteInfoModal() {
  return {
    title: "Assinante Premium",
    message: "Você pode publicar vagas sem custo adicional.",
  };
}

const vagaUiHelper = {
  buildModalFromValidation,
  buildConflictModal,
  buildGenericErrorModal,
  buildSuccessCreateModal,
  buildPublishModal,
  buildExpiredModal,
  buildBlockedPastDateModal,
  buildEnderecoNaoEncontradoModal,
  buildPagamentoNecessarioModal,
  buildAssinanteInfoModal,
};

export {
  buildModalFromValidation,
  buildConflictModal,
  buildGenericErrorModal,
  buildSuccessCreateModal,
  buildPublishModal,
  buildExpiredModal,
  buildBlockedPastDateModal,
  buildEnderecoNaoEncontradoModal,
  buildPagamentoNecessarioModal,
  buildAssinanteInfoModal,
};

export default vagaUiHelper;