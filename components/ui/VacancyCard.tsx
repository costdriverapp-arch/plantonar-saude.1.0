import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { JobVacancy } from "@/types";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

interface VacancyCardProps {
  vacancy: JobVacancy;
  onApply?: () => void;
  onCounterProposal?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

function formatCurrency(value?: number | string | null): string {
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

function getWorkHours(vacancy: JobVacancy) {
  const inicio = formatHour(vacancy.horario_inicio);
  const fim = formatHour(vacancy.horario_fim);

  if (inicio === "--" && fim === "--") return "--";
  if (inicio !== "--" && fim !== "--") return `Horário: ${inicio} às ${fim}`;
  return `Horário: ${inicio !== "--" ? inicio : fim}`;
}

function getCardTitle(vacancy: JobVacancy) {
  return (
    vacancy.titulo_personalizado ||
    vacancy.titulo_anuncio ||
    vacancy.nome_paciente ||
    "Vaga sem título"
  );
}

function getDescriptionText(vacancy: JobVacancy) {
  return (
    vacancy.descricao ||
    (vacancy as any).description ||
    (vacancy as any).descricao_vaga ||
    (vacancy as any).descricao_anuncio ||
    (vacancy as any).observacoes ||
    "--"
  );
}

function getTasksText(vacancy: JobVacancy) {
  return (
    vacancy.tarefas ||
    vacancy.cuidados ||
    (vacancy as any).tasks ||
    (vacancy as any).tarefas_descricao ||
    (vacancy as any).atividades ||
    "--"
  );
}

function getTipoBadgeText(vacancy: JobVacancy) {
  if (vacancy.tipo_vaga && vacancy.turno) {
    return `${vacancy.tipo_vaga} · ${vacancy.turno}`;
  }

  return vacancy.tipo_vaga || vacancy.turno || "--";
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

export function VacancyCard({
  vacancy,
  onApply,
  onCounterProposal,
  showActions = true,
  compact = false,
}: VacancyCardProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const title = useMemo(() => getCardTitle(vacancy), [vacancy]);
  const description = useMemo(() => getDescriptionText(vacancy), [vacancy]);
  const tasks = useMemo(() => getTasksText(vacancy), [vacancy]);
  const statusBadge = useMemo(
    () => getStatusBadgeInfo((vacancy as any).status),
    [vacancy]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: "#e9d5ff",
        },
      ]}
      onPress={() => setExpanded((prev) => !prev)}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

        <Text style={styles.price}>{formatCurrency(vacancy.valor_plantao)}</Text>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Feather name="briefcase" size={14} color="#7c3aed" />
          <Text style={styles.badgeText}>{getTipoBadgeText(vacancy)}</Text>
        </View>

        <View style={styles.badge}>
          <Feather name="moon" size={14} color="#7c3aed" />
          <Text style={styles.badgeText}>{vacancy.turno || "--"}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map-pin" size={16} color="#6b7280" />
        <Text style={[styles.infoMain, { color: colors.foreground }]}>
          {[vacancy.cidade, vacancy.estado].filter(Boolean).join("/") || "--"}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map" size={16} color="#6b7280" />
        <Text style={styles.infoSub}>Bairro: {vacancy.bairro || "--"}</Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="calendar" size={16} color="#6b7280" />
        <Text style={styles.infoSub}>{formatDate(vacancy.data_plantao)}</Text>
      </View>

      <View>
        <View style={styles.statusLineRow}>
          <View style={styles.statusLineLeft}>
            <Feather name="clock" size={16} color="#6b7280" />
            <Text style={styles.infoSub}>{getWorkHours(vacancy)}</Text>
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
              style={[styles.statusBadgeText, { color: statusBadge.textColor }]}
            >
              {statusBadge.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />
      </View>

      {!compact && expanded && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Descrição da Vaga
          </Text>
          <Text style={styles.description}>{description}</Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Patologias
          </Text>
          <Text style={styles.description}>
            {(vacancy as any).patologias || "--"}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Cuidados
          </Text>
          <Text style={styles.description}>
            {(vacancy as any).cuidados || "--"}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Particularidades
          </Text>
          <Text style={styles.description}>
            {(vacancy as any).particularidades || "--"}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Informações importantes
          </Text>
          <Text style={styles.description}>
            {(vacancy as any).important_observations?.length
              ? (vacancy as any).important_observations.join(" • ")
              : "--"}
          </Text>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Tarefas
          </Text>
          <Text style={styles.description}>{tasks}</Text>

          {showActions && (
            <View style={styles.actionsRow}>
              <PrimaryButton
                title="Contraproposta"
                onPress={onCounterProposal || (() => {})}
                variant="secondary"
                style={styles.actionBtn}
              />

              <PrimaryButton
                title="Candidatar"
                onPress={onApply || (() => {})}
                style={styles.actionBtn}
              />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
  },

  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#7c3aed",
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
    color: "#7c3aed",
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
  },

  infoSub: {
    fontSize: 14,
    color: "#6b7280",
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

  divider: {
    height: 1,
    backgroundColor: "#e9d5ff",
    marginVertical: 12,
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  actionBtn: {
    flex: 1,
  },
});