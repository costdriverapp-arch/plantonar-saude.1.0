import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import colors, { gradientsByRole } from "@/constants/colors";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
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

function getFirstNameOnly(value?: string | null) {
  if (!value) return "Cliente";
  const first = value.trim().split(" ")[0];
  return first || "Cliente";
}

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

function isActiveVacancy(status?: string) {
  const normalized = (status || "").toLowerCase().trim();

  return (
    normalized === "ativa" ||
    normalized === "publicada" ||
    normalized === "publicado" ||
    normalized === "open" ||
    normalized === "em_andamento"
  );
}

function isDraftVacancy(status?: string) {
  return (status || "").toLowerCase().trim() === "rascunho";
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const {
    clientPlanType,
    clientCandidateLimit,
    clientJobDurationHours,
    myVacancies,
    loadMyVacancies,
  } = useApp();

  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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

  const firstName = getFirstNameOnly(
    user?.firstName ||
      (user as any)?.name ||
      (user as any)?.full_name ||
      user?.email?.split("@")[0]
  );

  const isPremium = clientPlanType === "monthly" || clientPlanType === "yearly";

  const vacancies = useMemo(
    () => ((myVacancies || []) as VacancyItem[]),
    [myVacancies]
  );

  const activeVacancies = useMemo(
    () => vacancies.filter((item) => isActiveVacancy(item.status)),
    [vacancies]
  );

  const latestDraft = useMemo(
    () => vacancies.find((item) => isDraftVacancy(item.status)) || null,
    [vacancies]
  );

  const featuredVacancy = activeVacancies[0] || latestDraft || null;
  const featuredStatusLabel = activeVacancies[0] ? "Vaga ativa" : "Último rascunho";

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientsByRole.client}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hero,
          { paddingTop: (Platform.OS === "web" ? 28 : insets.top) + 14 },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Olá, {firstName}</Text>
            <Text style={styles.heroSubtitle}>Painel do Cliente</Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: -2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Ionicons name="star" size={12} color={colors.light.warning} />
                <Ionicons name="star" size={12} color={colors.light.warning} />
                <Ionicons name="star" size={12} color={colors.light.warning} />
                <Ionicons name="star" size={12} color={colors.light.warning} />
                <Ionicons name="star" size={12} color={colors.light.warning} />
              </View>
              <Text style={styles.ratingText}>5,00</Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <TouchableOpacity
  style={styles.bellBtn}
  onPress={() => router.push("/client-notifications" as any)}
  activeOpacity={0.75}
>
  <Feather name="bell" size={20} color="#fff" />
