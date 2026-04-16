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
import { UserRole } from "@/types";

function formatCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function sanitizeCPF(value: string) {
  return value.replace(/\D/g, "");
}

type Step = 1 | 2;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
 const { signUp, signIn } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: "",
    isEmailExists: false,
  });

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const goNext = async () => {
    if (step === 1) {
      if (!role) {
        setErrorModal({
          visible: true,
          message: "Selecione o tipo de cadastro.",
          isEmailExists: false,
        });
        return;
      }

      await Haptics.selectionAsync();
      setStep(2);
      return;
    }

    handleRegister();
  };

  const handleRegister = async () => {
    if (!role) {
      setErrorModal({
        visible: true,
        message: "Selecione o tipo de cadastro.",
        isEmailExists: false,
      });
      return;
    }

    if (!cpf.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorModal({
        visible: true,
        message: "Preencha todos os campos.",
        isEmailExists: false,
      });
      return;
    }

    if (sanitizeCPF(cpf).length !== 11) {
      setErrorModal({
        visible: true,
        message: "Informe um CPF válido.",
        isEmailExists: false,
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({
        visible: true,
        message: "As senhas não coincidem.",
        isEmailExists: false,
      });
      return;
    }

    if (password.length < 6) {
      setErrorModal({
        visible: true,
        message: "A senha deve ter pelo menos 6 caracteres.",
        isEmailExists: false,
      });
      return;
    }

    if (!acceptedTerms) {
      setErrorModal({
        visible: true,
        message: "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
        isEmailExists: false,
      });
      return;
    }

    setLoading(true);

    const result = await signUp({
      email: email.trim(),
      password,
      role,
      cpf: sanitizeCPF(cpf),
    });

    setLoading(false);

    if (!result.success) {
      const isEmailExists = result.error?.includes("já está cadastrado") ?? false;

      setErrorModal({
        visible: true,
        message: result.error || "Erro ao criar conta.",
        isEmailExists,
      });
      return;
    }

    const login = await signIn(email.trim(), password);

if (!login.success) {
  setErrorModal({
    visible: true,
    message: login.error || "Conta criada, mas erro ao entrar.",
    isEmailExists: false,
  });
  return;
}

if (login.role === "professional") {
  router.replace("/(professional)/profile-form");
} else {
  router.replace("/(client)/dashboard");
}
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#0D2B5E", "#1565C0", "#1E88E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGrad, { paddingTop: topPad + 20 }]}
        >
          <Pressable
            onPress={() => {
              if (step === 1) router.back();
              else setStep(1);
            }}
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

          <Text style={styles.headerTitle}>Criar conta</Text>
          <Text style={styles.headerSub}>
            {step === 1
              ? "Escolha como você vai usar o Plantonar Saúde"
              : "Cadastre seu CPF, e-mail e senha para começar"}
          </Text>

          <View style={styles.stepsRow}>
            {[1, 2].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step >= s ? "#ffffff" : "rgba(255,255,255,0.28)",
                  },
                ]}
              />
            ))}
          </View>
        </LinearGradient>

        <View style={styles.formArea}>
          {step === 1 ? (
            <View style={styles.form}>
              <Pressable
                style={({ pressed }) => [
                  styles.roleCard,
                  role === "professional" && styles.roleCardSelectedBlue,
                  pressed && { opacity: 0.92 },
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setRole("professional");
                }}
              >
                <View
                  style={[
                    styles.roleIcon,
                    role === "professional" && { backgroundColor: "#1e40af" },
                  ]}
                >
                  <Feather
                    name="user-check"
                    size={24}
                    color={role === "professional" ? "#fff" : "#1e40af"}
                  />
                </View>

                <View style={styles.roleTextWrap}>
                  <Text
                    style={[
                      styles.roleTitle,
                      role === "professional" && { color: "#1e40af" },
                    ]}
                  >
                    Profissional de Saúde
                  </Text>
                  <Text style={styles.roleSubtitle}>
                    Encontrar vagas e se candidatar a plantões
                  </Text>
                </View>

                {role === "professional" && (
                  <Feather name="check-circle" size={22} color="#1e40af" />
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.roleCard,
                  role === "client" && styles.roleCardSelectedGreen,
                  pressed && { opacity: 0.92 },
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setRole("client");
                }}
              >
                <View
                  style={[
                    styles.roleIcon,
                    role === "client" && { backgroundColor: "#16a34a" },
                  ]}
                >
                  <Feather
                    name="heart"
                    size={24}
                    color={role === "client" ? "#fff" : "#16a34a"}
                  />
                </View>

                <View style={styles.roleTextWrap}>
                  <Text
                    style={[
                      styles.roleTitle,
                      role === "client" && { color: "#16a34a" },
                    ]}
                  >
                    Cliente / Familiar
                  </Text>
                  <Text style={styles.roleSubtitle}>
                    Publicar vagas e encontrar profissionais
                  </Text>
                </View>

                {role === "client" && (
                 <Feather name="check-circle" size={22} color="#16a34a" />
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              <AppInput
                label="CPF"
                leftIcon="credit-card"
                value={cpf}
                onChangeText={(value) => setCpf(formatCPF(value))}
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                maxLength={14}
                placeholder="000.000.000-00"
              />

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
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmRef.current?.focus()}
                placeholder="Mínimo 6 caracteres"
              />

              <AppInput
                ref={confirmRef}
                label="Confirmar senha"
                leftIcon="lock"
                rightIcon={showConfirm ? "eye-off" : "eye"}
                onRightIconPress={() => setShowConfirm(!showConfirm)}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                blurOnSubmit={false}
                onSubmitEditing={async () => {
                  await Haptics.selectionAsync();
                  handleRegister();
                }}
                placeholder="Repita sua senha"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.termsCheckRow,
                  pressed && { opacity: 0.9 },
                ]}
                onPress={async () => {
                  await Haptics.selectionAsync();
                  setAcceptedTerms((prev) => !prev);
                }}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}>
                  {acceptedTerms ? <Feather name="check" size={14} color="#fff" /> : null}
                </View>

                <Text style={styles.termsCheckText}>
                  Li e aceito os{" "}
                  <Text
                    style={styles.termsCheckLink}
                    onPress={() => router.push("/(auth)/terms")}
                  >
                    Termos de Uso e Política de Privacidade
                  </Text>
                </Text>
              </Pressable>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.registerBtnWrap,
              pressed && !loading && { opacity: 0.9, transform: [{ scale: 0.985 }] },
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              goNext();
            }}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0D2B5E", "#1565C0", "#1E88E5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
            >
              {loading ? (
                <Feather name="loader" size={20} color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>
                  {step === 1 ? "Continuar" : "Criar conta"}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}> Entrar</Text>
            </Pressable>
          </View>

          <View style={styles.termsRow}>
            <Pressable onPress={() => router.push("/(auth)/terms")}>
              <Text style={styles.termsLink}>Termos de Uso e Política de Privacidade</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.nexorFooter, { paddingBottom: bottomPad + 12 }]}>
          <Text style={styles.nexorText}>Nexortec — Proibida a reprodução.</Text>
        </View>
      </ScrollView>

      <CustomModal
        visible={errorModal.visible}
        onClose={() =>
          setErrorModal({ visible: false, message: "", isEmailExists: false })
        }
        title="Atenção"
        message={errorModal.message}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
        buttons={
          errorModal.isEmailExists
            ? [
                {
                  label: "Tentar outro e-mail",
                  onPress: () =>
                    setErrorModal({
                      visible: false,
                      message: "",
                      isEmailExists: false,
                    }),
                  variant: "secondary",
                },
                {
                  label: "Fazer login",
                  onPress: () => {
                    setErrorModal({
                      visible: false,
                      message: "",
                      isEmailExists: false,
                    });
                    router.replace("/(auth)/login");
                  },
                  variant: "primary",
                },
              ]
            : undefined
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerGrad: {
    alignItems: "center",
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
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
  stepsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  stepDot: {
    width: 34,
    height: 6,
    borderRadius: 999,
  },
  formArea: {
    padding: 24,
    gap: 20,
  },
  form: {
    gap: 16,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  roleCardSelectedBlue: {
    borderColor: "#1e40af",
    backgroundColor: "#eff6ff",
  },
  roleCardSelectedGreen: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextWrap: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
  },
  termsCheckRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#1565C0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    backgroundColor: "#fff",
  },
  checkboxActive: {
    backgroundColor: "#1565C0",
  },
  termsCheckText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
  },
  termsCheckLink: {
    color: "#1565C0",
    fontWeight: "600",
  },
  registerBtnWrap: {
    marginTop: 4,
  },
  registerBtn: {
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
  registerBtnDisabled: {
    opacity: 0.7,
  },
  registerBtnText: {
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