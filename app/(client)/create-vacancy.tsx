import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { CustomModal } from "@/components/ui/CustomModal";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppInput } from "@/components/ui/AppInput";
import * as vagaUiHelper from "../../lib/vagas/vaga-ui-helper";
import * as vagaService from "../../lib/vagas/vaga-service";
import * as vagaValidation from "../../lib/vagas/vaga-validation-engine";
import { useAuth } from "@/context/AuthContext";
const BG = "#eef3f9";
const WHITE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SOFT = "#64748b";
const BORDER = "#d9e2ec";
const BLUE = "#1f69c6";
const GREEN = "#44a04a";
const LIGHT_BAR = "#d6dfeb";
const CHIP_BG = "#dde6f1";
const CHIP_TEXT = "#6c7a90";
const INFO_BG = "#dcecff";
const INFO_TEXT = "#3f7ed8";
const CLIENT_HEADER = "#14532d";
const CLIENT_GREEN = "#16a34a";
const CLIENT_LIGHT = "#dcfce7";

type Step = 1 | 2 | 3 | 4;

const SEXOS = ["Masculino", "Feminino", "Não informar"];
const TIPOS_VAGA = ["Plantão único", "Plantão cumulado", "Folguista", "Fixo mensal"];
const TURNOS = ["Diurno", "Noturno", "Plantão 12h", "Plantão 24h"];
const DURACOES = ["24 horas", "48 horas", "72 horas"];

const TITULOS_ANUNCIO = [
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
];

