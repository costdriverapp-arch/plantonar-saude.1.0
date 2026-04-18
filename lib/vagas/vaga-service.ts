import { supabase } from "../supabase";
import {
  montarPayloadVaga,
  type VagaFormData,
  type VagaPayload,
} from "./vaga-engine";
import {
  checkVagaConflict,
  type ExistingVagaConflictItem,
} from "./vaga-conflict-engine";
import {
  getFirstValidationMessage,
  validateVagaForm,
} from "./vaga-validation-engine";

export type CriarVagaResult =
  | {
      success: true;
      data: any;
      payload: VagaPayload;
    }
  | {
      success: false;
      error: string;
      validationErrors?: { field: string; message: string }[];
    };

function toExistingConflictItem(row: any): ExistingVagaConflictItem {
  return {
    id: row.id,
    dataPlantao: row.data_plantao,
    horarioInicio: row.horario_inicio,
    horarioFim: row.horario_fim,
    nomePaciente: row.nome_paciente,
    rua: row.rua,
    numero: row.numero,
    bairro: row.bairro,
    cidade: row.cidade,
    estado: row.estado,
    status: row.status,
  };
}

export async function carregarVagasDoCliente(
  authUserId: string
): Promise<{ success: true; data: any[] } | { success: false; error: string }> {
  const { data, error } = await supabase
  .from("vagas")
  .select(`
    id,
    status,
    titulo_anuncio,
    titulo_personalizado,
    nome_paciente,
    cidade,
    estado,
    bairro,
    data_plantao,
    horario_inicio,
    horario_fim,
    valor_plantao,
    tipo_vaga,
    turno,
    solicitante_nome,
    tarefas,
    cuidados,
    patologias,
    particularidades
  `)
  .eq("auth_user_id", authUserId)
  .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível carregar as vagas.",
    };
  }

  return {
    success: true,
    data: data || [],
  };
}

export async function carregarVagasPublicasParaProfissional(): Promise<
  { success: true; data: any[] } | { success: false; error: string }
> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("is_public", true)
    .eq("pagamento_liberado", true)
    .eq("status", "ativa")
    .order("published_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível carregar as vagas públicas.",
    };
  }

  return {
    success: true,
    data: data || [],
  };
}

export async function carregarVagaPorId(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("id", vagaId)
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível carregar a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function verificarConflitoDeVaga(
  formData: VagaFormData
): Promise<
  | { success: true; hasConflict: boolean; message: string | null }
  | { success: false; error: string }
> {
  const { data, error } = await supabase
    .from("vagas")
    .select(
      "id, data_plantao, horario_inicio, horario_fim, nome_paciente, rua, numero, bairro, cidade, estado, status"
    )
    .eq("auth_user_id", formData.authUserId);

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível verificar conflito de vaga.",
    };
  }

  const result = checkVagaConflict((data || []).map(toExistingConflictItem), {
    dataPlantao: formData.dataPlantao,
    horarioInicio: formData.horarioInicio,
    horarioFim: formData.horarioFim,
    nomePaciente: formData.nomePaciente,
    rua: formData.rua,
    numero: formData.numero,
    bairro: formData.bairro,
    cidade: formData.cidade,
    estado: formData.estado,
  });

  return {
    success: true,
    hasConflict: result.hasConflict,
    message: result.message,
  };
}

