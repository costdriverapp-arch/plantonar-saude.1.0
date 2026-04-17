export type ExistingVagaConflictItem = {
  id: string;
  dataPlantao: string | null;
  horarioInicio: string | null;
  horarioFim: string | null;
  nomePaciente: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  status?: string | null;
};

export type ConflictCheckInput = {
  dataPlantao: string;
  horarioInicio: string;
  horarioFim: string;
  nomePaciente: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export type ConflictCheckResult = {
  hasConflict: boolean;
  message: string | null;
  conflictingVagaId: string | null;
};

function cleanText(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function normalizeDateBrToIso(value: string | null | undefined): string | null {
  const cleaned = (value || "").trim();
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) return null;

  return `${year}-${month}-${day}`;
}

function normalizeUF(value: string | null | undefined): string {
  return cleanText(value).toUpperCase().slice(0, 2).toLowerCase();
}

function normalizeTime(value: string | null | undefined): string | null {
  const cleaned = (value || "").trim();
  if (!cleaned) return null;

  if (/^\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  if (/^\d{2}:\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned.slice(0, 5);
  }

  return null;
}

function timeToMinutes(value: string | null | undefined): number | null {
  const normalized = normalizeTime(value);
  if (!normalized) return null;

  const [hour, minute] = normalized.split(":").map(Number);
  if (
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
}

function samePaciente(a: string, b: string): boolean {
  return cleanText(a) === cleanText(b);
}

function sameEndereco(
  a: Pick<ConflictCheckInput, "rua" | "numero" | "bairro" | "cidade" | "estado">,
  b: Pick<ConflictCheckInput, "rua" | "numero" | "bairro" | "cidade" | "estado">
): boolean {
  return (
    cleanText(a.rua) === cleanText(b.rua) &&
    cleanText(a.numero) === cleanText(b.numero) &&
    cleanText(a.bairro) === cleanText(b.bairro) &&
    cleanText(a.cidade) === cleanText(b.cidade) &&
    normalizeUF(a.estado) === normalizeUF(b.estado)
  );
}

function isActiveLikeStatus(status: string | null | undefined): boolean {
  const normalized = cleanText(status);
  if (!normalized) return true;

  return ["ativa", "aguardando_pagamento", "preenchida", "em_andamento"].includes(
    normalized
  );
}

function checkVagaConflict(
  existingVagas: ExistingVagaConflictItem[],
  input: ConflictCheckInput
): ConflictCheckResult {
  const inputDate = normalizeDateBrToIso(input.dataPlantao);
  const inputStart = timeToMinutes(input.horarioInicio);

  if (!inputDate || inputStart === null) {
    return {
      hasConflict: false,
      message: null,
      conflictingVagaId: null,
    };
  }

  const relevantVagas = existingVagas.filter((vaga) => {
    if (!isActiveLikeStatus(vaga.status)) return false;

    const vagaDate = normalizeDateBrToIso(vaga.dataPlantao);
    if (vagaDate !== inputDate) return false;

    if (!samePaciente(vaga.nomePaciente || "", input.nomePaciente)) {
      return false;
    }

    return sameEndereco(
      {
        rua: vaga.rua || "",
        numero: vaga.numero || "",
        bairro: vaga.bairro || "",
        cidade: vaga.cidade || "",
        estado: vaga.estado || "",
      },
      {
        rua: input.rua,
        numero: input.numero,
        bairro: input.bairro,
        cidade: input.cidade,
        estado: input.estado,
      }
    );
  });

  if (relevantVagas.length === 0) {
    return {
      hasConflict: false,
      message: null,
      conflictingVagaId: null,
    };
  }

  let latestEndMinutes: number | null = null;
  let conflictingVagaId: string | null = null;

  for (const vaga of relevantVagas) {
    const endMinutes = timeToMinutes(vaga.horarioFim);
    if (endMinutes === null) continue;

    if (latestEndMinutes === null || endMinutes > latestEndMinutes) {
      latestEndMinutes = endMinutes;
      conflictingVagaId = vaga.id;
    }
  }

  if (latestEndMinutes === null) {
    return {
      hasConflict: false,
      message: null,
      conflictingVagaId: null,
    };
  }

  if (inputStart < latestEndMinutes) {
    return {
      hasConflict: true,
      message:
        "Já existe uma vaga para este paciente, endereço e data. O novo horário de início não pode ser menor que o horário de término da vaga já existente.",
      conflictingVagaId,
    };
  }

  return {
    hasConflict: false,
    message: null,
    conflictingVagaId: null,
  };
}

const vagaConflictEngine = {
  checkVagaConflict,
};

export { checkVagaConflict };
export default vagaConflictEngine;