const VACANCY_MODELS = [
  {
    id: "idoso-supervisao",
    patologias:
      "Paciente idoso com necessidade de supervisão contínua, podendo apresentar limitações físicas leves, risco de queda, esquecimentos e necessidade de apoio em atividades rotineiras.",
    cuidados:
      "Supervisionar o paciente durante o plantão, auxiliar na locomoção quando necessário, acompanhar alimentação, hidratação e medicações já organizadas, observar sinais gerais e comunicar qualquer intercorrência à família.",
    particularidades:
      "Manter atenção com deslocamentos dentro da casa, horários combinados, rotina já estabelecida pelo paciente e cordialidade no trato com familiares.",
    tarefas:
      "Acompanhar o paciente durante o período do plantão. Auxiliar nas atividades básicas do dia. Estimular hidratação e alimentação. Observar mudanças de comportamento. Comunicar intercorrências.",
  },
  {
    id: "paciente-acamado",
    patologias:
      "Paciente acamado, com limitação importante de mobilidade, podendo estar em recuperação, condição neurológica, fragilidade severa ou dependência total para atividades básicas.",
    cuidados:
      "Realizar mudança de decúbito conforme orientação, auxiliar na higiene, observar conforto, prevenir lesões por pressão, acompanhar sinais gerais e comunicar intercorrências imediatamente.",
    particularidades:
      "Exige atenção com posicionamento, conforto, higiene rigorosa, observação da pele e cuidado ao movimentar o paciente.",
    tarefas:
      "Mudança de decúbito. Higiene no leito. Troca de fraldas ou roupas quando necessário. Auxílio na alimentação. Observação contínua do estado geral.",
  },
  {
    id: "demencia-confusao",
    patologias:
      "Paciente com demência, Alzheimer ou quadro de confusão mental, podendo apresentar desorientação, esquecimento, agitação, alterações de humor e necessidade de supervisão próxima.",
    cuidados:
      "Garantir segurança, manter ambiente calmo, orientar com paciência, supervisionar deslocamentos, acompanhar alimentação e medicações já separadas, observando alterações comportamentais.",
    particularidades:
      "Evitar discussões, manter comunicação simples, ter atenção especial para saídas inesperadas, quedas e momentos de agitação.",
    tarefas:
      "Supervisionar continuamente. Auxiliar em higiene e alimentação. Redirecionar com calma em momentos de confusão. Observar comportamento. Comunicar intercorrências à família.",
  },
  {
    id: "pos-cirurgico",
    patologias:
      "Paciente em fase de recuperação após cirurgia, com necessidade de monitoramento, repouso, auxílio em deslocamentos e observação de sinais de desconforto ou complicação.",
    cuidados:
      "Observar dor, sinais gerais, auxiliar na locomoção com segurança, apoiar higiene e alimentação, acompanhar medicações conforme orientação e comunicar sinais de alerta.",
    particularidades:
      "Atenção com curativos, limitação de movimentos, dor, risco de queda e necessidade de repouso adequado.",
    tarefas:
      "Acompanhar recuperação no plantão. Auxiliar em deslocamentos. Apoiar higiene e alimentação. Observar sintomas. Informar qualquer intercorrência.",
  },
  {
    id: "mobilidade-reduzida",
    patologias:
      "Paciente com mobilidade reduzida por sequelas neurológicas, ortopédicas ou limitações crônicas, necessitando de auxílio para se movimentar com segurança.",
    cuidados:
      "Auxiliar em transferências, deslocamentos e posicionamento, sempre com atenção à segurança, conforto e prevenção de quedas.",
    particularidades:
      "Necessário cuidado ao levantar, sentar, caminhar e posicionar o paciente. Observar dor, cansaço e equilíbrio.",
    tarefas:
      "Auxiliar na locomoção. Apoiar higiene e alimentação. Organizar ambiente para segurança. Acompanhar mudanças de posição. Comunicar intercorrências.",
  },
  {
    id: "controle-medicamentos",
    patologias:
      "Paciente com doenças crônicas e rotina de uso contínuo de medicamentos, necessitando de controle de horários e observação de sinais gerais.",
    cuidados:
      "Acompanhar horários dos medicamentos já organizados pela família ou equipe responsável, observar sinais gerais, alimentação e hidratação, e comunicar alterações importantes.",
    particularidades:
      "Atenção rigorosa aos horários combinados, confirmação do que já está separado e observação de reações ou sintomas atípicos.",
    tarefas:
      "Lembrar e acompanhar horários dos medicamentos. Observar sinais gerais. Apoiar alimentação e hidratação. Comunicar intercorrências.",
  },
  {
    id: "oxigenio-respiratorio",
    patologias:
      "Paciente com limitação respiratória crônica, podendo fazer uso de oxigênio suplementar e necessitar de observação mais próxima do padrão respiratório.",
    cuidados:
      "Observar conforto respiratório, posicionamento, uso correto do oxigênio conforme já instalado, sinais de desconforto e comunicar qualquer piora imediatamente.",
    particularidades:
      "Atenção a cansaço excessivo, dificuldade para respirar, agitação, queda do conforto respiratório e posicionamento adequado.",
    tarefas:
      "Acompanhar padrão respiratório. Auxiliar no conforto e posicionamento. Observar uso do oxigênio. Comunicar intercorrências.",
  },
  {
    id: "curativos-feridas",
    patologias:
      "Paciente com feridas ou lesões de pele que exigem observação contínua, cuidado local e atenção com higiene e conforto.",
    cuidados:
      "Observar região afetada, manter higiene e conforto, seguir orientações previamente definidas pela família ou equipe e comunicar sinais de piora.",
    particularidades:
      "Atenção com dor, secreção, sangramento, odor, desconforto e necessidade de preservar a integridade da pele.",
    tarefas:
      "Observar feridas. Auxiliar na higiene. Posicionar adequadamente. Comunicar alterações importantes. Manter conforto do paciente.",
  },
  {
    id: "cuidados-paliativos",
    patologias:
      "Paciente em cuidados paliativos, com foco em conforto, dignidade, controle de desconfortos e acolhimento durante o plantão.",
    cuidados:
      "Priorizar conforto, higiene, posicionamento, acolhimento e observação sensível de sinais de desconforto, sempre comunicando intercorrências à família.",
    particularidades:
      "Necessita abordagem calma, respeitosa e atenta. Foco principal no conforto do paciente e no cuidado humanizado.",
    tarefas:
      "Manter conforto. Auxiliar higiene. Reposicionar conforme necessidade. Acompanhar sinais de desconforto. Apoiar família com comunicação respeitosa.",
  },
  {
    id: "crianca-adolescente",
    patologias:
      "Paciente pediátrico ou adolescente com necessidade de observação, rotina de cuidados especiais e acompanhamento durante o plantão.",
    cuidados:
      "Acompanhar rotina combinada, observar comportamento, apoiar alimentação, higiene e conforto, sempre com atenção ao acolhimento e segurança.",
    particularidades:
      "Exige comunicação cuidadosa, atenção ao comportamento, rotina familiar e suporte afetivo durante o plantão.",
    tarefas:
      "Acompanhar rotina. Auxiliar em higiene e alimentação. Observar sinais gerais. Garantir conforto e segurança. Comunicar intercorrências.",
  },
  {
    id: "acompanhante-hospitalar",
    patologias:
      "Paciente internado em ambiente hospitalar que necessita acompanhante para suporte, observação e auxílio durante a permanência.",
    cuidados:
      "Acompanhar o paciente durante o período, auxiliar em demandas básicas permitidas, observar sinais gerais e manter comunicação com familiares.",
    particularidades:
      "Seguir regras do ambiente hospitalar, manter postura adequada e observar orientações da equipe local.",
    tarefas:
      "Acompanhar o paciente. Auxiliar em demandas básicas. Observar estado geral. Comunicar intercorrências e atualizações à família.",
  },
  {
    id: "home-care-geral",
    patologias:
      "Paciente em atendimento domiciliar com necessidades variadas, exigindo acompanhamento, apoio em rotina e observação contínua durante o plantão.",
    cuidados:
      "Auxiliar conforme necessidade do paciente, mantendo conforto, segurança, organização do ambiente e comunicação de intercorrências.",
    particularidades:
      "Pode envolver rotina ampla de cuidados, exigindo atenção, organização e adaptação ao contexto domiciliar.",
    tarefas:
      "Acompanhar paciente no domicílio. Apoiar higiene, alimentação e conforto. Organizar ambiente. Observar estado geral. Comunicar intercorrências.",
  },
];

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function HeaderPriceBadge({ isSubscriber }: { isSubscriber: boolean }) {
  if (isSubscriber) {
    return (
      <View style={styles.headerIconBadge}>
        <MaterialCommunityIcons name="crown-outline" size={17} color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.headerPriceBadge}>
      <Text style={styles.headerPriceText}>R$ 19,90</Text>
    </View>
  );
}

