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
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function CreateVacancyScreen() {
  const { createVacancy } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [profession, setProfession] = useState("");
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cep, setCep] = useState("");
  const [workHours, setWorkHours] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState("");
  const [rawValue, setRawValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ visible: false, success: false, message: "" });

  const titleRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const neighborhoodRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const workHoursRef = useRef<TextInput>(null);
  const shiftDateRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);
  const tasksRef = useRef<TextInput>(null);
  const valueRef = useRef<TextInput>(null);

  const formatCurrency = (val: string) => {
    const nums = val.replace(/\D/g, "");
    if (!nums) return "";
    const num = parseInt(nums, 10) / 100;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const parseCurrencyValue = (): number => {
    const nums = rawValue.replace(/\D/g, "");
    return nums ? parseInt(nums, 10) / 100 : 0;
  };

  const handleSubmit = async () => {
    if (!profession || !title || !city || !state || !neighborhood || !cep || !workHours || !shiftDate || !description || !tasks || !rawValue) {
      setModal({ visible: true, success: false, message: "Por favor, preencha todos os campos da vaga." });
      return;
    }
    const value = parseCurrencyValue();
    if (value <= 0) {
      setModal({ visible: true, success: false, message: "Informe um valor válido para a vaga." });
      return;
    }
    setLoading(true);
    const result = await createVacancy({ title, profession, city, state, neighborhood, cep, workHours, shiftDate, description, tasks, value });
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModal({ visible: true, success: true, message: "Vaga criada com sucesso! Profissionais já podem se candidatar." });
    } else {
      setModal({ visible: true, success: false, message: result.error || "Erro ao criar vaga." });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Criar Anúncio</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>Informações da Vaga</Text>
          <AppInput label="Profissão desejada" value={profession} onChangeText={setProfession} leftIcon="briefcase" placeholder="Ex: Enfermeiro(a)" returnKeyType="next" onSubmitEditing={() => titleRef.current?.focus()} />
          <AppInput ref={titleRef} label="Título do anúncio" value={title} onChangeText={setTitle} leftIcon="edit" placeholder="Ex: ENFERMEIRO(A) NOTURNO" returnKeyType="next" onSubmitEditing={() => cityRef.current?.focus()} />

          <Text style={styles.sectionLabel}>Localização</Text>
          <AppInput ref={cityRef} label="Cidade" value={city} onChangeText={setCity} leftIcon="navigation" placeholder="Nome da cidade" returnKeyType="next" onSubmitEditing={() => stateRef.current?.focus()} />
          <AppInput ref={stateRef} label="Estado" value={state} onChangeText={setState} leftIcon="flag" placeholder="Ex: MG" returnKeyType="next" onSubmitEditing={() => neighborhoodRef.current?.focus()} autoCapitalize="characters" maxLength={2} />
          <AppInput ref={neighborhoodRef} label="Bairro" value={neighborhood} onChangeText={setNeighborhood} leftIcon="map-pin" placeholder="Nome do bairro" returnKeyType="next" onSubmitEditing={() => cepRef.current?.focus()} />
          <AppInput ref={cepRef} label="CEP" value={cep} onChangeText={setCep} leftIcon="map" placeholder="00000-000" returnKeyType="next" onSubmitEditing={() => workHoursRef.current?.focus()} keyboardType="numbers-and-punctuation" />

          <Text style={styles.sectionLabel}>Horário e Data</Text>
          <AppInput ref={workHoursRef} label="Horário de Trabalho" value={workHours} onChangeText={setWorkHours} leftIcon="clock" placeholder="Ex: 19:00 às 07:00" returnKeyType="next" onSubmitEditing={() => shiftDateRef.current?.focus()} />
          <AppInput ref={shiftDateRef} label="Data do Plantão" value={shiftDate} onChangeText={setShiftDate} leftIcon="calendar" placeholder="DD/MM/AAAA" returnKeyType="next" onSubmitEditing={() => descRef.current?.focus()} keyboardType="numbers-and-punctuation" />

          <Text style={styles.sectionLabel}>Detalhes</Text>
          <AppInput ref={descRef} label="Descrição da Vaga" value={description} onChangeText={setDescription} leftIcon="file-text" placeholder="Descreva as necessidades do paciente..." returnKeyType="next" onSubmitEditing={() => tasksRef.current?.focus()} multiline numberOfLines={4} />
          <AppInput ref={tasksRef} label="Tarefas" value={tasks} onChangeText={setTasks} leftIcon="list" placeholder="Liste as tarefas a serem realizadas..." returnKeyType="next" onSubmitEditing={() => valueRef.current?.focus()} multiline numberOfLines={3} />

          <AppInput
            ref={valueRef}
            label="Valor do Plantão"
            value={rawValue ? formatCurrency(rawValue) : ""}
            onChangeText={(text) => setRawValue(text.replace(/\D/g, ""))}
            leftIcon="dollar-sign"
            placeholder="R$ 0,00"
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>{loading ? "Publicando..." : "Publicar Vaga"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modal.visible}
        onClose={() => {
          setModal({ ...modal, visible: false });
          if (modal.success) router.push("/(client)/my-vacancies");
        }}
        title={modal.success ? "Vaga Publicada!" : "Atenção"}
        message={modal.message}
        icon={<Feather name={modal.success ? "check-circle" : "alert-circle"} size={40} color={modal.success ? "#16a34a" : "#ef4444"} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#14532d", paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: { padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 10, marginTop: 6 },
  submitBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
