import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CustomModal } from "@/components/ui/CustomModal";
import { VacancyCard } from "@/components/ui/VacancyCard";
import { AppInput } from "@/components/ui/AppInput";
import { useApp } from "@/context/AppContext";
import { JobVacancy } from "@/types";
import * as Haptics from "expo-haptics";

export default function VacanciesScreen() {
  const { vacancies, credits, applyToVacancy, loadVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
  const [counterValue, setCounterValue] = useState("");
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCounterInvalidModal, setShowCounterInvalidModal] = useState(false);
  const [isWithCounter, setIsWithCounter] = useState(false);
  const counterRef = useRef<TextInput>(null);

  const formatCurrencyInput = (val: string) => {
    const nums = val.replace(/\D/g, "");
    if (!nums) return "";
    const num = parseInt(nums, 10) / 100;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const parseCurrencyValue = (val: string): number => {
    const nums = val.replace(/\D/g, "");
    return nums ? parseInt(nums, 10) / 100 : 0;
  };

  const handleApply = (vacancy: JobVacancy) => {
    setSelectedVacancy(vacancy);
    if (credits < 1) {
      setShowNoCreditsModal(true);
      return;
    }
    setIsWithCounter(false);
    setShowConfirmModal(true);
  };

  const handleCounterProposal = (vacancy: JobVacancy) => {
    setSelectedVacancy(vacancy);
    if (credits < 1) {
      setShowNoCreditsModal(true);
      return;
    }
    setCounterValue("");
    setShowCounterModal(true);
  };

  const handleCounterSubmit = () => {
    const val = parseCurrencyValue(counterValue);
    if (val <= 0) {
      setShowCounterInvalidModal(true);
      return;
    }
    if (selectedVacancy && val === selectedVacancy.value) {
      setShowCounterInvalidModal(true);
      return;
    }
    setShowCounterModal(false);
    setIsWithCounter(true);
    setShowConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedVacancy) return;
    setShowConfirmModal(false);
    setLoading(true);
    const counterVal = isWithCounter ? parseCurrencyValue(counterValue) : undefined;
    const result = await applyToVacancy(selectedVacancy.id, counterVal);
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } else {
      setShowNoCreditsModal(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={styles.headerTitle}>Vagas Disponíveis</Text>
        <View style={styles.creditsBox}>
          <Feather name="star" size={13} color="#fbbf24" />
          <Text style={styles.creditsText}>{credits} crédito{credits !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <FlatList
          data={vacancies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadVacancies}
          refreshing={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="briefcase" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Nenhuma vaga disponível</Text>
              <Text style={styles.emptyDesc}>Puxe para baixo para atualizar.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <VacancyCard
              vacancy={item}
              onApply={() => handleApply(item)}
              onCounterProposal={() => handleCounterProposal(item)}
            />
          )}
        />
      )}

      <CustomModal
        visible={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        title="Sem Créditos"
        message="Você não possui créditos suficientes para se candidatar a esta vaga."
        icon={<Feather name="star" size={40} color="#f59e0b" />}
        buttons={[
          { label: "Agora não", onPress: () => setShowNoCreditsModal(false), variant: "secondary" },
          {
            label: "Adquirir crédito",
            onPress: () => setShowNoCreditsModal(false),
            variant: "primary",
          },
        ]}
      />

      <CustomModal
        visible={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title="Contraproposta"
        message={`Vaga: ${formatCurrencyInput(String((selectedVacancy?.value ?? 0) * 100))}\n\nA contraproposta não pode ser igual ao valor da vaga.`}
        icon={<Feather name="dollar-sign" size={40} color="#1e40af" />}
        buttons={[
          { label: "Cancelar", onPress: () => setShowCounterModal(false), variant: "secondary" },
          { label: "Confirmar", onPress: handleCounterSubmit, variant: "primary" },
        ]}
      />

      <CustomModal
        visible={showCounterInvalidModal}
        onClose={() => setShowCounterInvalidModal(false)}
        title="Valor Inválido"
        message="A contraproposta não pode ser igual ao valor da vaga ou zero. Insira um valor diferente."
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />

      <CustomModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Candidatura"
        message={
          isWithCounter
            ? `Você está se candidatando à vaga "${selectedVacancy?.title}" com contraproposta de ${counterValue}. Isso usará 1 crédito.`
            : `Você está se candidatando à vaga "${selectedVacancy?.title}". Isso usará 1 crédito.`
        }
        icon={<Feather name="check-circle" size={40} color="#1e40af" />}
        buttons={[
          { label: "Cancelar", onPress: () => setShowConfirmModal(false), variant: "secondary" },
          { label: "Confirmar", onPress: handleConfirm, variant: "primary" },
        ]}
      />

      <CustomModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Candidatura Enviada!"
        message="Sua candidatura foi registrada com sucesso. O cliente entrará em contato se você for selecionado."
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  creditsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  creditsText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  list: { padding: 16 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#475569" },
  emptyDesc: { fontSize: 13, color: "#94a3b8" },
});
