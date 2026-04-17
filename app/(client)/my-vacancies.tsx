import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

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
};

const CLIENT_PRIMARY = "#16a34a";
const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const BLUE = "#1f69c6";

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

export default function MyVacanciesScreen() {
  const { myVacancies, loadMyVacancies } = useApp();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [importantObservations, setImportantObservations] = useState<string[]>(
    []
  );

  useEffect(() => {
    loadMyVacancies();
  }, []);

  useEffect(() => {
    async function loadImportantObservations() {
      if (!user?.id) {
        setImportantObservations([]);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("important_observations")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        setImportantObservations([]);
        return;
      }

      const raw = data?.important_observations;

      if (Array.isArray(raw)) {
        setImportantObservations(
          raw.filter((item) => typeof item === "string" && item.trim().length > 0)
        );
        return;
      }

      setImportantObservations([]);
    }

    loadImportantObservations();
  }, [user?.id]);

  const vacancies = useMemo(
    () => ((myVacancies || []) as VacancyItem[]),
    [myVacancies]
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.resolve(loadMyVacancies());
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderEmptyState = () => {
    return (
      <View style={[styles.emptyCard, { marginBottom: insets.bottom + 24 }]}>
        <Text style={styles.emptyTitle}>Nenhuma vaga criada</Text>

        <PrimaryButton
          title="Criar vaga"
          onPress={() => router.push("/(client)/create-vacancy")}
          style={styles.emptyButton}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Minhas vagas" showBack />

      <FlatList
        data={vacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          vacancies.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
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
                <Text style={styles.infoSub}>{formatDate(item.data_plantao)}</Text>
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

                  <Text style={styles.sectionTitle}>Tarefas</Text>
                  <Text style={styles.description}>{tasks}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.sectionTitle}>Informações importantes</Text>

                  {importantObservations.length > 0 ? (
                    <View style={styles.observationsList}>
                      {importantObservations.map((observation, index) => (
                        <View
                          key={`${item.id}-important-observation-${index}`}
                          style={styles.observationRow}
                        >
                          <Feather
                            name="check-circle"
                            size={16}
                            color={CLIENT_PRIMARY}
                          />
                          <Text style={styles.observationText}>{observation}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.description}>--</Text>
                  )}

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.editButtonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.publishButton}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.publishButtonText}>Publicar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>
          );
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

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
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
    marginBottom: 12,
  },

  emptyButton: {
    width: "100%",
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
    color: CLIENT_PRIMARY,
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
    backgroundColor: "#e8f0fb",
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

  observationsList: {
    marginTop: 2,
  },

  observationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  observationText: {
    flex: 1,
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
    borderColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  publishButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: CLIENT_PRIMARY,
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
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
});