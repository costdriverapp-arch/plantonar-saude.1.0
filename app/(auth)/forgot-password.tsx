import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { AppInput } from "@/components/ui/AppInput";
import { CustomModal } from "@/components/ui/CustomModal";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [modal, setModal] = useState({ visible: false, success: false, message: "" });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSubmit = () => {
    if (!email.trim()) {
      setModal({ visible: true, success: false, message: "Por favor, insira seu e-mail." });
      return;
    }
    setModal({
      visible: true,
      success: true,
      message: "Se este e-mail estiver cadastrado, você receberá as instruções de recuperação em breve.",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: "#1e3a8a" }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Senha</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <Feather name="lock" size={48} color="#1e40af" />
          </View>
          <Text style={styles.title}>Esqueceu sua senha?</Text>
          <Text style={styles.subtitle}>
            Digite seu e-mail cadastrado e enviaremos as instruções para redefinir sua senha.
          </Text>

          <AppInput
            label="E-mail"
            leftIcon="mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            placeholder="seu@email.com"
          />

          <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={styles.btnText}>Enviar instruções</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Voltar para o login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modal.visible}
        onClose={() => {
          setModal({ ...modal, visible: false });
          if (modal.success) router.replace("/(auth)/login");
        }}
        title={modal.success ? "E-mail Enviado" : "Atenção"}
        message={modal.message}
        icon={
          <Feather
            name={modal.success ? "check-circle" : "alert-circle"}
            size={40}
            color={modal.success ? "#16a34a" : "#ef4444"}
          />
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
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  iconWrap: {
    alignItems: "center",
    marginBottom: 20,
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignSelf: "center",
  },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 28 },
  btn: {
    backgroundColor: "#1e40af",
    borderRadius: 14,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backLink: { alignItems: "center", marginTop: 16 },
  backLinkText: { color: "#1e40af", fontSize: 14, fontWeight: "500" },
});
