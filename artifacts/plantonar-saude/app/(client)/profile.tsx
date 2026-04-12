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

export default function ClientProfile() {
  const { user, updateUser, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");
  const [cpf, setCpf] = useState(user?.cpf || "");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ visible: false, message: "", success: false });
  const [logoutModal, setLogoutModal] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const whatsappRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);

  const handleSave = async () => {
    setSaving(true);
    await updateUser({ firstName, lastName, phone, whatsapp, cpf });
    setSaving(false);
    setModal({ visible: true, message: "Perfil salvo com sucesso!", success: true });
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={() => setLogoutModal(true)} hitSlop={8}>
            <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Feather name="user" size={36} color="#16a34a" />
            </View>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          <AppInput label="Nome" value={firstName} onChangeText={setFirstName} leftIcon="user" returnKeyType="next" onSubmitEditing={() => lastNameRef.current?.focus()} placeholder="Seu nome" />
          <AppInput ref={lastNameRef} label="Sobrenome" value={lastName} onChangeText={setLastName} leftIcon="user" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} placeholder="Seu sobrenome" />
          <AppInput ref={phoneRef} label="Telefone" value={phone} onChangeText={setPhone} leftIcon="phone" returnKeyType="next" onSubmitEditing={() => whatsappRef.current?.focus()} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
          <AppInput ref={whatsappRef} label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} leftIcon="message-circle" returnKeyType="next" onSubmitEditing={() => cpfRef.current?.focus()} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
          <AppInput ref={cpfRef} label="CPF" value={cpf} onChangeText={setCpf} leftIcon="credit-card" returnKeyType="done" onSubmitEditing={handleSave} placeholder="000.000.000-00" keyboardType="numbers-and-punctuation" />

          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            <Feather name="save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? "Salvando..." : "Salvar Perfil"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal visible={modal.visible} onClose={() => setModal({ ...modal, visible: false })} title={modal.success ? "Sucesso" : "Atenção"} message={modal.message} icon={<Feather name={modal.success ? "check-circle" : "alert-circle"} size={40} color={modal.success ? "#16a34a" : "#ef4444"} />} />
      <CustomModal visible={logoutModal} onClose={() => setLogoutModal(false)} title="Sair da conta" message="Tem certeza que deseja sair?" icon={<Feather name="log-out" size={40} color="#ef4444" />} buttons={[{ label: "Cancelar", onPress: () => setLogoutModal(false), variant: "secondary" }, { label: "Sair", onPress: handleLogout, variant: "danger" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#14532d", paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  email: { fontSize: 14, color: "#64748b" },
  saveBtn: { backgroundColor: "#16a34a", borderRadius: 14, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
