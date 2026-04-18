import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { VacancyCard } from "@/components/ui/VacancyCard";
import { AppModal } from "@/components/ui/AppModal";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";

type VacancyItem = {
  id: string;
  status?: string;
  titulo_anuncio?: string;
  titulo_personalizado?: string;
  nome_paciente?: string;
  cidade?: string;
  estado?: string;
  bairro?: string;
  data_plantao?: string;
  horario_inicio?: string;
  horario_fim?: string;
  valor_plantao?: number | string | null;
  applicationsCount?: number;
  is_public?: boolean;
  pagamento_liberado?: boolean;
  tipo_vaga?: string;
  turno?: string;
  solicitante_nome?: string;
  descricao?: string;
  tarefas?: string;
  cuidados?: string;
  patologias?: string;
  particularidades?: string;
  value?: number;
  important_observations?: string[];
};

function formatCurrency(value?: number | string | null) {
  const numericValue =
    typeof value === "string" ? Number(value.replace(",", ".")) : value;

  if (numericValue == null || Number.isNaN(numericValue)) {
    return "R$ 0,00";
  }

  return Number(numericValue).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

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

function getVacancyNumericValue(item: VacancyItem): number {
  if (typeof item.valor_plantao === "number") return item.valor_plantao;

  if (typeof item.valor_plantao === "string") {
    const parsed = Number(item.valor_plantao.replace(",", "."));
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (typeof item.value === "number") return item.value;

  return 0;
}

function getCardTitle(item: VacancyItem) {
  return (
    item.titulo_personalizado ||
    item.titulo_anuncio ||
    item.nome_paciente ||
    "Vaga sem título"
  );
}

export default function ProfessionalDashboard() {
  const { user } = useAuth();
  const { vacancies, credits, unreadCount, loadVacancies } = useApp();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedVacancy, setSelectedVacancy] = useState<VacancyItem | null>(
    null
  );
  const [counterValue, setCounterValue] = useState("R$ 0,00");
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNoCreditsModal, setShowNoCreditsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCounterInvalidModal, setShowCounterInvalidModal] = useState(false);
  const [counterInvalidMessage, setCounterInvalidMessage] = useState("");
  const [isWithCounter, setIsWithCounter] = useState(false);

  const counterRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      loadVacancies();
    }, [loadVacancies])
  );

  const firstName =
    user?.firstName || user?.email?.split("@")[0] || "Profissional";

  const safeVacancies = ((vacancies || []) as VacancyItem[]);
  const featuredVacancies = safeVacancies.slice(0, 1);

  const handleApply = (vacancy: VacancyItem) => {
    setSelectedVacancy(vacancy);

    if ((credits ?? 0) < 1) {
      setShowNoCreditsModal(true);
      return;
    }

    setIsWithCounter(false);
    setShowConfirmModal(true);
  };

  const handleCounterProposal = (vacancy: VacancyItem) => {
    setSelectedVacancy(vacancy);

    if ((credits ?? 0) < 1) {
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
    const vacancyValue = getVacancyNumericValue(selectedVacancy);

    if (val < 140) {
      setCounterInvalidMessage(
        "A contraproposta não pode ser inferior a R$ 140,00."
      );
      setShowCounterInvalidModal(true);
      return;
    }

    if (val === vacancyValue) {
      setCounterInvalidMessage(
        "A contraproposta não pode ser igual ao valor da vaga."
      );
      setShowCounterInvalidModal(true);
      return;
    }

    setShowCounterModal(false);
    setIsWithCounter(true);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#123C86", "#2F80ED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hero,
          { paddingTop: (Platform.OS === "web" ? 28 : insets.top) + 14 },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Olá, {firstName}</Text>
            <Text style={styles.heroSubtitle}>Profissional da Saúde</Text>
            <Text style={styles.heroRating}>5 estrelas - 5,00</Text>
          </View>

          <View style={styles.heroRight}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => router.push("/(professional)/notifications")}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={20} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.creditsPill}
              onPress={() => router.push("/(professional)/creditos")}
              activeOpacity={0.75}
            >
              <Feather name="award" size={14} color="#f59e0b" />
              <Text style={styles.creditsPillText}>
                {credits > 0 ? "Ilimitados" : "0 créditos"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.85}
            onPress={() => router.push("/(professional)/(tabs)/applications")}
          >
            <Feather name="send" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Candidaturas</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Feather name="star" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Selecionado</Text>
          </View>

          <View style={styles.statCard}>
            <Feather name="users" size={16} color="#dbeafe" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Contratados</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {credits === 0 && (
          <TouchableOpacity style={styles.creditAlert} activeOpacity={0.85}>
            <Feather name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.creditAlertText}>
              Seu crédito diário acabou. Adquira mais créditos para se
              candidatar.
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <TouchableOpacity
            style={styles.sectionExploreBtn}
            onPress={() => router.push("/(professional)/(tabs)/vacancies")}
            activeOpacity={0.75}
          >
            <Feather name="briefcase" size={18} color="#1e40af" />
            <Text style={styles.sectionExploreText}>
              Explorar todas as vagas ({safeVacancies.length})
            </Text>
            <Feather name="arrow-right" size={18} color="#1e40af" />
          </TouchableOpacity>
        </View>

        {featuredVacancies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="briefcase" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhuma vaga disponível</Text>
            <Text style={styles.emptyDesc}>
              Volte mais tarde para verificar novas oportunidades.
            </Text>
          </View>
        ) : (
          featuredVacancies.map((v) => (
            <VacancyCard
              key={v.id}
              vacancy={v}
              showActions={true}
              onApply={() => handleApply(v)}
              onCounterProposal={() => handleCounterProposal(v)}
            />
          ))
        )}
      </ScrollView>

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
            ? formatCurrency(getVacancyNumericValue(selectedVacancy))
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
              placeholderTextColor="#a78bfa"
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
            ? `Você está se candidatando à vaga "${
                selectedVacancy ? getCardTitle(selectedVacancy) : ""
              }" com contraproposta de ${counterValue}. Isso usará 1 crédito.`
            : `Você está se candidatando à vaga "${
                selectedVacancy ? getCardTitle(selectedVacancy) : ""
              }". Isso usará 1 crédito.`
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
        message="Por enquanto este fluxo está mockado. Os modais já estão funcionando no dashboard."
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  hero: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "500",
  },

  heroRating: {
    color: "#FDE68A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  heroRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bellBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  badge: {
    position: "absolute",
    top: 1,
    right: 0,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  creditsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  creditsPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 92,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: 0,
    marginBottom: 0,
  },

  statLabel: {
    color: "#DCEAFE",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  creditAlert: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  creditAlertText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionExploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },

  sectionExploreText: {
    flex: 1,
    color: "#1E40AF",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },

  emptyDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },

  counterInputWrap: {
    width: "100%",
  },

  counterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2e1065",
    marginBottom: 8,
  },

  counterInputBox: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#d8b4fe",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  counterInput: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e1065",
  },

  counterHint: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: "#7c3aed",
  },
});