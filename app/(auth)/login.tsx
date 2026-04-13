import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: "#1e3a8a" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Feather name="activity" size={32} color="#ffffff" />
          <Text style={styles.headerTitle}>Plantonar Saúde</Text>
        </View>
        <Text style={styles.headerSlogan}>Conectando profissionais a quem{"\n"}precisa de cuidados.</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Entrar na conta</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

          <AppInput
            label="E-mail"
            leftIcon="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
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
            onSubmitEditing={handleLogin}
            placeholder="Sua senha"
          />

          <TouchableOpacity
            onPress={() => router.push("/(auth)/forgot-password")}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Feather name="loader" size={20} color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Não tenho cadastro</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.registerLink}> Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Text style={[styles.footer, { paddingBottom: bottomPad + 4 }]}>
        Desenvolvido por nexortec - 2026
      </Text>

      <CustomModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: "" })}
        title="Atenção"
        message={errorModal.message}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: 0,
    padding: 8,
    paddingTop: 0,
    zIndex: 10,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerSlogan: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 20,
    marginTop: -4,
  },
  forgotText: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "500",
  },
  loginBtn: {
    backgroundColor: "#1e40af",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  registerText: {
    color: "#64748b",
    fontSize: 14,
  },
  registerLink: {
    color: "#1e40af",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 11,
    paddingTop: 4,
  },
});
