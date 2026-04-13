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

type Step = 1 | 2 | 3;

export default function ProfessionalProfile() {
  const { user, updateUser, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  const [cpf, setCpf] = useState(user?.cpf || "");
  const [rg, setRg] = useState(user?.rg || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || "");

  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cep, setCep] = useState("");

  const [profession, setProfession] = useState("");
  const [coren, setCoren] = useState("");
  const [specialties, setSpecialties] = useState("");

  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ visible: false, message: "" });
  const [logoutModal, setLogoutModal] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const birthRef = useRef<TextInput>(null);
  const cpfRef = useRef<TextInput>(null);
  const rgRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const whatsappRef = useRef<TextInput>(null);

  const numberRef = useRef<TextInput>(null);
  const complementRef = useRef<TextInput>(null);
  const neighborhoodRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);

  const corenRef = useRef<TextInput>(null);
  const specialtiesRef = useRef<TextInput>(null);

  const handleSave = async () => {
    setSaving(true);
    await updateUser({
      firstName,
      lastName,
      birthDate,
      cpf,
      rg,
      phone,
      whatsapp,
    });
    setSaving(false);
    setModal({ visible: true, message: "Perfil salvo com sucesso!" });
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
        <View style={styles.stepsRow}>
          {[1, 2, 3].map((s) => (
            <TouchableOpacity key={s} onPress={() => setStep(s as Step)}>
              <View style={[styles.stepChip, step === s && styles.stepChipActive]}>
                <Text style={[styles.stepChipText, step === s && styles.stepChipTextActive]}>
                  {s === 1 ? "Pessoal" : s === 2 ? "Endereço" : "Profissional"}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Feather name="user" size={36} color="#1e40af" />
                </View>
                <Text style={styles.avatarHint}>Toque para adicionar foto</Text>
              </View>
              <AppInput label="Nome" value={firstName} onChangeText={setFirstName} returnKeyType="next" onSubmitEditing={() => lastNameRef.current?.focus()} placeholder="Seu nome" leftIcon="user" />
              <AppInput ref={lastNameRef} label="Sobrenome" value={lastName} onChangeText={setLastName} returnKeyType="next" onSubmitEditing={() => birthRef.current?.focus()} placeholder="Seu sobrenome" leftIcon="user" />
              <AppInput ref={birthRef} label="Data de Nascimento" value={birthDate} onChangeText={setBirthDate} returnKeyType="next" onSubmitEditing={() => cpfRef.current?.focus()} placeholder="DD/MM/AAAA" leftIcon="calendar" keyboardType="numbers-and-punctuation" />
              <AppInput ref={cpfRef} label="CPF" value={cpf} onChangeText={setCpf} returnKeyType="next" onSubmitEditing={() => rgRef.current?.focus()} placeholder="000.000.000-00" leftIcon="credit-card" keyboardType="numbers-and-punctuation" />
              <AppInput ref={rgRef} label="RG" value={rg} onChangeText={setRg} returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} placeholder="00.000.000-0" leftIcon="file-text" />
              <AppInput ref={phoneRef} label="Telefone" value={phone} onChangeText={setPhone} returnKeyType="next" onSubmitEditing={() => whatsappRef.current?.focus()} placeholder="(00) 00000-0000" leftIcon="phone" keyboardType="phone-pad" />
              <AppInput ref={whatsappRef} label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} returnKeyType="done" placeholder="(00) 00000-0000" leftIcon="message-circle" keyboardType="phone-pad" />
            </>
          )}
          {step === 2 && (
            <>
              <AppInput label="CEP" value={cep} onChangeText={setCep} returnKeyType="next" onSubmitEditing={() => numberRef.current?.focus()} placeholder="00000-000" leftIcon="map-pin" keyboardType="numbers-and-punctuation" />
              <AppInput label="Rua / Logradouro" value={street} onChangeText={setStreet} returnKeyType="next" onSubmitEditing={() => numberRef.current?.focus()} placeholder="Nome da rua" leftIcon="map" />
              <AppInput ref={numberRef} label="Número" value={number} onChangeText={setNumber} returnKeyType="next" onSubmitEditing={() => complementRef.current?.focus()} placeholder="123" leftIcon="hash" keyboardType="numbers-and-punctuation" />
              <AppInput ref={complementRef} label="Complemento" value={complement} onChangeText={setComplement} returnKeyType="next" onSubmitEditing={() => neighborhoodRef.current?.focus()} placeholder="Apto, bloco, etc." leftIcon="home" />
              <AppInput ref={neighborhoodRef} label="Bairro" value={neighborhood} onChangeText={setNeighborhood} returnKeyType="next" onSubmitEditing={() => cityRef.current?.focus()} placeholder="Nome do bairro" leftIcon="map-pin" />
              <AppInput ref={cityRef} label="Cidade" value={city} onChangeText={setCity} returnKeyType="next" onSubmitEditing={() => stateRef.current?.focus()} placeholder="Nome da cidade" leftIcon="navigation" />
              <AppInput ref={stateRef} label="Estado" value={state} onChangeText={setState} returnKeyType="done" placeholder="Ex: MG" leftIcon="flag" autoCapitalize="characters" maxLength={2} />
            </>
          )}
          {step === 3 && (
            <>
              <AppInput label="Profissão" value={profession} onChangeText={setProfession} returnKeyType="next" onSubmitEditing={() => corenRef.current?.focus()} placeholder="Ex: Enfermeiro(a), Cuidador(a)" leftIcon="briefcase" />
              <AppInput ref={corenRef} label="COREN / Registro Profissional" value={coren} onChangeText={setCoren} returnKeyType="next" onSubmitEditing={() => specialtiesRef.current?.focus()} placeholder="Número do conselho" leftIcon="shield" />
              <AppInput ref={specialtiesRef} label="Especialidades" value={specialties} onChangeText={setSpecialties} returnKeyType="done" placeholder="Ex: UTI, Pediatria, Geriatra" leftIcon="activity" multiline />
            </>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Feather name="save" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? "Salvando..." : "Salvar Perfil"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modal.visible}
        onClose={() => setModal({ visible: false, message: "" })}
        title="Sucesso"
        message={modal.message}
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
      />

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sair da conta"
        message="Tem certeza que deseja sair?"
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
  header: { backgroundColor: "#1e3a8a", paddingHorizontal: 16, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  stepsRow: { flexDirection: "row", gap: 8 },
  stepChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)" },
  stepChipActive: { backgroundColor: "#ffffff" },
  stepChipText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  stepChipTextActive: { color: "#1e3a8a" },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  avatarHint: { fontSize: 12, color: "#64748b" },
  saveBtn: {
    backgroundColor: "#1e40af",
    borderRadius: 14,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
