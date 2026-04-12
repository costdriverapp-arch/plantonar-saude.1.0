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
import { useAuth } from "@/context/AuthContext";

export default function AdminProfile() {
  const { user, updateUser, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email] = useState(user?.email || "");

  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ visible: false, title: "", message: "", isError: false });
  const [logoutModal, setLogoutModal] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) {
      setModal({ visible: true, title: "Atenção", message: "Informe seu nome.", isError: true });
      return;
    }
    setSaving(true);
    await updateUser({ firstName, lastName });
    setSaving(false);
    setModal({ visible: true, title: "Sucesso", message: "Perfil atualizado com sucesso!", isError: false });
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={() => setLogoutModal(true)} hitSlop={12}>
            <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="shield" size={38} color="#fff" />
          </View>
          <Text style={styles.avatarName}>
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Administrador"}
          </Text>
          <View style={styles.roleBadge}>
            <Feather name="lock" size={11} color="#a78bfa" />
            <Text style={styles.roleText}>Administrador</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <AppInput
            label="Nome"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Seu nome"
            leftIcon="user"
            returnKeyType="next"
          />
          <AppInput
            label="Sobrenome"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Seu sobrenome"
            leftIcon="user"
            returnKeyType="done"
          />

          <Text style={styles.sectionTitle}>Acesso</Text>

          <View style={styles.infoRow}>
            <Feather name="mail" size={16} color="#581c87" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Feather name="shield" size={16} color="#581c87" />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Nível de acesso</Text>
              <Text style={styles.infoValue}>Administrador do Sistema</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Feather name="save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? "Salvando..." : "Salvar Alterações"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setLogoutModal(true)}
            activeOpacity={0.85}
          >
            <Feather name="log-out" size={18} color="#ef4444" />
            <Text style={styles.logoutBtnText}>Sair do sistema</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modal.visible}
        onClose={() => setModal({ ...modal, visible: false })}
        title={modal.title}
        message={modal.message}
        icon={<Feather name={modal.isError ? "alert-circle" : "check-circle"} size={40} color={modal.isError ? "#ef4444" : "#16a34a"} />}
      />

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sair do painel"
        message="Tem certeza que deseja sair do sistema?"
        icon={<Feather name="log-out" size={40} color="#ef4444" />}
        buttons={[
          { label: "Cancelar", onPress: () => setLogoutModal(false), variant: "secondary" },
          { label: "Sair", onPress: handleLogout, variant: "danger" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#581c87",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  avatarSection: { alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 4,
  },
  avatarName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(167,139,250,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: { color: "#a78bfa", fontSize: 12, fontWeight: "600" },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#581c87",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#0f172a", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#581c87",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  logoutBtn: {
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: "#fecaca",
    backgroundColor: "#fff5f5",
  },
  logoutBtnText: { color: "#ef4444", fontSize: 15, fontWeight: "700" },
});
