import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { VacancyCard } from "@/components/ui/VacancyCard";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { vacancies, credits, unreadCount, loadVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    loadVacancies();
  }, []);

  const firstName = user?.firstName || user?.email?.split("@")[0] || "Profissional";
  const featuredVacancies = vacancies.slice(0, 2);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerTop}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Feather name="user" size={22} color="#1e3a8a" />
            </View>
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.name}>{firstName}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push("/(professional)/notifications")}
            >
              <Feather name="bell" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.creditsBox}>
              <Feather name="star" size={14} color="#fbbf24" />
              <Text style={styles.creditsText}>{credits} crédito{credits !== 1 ? "s" : ""}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {credits === 0 && (
          <TouchableOpacity style={styles.creditAlert}>
            <Feather name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.creditAlertText}>
              Seu crédito diário acabou. Adquira mais créditos para se candidatar.
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vagas em Destaque</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push("/(professional)/vacancies")}
          >
            <Text style={styles.seeAllText}>Ver todas</Text>
            <Feather name="arrow-right" size={14} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {featuredVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma vaga disponível</Text>
            <Text style={styles.emptyDesc}>Volte mais tarde para verificar novas oportunidades.</Text>
          </View>
        ) : (
          featuredVacancies.map((v) => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              showActions={false}
              compact
              onApply={() => router.push("/(professional)/vacancies")}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.arrowCard}
          onPress={() => router.push("/(professional)/vacancies")}
          activeOpacity={0.85}
        >
          <Feather name="briefcase" size={20} color="#1e40af" />
          <Text style={styles.arrowCardText}>Explorar todas as vagas disponíveis</Text>
          <Feather name="chevron-right" size={20} color="#1e40af" />
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
            <Feather name="file-text" size={22} color="#1e40af" />
            <Text style={styles.statLabel}>Candidaturas</Text>
            <TouchableOpacity onPress={() => router.push("/(professional)/applications")}>
              <Text style={styles.statLink}>Ver minhas candidaturas</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#dcfce7" }]}>
            <Feather name="star" size={22} color="#16a34a" />
            <Text style={styles.statLabel}>Crédito Diário</Text>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{credits}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  name: { color: "#ffffff", fontSize: 17, fontWeight: "700" },
  headerRight: { alignItems: "flex-end", gap: 6 },
  bellBtn: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  creditsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  creditsText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  content: { paddingHorizontal: 16, paddingTop: 20 },
  creditAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  creditAlertText: { flex: 1, fontSize: 13, color: "#92400e", lineHeight: 18 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  seeAllText: { color: "#1e40af", fontSize: 14, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8", textAlign: "center" },
  arrowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  arrowCardText: { flex: 1, color: "#1e40af", fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  statLabel: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLink: { fontSize: 12, color: "#1e40af", fontWeight: "500", textDecorationLine: "underline" },
});
