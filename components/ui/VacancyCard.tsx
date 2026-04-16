import React from "react";
import { StyleSheet, Text, View } from "react-native";
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

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatShiftDate(value?: string): string {
  if (!value) return "";

  const raw = String(value).trim();

  const weekdays = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const [, dd, mm, yyyy] = brMatch;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(date.getTime())) {
      return `${dd}/${mm}/${yyyy} - ${weekdays[date.getDay()]}`;
    }
    return raw;
  }

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(date.getTime())) {
      return `${dd}/${mm}/${yyyy} - ${weekdays[date.getDay()]}`;
    }
    return raw;
  }

  return raw;
}

function getShiftLabel(vacancy: JobVacancy): "Diurno" | "Noturno" {
  const raw =
    String(
      (vacancy as any)?.shiftType ??
        (vacancy as any)?.period ??
        (vacancy as any)?.turno ??
        (vacancy as any)?.dayPeriod ??
        ""
    )
      .trim()
      .toLowerCase();

  if (raw.includes("not")) return "Noturno";
  if (raw.includes("diu") || raw.includes("day")) return "Diurno";

  const hours = String((vacancy as any)?.workHours ?? "");
  const startMatch = hours.match(/(\d{1,2})[:hH]?(\d{2})?/);

  if (startMatch) {
    const hour = Number(startMatch[1]);
    if (!Number.isNaN(hour)) {
      return hour >= 18 || hour <= 5 ? "Noturno" : "Diurno";
    }
  }

  return "Diurno";
}

function getWorkTypeLabel(vacancy: JobVacancy): "Plantão" | "Fixo" {
  const raw =
    String(
      (vacancy as any)?.workType ??
        (vacancy as any)?.vacancyType ??
        (vacancy as any)?.type ??
        (vacancy as any)?.jobType ??
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

export function VacancyCard({
  vacancy,
  onApply,
  onCounterProposal,
  showActions = true,
  compact = false,
}: VacancyCardProps) {
  const colors = useColors();
  const shiftLabel = getShiftLabel(vacancy);
  const workTypeLabel = getWorkTypeLabel(vacancy);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {vacancy.title}
        </Text>
        <Text style={[styles.value, { color: colors.success }]}>
          {formatCurrency(vacancy.value)}
        </Text>
      </View>

      <View style={styles.badgesRow}>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Feather name="briefcase" size={12} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            {vacancy.profession} · {workTypeLabel}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: "#EEF2FF" }]}>
          <Feather
            name={shiftLabel === "Noturno" ? "moon" : "sun"}
            size={12}
            color="#1e40af"
          />
          <Text style={[styles.badgeText, { color: "#1e40af" }]}>{shiftLabel}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map-pin" size={14} color={colors.mutedForeground} />
        <Text style={[styles.cityText, { color: colors.foreground }]}>
          {vacancy.city}/{vacancy.state}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Bairro: {vacancy.neighborhood} | CEP: {vacancy.cep}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="calendar" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          {formatShiftDate(vacancy.shiftDate)}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="clock" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Horário: {vacancy.workHours}
        </Text>
      </View>

      {!compact && (
        <>
          <Text style={[styles.descLabel, { color: colors.foreground }]}>Descrição</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={3}>
            {vacancy.description}
          </Text>

          <Text style={[styles.descLabel, { color: colors.foreground }]}>Tarefas</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={3}>
            {vacancy.tasks}
          </Text>
        </>
      )}

      {showActions && (
        <View style={styles.actions}>
          <PrimaryButton
            title="Contraproposta"
            onPress={onCounterProposal || (() => {})}
            variant="secondary"
            style={styles.actionBtn}
          />

          <PrimaryButton
            title="Candidatar-se"
            onPress={onApply || (() => {})}
            style={styles.actionBtn}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },

  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },

  value: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },

  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: "48%",
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    flexShrink: 1,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 5,
  },

  cityText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    lineHeight: 19,
  },

  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  descLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },

  desc: {
    fontSize: 13,
    lineHeight: 18,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  actionBtn: {
    flex: 1,
  },
});