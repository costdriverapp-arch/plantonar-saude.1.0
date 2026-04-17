import type {
  DuracaoAnuncio,
  SexoPaciente,
  TipoVaga,
  TituloAnuncioBase,
  TurnoVaga,
  VagaFormData,
  VagaHorarioItem,
} from "./vaga-engine";

export type VagaValidationError = {
  field: string;
  message: string;
};

export type VagaValidationResult = {
  isValid: boolean;
  errors: VagaValidationError[];
};

function cleanText(value: string | null | undefined): string {
  return (value || "").trim();
}

function onlyDigits(value: string | null | undefined): string {
  return (value || "").replace(/\D/g, "");
}

function hasValue(value: string | null | undefined): boolean {
  return cleanText(value).length > 0;
}

function parseBrDate(value: string | null | undefined): Date | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function isPastDate(value: string | null | undefined): boolean {
  const date = parseBrDate(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() < today.getTime();
}

function isValidTime(value: string | null | undefined): boolean {
  const cleaned = cleanText(value);
  if (!cleaned) return false;

  const match = cleaned.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

function timeToMinutes(value: string | null | undefined): number | null {
  if (!isValidTime(value)) return null;

  const [hour, minute] = cleanText(value).split(":").map(Number);
  return hour * 60 + minute;
}

function isEndAfterStart(
  start: string | null | undefined,
  end: string | null | undefined
): boolean {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);

  if (startMin === null || endMin === null) return false;

  if (endMin === startMin) return false;

  return true;
}

function isAllowedTipoVaga(value: TipoVaga): boolean {
  return (
    value === "Plantão único" ||
    value === "Plantão cumulado" ||
    value === "Folguista" ||
    value === "Fixo mensal"
  );
}

function isAllowedSexoPaciente(value: SexoPaciente): boolean {
  return (
    value === "Masculino" ||
    value === "Feminino" ||
    value === "Não informar"
  );
}

function isAllowedTurno(value: TurnoVaga): boolean {
  return (
    value === "Diurno" ||
    value === "Noturno" ||
    value === "Plantão 12h" ||
    value === "Plantão 24h"
  );
}

function isAllowedDuracao(value: DuracaoAnuncio): boolean {
  return value === "24 horas" || value === "48 horas" || value === "72 horas";
}

function isAllowedTitulo(value: TituloAnuncioBase): boolean {
  return [
    "Acompanhante hospitalar Diurno",
    "Acompanhante hospitalar Noturno",
    "Acompanhante Residencial Diurno",
    "Acompanhante Residencial Noturno",
    "Cuidadora de idosos",
    "Cuidador de Idosos (masculino)",
    "Auxiliar de Enfermagem",
    "Auxiliar de Enfermagem (masculino)",
    "Técnica em Enfermagem",
    "Técnico em Enfermagem (masculino)",
    "Enfermeira",
    "Enfermeira Diurna",
    "Enfermeira Noturna",
    "Enfermeiro (Masculino)",
    "Fonoaudiólogo(a)",
    "Médico(a)",
    "Psicólogo(a)",
    "Terapeuta Ocupacional",
    "Outro",
  ].includes(value);
}

function parseMoney(value: string | null | undefined): number | null {
  const raw = cleanText(value);
  if (!raw) return null;

  const normalized = raw
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateDiasHorarios(
  diasHorarios: VagaHorarioItem[] | undefined
): VagaValidationError[] {
  const errors: VagaValidationError[] = [];

  if (!Array.isArray(diasHorarios)) return errors;

  diasHorarios.forEach((item, index) => {
    const prefix = `diasHorarios.${index}`;

    if (!hasValue(item.data)) {
      errors.push({
        field: `${prefix}.data`,
        message: "Data adicional obrigatória.",
      });
    } else if (parseBrDate(item.data) === null) {
      errors.push({
        field: `${prefix}.data`,
        message: "Data adicional inválida.",
      });
    } else if (isPastDate(item.data)) {
      errors.push({
        field: `${prefix}.data`,
        message: "Não é permitido cadastrar data passada.",
      });
    }

    if (!hasValue(item.horarioInicio)) {
      errors.push({
        field: `${prefix}.horarioInicio`,
        message: "Horário de entrada adicional obrigatório.",
      });
    } else if (!isValidTime(item.horarioInicio)) {
      errors.push({
        field: `${prefix}.horarioInicio`,
        message: "Horário de entrada adicional inválido.",
      });
    }

    if (!hasValue(item.horarioFim)) {
      errors.push({
        field: `${prefix}.horarioFim`,
        message: "Horário de saída adicional obrigatório.",
      });
    } else if (!isValidTime(item.horarioFim)) {
      errors.push({
        field: `${prefix}.horarioFim`,
        message: "Horário de saída adicional inválido.",
      });
    }

    if (
      hasValue(item.horarioInicio) &&
      hasValue(item.horarioFim) &&
      isValidTime(item.horarioInicio) &&
      isValidTime(item.horarioFim) &&
      !isEndAfterStart(item.horarioInicio, item.horarioFim)
    ) {
      errors.push({
        field: `${prefix}.horarioFim`,
        message:
  "O horário de saída adicional deve ser diferente do horário de entrada.",
      });
    }
  });

  return errors;
}

function validateStep1(data: VagaFormData): VagaValidationResult {
  const errors: VagaValidationError[] = [];

  if (!hasValue(data.solicitanteNome)) {
    errors.push({
      field: "solicitanteNome",
      message: "Nome completo do solicitante é obrigatório.",
    });
  }

  if (!hasValue(data.telefone)) {
    errors.push({
      field: "telefone",
      message: "Telefone é obrigatório.",
    });
  }

  if (!hasValue(data.whatsapp)) {
    errors.push({
      field: "whatsapp",
      message: "WhatsApp é obrigatório.",
    });
  }

  if (!hasValue(data.nomePaciente)) {
    errors.push({
      field: "nomePaciente",
      message: "Nome do paciente é obrigatório.",
    });
  }

  if (!hasValue(data.sexoPaciente) || !isAllowedSexoPaciente(data.sexoPaciente)) {
    errors.push({
      field: "sexoPaciente",
      message: "Sexo do paciente é obrigatório.",
    });
  }

  if (!hasValue(data.idadePaciente)) {
    errors.push({
      field: "idadePaciente",
      message: "Idade do paciente é obrigatória.",
    });
  } else {
    const idade = Number(onlyDigits(data.idadePaciente));
    if (!Number.isFinite(idade) || idade <= 0) {
      errors.push({
        field: "idadePaciente",
        message: "Idade do paciente inválida.",
      });
    }
  }

  if (!hasValue(data.tipoVaga) || !isAllowedTipoVaga(data.tipoVaga)) {
    errors.push({
      field: "tipoVaga",
      message: "Tipo de vaga é obrigatório.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep2(data: VagaFormData): VagaValidationResult {
  const errors: VagaValidationError[] = [];

  if (!hasValue(data.cep)) {
    errors.push({
      field: "cep",
      message: "CEP é obrigatório.",
    });
  }

  if (!hasValue(data.rua)) {
    errors.push({
      field: "rua",
      message: "Rua / Logradouro é obrigatório.",
    });
  }

  if (!hasValue(data.numero)) {
    errors.push({
      field: "numero",
      message: "Número é obrigatório.",
    });
  }

  if (!hasValue(data.complemento)) {
    errors.push({
      field: "complemento",
      message: "Complemento é obrigatório.",
    });
  }

  if (!hasValue(data.bairro)) {
    errors.push({
      field: "bairro",
      message: "Bairro é obrigatório.",
    });
  }

  if (!hasValue(data.cidade)) {
    errors.push({
      field: "cidade",
      message: "Cidade é obrigatória.",
    });
  }

  if (!hasValue(data.estado)) {
    errors.push({
      field: "estado",
      message: "UF é obrigatória.",
    });
  } else if (cleanText(data.estado).length !== 2) {
    errors.push({
      field: "estado",
      message: "UF deve ter 2 letras.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep3(data: VagaFormData): VagaValidationResult {
  const errors: VagaValidationError[] = [];

  if (!hasValue(data.patologias)) {
    errors.push({
      field: "patologias",
      message: "Patologias / Diagnóstico é obrigatório.",
    });
  }

  if (!hasValue(data.cuidados)) {
    errors.push({
      field: "cuidados",
      message: "Descrição dos cuidados necessários é obrigatória.",
    });
  }

  if (!hasValue(data.particularidades)) {
    errors.push({
      field: "particularidades",
      message: "Particularidades do paciente é obrigatório.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateStep4(data: VagaFormData): VagaValidationResult {
  const errors: VagaValidationError[] = [];

  if (!hasValue(data.tituloAnuncio) || !isAllowedTitulo(data.tituloAnuncio)) {
    errors.push({
      field: "tituloAnuncio",
      message: "Título do anúncio é obrigatório.",
    });
  }

  if (data.tituloAnuncio === "Outro" && !hasValue(data.tituloOutro)) {
    errors.push({
      field: "tituloOutro",
      message: "Título personalizado é obrigatório.",
    });
  }

  if (!hasValue(data.dataPlantao)) {
    errors.push({
      field: "dataPlantao",
      message: "Data do plantão é obrigatória.",
    });
  } else if (parseBrDate(data.dataPlantao) === null) {
    errors.push({
      field: "dataPlantao",
      message: "Data do plantão inválida.",
    });
  } else if (isPastDate(data.dataPlantao)) {
    errors.push({
      field: "dataPlantao",
      message: "Não é permitido cadastrar data passada.",
    });
  }

  if (!hasValue(data.horarioInicio)) {
    errors.push({
      field: "horarioInicio",
      message: "Horário de entrada é obrigatório.",
    });
  } else if (!isValidTime(data.horarioInicio)) {
    errors.push({
      field: "horarioInicio",
      message: "Horário de entrada inválido.",
    });
  }

  if (!hasValue(data.horarioFim)) {
    errors.push({
      field: "horarioFim",
      message: "Horário de saída é obrigatório.",
    });
  } else if (!isValidTime(data.horarioFim)) {
    errors.push({
      field: "horarioFim",
      message: "Horário de saída inválido.",
    });
  }

  if (
    hasValue(data.horarioInicio) &&
    hasValue(data.horarioFim) &&
    isValidTime(data.horarioInicio) &&
    isValidTime(data.horarioFim) &&
    !isEndAfterStart(data.horarioInicio, data.horarioFim)
  ) {
    errors.push({
      field: "horarioFim",
      message: "O horário de saída deve ser diferente do horário de entrada.",
    });
  }

  if (!hasValue(data.turno) || !isAllowedTurno(data.turno)) {
    errors.push({
      field: "turno",
      message: "Turno é obrigatório.",
    });
  }

  if (!hasValue(data.tarefas)) {
    errors.push({
      field: "tarefas",
      message: "Tarefas do profissional é obrigatório.",
    });
  }

  if (!hasValue(data.valorPlantao)) {
    errors.push({
      field: "valorPlantao",
      message: "Valor do plantão é obrigatório.",
    });
  } else {
    const valor = parseMoney(data.valorPlantao);
    if (valor === null || valor < 140) {
      errors.push({
        field: "valorPlantao",
        message: "Valor do plantão deve ser no mínimo R$ 140,00.",
      });
    }
  }

  if (!hasValue(data.duracao) || !isAllowedDuracao(data.duracao)) {
    errors.push({
      field: "duracao",
      message: "Duração do anúncio é obrigatória.",
    });
  }

  if (
    data.tipoVaga === "Plantão único" &&
    Array.isArray(data.diasHorarios) &&
    data.diasHorarios.length > 0
  ) {
    errors.push({
      field: "diasHorarios",
      message: "Plantão único não permite adicionar mais dias e horários.",
    });
  }

  errors.push(...validateDiasHorarios(data.diasHorarios));

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function validateVagaForm(data: VagaFormData): VagaValidationResult {
  const step1 = validateStep1(data);
  const step2 = validateStep2(data);
  const step3 = validateStep3(data);
  const step4 = validateStep4(data);

  const errors = [...step1.errors, ...step2.errors, ...step3.errors, ...step4.errors];

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function getFirstValidationMessage(
  result: VagaValidationResult,
  fallback = "Preencha todos os campos obrigatórios."
): string {
  return result.errors[0]?.message || fallback;
}

const vagaValidation = {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateVagaForm,
  getFirstValidationMessage,
};

export {
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateVagaForm,
  getFirstValidationMessage,
};

export default vagaValidation;