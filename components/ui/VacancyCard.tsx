import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { JobVacancy } from "@/types";

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

export function VacancyCard({ vacancy, onApply, onCounterProposal, showActions = true, compact = false }: VacancyCardProps) {
  const colors = useColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Feather name="briefcase" size={12} color={colors.primary} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>{vacancy.profession}</Text>
        </View>
        <Text style={[styles.value, { color: colors.success }]}>{formatCurrency(vacancy.value)}</Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>{vacancy.title}</Text>

      <View style={styles.infoRow}>
        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          {vacancy.city}/{vacancy.state} • {vacancy.neighborhood} • CEP: {vacancy.cep}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Feather name="clock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          {vacancy.workHours} • {vacancy.shiftDate}
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
          <TouchableOpacity
            style={[styles.counterBtn, { borderColor: colors.primary }]}
            onPress={onCounterProposal}
            activeOpacity={0.8}
          >
            <Text style={[styles.counterBtnText, { color: colors.primary }]}>Contraproposta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary }]}
            onPress={onApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyBtnText}>Candidatar-se</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 4,
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
  counterBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  applyBtn: {
    flex: 1,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
