import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signInAsAdmin } = useAuth();
  const [loadingAdm, setLoadingAdm] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAdmAccess = async () => {
    setLoadingAdm(true);
    await signInAsAdmin();
    setLoadingAdm(false);
    router.replace("/(admin)/dashboard");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <TouchableOpacity
        style={[styles.admBtn, { top: topPad + 8 }]}
        onPress={handleAdmAccess}
        hitSlop={12}
        activeOpacity={0.7}
        disabled={loadingAdm}
      >
        <Feather name={loadingAdm ? "loader" : "settings"} size={13} color="rgba(255,255,255,0.45)" />
        <Text style={styles.admBtnText}>ADM</Text>
      </TouchableOpacity>

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Feather name="activity" size={52} color="#ffffff" />
          </View>
        </View>
        <Text style={styles.appName}>Plantonar Saúde</Text>
        <Text style={styles.slogan}>Conectando profissionais a quem{"\n"}precisa de cuidados.</Text>
      </View>

      <View style={styles.cardsRow}>
        <View style={[styles.featureCard, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
          <Feather name="shield" size={24} color="#93c5fd" />
          <Text style={styles.featureText}>Profissionais verificados</Text>
        </View>
        <View style={[styles.featureCard, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
          <Feather name="clock" size={24} color="#93c5fd" />
          <Text style={styles.featureText}>Vagas disponíveis 24h</Text>
        </View>
        <View style={[styles.featureCard, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
          <Feather name="heart" size={24} color="#93c5fd" />
          <Text style={styles.featureText}>Cuidado com qualidade</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Feather name="log-in" size={18} color="#1e3a8a" style={{ marginRight: 8 }} />
          <Text style={styles.primaryBtnText}>Já sou cadastrado</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Não sou cadastrado</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Desenvolvido por nexortec - 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  heroSection: {
    alignItems: "center",
    marginTop: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 24,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  featureCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 15,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#1e3a8a",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryBtn: {
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  secondaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  admBtn: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },
  admBtnText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