export async function criarVaga(formData: VagaFormData): Promise<CriarVagaResult> {
  const validation = validateVagaForm(formData);

  if (!validation.isValid) {
    return {
      success: false,
      error: getFirstValidationMessage(validation),
      validationErrors: validation.errors,
    };
  }

  const payload = montarPayloadVaga(formData);

  const { data: existingRows, error: conflictLoadError } = await supabase
    .from("vagas")
    .select(
      "id, data_plantao, horario_inicio, horario_fim, nome_paciente, rua, numero, bairro, cidade, estado, status"
    )
    .eq("auth_user_id", formData.authUserId);

  if (conflictLoadError) {
    return {
      success: false,
      error:
        conflictLoadError.message ||
        "Não foi possível verificar conflito de vagas.",
    };
  }

  const conflictResult = checkVagaConflict(
    (existingRows || []).map(toExistingConflictItem),
    {
      dataPlantao: formData.dataPlantao,
      horarioInicio: formData.horarioInicio,
      horarioFim: formData.horarioFim,
      nomePaciente: formData.nomePaciente,
      rua: formData.rua,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
    }
  );

  if (conflictResult.hasConflict) {
    return {
      success: false,
      error:
        conflictResult.message ||
        "Já existe uma vaga conflitante para este paciente, endereço e data.",
    };
  }

  const { data, error } = await supabase
    .from("vagas")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível criar a vaga.",
    };
  }

  return {
    success: true,
    data,
    payload,
  };
}

export async function atualizarVaga(
  vagaId: string,
  formData: VagaFormData
): Promise<CriarVagaResult> {
  const validation = validateVagaForm(formData);

  if (!validation.isValid) {
    return {
      success: false,
      error: getFirstValidationMessage(validation),
      validationErrors: validation.errors,
    };
  }

  const payload = montarPayloadVaga(formData);

  const { data: existingRows, error: conflictLoadError } = await supabase
    .from("vagas")
    .select(
      "id, data_plantao, horario_inicio, horario_fim, nome_paciente, rua, numero, bairro, cidade, estado, status"
    )
    .eq("auth_user_id", formData.authUserId)
    .neq("id", vagaId);

  if (conflictLoadError) {
    return {
      success: false,
      error:
        conflictLoadError.message ||
        "Não foi possível verificar conflito de vagas.",
    };
  }

  const conflictResult = checkVagaConflict(
    (existingRows || []).map(toExistingConflictItem),
    {
      dataPlantao: formData.dataPlantao,
      horarioInicio: formData.horarioInicio,
      horarioFim: formData.horarioFim,
      nomePaciente: formData.nomePaciente,
      rua: formData.rua,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
    }
  );

  if (conflictResult.hasConflict) {
    return {
      success: false,
      error:
        conflictResult.message ||
        "Já existe uma vaga conflitante para este paciente, endereço e data.",
    };
  }

  const { data, error } = await supabase
    .from("vagas")
    .update(payload)
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível atualizar a vaga.",
    };
  }

  return {
    success: true,
    data,
    payload,
  };
}

export async function marcarVagaComoPublica(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("vagas")
    .update({
      pagamento_liberado: true,
      is_public: true,
      published_at: now,
      status: "ativa",
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível publicar a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function marcarVagaComoExpirada(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({
      status: "expirada",
      is_public: false,
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível expirar a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function marcarVagaComoPreenchida(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({
      status: "preenchida",
      is_public: false,
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível preencher a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function marcarVagaEmAndamento(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({
      status: "em_andamento",
      is_public: false,
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível iniciar o plantão.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function concluirVaga(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({
      status: "concluida",
      is_public: false,
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível concluir a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

export async function cancelarVaga(
  vagaId: string
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  const { data, error } = await supabase
    .from("vagas")
    .update({
      status: "cancelada",
      is_public: false,
    })
    .eq("id", vagaId)
    .select("*")
    .single();

  if (error) {
    return {
      success: false,
      error: error.message || "Não foi possível cancelar a vaga.",
    };
  }

  return {
    success: true,
    data,
  };
}

const vagaService = {
  carregarVagasDoCliente,
  carregarVagasPublicasParaProfissional,
  carregarVagaPorId,
  verificarConflitoDeVaga,
  criarVaga,
  atualizarVaga,
  marcarVagaComoPublica,
  marcarVagaComoExpirada,
  marcarVagaComoPreenchida,
  marcarVagaEmAndamento,
  concluirVaga,
  cancelarVaga,
};

export default vagaService;