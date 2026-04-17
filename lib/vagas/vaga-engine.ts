export type TipoVaga =
  | "Plantão único"
  | "Plantão cumulado"
  | "Folguista"
  | "Fixo mensal"
  | "";

export type SexoPaciente = "Masculino" | "Feminino" | "Não informar" | "";

export type TurnoVaga =
  | "Diurno"
  | "Noturno"
  | "Plantão 12h"
  | "Plantão 24h"
  | "";

export type DuracaoAnuncio = "24 horas" | "48 horas" | "72 horas" | "";

export type TituloAnuncioBase =
  | "Acompanhante hospitalar Diurno"
  | "Acompanhante hospitalar Noturno"
  | "Acompanhante Residencial Diurno"
  | "Acompanhante Residencial Noturno"
  | "Cuidadora de idosos"
  | "Cuidador de Idosos (masculino)"
  | "Auxiliar de Enfermagem"
  | "Auxiliar de Enfermagem (masculino)"
  | "Técnica em Enfermagem"
  | "Técnico em Enfermagem (masculino)"
  | "Enfermeira"
  | "Enfermeira Diurna"
  | "Enfermeira Noturna"
  | "Enfermeiro (Masculino)"
  | "Fonoaudiólogo(a)"
  | "Médico(a)"
  | "Psicólogo(a)"
  | "Terapeuta Ocupacional"
  | "Outro"
  | "";

export type VagaHorarioItem = {
  data: string;
  horarioInicio: string;
  horarioFim: string;
};

export type VagaFormData = {
  authUserId: string;

  solicitanteNome: string;
  telefone: string;
  whatsapp: string;

  nomePaciente: string;
  sexoPaciente: SexoPaciente;
  idadePaciente: string;

  tipoVaga: TipoVaga;

  usarEnderecoUsuario: boolean;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;

  modeloId?: string | null;
  patologias: string;
  cuidados: string;
  particularidades: string;

  tituloAnuncio: TituloAnuncioBase;
  tituloOutro: string;

  dataPlantao: string;
  horarioInicio: string;
  horarioFim: string;
  diasHorarios?: VagaHorarioItem[];

  turno: TurnoVaga;
  tarefas: string;
  valorPlantao: string;
  duracao: DuracaoAnuncio;

  assinaturaNoMomento: boolean;
  valorCobrancaPublicacao?: number | null;
};

export type VagaPayload = {
  auth_user_id: string;
  status: string;

  is_public: boolean;
  pagamento_liberado: boolean;
  published_at: string | null;

  tipo_vaga: string | null;
  titulo_anuncio: string;
  titulo_personalizado: string | null;
  modelo_id: string | null;

  solicitante_nome: string;
  telefone: string;
  whatsapp: string | null;

  nome_paciente: string;
  sexo_paciente: string | null;
  idade_paciente: number | null;

  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  usar_endereco_usuario: boolean;

  patologias: string | null;
  cuidados: string | null;
  particularidades: string | null;
  tarefas: string | null;

  turno: string | null;
  valor_plantao: number | null;
  duracao_anuncio_horas: number | null;

  data_plantao: string | null;
  horario_inicio: string | null;
  horario_fim: string | null;

  dias_horarios: VagaHorarioItem[];

  assinatura_no_momento: boolean;
  valor_cobranca_publicacao: number;
};

function cleanText(value: string | null | undefined): string {
  return (value || "").trim();
}

function nullableText(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  return cleaned ? cleaned : null;
}

function onlyDigits(value: string | null | undefined): string {
  return (value || "").replace(/\D/g, "");
}

function parseInteger(value: string | null | undefined): number | null {
  const digits = onlyDigits(value);
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUF(value: string | null | undefined): string | null {
  const cleaned = cleanText(value).toUpperCase().slice(0, 2);
  return cleaned || null;
}

function normalizeDateBrToIso(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
}

function normalizeTime(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;

  const match = cleaned.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;

  return `${match[1]}:${match[2]}:00`;
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

function parseDuracaoHoras(value: DuracaoAnuncio): number | null {
  if (value === "24 horas") return 24;
  if (value === "48 horas") return 48;
  if (value === "72 horas") return 72;
  return null;
}

function normalizeDiasHorarios(items?: VagaHorarioItem[]): VagaHorarioItem[] {
  if (!Array.isArray(items)) return [];

  return items.filter(
    (i) => cleanText(i.data) && cleanText(i.horarioInicio) && cleanText(i.horarioFim)
  );
}

function resolveTitulo(
  titulo: TituloAnuncioBase,
  outro: string
): { tituloFinal: string; personalizado: string | null } {
  if (titulo === "Outro") {
    const t = cleanText(outro);
    return {
      tituloFinal: t,
      personalizado: t || null,
    };
  }

  return {
    tituloFinal: cleanText(titulo),
    personalizado: null,
  };
}

export function montarPayloadVaga(data: VagaFormData): VagaPayload {
  const titulo = resolveTitulo(data.tituloAnuncio, data.tituloOutro);

  return {
    auth_user_id: data.authUserId,
    status: "rascunho",

    is_public: false,
    pagamento_liberado: false,
    published_at: null,

    tipo_vaga: nullableText(data.tipoVaga),
    titulo_anuncio: titulo.tituloFinal,
    titulo_personalizado: titulo.personalizado,
    modelo_id: nullableText(data.modeloId),

    solicitante_nome: cleanText(data.solicitanteNome),
    telefone: cleanText(data.telefone),
    whatsapp: nullableText(data.whatsapp),

    nome_paciente: cleanText(data.nomePaciente),
    sexo_paciente: nullableText(data.sexoPaciente),
    idade_paciente: parseInteger(data.idadePaciente),

    cep: nullableText(data.cep),
    rua: nullableText(data.rua),
    numero: nullableText(data.numero),
    complemento: nullableText(data.complemento),
    bairro: nullableText(data.bairro),
    cidade: nullableText(data.cidade),
    estado: normalizeUF(data.estado),
    usar_endereco_usuario: !!data.usarEnderecoUsuario,

    patologias: nullableText(data.patologias),
    cuidados: nullableText(data.cuidados),
    particularidades: nullableText(data.particularidades),
    tarefas: nullableText(data.tarefas),

    turno: nullableText(data.turno),
    valor_plantao: parseMoney(data.valorPlantao),
    duracao_anuncio_horas: parseDuracaoHoras(data.duracao),

    data_plantao: normalizeDateBrToIso(data.dataPlantao),
    horario_inicio: normalizeTime(data.horarioInicio),
    horario_fim: normalizeTime(data.horarioFim),

    dias_horarios: normalizeDiasHorarios(data.diasHorarios),

    assinatura_no_momento: !!data.assinaturaNoMomento,
    valor_cobranca_publicacao:
      typeof data.valorCobrancaPublicacao === "number"
        ? data.valorCobrancaPublicacao
        : 19.9,
  };
}