</TouchableOpacity>

            <View style={styles.accountWrap}>
              <View style={styles.userCircle}>
                <Feather name="user" size={18} color="#fff" />
              </View>

              <View
                style={[
                  styles.accountStatusPill,
                  isPremium
                    ? styles.accountStatusPillPremium
                    : styles.accountStatusPillFree,
                ]}
              >
                <Feather
                  name={isPremium ? "award" : "shield"}
                  size={13}
                  color={isPremium ? colors.light.warning : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.accountStatusText,
                    isPremium
                      ? styles.accountStatusTextPremium
                      : styles.accountStatusTextFree,
                  ]}
                >
                  {isPremium ? "Premium" : "Conta Free"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="file-text" size={16} color="#DCFCE7" />
            <Text style={styles.statValue}>{activeVacancies.length}</Text>
            <Text style={styles.statLabel}>Publicadas</Text>
          </View>

          <View style={styles.statCard}>
            <Feather name="users" size={16} color="#DCFCE7" />
            <Text style={styles.statValue}>{clientCandidateLimit}</Text>
            <Text style={styles.statLabel}>Candidatos</Text>
          </View>

          <View style={styles.statCard}>
            <Feather name="clock" size={16} color="#DCFCE7" />
            <Text style={styles.statValue}>{clientJobDurationHours}h</Text>
            <Text style={styles.statLabel}>Validade</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {!isPremium && (
          <View style={styles.premiumAlert}>
            <View style={styles.premiumAlertTop}>
              <View style={styles.premiumAlertIcon}>
                <Feather name="star" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.premiumAlertTitle}>Plano Premium</Text>
                <Text style={styles.premiumAlertDesc}>
                  Tenha mais candidatos por anúncio e mais alcance nas suas vagas.
                </Text>
              </View>
            </View>

            <PrimaryButton
              title="Conhecer plano premium"
              onPress={() => router.push("/creditos" as any)}
              style={{ marginTop: 14 }}
            />
          </View>
        )}

        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.sectionExploreBtn}
            onPress={() => router.push("/(client)/my-vacancies" as any)}
            activeOpacity={0.75}
          >
            <Feather name="briefcase" size={18} color={colors.light.primary} />
            <Text style={styles.sectionExploreText}>Suas vagas ativas</Text>
            <Feather name="arrow-right" size={18} color={colors.light.primary} />
          </TouchableOpacity>
        </View>

        {featuredVacancy ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.vacancyCard}
            onPress={() => toggleExpand(featuredVacancy.id)}
          >
            <View style={styles.vacancyHeader}>
              <Text style={styles.vacancyTitle}>{getCardTitle(featuredVacancy)}</Text>

              <Text style={styles.vacancyPrice}>
                {formatCurrency(featuredVacancy.valor_plantao)}
              </Text>
            </View>

            <View style={styles.vacancyBadgesRow}>
              <View style={styles.vacancyBadge}>
                <Feather name="briefcase" size={14} color="#1f69c6" />
                <Text style={styles.vacancyBadgeText}>
                  {getTipoBadgeText(featuredVacancy)}
                </Text>
              </View>

              <View style={styles.vacancyBadge}>
                <Feather name="moon" size={14} color="#1f69c6" />
                <Text style={styles.vacancyBadgeText}>
                  {featuredVacancy.turno || "--"}
                </Text>
              </View>
            </View>

            <View style={styles.vacancyInfoRow}>
              <Feather name="map-pin" size={16} color="#6b7280" />
              <Text style={styles.vacancyInfoMain}>
                {[featuredVacancy.cidade, featuredVacancy.estado]
                  .filter(Boolean)
                  .join("/") || "--"}
              </Text>
            </View>

            <View style={styles.vacancyInfoRow}>
              <Feather name="map" size={16} color="#6b7280" />
              <Text style={styles.vacancyInfoSub}>
                Bairro: {featuredVacancy.bairro || "--"}
              </Text>
            </View>

            <View style={styles.vacancyInfoRow}>
              <Feather name="calendar" size={16} color="#6b7280" />
              <Text style={styles.vacancyInfoSub}>
                {formatDate(featuredVacancy.data_plantao)}
              </Text>
            </View>

            <View>
              <View style={styles.vacancyStatusLineRow}>
                <View style={styles.vacancyStatusLineLeft}>
                  <Feather name="clock" size={16} color="#6b7280" />
                  <Text style={styles.vacancyInfoSub}>
                    {getWorkHours(featuredVacancy)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.vacancyStatusBadge,
                    {
                      backgroundColor: getStatusBadgeInfo(featuredVacancy.status)
                        .backgroundColor,
                      borderColor: getStatusBadgeInfo(featuredVacancy.status)
                        .borderColor,
                      shadowColor: getStatusBadgeInfo(featuredVacancy.status)
                        .shadowColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.vacancyStatusBadgeText,
                      {
                        color: getStatusBadgeInfo(featuredVacancy.status).textColor,
                      },
                    ]}
                  >
                    {getStatusBadgeInfo(featuredVacancy.status).label}
                  </Text>
                </View>
              </View>

              <View style={styles.vacancyDivider} />
            </View>

            {expandedId === featuredVacancy.id && (
              <>
                <Text style={styles.vacancySectionTitle}>Descrição da Vaga</Text>
                <Text style={styles.vacancyDescription}>
                  {getDescriptionText(featuredVacancy)}
                </Text>

                <Text style={styles.vacancySectionTitle}>Patologias</Text>
                <Text style={styles.vacancyDescription}>
                  {(featuredVacancy as any).patologias || "--"}
                </Text>

                <Text style={styles.vacancySectionTitle}>Cuidados</Text>
                <Text style={styles.vacancyDescription}>
                  {(featuredVacancy as any).cuidados || "--"}
                </Text>

                <Text style={styles.vacancySectionTitle}>Particularidades</Text>
                <Text style={styles.vacancyDescription}>
                  {(featuredVacancy as any).particularidades || "--"}
                </Text>

                <Text style={styles.vacancySectionTitle}>Tarefas</Text>
                <Text style={styles.vacancyDescription}>
                  {getTasksText(featuredVacancy)}
                </Text>

                <View style={styles.vacancyDivider} />

                <Text style={styles.vacancySectionTitle}>Informações importantes</Text>

                {importantObservations.length > 0 ? (
                  <View style={styles.vacancyObservationsList}>
                    {importantObservations.map((observation, index) => (
                      <View
                        key={`${featuredVacancy.id}-important-observation-${index}`}
                        style={styles.vacancyObservationRow}
                      >
                        <Feather
                          name="check-circle"
                          size={16}
                          color={colors.light.primary}
                        />
                        <Text style={styles.vacancyObservationText}>
                          {observation}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.vacancyDescription}>--</Text>
                )}

                <View style={styles.vacancyActionsRow}>
                  <TouchableOpacity
                    style={styles.vacancyEditButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.vacancyEditButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.vacancyPublishButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.vacancyPublishButtonText}>Publicar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={40} color={colors.light.border} />
            <Text style={styles.emptyTitle}>Nenhuma vaga ativa</Text>
            <Text style={styles.emptyDesc}>
              Você ainda não possui vagas ativas nem rascunhos salvos.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },

  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "500",
  },

  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.light.warning,
  },

  heroRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  accountWrap: {
    alignItems: "center",
  },

  accountStatusPill: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  accountStatusPillPremium: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  accountStatusPillFree: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },

  accountStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  accountStatusTextPremium: {
    color: "#FFFFFF",
  },

  accountStatusTextFree: {
    color: "#FFFFFF",
  },

  userCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 92,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },

  statLabel: {
    color: "#DCFCE7",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  premiumAlert: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },

  premiumAlertTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  premiumAlertIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  premiumAlertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.light.foreground,
  },

  premiumAlertDesc: {
    marginTop: 4,
    fontSize: 13,
    color: colors.light.mutedForeground,
    lineHeight: 18,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionExploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light.accent,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  sectionExploreText: {
    flex: 1,
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  vacancyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  vacancyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 12,
  },

  vacancyTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  vacancyPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#16a34a",
  },

  vacancyBadgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },

  vacancyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e8f0fb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  vacancyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1f69c6",
  },

  vacancyInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  vacancyInfoMain: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  vacancyInfoSub: {
    fontSize: 14,
    color: "#6b7280",
  },

  vacancyStatusLineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  vacancyStatusLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  vacancyStatusBadge: {
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

  vacancyStatusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  vacancySectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  vacancyDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },

  vacancyObservationsList: {
    marginTop: 2,
  },

  vacancyObservationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },

  vacancyObservationText: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },

  vacancyActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  vacancyEditButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },

  vacancyEditButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a",
  },

  vacancyPublishButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },

  vacancyPublishButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  vacancyDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.light.foreground,
  },

  emptyDesc: {
    fontSize: 13,
    color: colors.light.mutedForeground,
    textAlign: "center",
  },
});