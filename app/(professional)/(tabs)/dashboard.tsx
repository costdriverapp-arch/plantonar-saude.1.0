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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { VacancyCard } from "@/components/ui/VacancyCard";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { vacancies, credits, unreadCount, loadVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    loadVacancies();
  }, []);

  const firstName =
    user?.firstName || user?.email?.split("@")[0] || "Profissional";

  // 🔥 CORREÇÃO AQUI
  const safeVacancies = vacancies || [];
  const featuredVacancies = safeVacancies.slice(0, 2);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#123C86", "#2F80ED"]}
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
            <Text style={styles.heroSubtitle}>Profissional da Saúde</Text>
          </View>

          <View style={styles.heroRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push("/(professional)/notifications")}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={20} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.creditsPill}
              onPress={() => router.push("/(professional)/creditos")}
              activeOpacity={0.75}
            >
              <Feather name="award" size={14} color="#f59e0b" />
              <Text style={styles.creditsPillText}>
                {credits > 0 ? "Ilimitados" : "0 créditos"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push("/(professional)/(tabs)/applications")
            }
          >
            <Feather name="send" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Candidaturas</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Feather name="star" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Selecionado</Text>
          </View>

          <View style={styles.statCard}>
            <Feather name="users" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Contratados</Text>
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
        {credits === 0 && (
          <TouchableOpacity style={styles.creditAlert} activeOpacity={0.85}>
            <Feather name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.creditAlertText}>
              Seu crédito diário acabou. Adquira mais créditos para se candidatar.
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.sectionExploreBtn}
            onPress={() =>
              router.push("/(professional)/(tabs)/vacancies")
            }
            activeOpacity={0.75}
          >
            <Feather name="briefcase" size={18} color="#1e40af" />
            <Text style={styles.sectionExploreText}>
              Explorar todas as vagas
            </Text>
            <Feather name="arrow-right" size={18} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {featuredVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma vaga disponível</Text>
            <Text style={styles.emptyDesc}>
              Volte mais tarde para verificar novas oportunidades.
            </Text>
          </View>
        ) : (
          featuredVacancies.map((v) => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              showActions={false}
              compact
              onApply={() =>
                router.push("/(professional)/(tabs)/vacancies")
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
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

  heroRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 1,
    right: 0,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  creditsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  creditsPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
    marginTop: 0,
    marginBottom: 0,
  },

  statLabel: {
    color: "#DCEAFE",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  creditAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  creditAlertText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionExploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  sectionExploreText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },

  emptyDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
});