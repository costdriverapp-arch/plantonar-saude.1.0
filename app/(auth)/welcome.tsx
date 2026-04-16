import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { signInAsAdmin } = useAuth();
  const [loadingAdm, setLoadingAdm] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAdmAccess = async () => {
    setLoadingAdm(true);
    await signInAsAdmin();
    setLoadingAdm(false);
    router.replace("/(admin)/dashboard");
  };

  return (
    <LinearGradient
      colors={["#0D2B5E", "#1565C0", "#1E88E5"]}
      style={[styles.container, { paddingTop: topPad, paddingBottom: botPad }]}
    >
      {/* ADM */}
      <Pressable style={styles.admBtn} onPress={handleAdmAccess}>
        <Text style={styles.admText}>{loadingAdm ? "..." : "ADM"}</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image
              source={require("@/assets/images/logo-plantonar.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.tagline}>
            Conectando profissionais{"\n"}da saúde com quem precisa
          </Text>
        </View>

        <View style={styles.cardsRow}>
          <FeatureCard icon="shield-checkmark" label="Profissionais Verificados" />
          <FeatureCard icon="flash" label="Contratação Rápida" />
          <FeatureCard icon="people" label="Milhares de Vagas" />
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={styles.primaryBtn}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(auth)/register");
            }}
          >
            <Text style={styles.primaryBtnText}>Criar conta grátis</Text>
          </Pressable>

          <Pressable
            style={styles.ghostBtn}
            onPress={async () => {
              await Haptics.selectionAsync();
              router.push("/(auth)/login");
            }}
          >
            <Text style={styles.ghostBtnText}>Já tenho conta — Entrar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Desenvolvido por Nexor-tec ® - {new Date().getFullYear()}
        </Text>
      </View>
    </LinearGradient>
  );
}

function FeatureCard({ icon, label }: any) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconBg}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    gap: 24,
  },
  topSection: {
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  logoImage: {
    width: 180,
    height: 180,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#27AE60",
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
  buttons: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#1565C0",
    fontSize: 16,
    fontWeight: "700",
  },
  ghostBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  ghostBtnText: {
    color: "#fff",
    fontSize: 15,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 4,
  },
  footerText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
  admBtn: {
    position: "absolute",
    right: 16,
    top: 20,
    zIndex: 10,
  },
  admText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
});