function CalendarPreviewDay({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.calendarDay, active && styles.calendarDayActive]}>
      <Text style={[styles.calendarDayText, active && styles.calendarDayTextActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function CreateVacancyScreen() {
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 12;
const { user } = useAuth();
const { modelId } = useLocalSearchParams<{ modelId?: string }>();
  const [step, setStep] = useState<Step>(1);

  const [isSubscriber] = useState(false);
 const [usarMeuEndereco, setUsarMeuEndereco] = useState(false);

const handleToggleEndereco = (value: boolean) => {
  setUsarMeuEndereco(value);

  if (value && user) {
    const profileData = user as any;

    setCep(profileData.cep || "");
    setRua(profileData.street || "");
    setNumero(profileData.number || "");
    setComplemento(profileData.complement || "");
    setBairro(profileData.neighborhood || "");
    setCidade(profileData.city || "");
    setEstado(profileData.state || "");
  }
};

  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nomePaciente, setNomePaciente] = useState("");
  const [sexoPaciente, setSexoPaciente] = useState("");
  const [idadePaciente, setIdadePaciente] = useState("");
  const [tipoVaga, setTipoVaga] = useState("");

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [patologias, setPatologias] = useState("");
  const [cuidados, setCuidados] = useState("");
  const [particularidades, setParticularidades] = useState("");

  const [tituloAnuncio, setTituloAnuncio] = useState("");
  const [tituloOutro, setTituloOutro] = useState("");
  const [turno, setTurno] = useState("");
  const [tarefas, setTarefas] = useState("");
  const [valorPlantao, setValorPlantao] = useState("");
  const [duracao, setDuracao] = useState("72 horas");

  const [dataPlantao, setDataPlantao] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");

  const [showTituloModal, setShowTituloModal] = useState(false);
  const [validationModal, setValidationModal] = useState({
    visible: false,
    title: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
useEffect(() => {
  if (!modelId) return;

  const selectedModel = VACANCY_MODELS.find((item) => item.id === modelId);
  if (!selectedModel) return;

  setPatologias(selectedModel.patologias);
  setCuidados(selectedModel.cuidados);
  setParticularidades(selectedModel.particularidades);
  setTarefas(selectedModel.tarefas);
}, [modelId]);
  const progress = useMemo(() => {
    if (step === 1) return [GREEN, LIGHT_BAR, LIGHT_BAR];
    if (step === 2) return [GREEN, BLUE, LIGHT_BAR];
    if (step === 3) return [GREEN, BLUE, LIGHT_BAR];
    return [GREEN, GREEN, BLUE];
  }, [step]);

  const stepLabel = useMemo(() => {
    if (step === 1) return "Dados do solicitante";
    if (step === 2) return "Local do trabalho";
    if (step === 3) return "Dados do paciente";
    return "Dados do plantão";
  }, [step]);

  const nextStep = () => {
    if (step === 1) {
      const validation = vagaValidation.validateStep1({
  authUserId: user?.id || "",
        solicitanteNome,
        telefone,
        whatsapp,
        nomePaciente,
        sexoPaciente: sexoPaciente as any,
        idadePaciente,
        tipoVaga: tipoVaga as any,
        usarEnderecoUsuario: usarMeuEndereco,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        modeloId: null,
        patologias: "",
        cuidados: "",
        particularidades: "",
        tituloAnuncio: "" as any,
        tituloOutro: "",
        dataPlantao: "",
        horarioInicio: "",
        horarioFim: "",
        diasHorarios: [],
        turno: "" as any,
        tarefas: "",
        valorPlantao: "",
        duracao: "" as any,
        assinaturaNoMomento: false,
        valorCobrancaPublicacao: null,
      });

      if (!validation.isValid) {
        const modal = vagaUiHelper.buildModalFromValidation(validation);
        setValidationModal({
          visible: true,
          title: modal.title,
          message: modal.message,
        });
        return;
      }
    }

    if (step === 2) {
     const validation = vagaValidation.validateStep2({
  authUserId: user?.id || "",
        solicitanteNome,
        telefone,
        whatsapp,
        nomePaciente,
        sexoPaciente: sexoPaciente as any,
        idadePaciente,
        tipoVaga: tipoVaga as any,
        usarEnderecoUsuario: usarMeuEndereco,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        modeloId: null,
        patologias: "",
        cuidados: "",
        particularidades: "",
        tituloAnuncio: "" as any,
        tituloOutro: "",
        dataPlantao: "",
        horarioInicio: "",
        horarioFim: "",
        diasHorarios: [],
        turno: "" as any,
        tarefas: "",
        valorPlantao: "",
        duracao: "" as any,
        assinaturaNoMomento: false,
        valorCobrancaPublicacao: null,
      });

      if (!validation.isValid) {
        const modal = vagaUiHelper.buildModalFromValidation(validation);
        setValidationModal({
          visible: true,
          title: modal.title,
          message: modal.message,
        });
        return;
      }
    }

    if (step === 3) {
      const validation = vagaValidation.validateStep3({
  authUserId: user?.id || "",
        solicitanteNome,
        telefone,
        whatsapp,
        nomePaciente,
        sexoPaciente: sexoPaciente as any,
        idadePaciente,
        tipoVaga: tipoVaga as any,
        usarEnderecoUsuario: usarMeuEndereco,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        modeloId: null,
        patologias,
        cuidados,
        particularidades,
        tituloAnuncio: "" as any,
        tituloOutro: "",
        dataPlantao: "",
        horarioInicio: "",
        horarioFim: "",
        diasHorarios: [],
        turno: "" as any,
        tarefas: "ok",
        valorPlantao: "",
        duracao: "" as any,
        assinaturaNoMomento: false,
        valorCobrancaPublicacao: null,
      });

      if (!validation.isValid) {
        const modal = vagaUiHelper.buildModalFromValidation(validation);
        setValidationModal({
          visible: true,
          title: modal.title,
          message: modal.message,
        });
        return;
      }
    }

    if (step < 4) setStep((prev) => (prev + 1) as Step);
  };

  const handlePublish = async () => {
    const validation = vagaValidation.validateStep4({
  authUserId: user?.id || "",
      solicitanteNome,
      telefone,
      whatsapp,
      nomePaciente,
      sexoPaciente: sexoPaciente as any,
      idadePaciente,
      tipoVaga: tipoVaga as any,
      usarEnderecoUsuario: usarMeuEndereco,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      modeloId: null,
      patologias,
      cuidados,
      particularidades,
      tituloAnuncio: tituloAnuncio as any,
      tituloOutro,
      dataPlantao,
      horarioInicio,
      horarioFim,
      diasHorarios: [],
      turno: turno as any,
      tarefas,
      valorPlantao,
      duracao: duracao as any,
      assinaturaNoMomento: false,
      valorCobrancaPublicacao: null,
    });

    if (!validation.isValid) {
      const modal = vagaUiHelper.buildModalFromValidation(validation);
      setValidationModal({
        visible: true,
        title: modal.title,
        message: modal.message,
      });
      return;
    }

    try {
      setSaving(true);

    const result = await vagaService.criarVaga({
  authUserId: user?.id || "",
        solicitanteNome,
        telefone,
        whatsapp,
        nomePaciente,
        sexoPaciente: sexoPaciente as any,
        idadePaciente,
        tipoVaga: tipoVaga as any,
        usarEnderecoUsuario: usarMeuEndereco,
        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        modeloId: null,
        patologias,
        cuidados,
        particularidades,
        tituloAnuncio: tituloAnuncio as any,
        tituloOutro,
        dataPlantao,
        horarioInicio,
        horarioFim,
        diasHorarios: [],
        turno: turno as any,
        tarefas,
        valorPlantao,
        duracao: duracao as any,
        assinaturaNoMomento: false,
        valorCobrancaPublicacao: null,
      });
console.log("CRIAR VAGA RESULT:", result);
      if (!result.success) {
        
        const modal = vagaUiHelper.buildGenericErrorModal(result.error);
        setValidationModal({
          visible: true,
          title: modal.title,
          message: modal.message,
        });
        return;
      }

      const modal = vagaUiHelper.buildSuccessCreateModal();
      setValidationModal({
        visible: true,
        title: modal.title,
        message: modal.message,
      });
   } catch (error: any) {
  console.log("CREATE VAGA SCREEN ERROR:", error);

  const modal = vagaUiHelper.buildGenericErrorModal(
    error?.message || "Erro inesperado ao criar vaga."
  );

  setValidationModal({
    visible: true,
    title: modal.title,
    message: modal.message,
  });
} finally {
  setSaving(false);
}
  };

  const prevStep = () => {
    if (step > 1) setStep((prev) => (prev - 1) as Step);
  };

  const rightContent = <HeaderPriceBadge isSubscriber={isSubscriber} />;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Criar Vaga"
        showBack
        rightContent={rightContent}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: bottomPad + 90 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressRow}>
            <View style={[styles.progressSegment, { backgroundColor: progress[0] }]} />
            <View style={[styles.progressSegment, { backgroundColor: progress[1] }]} />
            <View style={[styles.progressSegment, { backgroundColor: progress[2] }]} />
          </View>

          <Text style={styles.stepLabel}>{stepLabel}</Text>

          {step === 1 && (
            <>
              <AppInput
                label="Nome completo do solicitante"
                value={solicitanteNome}
                onChangeText={setSolicitanteNome}
                placeholder="Digite seu nome completo"
              />

              <AppInput
                label="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                placeholder="(xx)xxxxx-xxxx"
                keyboardType="phone-pad"
              />

              <AppInput
                label="WhatsApp"
                value={whatsapp}
                onChangeText={setWhatsapp}
                placeholder="(xx)xxxxx-xxxx"
                keyboardType="phone-pad"
              />

              <AppInput
                label="Nome do paciente"
                value={nomePaciente}
                onChangeText={setNomePaciente}
                placeholder="Nome completo"
              />

              <Text style={styles.fieldLabel}>Sexo do paciente</Text>
              <View style={styles.chipsRow}>
                {SEXOS.map((item) => {
                  const selected = sexoPaciente === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.85}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setSexoPaciente(item)}
                    >
                      <Text
                        style={[styles.chipText, selected && styles.chipTextSelected]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <AppInput
                label="Idade do paciente"
                value={idadePaciente}
                onChangeText={setIdadePaciente}
                placeholder="Ex: 72"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Tipo de vaga</Text>
              <View style={styles.chipsRowWrap}>
                {TIPOS_VAGA.map((item) => {
                  const selected = tipoVaga === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.85}
                      style={[styles.chip, selected && styles.chipSelectedStrong]}
                      onPress={() => setTipoVaga(item)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelectedStrong,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.singleButtonRow}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.primaryButton}
                  onPress={nextStep}
                >
                  <Text style={styles.primaryButtonText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.addressHeaderRow}>
                <Text style={styles.addressTitle}>Endereço do plantão</Text>

                <View style={styles.addressSwitchRow}>
                  <Text style={styles.addressSwitchText}>Meu endereço</Text>
                <Switch
  value={usarMeuEndereco}
  onValueChange={handleToggleEndereco}
                    trackColor={{ false: "#cbd5e1", true: "#86efac" }}
                    thumbColor={usarMeuEndereco ? CLIENT_GREEN : "#ffffff"}
                  />
                </View>
              </View>

              <AppInput
                label="CEP"
                value={cep}
                onChangeText={(value) => setCep(formatCep(value))}
                placeholder="00000-000"
                keyboardType="numeric"
              />

              <AppInput
                label="Rua / Logradouro"
                value={rua}
                onChangeText={setRua}
                placeholder="Rua Exemplo"
              />

              <View style={styles.row}>
                <View style={styles.smallCol}>
                  <AppInput
                    label="Número"
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="123"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.largeCol}>
                  <AppInput
                    label="Complemento"
                    value={complemento}
                    onChangeText={setComplemento}
                    placeholder="Apto, bloco..."
                  />
                </View>
              </View>

              <AppInput
                label="Bairro"
                value={bairro}
                onChangeText={setBairro}
                placeholder="Nome do bairro"
              />

              <View style={styles.row}>
                <View style={styles.cityCol}>
                  <AppInput
                    label="Cidade"
                    value={cidade}
                    onChangeText={setCidade}
                    placeholder="Belo Horizonte"
                  />
                </View>

                <View style={styles.ufCol}>
                  <AppInput
                    label="UF"
                    value={estado}
                    onChangeText={(value) => setEstado(value.toUpperCase().slice(0, 2))}
                    placeholder="MG"
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={styles.footerActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.backInline}
                  onPress={prevStep}
                >
                  <Feather name="arrow-left" size={16} color={BLUE} />
                  <Text style={styles.backInlineText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.primaryButtonFlex}
                  onPress={nextStep}
                >
                  <Text style={styles.primaryButtonText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Pressable
                style={styles.templateCard}
                onPress={() => router.push("/(client)/vacancy-models")}
              >
                <View style={styles.templateLeft}>
                  <View style={styles.templateIconBox}>
                    <Feather name="briefcase" size={16} color={BLUE} />
                  </View>

                  <View style={styles.templateTextBox}>
                    <Text style={styles.templateTitle}>Modelos prontos</Text>
                    <Text style={styles.templateSubtitle}>
                      Preencha automaticamente com base na patologia
                    </Text>
                  </View>
                </View>

                <Feather name="chevron-right" size={18} color={TEXT_SOFT} />
              </Pressable>

              <Text style={styles.fieldLabel}>Patologias / Diagnóstico</Text>
              <TextInput
                value={patologias}
                onChangeText={setPatologias}
                placeholder="Descreva as condições de saúde"
                placeholderTextColor="#97a6ba"
                multiline
                style={[styles.textArea, styles.textAreaMedium]}
              />

              <Text style={styles.fieldLabel}>Descrição dos cuidados necessários</Text>
              <TextInput
                value={cuidados}
                onChangeText={setCuidados}
                placeholder="Quais cuidados o profissional deverá prestar"
                placeholderTextColor="#97a6ba"
                multiline
                style={[styles.textArea, styles.textAreaLarge]}
              />

              <Text style={styles.fieldLabel}>Particularidades do paciente</Text>
              <TextInput
                value={particularidades}
                onChangeText={setParticularidades}
                placeholder="Informações adicionais importantes"
                placeholderTextColor="#97a6ba"
                multiline
                style={[styles.textArea, styles.textAreaSmall]}
              />

              <View style={styles.footerActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.backInline}
                  onPress={prevStep}
                >
                  <Feather name="arrow-left" size={16} color={BLUE} />
                  <Text style={styles.backInlineText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.primaryButtonFlex}
                  onPress={nextStep}
                >
                  <Text style={styles.primaryButtonText}>Continuar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.fieldLabel}>Título do anúncio</Text>
              <Pressable
                style={styles.selectBox}
                onPress={() => setShowTituloModal(true)}
              >
                <Text
                  style={[
                    styles.selectText,
                    !tituloAnuncio && styles.placeholderText,
                  ]}
                >
                  {tituloAnuncio || "Toque para selecionar..."}
                </Text>
                <Feather name="chevron-down" size={18} color={TEXT_SOFT} />
              </Pressable>

              {tituloAnuncio === "Outro" && (
                <AppInput
                  label="Título personalizado"
                  value={tituloOutro}
                  onChangeText={(value) => setTituloOutro(value.slice(0, 80))}
                  placeholder="Digite o título do anúncio"
                  maxLength={80}
                />
              )}

              <Text style={styles.fieldLabel}>Data do plantão</Text>
              <AppInput
                label="Data do plantão"
                value={dataPlantao}
                onChangeText={(value) => setDataPlantao(formatDate(value))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
              />

              <TouchableOpacity activeOpacity={0.85} style={styles.addDateButton}>
                <Feather name="plus" size={16} color={BLUE} />
                <Text style={styles.addDateButtonText}>Adicionar mais dias e horários</Text>
              </TouchableOpacity>

              <AppInput
                label="Horário de entrada"
                value={horarioInicio}
                onChangeText={setHorarioInicio}
                placeholder="00:00"
              />

              <AppInput
                label="Horário de saída"
                value={horarioFim}
                onChangeText={setHorarioFim}
                placeholder="00:00"
              />

              <Text style={styles.fieldLabel}>Turno</Text>
              <View style={styles.chipsRowWrap}>
                {TURNOS.map((item) => {
                  const selected = turno === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.85}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => setTurno(item)}
                    >
                      <Text
                        style={[styles.chipText, selected && styles.chipTextSelected]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Tarefas do profissional</Text>
              <TextInput
                value={tarefas}
                onChangeText={setTarefas}
                placeholder="Mudança de decúbito a cada 2h. Banho no leito. Troca de fraldas. Alimentação. Medicamentos."
                placeholderTextColor="#97a6ba"
                multiline
                style={[styles.textArea, styles.tasksArea]}
              />

              <AppInput
                label="Valor do plantão (mín. R$ 140,00)"
                value={valorPlantao}
                onChangeText={setValorPlantao}
                placeholder="Ex: 350,00"
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Duração do anúncio (máx. 72h)</Text>
              <View style={styles.chipsRow}>
                {DURACOES.map((item) => {
                  const selected = duracao === item;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.85}
                      style={[styles.chip, selected && styles.chipSelectedStrong]}
                      onPress={() => setDuracao(item)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected && styles.chipTextSelectedStrong,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.durationHintRow}>
                <Feather name="clock" size={12} color="#97a6ba" />
                <Text style={styles.durationHintText}>
                  A vaga será automaticamente encerrada após 72h
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Feather name="info" size={14} color={INFO_TEXT} />
                <Text style={styles.infoBoxText}>
                  A plataforma cobra R$ 19,90 pela publicação. O pagamento do plantão é
                  feito diretamente ao profissional.
                </Text>
              </View>

              <View style={styles.footerActionsLast}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.backInline}
                  onPress={prevStep}
                >
                  <Feather name="arrow-left" size={16} color={BLUE} />
                  <Text style={styles.backInlineText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.primaryButtonFlex}
                  onPress={handlePublish}
                  disabled={saving}
                >
                  <Text style={styles.primaryButtonText}>
                    {saving ? "Publicando..." : "Publicar vaga"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showTituloModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTituloModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTituloModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Título do anúncio</Text>
              <Pressable onPress={() => setShowTituloModal(false)}>
                <Feather name="x" size={20} color={TEXT} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {TITULOS_ANUNCIO.map((item) => {
                const selected = tituloAnuncio === item;
                return (
                  <Pressable
                    key={item}
                    style={styles.modalItem}
                    onPress={() => {
                      setTituloAnuncio(item);
                      setShowTituloModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {selected ? <Feather name="check" size={18} color={BLUE} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <CustomModal
        visible={validationModal.visible}
        onClose={() =>
          setValidationModal({
            visible: false,
            title: "",
            message: "",
          })
        }
        title={validationModal.title}
        message={validationModal.message}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 12,
  },

  headerIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CLIENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  headerPriceBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerPriceText: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "700",
  },

  progressRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 10,
  },

  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 999,
  },

  stepLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
    marginBottom: 12,
  },

  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 2,
  },

  addressTitle: {
    fontSize: 13,
    lineHeight: 17,
    color: TEXT,
    fontWeight: "800",
  },

  addressSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  addressSwitchText: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  smallCol: {
    flex: 0.9,
  },

  largeCol: {
    flex: 1.3,
  },

  cityCol: {
    flex: 1.4,
  },

  ufCol: {
    flex: 0.6,
  },

  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 2,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  chipsRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  chip: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: CHIP_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  chipSelected: {
    backgroundColor: "#cfdcf1",
  },

  chipSelectedStrong: {
    backgroundColor: "#e6f0ff",
    borderWidth: 1.5,
    borderColor: BLUE,
  },

  chipText: {
    fontSize: 11,
    lineHeight: 14,
    color: CHIP_TEXT,
    fontWeight: "700",
  },

  chipTextSelected: {
    color: "#5f6f87",
  },

  chipTextSelectedStrong: {
    color: BLUE,
  },

  textArea: {
    width: "100%",
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: TEXT,
    marginBottom: 14,
    textAlignVertical: "top",
  },

  textAreaMedium: {
    minHeight: 94,
  },

  textAreaLarge: {
    minHeight: 108,
  },

  textAreaSmall: {
    minHeight: 82,
  },

  tasksArea: {
    minHeight: 96,
  },

  templateCard: {
    width: "100%",
    backgroundColor: "#eaf1fb",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dce7f5",
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  templateLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  templateIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#f3f7fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  templateTextBox: {
    flex: 1,
  },

  templateTitle: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "800",
    color: BLUE,
    marginBottom: 2,
  },

  templateSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "#7a8ba3",
    fontWeight: "500",
  },

  selectBox: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  selectText: {
    fontSize: 15,
    color: TEXT,
    fontWeight: "500",
    flex: 1,
    paddingRight: 12,
  },

  placeholderText: {
    color: "#97a6ba",
  },

  calendarBox: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },

  calendarHeader: {
    marginBottom: 12,
  },

  calendarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  calendarTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: BLUE,
  },

  calendarMonth: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  calendarWeekText: {
    width: 34,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  calendarDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f3f7fb",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarDayActive: {
    backgroundColor: "#d8f5df",
    borderWidth: 1,
    borderColor: CLIENT_GREEN,
  },

  calendarDayText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#7b8ba3",
    fontWeight: "700",
  },

  calendarDayTextActive: {
    color: CLIENT_HEADER,
  },

  addDateButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cfe0f3",
    backgroundColor: "#f5f9ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },

  addDateButtonText: {
    fontSize: 13,
    lineHeight: 16,
    color: BLUE,
    fontWeight: "700",
  },

  timeBox: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timePlaceholder: {
    fontSize: 15,
    color: "#97a6ba",
    fontWeight: "500",
  },

  durationHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -2,
    marginBottom: 12,
  },

  durationHintText: {
    fontSize: 11,
    lineHeight: 14,
    color: "#97a6ba",
    fontWeight: "500",
  },

  infoBox: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: INFO_BG,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 18,
  },

  infoBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: INFO_TEXT,
    fontWeight: "500",
  },

  singleButtonRow: {
    marginTop: 8,
  },

  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
    marginBottom: 8,
  },

  footerActionsLast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },

  backInline: {
    minHeight: 48,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  backInlineText: {
    fontSize: 15,
    lineHeight: 18,
    color: BLUE,
    fontWeight: "700",
  },

  primaryButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonFlex: {
    flex: 1,
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 17,
    lineHeight: 20,
    color: WHITE,
    fontWeight: "800",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modalCard: {
    width: "100%",
    maxHeight: "75%",
    borderRadius: 18,
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "800",
  },

  modalItem: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalItemText: {
    flex: 1,
    paddingRight: 12,
    fontSize: 15,
    color: TEXT,
    fontWeight: "500",
  },

  modalItemTextSelected: {
    color: BLUE,
    fontWeight: "700",
  },
});