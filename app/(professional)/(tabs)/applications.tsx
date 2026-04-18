import React, { useEffect } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { AppHeader } from "@/components/ui/AppHeader";
import { CustomModal } from "@/components/ui/CustomModal";
import { useApp } from "@/context/AppContext";
import { Application } from "@/types";

const statusInfo = {
  pending: { label: "Aguardando", color: "#f59e0b", icon: "clock" as const },
  accepted: { label: "Aceita", color: "#16a34a", icon: "check-circle" as const },
  rejected: { label: "Recusada", color: "#ef4444", icon: "x-circle" as const },
  cancelled: { label: "Cancelada", color: "#94a3b8", icon: "slash" as const },
  vacancy_filled: { label: "Vaga Preenchida", color: "#6366f1", icon: "users" as const },
};

type StatusFilter = "all" | "pending" | "accepted" | "rejected" | "cancelled";

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

function formatHour(value?: string | null) {
  if (!value) return "--";
  return String(value).slice(0, 5);
}

function formatDateWithWeekday(value?: string | null) {
  if (!value) return "--";

  const raw = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return String(value);

  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} - ${weekday}`;
}

function getCardTitle(item: any) {
  return (
    item?.vaga?.titulo_personalizado ||
    item?.vaga?.titulo_anuncio ||
    item?.vaga?.nome_paciente ||
    item?.vacancy?.title ||
    "Vaga"
  );
}

function getLocationText(item: any) {
  const cidade = item?.vaga?.cidade || item?.vacancy?.city || "--";
  const estado = item?.vaga?.estado || item?.vacancy?.state || "--";
  const bairro = item?.vaga?.bairro || item?.vacancy?.neighborhood || "--";

  return `${cidade}/${estado} • ${bairro}`;
}

function getDateHourText(item: any) {
  const data =
    formatDateWithWeekday(item?.vaga?.data_plantao || item?.vacancy?.shiftDate);
  const inicio = formatHour(item?.vaga?.horario_inicio);
  const fim = formatHour(item?.vaga?.horario_fim);
  const horario =
    inicio !== "--" && fim !== "--"
      ? `${inicio} às ${fim}`
      : item?.vacancy?.workHours || "--";

  return `${data} • ${horario}`;
}

function getVacancyValue(item: any) {
  return (
    item?.vaga?.valor_plantao ??
    item?.vacancy?.value ??
    0
  );
}

export default function ApplicationsScreen() {
  const { myApplications, cancelApplication, loadMyApplications, credits } = useApp();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [confirmCancel, setConfirmCancel] = React.useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  useEffect(() => {
    loadMyApplications();
  }, []);

  const handleCancel = async () => {
    if (!confirmCancel) return;
    await cancelApplication(confirmCancel.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmCancel(null);
  };

  const filteredApplications =
    statusFilter === "all"
      ? myApplications
      : myApplications.filter((item: any) => item.status === statusFilter);

  const headerRightContent = (
    <View style={styles.headerRight}>
      <View style={styles.creditsBox}>
        <Feather name="star" size={13} color="#fbbf24" />
        <Text style={styles.creditsText}>
          {credits} crédito{credits !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {[
          { label: "Todas", value: "all" as StatusFilter },
          { label: "Aguardando", value: "pending" as StatusFilter },
          { label: "Aceitas", value: "accepted" as StatusFilter },
          { label: "Recusadas", value: "rejected" as StatusFilter },
          { label: "Canceladas", value: "cancelled" as StatusFilter },
        ].map((item) => {
          const active = statusFilter === item.value;

          return (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
              ]}
              onPress={() => setStatusFilter(item.value)}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.chipText,
                  active ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Minhas Candidaturas"
        showBack
        rightContent={headerRightContent}
      />

      <FlatList
        data={filteredApplications}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
        onRefresh={loadMyApplications}
        refreshing={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma candidatura</Text>
            <Text style={styles.emptyDesc}>
              Ajuste os filtros ou candidate-se a vagas para vê-las aqui.
            </Text>
          </View>
        }
        renderItem={({ item }: { item: any }) => {
          const info =
            statusInfo[item.status as keyof typeof statusInfo] || statusInfo.pending;

          return (
            <TouchableOpacity activeOpacity={0.85} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{getCardTitle(item)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: info.color + "22" }]}>
                  <Feather name={info.icon} size={12} color={info.color} />
                  <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Feather name="map-pin" size={13} color="#64748b" />
                <Text style={styles.infoText}>{getLocationText(item)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Feather name="calendar" size={13} color="#64748b" />
                <Text style={styles.infoText}>{getDateHourText(item)}</Text>
              </View>

              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Valor da vaga:</Text>
                <Text style={styles.value}>{formatCurrency(getVacancyValue(item))}</Text>
              </View>

              {!!item.valor_contraproposta && (
                <View style={styles.valueRow}>
                  <Text style={styles.valueLabel}>Sua contraproposta:</Text>
                  <Text style={[styles.value, { color: "#6366f1" }]}>
                    {formatCurrency(item.valor_contraproposta)}
                  </Text>
                </View>
              )}

              {item.status === "pending" && (
  <TouchableOpacity
    style={styles.cancelBtn}
    onPress={() => {
      console.log("CLICOU DESISTIR", item.id);
      setConfirmCancel(item);
    }}
    activeOpacity={0.8}
  >
    <Feather name="x" size={14} color="#ef4444" />
    <Text style={styles.cancelBtnText}>Desistir da candidatura</Text>
  </TouchableOpacity>
)}
            </TouchableOpacity>
          );
        }}
      />

      <CustomModal
  visible={!!confirmCancel}
  onClose={() => {
    console.log("FECHOU MODAL");
    setConfirmCancel(null);
  }}
  title="Desistir da candidatura?"
  message="Se você desistir desta candidatura agora, ela será cancelada e 1 crédito será restituído para sua conta. Deseja continuar?"
  icon={<Feather name="alert-circle" size={40} color="#f59e0b" />}
  buttons={[
    {
      label: "Voltar",
      onPress: () => {
        console.log("VOLTOU MODAL");
        setConfirmCancel(null);
      },
      variant: "secondary",
    },
    {
      label: "Sim, desistir",
      onPress: () => {
        console.log("CONFIRMOU CANCELAMENTO");
        handleCancel();
      },
      variant: "danger",
    },
  ]}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

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

  list: {
    padding: 16,
  },

  listHeader: {
    marginBottom: 12,
  },

  chipsRow: {
    paddingRight: 8,
    gap: 8,
  },

  chip: {
    height: 32,
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  chipActive: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },

  chipInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },

  chipTextActive: {
    color: "#ffffff",
  },

  chipTextInactive: {
    color: "#334155",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },

  emptyDesc: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  infoRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 3,
  },

  infoText: {
    fontSize: 12,
    color: "#64748b",
    flex: 1,
  },

  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },

  valueLabel: {
    fontSize: 13,
    color: "#64748b",
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a",
  },

  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    alignSelf: "flex-start",
  },

  cancelBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "600",
  },
});