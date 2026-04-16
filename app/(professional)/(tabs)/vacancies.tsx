import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import * as Haptics from "expo-haptics";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppModal } from "@/components/ui/AppModal";
import { VacancyCard } from "@/components/ui/VacancyCard";
import { useApp } from "@/context/AppContext";
import { JobVacancy } from "@/types";

type WorkTypeFilter = "Todos" | "Plantão" | "Fixo";

function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "R$ 0,00";

  const numericValue = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

function currencyInputToNumber(value: string): number {
  const digits = value.replace(/\D/g, "");

  if (!digits) return 0;

  return Number(digits) / 100;
}

function getWorkTypeLabel(vacancy: JobVacancy): "Plantão" | "Fixo" {
  const raw =
    String(
      (vacancy as any)?.workType ??
        (vacancy as any)?.vacancyType ??
        (vacancy as any)?.type ??
        (vacancy as any)?.jobType ??
        ""
    )
      .trim()
      .toLowerCase();

  if (
    raw.includes("fixo") ||
    raw.includes("clt") ||
    raw.includes("efetivo") ||
    raw.includes("mensal")
  ) {
    return "Fixo";
  }

  return "Plantão";
}

export default function VacanciesScreen() {
  const { vacancies, credits, applyToVacancy, loadVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [loading, setLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null);
  const [counterValue, setCounterValue] = useState("R$ 0,00");
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCounterInvalidModal, setShowCounterInvalidModal] = useState(false);
  const [counterInvalidMessage, setCounterInvalidMessage] = useState("");
  const [isWithCounter, setIsWithCounter] = useState(false);
  const [selectedUf, setSelectedUf] = useState("Todos");
  const [selectedWorkType, setSelectedWorkType] = useState<WorkTypeFilter>("Todos");
  const counterRef = useRef<TextInput>(null);

  useEffect(() => {
    loadVacancies();
  }, []);

  const ufOptions = useMemo(() => {
    const set = new Set<string>();

    vacancies.forEach((vacancy) => {
      const uf = String((vacancy as any)?.state ?? "").trim().toUpperCase();
      if (uf) set.add(uf);
    });

    return ["Todos", ...Array.from(set).sort()];
  }, [vacancies]);

  const filteredVacancies = useMemo(() => {
    return vacancies.filter((vacancy) => {
      const vacancyUf = String((vacancy as any)?.state ?? "").trim().toUpperCase();
      const workType = getWorkTypeLabel(vacancy);

      const matchUf = selectedUf === "Todos" || vacancyUf === selectedUf;
      const matchWorkType = selectedWorkType === "Todos" || workType === selectedWorkType;

      return matchUf && matchWorkType;
    });
  }, [vacancies, selectedUf, selectedWorkType]);

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

    setCounterValue("R$ 0,00");
    setShowCounterModal(true);

    setTimeout(() => {
      counterRef.current?.focus();
    }, 150);
  };

  const handleCounterSubmit = () => {
    if (!selectedVacancy) return;

    const val = currencyInputToNumber(counterValue);

    if (val < 140) {
      setCounterInvalidMessage("A contraproposta não pode ser inferior a R$ 140,00.");
      setShowCounterInvalidModal(true);
      return;
    }

    if (val === selectedVacancy.value) {
      setCounterInvalidMessage("A contraproposta não pode ser igual ao valor da vaga.");
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

    const counterVal = isWithCounter ? currencyInputToNumber(counterValue) : undefined;
    const result = await applyToVacancy(selectedVacancy.id, counterVal);

    setLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSuccessModal(true);
    } else {
      setShowNoCreditsModal(true);
    }
  };

  const headerRightContent = (
    <View style={styles.headerRight}>
      <View style={styles.creditsBox}>
        <Feather name="star" size={13} color="#fbbf24" />
        <Text style={styles.creditsText}>
          {credits} crédito{credits !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Filtrar por UF</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {ufOptions.map((uf) => {
            const active = selectedUf === uf;

            return (
              <TouchableOpacity
                key={uf}
                style={[
                  styles.chip,
                  active ? styles.chipActive : styles.chipInactive,
                ]}
                onPress={() => setSelectedUf(uf)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextActive : styles.chipTextInactive,
                  ]}
                >
                  {uf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filtersBlock}>
        <Text style={styles.filterLabel}>Tipo de vaga</Text>
        <View style={styles.subFilterRow}>
          {(["Todos", "Plantão", "Fixo"] as WorkTypeFilter[]).map((type) => {
            const active = selectedWorkType === type;

            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.subChip,
                  active ? styles.subChipActive : styles.subChipInactive,
                ]}
                onPress={() => setSelectedWorkType(type)}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.subChipText,
                    active ? styles.subChipTextActive : styles.subChipTextInactive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filteredVacancies.length} vaga{filteredVacancies.length !== 1 ? "s" : ""} encontrada
          {filteredVacancies.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Vagas Disponíveis"
        showBack
        rightContent={headerRightContent}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1e40af" />
        </View>
      ) : (
        <FlatList
          data={filteredVacancies}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 80 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={loadVacancies}
          refreshing={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="briefcase" size={48} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptyDesc}>
                Tente trocar os filtros para ver mais resultados.
              </Text>
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

      <AppModal
        visible={showNoCreditsModal}
        onClose={() => setShowNoCreditsModal(false)}
        title="Sem créditos"
        message="Você não possui créditos suficientes para se candidatar a esta vaga."
        type="info"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowNoCreditsModal(false),
        }}
      />

      <AppModal
        visible={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title="Contraproposta"
        message={`Vaga: ${
          selectedVacancy
            ? selectedVacancy.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })
            : "R$ 0,00"
        }`}
        type="confirm"
        secondaryAction={{
          label: "Cancelar",
          onPress: () => setShowCounterModal(false),
        }}
        primaryAction={{
          label: "Confirmar",
          onPress: handleCounterSubmit,
        }}
      >
        <View style={styles.counterInputWrap}>
          <Text style={styles.counterLabel}>Informe sua contraproposta</Text>

          <View style={styles.counterInputBox}>
            <TextInput
              ref={counterRef}
              value={counterValue}
              onChangeText={(text) => setCounterValue(formatCurrencyInput(text))}
              keyboardType="numeric"
              placeholder="R$ 0,00"
              placeholderTextColor="#94a3b8"
              style={styles.counterInput}
              selectTextOnFocus
            />
          </View>

          <Text style={styles.counterHint}>
            Mínimo: R$ 140,00 e diferente do valor da vaga.
          </Text>
        </View>
      </AppModal>

      <AppModal
        visible={showCounterInvalidModal}
        onClose={() => setShowCounterInvalidModal(false)}
        title="Valor inválido"
        message={counterInvalidMessage}
        type="error"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowCounterInvalidModal(false),
        }}
      />

      <AppModal
        visible={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar candidatura"
        message={
          isWithCounter
            ? `Você está se candidatando à vaga "${selectedVacancy?.title}" com contraproposta de ${counterValue}. Isso usará 1 crédito.`
            : `Você está se candidatando à vaga "${selectedVacancy?.title}". Isso usará 1 crédito.`
        }
        type="confirm"
        secondaryAction={{
          label: "Cancelar",
          onPress: () => setShowConfirmModal(false),
        }}
        primaryAction={{
          label: "Confirmar",
          onPress: handleConfirm,
        }}
      />

      <AppModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Candidatura enviada!"
        message="Sua candidatura foi registrada com sucesso. O cliente entrará em contato se você for selecionado."
        type="success"
        primaryAction={{
          label: "Fechar",
          onPress: () => setShowSuccessModal(false),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },

  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  creditsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  creditsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  list: {
    padding: 16,
  },

  listHeader: {
    paddingBottom: 10,
  },

  filtersBlock: {
    marginBottom: 14,
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },

  chipsRow: {
    paddingRight: 8,
    gap: 8,
  },

  chip: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  chipActive: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },

  chipInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },

  chipText: {
    fontSize: 14,
    fontWeight: "700",
  },

  chipTextActive: {
    color: "#ffffff",
  },

  chipTextInactive: {
    color: "#334155",
  },

  subFilterRow: {
    flexDirection: "row",
    gap: 8,
  },

  subChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },

  subChipActive: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },

  subChipInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },

  subChipText: {
    fontSize: 14,
    fontWeight: "700",
  },

  subChipTextActive: {
    color: "#ffffff",
  },

  subChipTextInactive: {
    color: "#334155",
  },

  resultsRow: {
    marginBottom: 6,
  },

  resultsText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 10,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },

  emptyDesc: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },

  counterInputWrap: {
    width: "100%",
  },

  counterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 8,
  },

  counterInputBox: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  counterInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  counterHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },
});