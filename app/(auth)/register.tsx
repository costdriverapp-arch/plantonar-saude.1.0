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
import { UserRole } from "@/types";

type Step = 1 | 2 | 3;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: "", isEmailExists: false });

  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const goNext = () => {
    if (step === 1) {
      if (!role) {
        setErrorModal({ visible: true, message: "Selecione o tipo de cadastro." });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!email.trim() || !password || !confirmPassword) {
        setErrorModal({ visible: true, message: "Preencha todos os campos." });
        return;
      }
      if (password !== confirmPassword) {
        setErrorModal({ visible: true, message: "As senhas não coincidem." });
        return;
      }
      if (password.length < 6) {
        setErrorModal({ visible: true, message: "A senha deve ter pelo menos 6 caracteres." });
        return;
      }
      if (!acceptedTerms) {
        setErrorModal({ visible: true, message: "Aceite os Termos e Políticas de Privacidade para continuar." });
        return;
      }
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (!role) return;
    setLoading(true);
    const result = await signUp({ email: email.trim(), password, role });
    setLoading(false);
    if (!result.success) {
      const isEmailExists = result.error?.includes("já está cadastrado") ?? false;
      setErrorModal({ visible: true, message: result.error || "Erro ao criar conta.", isEmailExists });
    } else {
      if (role === "professional") router.replace("/(professional)/(tabs)/dashboard");
      else if (role === "client") router.replace("/(client)/dashboard");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: "#1e3a8a" }]}>
        <TouchableOpacity
          onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={styles.stepsRow}>
          {[1, 2].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                { backgroundColor: step >= s ? "#ffffff" : "rgba(255,255,255,0.3)" },
              ]}
            />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>Como você vai usar o app?</Text>
              <Text style={styles.stepSubtitle}>Escolha seu tipo de cadastro</Text>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "professional" && styles.roleCardSelected,
                  role === "professional" && { borderColor: "#1e40af" },
                ]}
                onPress={() => setRole("professional")}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIcon, { backgroundColor: "#dbeafe" }]}>
                  <Feather name="user-check" size={28} color="#1e40af" />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>Profissional de Saúde</Text>
                  <Text style={styles.roleDesc}>Encontre vagas e candidature-se a plantões</Text>
                </View>
                {role === "professional" && (
                  <Feather name="check-circle" size={22} color="#1e40af" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  role === "client" && styles.roleCardSelected,
                  role === "client" && { borderColor: "#16a34a" },
                ]}
                onPress={() => setRole("client")}
                activeOpacity={0.85}
              >
                <View style={[styles.roleIcon, { backgroundColor: "#dcfce7" }]}>
                  <Feather name="heart" size={28} color="#16a34a" />
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>Cliente / Familiar</Text>
                  <Text style={styles.roleDesc}>Publique vagas e encontre profissionais</Text>
                </View>
                {role === "client" && (
                  <Feather name="check-circle" size={22} color="#16a34a" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>Seus dados de acesso</Text>
              <Text style={styles.stepSubtitle}>Você poderá completar seu perfil depois</Text>

              <AppInput
                label="E-mail"
                leftIcon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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
                returnKeyType="next"
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
                onSubmitEditing={goNext}
                placeholder="Repita sua senha"
              />

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && { backgroundColor: "#1e40af", borderColor: "#1e40af" },
                  ]}
                >
                  {acceptedTerms && <Feather name="check" size={14} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  Li e aceito os{" "}
                  <Text
                    style={styles.termsLink}
                    onPress={() => router.push("/(auth)/terms")}
                  >
                    Termos e Políticas de Privacidade
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
            onPress={goNext}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <Feather name="loader" size={20} color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === 2 ? "Criar Conta" : "Próximo"}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: "", isEmailExists: false })}
        title="Atenção"
        message={errorModal.message}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
        buttons={
          errorModal.isEmailExists
            ? [
                {
                  label: "Tentar outro e-mail",
                  onPress: () => setErrorModal({ visible: false, message: "", isEmailExists: false }),
                  variant: "secondary",
                },
                {
                  label: "Fazer login",
                  onPress: () => {
                    setErrorModal({ visible: false, message: "", isEmailExists: false });
                    router.replace("/(auth)/login");
                  },
                  variant: "primary",
                },
              ]
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    alignSelf: "flex-start",
    padding: 4,
    paddingTop: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 8,
  },
  stepDot: {
    width: 32,
    height: 6,
    borderRadius: 3,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  roleCardSelected: {
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 17,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 20,
  },
  termsLink: {
    color: "#1e40af",
    fontWeight: "600",
  },
  nextBtn: {
    backgroundColor: "#1e40af",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  nextBtnDisabled: {
    opacity: 0.7,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
