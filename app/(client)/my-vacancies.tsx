import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/context/AppContext";

const statusInfo = {
  open: { label: "Ativa", color: "#16a34a" },
  filled: { label: "Preenchida", color: "#1e40af" },
  cancelled: { label: "Cancelada", color: "#ef4444" },
};

export default function MyVacanciesScreen() {
  const { myVacancies, loadMyVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => { loadMyVacancies(); }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Meus Anúncios</Text>
      </View>

      <FlatList
        data={myVacancies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
        onRefresh={loadMyVacancies}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={44} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhum anúncio publicado</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/(client)/create-vacancy")}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Criar anúncio</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const info = statusInfo[item.status];
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: "/(client)/vacancy-detail", params: { id: item.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: info.color + "20" }]}>
                  <Text style={[styles.statusText, { color: info.color }]}>{info.label}</Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={12} color="#64748b" />
                <Text style={styles.infoText}>{item.city}/{item.state} • {item.neighborhood}</Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="calendar" size={12} color="#64748b" />
                <Text style={styles.infoText}>{item.shiftDate} • {item.workHours}</Text>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.value}>
                  {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </Text>
                <View style={styles.applicantsRow}>
                  <Feather name="users" size={13} color="#16a34a" />
                  <Text style={styles.applicantsText}>{item.applicationsCount} candidato(s)</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#14532d", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  list: { padding: 16 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: "#fff", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  infoText: { fontSize: 12, color: "#64748b" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  value: { fontSize: 15, fontWeight: "700", color: "#16a34a" },
  applicantsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  applicantsText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
});
