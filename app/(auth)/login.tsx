import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppInput } from "@/components/ui/AppInput";
import { CustomModal } from "@/components/ui/CustomModal";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: "" });

  const passwordRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorModal({ visible: true, message: "Por favor, preencha e-mail e senha." });
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setErrorModal({ visible: true, message: result.error || "Erro ao entrar." });
    } else {
      if (result.role === "professional") router.replace("/(professional)/(tabs)/dashboard");
      else if (result.role === "client") router.replace("/(client)/dashboard");
      else if (result.role === "admin") router.replace("/(admin)/dashboard");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0D2B5E", "#1565C0", "#1E88E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGrad, { paddingTop: topPad + 24 }]}
        >
          <Pressable
            onPress={() => router.back()}
           style={[styles.backBtn, { top: topPad + 10 }]}
            hitSlop={12}
          >
            <View style={styles.backCircle}>
              <Feather name="arrow-left" size={18} color="#fff" />
            </View>
          </Pressable>

          <Image
            source={require("@/assets/images/logo-plantonar.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.headerTitle}>Bem-vindo de volta</Text>
          <Text style={styles.headerSub}>Entre com sua conta Plantonar Saúde</Text>
        </LinearGradient>

        <View style={styles.formArea}>
          <View style={styles.form}>
            <AppInput
              label="E-mail"
              leftIcon="mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              placeholder="seu@email.com"
            />

            <AppInput
              ref={passwordRef}
              label="Senha"
              leftIcon="lock"
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={async () => {
                await Haptics.selectionAsync();
                handleLogin();
              }}
              placeholder="Sua senha"
            />
          </View>

          <Pressable
            onPress={() => router.push("/(auth)/forgot-password")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtnWrap,
              pressed && !loading && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleLogin();
            }}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0D2B5E", "#1565C0", "#1E88E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            >
              {loading ? (
                <Feather name="loader" size={20} color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Entrar</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}> Cadastre-se</Text>
            </Pressable>
          </View>

          <View style={styles.termsRow}>
            <Pressable onPress={() => router.push("/(auth)/terms")}>
              <Text style={styles.termsLink}>Termos de Uso e Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.nexorFooter, { paddingBottom: bottomPad + 12 }]}>
          <Text style={styles.nexorText}>Desenvolvido por Nexor-tec ® - {new Date().getFullYear()}</Text>
        </View>
      </ScrollView>

      <CustomModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: "" })}
        title="Atenção"
        message={errorModal.message}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerGrad: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 50,
    zIndex: 10,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 110,
    height: 110,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  headerSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    textAlign: "center",
  },
  formArea: {
    padding: 24,
    gap: 20,
  },
  form: {
    gap: 16,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    paddingVertical: 2,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: "#1565C0",
    fontWeight: "600",
  },
  loginBtnWrap: {
    marginTop: 4,
  },
  loginBtn: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
  },
  footerLink: {
    fontSize: 14,
    color: "#1565C0",
    fontWeight: "600",
  },
  termsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  termsLink: {
    fontSize: 13,
    color: "#1565C0",
    fontWeight: "600",
    textAlign: "center",
  },
  nexorFooter: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  nexorText: {
    fontSize: 11,
    color: "#94a3b8",
    textAlign: "center",
  },
});