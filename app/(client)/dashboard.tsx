import { router } from "expo-router";
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
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const { myVacancies, loadMyVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => { loadMyVacancies(); }, []);

  const firstName = user?.firstName || user?.email?.split("@")[0] || "Cliente";
  const activeVacancies = myVacancies.filter((v) => v.status === "open");

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Feather name="user" size={22} color="#14532d" />
            </View>
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <Feather name="briefcase" size={22} color="#16a34a" />
            <Text style={styles.statLabel}>Vagas Ativas</Text>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{activeVacancies.length}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
            <Feather name="users" size={22} color="#1e40af" />
            <Text style={styles.statLabel}>Total Candidatos</Text>
            <Text style={[styles.statValue, { color: "#1e40af" }]}>
              {myVacancies.reduce((acc, v) => acc + v.applicationsCount, 0)}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vagas Ativas</Text>
          <TouchableOpacity onPress={() => router.push("/(client)/my-vacancies")}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {activeVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={44} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma vaga ativa</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/(client)/create-vacancy")}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.createBtnText}>Criar primeira vaga</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeVacancies.slice(0, 3).map((v) => (
            <TouchableOpacity
              key={v.id}
              style={styles.vacancyCard}
              onPress={() => router.push({ pathname: "/(client)/vacancy-detail", params: { id: v.id } })}
              activeOpacity={0.85}
            >
              <View style={styles.vacancyCardTop}>
                <Text style={styles.vacancyTitle}>{v.title}</Text>
                <View style={styles.countBadge}>
                  <Feather name="users" size={12} color="#16a34a" />
                  <Text style={styles.countText}>{v.applicationsCount}</Text>
                </View>
              </View>
              <View style={styles.vacancyInfoRow}>
                <Feather name="map-pin" size={12} color="#64748b" />
                <Text style={styles.vacancyInfo}>{v.city}/{v.state} • {v.neighborhood}</Text>
              </View>
              <View style={styles.vacancyInfoRow}>
                <Feather name="calendar" size={12} color="#64748b" />
                <Text style={styles.vacancyInfo}>{v.shiftDate} • {v.workHours}</Text>
              </View>
              <Text style={styles.vacancyValue}>
                {v.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#14532d",
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between" },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  greeting: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  name: { color: "#fff", fontSize: 17, fontWeight: "700" },
  content: { padding: 16 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, gap: 6 },
  statLabel: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  statValue: { fontSize: 28, fontWeight: "700" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  seeAllText: { color: "#16a34a", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#16a34a", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: "#fff", fontWeight: "600" },
  vacancyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  vacancyCardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  vacancyTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", flex: 1 },
  countBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  vacancyInfoRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  vacancyInfo: { fontSize: 12, color: "#64748b" },
  vacancyValue: { fontSize: 15, fontWeight: "700", color: "#16a34a", marginTop: 6 },
});
