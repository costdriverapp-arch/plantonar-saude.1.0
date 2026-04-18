import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { criarCandidatura } from "@/lib/services/vaga-candidatura-service";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";


type WorkTypeFilter = "Todos" | "Plantão" | "Fixo";

type VacancyItem = {
  id: string;
  status?: string;
  titulo_anuncio?: string;
  titulo_personalizado?: string;
  nome_paciente?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_plantao?: string;
  horario_inicio?: string;
  horario_fim?: string;
  valor_plantao?: number | string | null;
  applicationsCount?: number;
  is_public?: boolean;
  pagamento_liberado?: boolean;
  tipo_vaga?: string;
  turno?: string;
  solicitante_nome?: string;
  descricao?: string;
  tarefas?: string;
  cuidados?: string;
  patologias?: string;
  particularidades?: string;
  value?: number;
};

const PROFESSIONAL_PRIMARY = "#7c3aed";
const BG = "#f8f5ff";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e9d5ff";
const BLUE = "#7c3aed";

function formatCurrency(value?: number | string | null) {
  const numericValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : value;

  if (numericValue == null || Number.isNaN(numericValue)) {
    return "R$ 0,00";
  }

  return Number(numericValue).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string) {
  if (!value) return "--";

  const raw = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = raw.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatHour(value?: string) {
  if (!value) return "--";
  return value.slice(0, 5);
}

function getWorkHours(item: VacancyItem) {
  const inicio = formatHour(item.horario_inicio);
  const fim = formatHour(item.horario_fim);

  if (inicio === "--" && fim === "--") return "--";
  if (inicio !== "--" && fim !== "--") return `Horário: ${inicio} às ${fim}`;
  return `Horário: ${inicio !== "--" ? inicio : fim}`;
}

function getCardTitle(item: VacancyItem) {
  return (
    item.titulo_personalizado ||
    item.titulo_anuncio ||
    item.nome_paciente ||
    "Vaga sem título"
  );
}

function getDescriptionText(item: VacancyItem) {
  return (
    item.descricao ||
    (item as any).description ||
    (item as any).descricao_vaga ||
    (item as any).descricao_anuncio ||
    (item as any).observacoes ||
    "--"
  );
}

function getTasksText(item: VacancyItem) {
  return (
    item.tarefas ||
    item.cuidados ||
    (item as any).tasks ||
    (item as any).tarefas_descricao ||
    (item as any).atividades ||
    "--"
  );
}

function getTipoBadgeText(item: VacancyItem) {
  if (item.tipo_vaga && item.turno) {
    return `${item.tipo_vaga} · ${item.turno}`;
  }

  return item.tipo_vaga || item.turno || "--";
}

function getStatusBadgeInfo(status?: string) {
  const normalized = (status || "").toLowerCase().trim();

  if (normalized === "rascunho") {
    return {
      label: "Rascunho",
      textColor: "#c2410c",
      backgroundColor: "#ffedd5",
      borderColor: "#fdba74",
      shadowColor: "#fb923c",
    };
  }

  if (
    normalized === "ativa" ||
    normalized === "publicada" ||
    normalized === "publicado" ||
    normalized === "open"
  ) {
    return {
      label: "Publicado",
      textColor: "#166534",
      backgroundColor: "#dcfce7",
      borderColor: "#86efac",
      shadowColor: "#4ade80",
    };
  }

  if (
    normalized === "encerrada" ||
    normalized === "cancelada" ||
    normalized === "cancelado" ||
    normalized === "expirada" ||
    normalized === "preenchida" ||
    normalized === "filled"
  ) {
    return {
      label: "Encerrada",
      textColor: "#b91c1c",
      backgroundColor: "#fee2e2",
      borderColor: "#fca5a5",
      shadowColor: "#f87171",
    };
  }

  if (normalized === "em_andamento") {
    return {
      label: "Em andamento",
      textColor: "#7c3aed",
      backgroundColor: "#ede9fe",
      borderColor: "#c4b5fd",
      shadowColor: "#a78bfa",
    };
  }

  if (normalized === "concluida" || normalized === "concluída") {
    return {
      label: "Concluída",
      textColor: "#0f766e",
      backgroundColor: "#ccfbf1",
      borderColor: "#99f6e4",
      shadowColor: "#5eead4",
    };
  }

  return {
    label: status || "--",
    textColor: "#475569",
    backgroundColor: "#f1f5f9",
    borderColor: "#cbd5e1",
    shadowColor: "#94a3b8",
  };
}

function getWorkTypeLabel(item: VacancyItem): "Plantão" | "Fixo" {
  const raw = String(
    item.tipo_vaga ??
      (item as any)?.workType ??
      (item as any)?.vacancyType ??
      (item as any)?.type ??
      (item as any)?.jobType ??
      ""
  )
    .trim()
    .toLowerCase();

  if (
    raw.includes("fixo") ||
    raw.includes("clt") ||
    raw.includes("efetivo") ||
    raw.includes("mensal")
  ) {
    return "Fixo";
  }

  return "Plantão";
}

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "R$ 0,00";

  const numericValue = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function currencyInputToNumber(value: string): number {
  const digits = value.replace(/\D/g, "");

  if (!digits) return 0;

  return Number(digits) / 100;
}

function getVacancyNumericValue(item: VacancyItem): number {
  if (typeof item.valor_plantao === "number") return item.valor_plantao;

  if (typeof item.valor_plantao === "string") {
    const parsed = Number(item.valor_plantao.replace(",", "."));
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (typeof item.value === "number") return item.value;

  return 0;
}

export default function ProfessionalVacanciesScreen() {
const {
  vacancies,
  credits,
  myApplications,
  applyToVacancy,
  cancelApplication,
  loadVacancies,
  loadMyApplications,
} = useApp();
const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedUf, setSelectedUf] = useState("Todos");
  const [selectedWorkType, setSelectedWorkType] =
    useState<WorkTypeFilter>("Todos");

  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(
    null
  );
  const [counterValue, setCounterValue] = useState("R$ 0,00");
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCounterInvalidModal, setShowCounterInvalidModal] = useState(false);
  const [counterInvalidMessage, setCounterInvalidMessage] = useState("");
  const [isWithCounter, setIsWithCounter] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const counterRef = useRef<TextInput>(null);

   useFocusEffect(
    useCallback(() => {
      loadVacancies();
      loadMyApplications();
    }, [loadVacancies, loadMyApplications])
  );

  const vacancyList = useMemo(
    () => ((vacancies || []) as VacancyItem[]),
    [vacancies]
  );

  const ufOptions = useMemo(() => {
    const set = new Set<string>();

    vacancyList.forEach((item) => {
      const uf = String(item.estado ?? "").trim().toUpperCase();
      if (uf) set.add(uf);
    });

    return ["Todos", ...Array.from(set).sort()];
  }, [vacancyList]);

  const filteredVacancies = useMemo(() => {
    return vacancyList.filter((item) => {
      const vacancyUf = String(item.estado ?? "").trim().toUpperCase();
      const workType = getWorkTypeLabel(item);

      const matchUf = selectedUf === "Todos" || vacancyUf === selectedUf;
      const matchWorkType =
        selectedWorkType === "Todos" || workType === selectedWorkType;

      return matchUf && matchWorkType;
    });
  }, [vacancyList, selectedUf, selectedWorkType]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.resolve(loadVacancies());
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleApply = (vacancy: VacancyItem) => {
    setSelectedVacancy(vacancy);

    if ((credits ?? 0) < 1) {
      setShowNoCreditsModal(true);
      return;
    }

    setIsWithCounter(false);
    setShowConfirmModal(true);
  };
    const handleAskCancelApplication = (vacancyId: string) => {
    const activeApplication = myApplications.find(
      (application: any) =>
        application.vaga_id === vacancyId && application.status === "pending"
    );

    if (!activeApplication?.id) return;

    setSelectedVacancy(
      vacancyList.find((vacancy) => vacancy.id === vacancyId) || null
    );
    setSelectedApplicationId(activeApplication.id);
    setShowCancelConfirmModal(true);
  };

  const handleCounterProposal = (vacancy: VacancyItem) => {
    setSelectedVacancy(vacancy);

    if ((credits ?? 0) < 1) {
      setShowNoCreditsModal(true);
      return;
    }

    setCounterValue("R$ 0,00");
    setShowCounterModal(true);

    setTimeout(() => {
      counterRef.current?.focus();
    }, 150);
  };

  const handleCounterSubmit = () => {
    if (!selectedVacancy) return;

    const val = currencyInputToNumber(counterValue);
    const vacancyValue = getVacancyNumericValue(selectedVacancy);

    if (val < 140) {
      setCounterInvalidMessage("A contraproposta não pode ser inferior a R$ 140,00.");
      setShowCounterInvalidModal(true);
      return;
    }

    if (val === vacancyValue) {
      setCounterInvalidMessage("A contraproposta não pode ser igual ao valor da vaga.");
      setShowCounterInvalidModal(true);
      return;
    }

    setShowCounterModal(false);
    setIsWithCounter(true);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
  if (!selectedVacancy) return;

  try {
    setShowConfirmModal(false);
    setLoading(true);

    const counterVal = isWithCounter
      ? currencyInputToNumber(counterValue)
      : undefined;

   const result = await applyToVacancy(selectedVacancy.id, counterVal);

  if (result?.success) {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  setShowSuccessModal(true);
} else {
  console.log("CRIAR CANDIDATURA RESULT:", result);
  setCounterInvalidMessage(result?.error || "Erro ao se candidatar.");
  setShowCounterInvalidModal(true);
}
  } catch (error) {
  console.log("ERRO CANDIDATURA:", error);
  setCounterInvalidMessage("Erro ao se candidatar.");
  setShowCounterInvalidModal(true);
} finally {
    setLoading(false);
  }
};
  const handleConfirmCancelApplication = async () => {
    if (!selectedApplicationId) return;

    try {
      setShowCancelConfirmModal(false);
      setLoading(true);

      await cancelApplication(selectedApplicationId);
      await loadMyApplications();
      await loadVacancies();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCancelSuccessModal(true);
      setSelectedApplicationId(null);
    } catch (error) {
      console.log("ERRO AO CANCELAR CANDIDATURA:", error);
      setCounterInvalidMessage("Erro ao desistir da vaga.");
      setShowCounterInvalidModal(true);
    } finally {
      setLoading(false);
    }
  };

  const headerRightContent = (
    <View style={styles.headerRight}>
      <View style={styles.creditsBox}>
        <Feather name="star" size={13} color="#fbbf24" />
        <Text style={styles.creditsText}>
          {credits ?? 0} crédito{credits !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Filtrar por UF</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {ufOptions.map((uf) => {
            const active = selectedUf === uf;

            return (
              <TouchableOpacity
                key={uf}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => setSelectedUf(uf)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {uf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Tipo de vaga</Text>

        <View style={styles.subFilterRow}>
          {(["Todos", "Plantão", "Fixo"] as WorkTypeFilter[]).map((type) => {
            const active = selectedWorkType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.subChip,
                  active ? styles.subChipActive : styles.subChipInactive,
                ]}
                onPress={() => setSelectedWorkType(type)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.subChipText,
                    active
                      ? styles.subChipTextActive
                      : styles.subChipTextInactive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filteredVacancies.length} vaga
          {filteredVacancies.length !== 1 ? "s" : ""} encontrada
          {filteredVacancies.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    return (
      <View style={[styles.emptyCard, { marginBottom: insets.bottom + 24 }]}>
        <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Vagas disponíveis"
        showBack
        rightContent={headerRightContent}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={PROFESSIONAL_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={filteredVacancies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            filteredVacancies.length === 0 && styles.listContentEmpty,
            { paddingBottom: bottomPad + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => {
            const title = getCardTitle(item);
            const description = getDescriptionText(item);
            const tasks = getTasksText(item);
            const isExpanded = expandedId === item.id;
            const statusBadge = getStatusBadgeInfo(item.status);

            const activeApplication = myApplications.find(
              (application: any) =>
                application.vaga_id === item.id && application.status === "pending"
            );
            const hasActiveApplication = !!activeApplication;

            return (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>

                  <Text style={styles.price}>
                    {formatCurrency(item.valor_plantao)}
                  </Text>
                </View>

                <View style={styles.badgesRow}>
                  <View style={styles.badge}>
                    <Feather name="briefcase" size={14} color={BLUE} />
                    <Text style={styles.badgeText}>{getTipoBadgeText(item)}</Text>
                  </View>

                  <View style={styles.badge}>
                    <Feather name="moon" size={14} color={BLUE} />
                    <Text style={styles.badgeText}>{item.turno || "--"}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={16} color={MUTED} />
                  <Text style={styles.infoMain}>
                    {[item.cidade, item.estado].filter(Boolean).join("/") || "--"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="map" size={16} color={MUTED} />
                  <Text style={styles.infoSub}>
                    Bairro: {item.bairro || "--"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Feather name="calendar" size={16} color={MUTED} />
                  <Text style={styles.infoSub}>
                    {formatDate(item.data_plantao)}
                  </Text>
                </View>

                <View>
                  <View style={styles.statusLineRow}>
                    <View style={styles.statusLineLeft}>
                      <Feather name="clock" size={16} color={MUTED} />
                      <Text style={styles.infoSub}>{getWorkHours(item)}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusBadge.backgroundColor,
                          borderColor: statusBadge.borderColor,
                          shadowColor: statusBadge.shadowColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusBadge.textColor },
                        ]}
                      >
                        {statusBadge.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />
                </View>

                {isExpanded && (
                  <>
                    <Text style={styles.sectionTitle}>Descrição da Vaga</Text>
                    <Text style={styles.description}>{description}</Text>

                    <Text style={styles.sectionTitle}>Patologias</Text>
                    <Text style={styles.description}>
                      {(item as any).patologias || "--"}
                    </Text>

                    <Text style={styles.sectionTitle}>Cuidados</Text>
                    <Text style={styles.description}>
                      {(item as any).cuidados || "--"}
                    </Text>

                   <Text style={styles.sectionTitle}>Particularidades</Text>
<Text style={styles.description}>
  {(item as any).particularidades || "--"}
</Text>

<Text style={styles.sectionTitle}>Informações importantes</Text>
<Text style={styles.description}>
  {(item as any).important_observations?.length
    ? (item as any).important_observations.join(" • ")
    : "--"}
</Text>

<Text style={styles.sectionTitle}>Tarefas</Text>
<Text style={styles.description}>{tasks}</Text>

                                      <View style={styles.actionsRow}>
  {hasActiveApplication ? (
    <TouchableOpacity
      style={styles.publishButton}
      activeOpacity={0.85}
      onPress={() => handleAskCancelApplication(item.id)}
    >
      <Text style={styles.publishButtonText}>Desistir da vaga</Text>
    </TouchableOpacity>
  ) : (
    <>
      <TouchableOpacity
        style={styles.editButton}
        activeOpacity={0.85}
        onPress={() => handleCounterProposal(item)}
      >
        <Text style={styles.editButtonText}>Contraproposta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.publishButton}
        activeOpacity={0.85}
        onPress={() => handleApply(item)}
      >
        <Text style={styles.publishButtonText}>Candidatar</Text>
      </TouchableOpacity>
    </>
  )}
</View>
                  </>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <AppModal
        visible={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        title="Sem créditos"
        message="Você não possui créditos suficientes para se candidatar a esta vaga."
        type="info"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowNoCreditsModal(false),
        }}
      />

      <AppModal
        visible={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title="Contraproposta"
        message={`Vaga: ${
          selectedVacancy
            ? formatCurrency(getVacancyNumericValue(selectedVacancy))
            : "R$ 0,00"
        }`}
        type="confirm"
        secondaryAction={{
          label: "Cancelar",
          onPress: () => setShowCounterModal(false),
        }}
        primaryAction={{
          label: "Confirmar",
          onPress: handleCounterSubmit,
        }}
      >
        <View style={styles.counterInputWrap}>
          <Text style={styles.counterLabel}>Informe sua contraproposta</Text>

          <View style={styles.counterInputBox}>
            <TextInput
              ref={counterRef}
              value={counterValue}
              onChangeText={(text) => setCounterValue(formatCurrencyInput(text))}
              keyboardType="numeric"
              placeholder="R$ 0,00"
              placeholderTextColor="#a78bfa"
              style={styles.counterInput}
              selectTextOnFocus
            />
          </View>

          <Text style={styles.counterHint}>
            Mínimo: R$ 140,00 e diferente do valor da vaga.
          </Text>
        </View>
      </AppModal>

      <AppModal
        visible={showCounterInvalidModal}
        onClose={() => setShowCounterInvalidModal(false)}
        title="Valor inválido"
        message={counterInvalidMessage}
        type="error"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowCounterInvalidModal(false),
        }}
      />

      <AppModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar candidatura"
        message={
          isWithCounter
            ? `Você está se candidatando à vaga "${selectedVacancy ? getCardTitle(selectedVacancy) : ""}" com contraproposta de ${counterValue}. Isso usará 1 crédito.`
            : `Você está se candidatando à vaga "${selectedVacancy ? getCardTitle(selectedVacancy) : ""}". Isso usará 1 crédito.`
        }
        type="confirm"
        secondaryAction={{
          label: "Cancelar",
          onPress: () => setShowConfirmModal(false),
        }}
        primaryAction={{
          label: "Confirmar",
          onPress: handleConfirm,
        }}
      />

      <AppModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Candidatura enviada!"
        message="Sua candidatura foi registrada com sucesso. O cliente entrará em contato se você for selecionado."
        type="success"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowSuccessModal(false),
        }}
      />

            <AppModal
        visible={showCancelConfirmModal}
        onClose={() => setShowCancelConfirmModal(false)}
        title="Desistir da vaga"
        message={`Você deseja desistir da vaga "${
          selectedVacancy ? getCardTitle(selectedVacancy) : ""
        }"? O seu crédito será restituído.`}
        type="confirm"
        secondaryAction={{
          label: "Voltar",
          onPress: () => setShowCancelConfirmModal(false),
        }}
        primaryAction={{
          label: "Desistir",
          onPress: handleConfirmCancelApplication,
        }}
      />

      <AppModal
        visible={showCancelSuccessModal}
        onClose={() => setShowCancelSuccessModal(false)}
        title="Candidatura cancelada"
        message="Você desistiu da vaga e seu crédito foi restituído. A vaga voltou ao estado original para você."
        type="success"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowCancelSuccessModal(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  creditsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  creditsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },

  listHeader: {
    paddingBottom: 10,
  },

  filtersBlock: {
    marginBottom: 14,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4c1d95",
    marginBottom: 10,
  },

  chipsRow: {
    paddingRight: 8,
    gap: 8,
  },

  chip: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  chipActive: {
    backgroundColor: PROFESSIONAL_PRIMARY,
    borderColor: PROFESSIONAL_PRIMARY,
  },

  chipInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd6fe",
  },

  chipText: {
    fontSize: 14,
    fontWeight: "700",
  },

  chipTextActive: {
    color: "#ffffff",
  },

  chipTextInactive: {
    color: "#5b21b6",
  },

  subFilterRow: {
    flexDirection: "row",
    gap: 8,
  },

  subChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  subChipActive: {
    backgroundColor: PROFESSIONAL_PRIMARY,
    borderColor: PROFESSIONAL_PRIMARY,
  },

  subChipInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd6fe",
  },

  subChipText: {
    fontSize: 14,
    fontWeight: "700",
  },

  subChipTextActive: {
    color: "#ffffff",
  },

  subChipTextInactive: {
    color: "#5b21b6",
  },

  resultsRow: {
    marginBottom: 6,
  },

  resultsText: {
    fontSize: 13,
    color: "#7c3aed",
    fontWeight: "600",
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: PROFESSIONAL_PRIMARY,
  },

  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BLUE,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  infoMain: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  infoSub: {
    fontSize: 14,
    color: MUTED,
  },

  statusLineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  statusLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  statusBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  description: {
    fontSize: 14,
    color: MUTED,
    lineHeight: 22,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: PROFESSIONAL_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFESSIONAL_PRIMARY,
  },

  publishButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: PROFESSIONAL_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  publishButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  divider: {
    height: 1,
    backgroundColor: "#e9d5ff",
    marginVertical: 12,
  },

  counterInputWrap: {
    width: "100%",
  },

  counterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e1065",
    marginBottom: 8,
  },

  counterInputBox: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#d8b4fe",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  counterInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e1065",
  },

  counterHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#7c3aed",
  },
});