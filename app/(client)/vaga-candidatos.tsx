import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";

const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const CLIENT_PRIMARY = "#16a34a";
const STAR = "#f59e0b";

type CandidateItem = {
  id: string;
  nome: string;
  profissao: string;
  sexo: string;
  idade: number;
  cidade: string;
  estado: string;
  bairro: string;
  notaMedia: number;
  totalPlantoes: number;
  docsChecados: boolean;
};

const MOCK_CANDIDATOS: CandidateItem[] = [
  {
    id: "1",
    nome: "Mariana Souza",
    profissao: "Técnica de Enfermagem",
    sexo: "Feminino",
    idade: 32,
    cidade: "Belo Horizonte",
    estado: "MG",
    bairro: "Santo Antônio",
    notaMedia: 4.9,
    totalPlantoes: 84,
    docsChecados: true,
  },
  {
    id: "2",
    nome: "Patrícia Lima",
    profissao: "Cuidadora de Idosos",
    sexo: "Feminino",
    idade: 41,
    cidade: "Belo Horizonte",
    estado: "MG",
    bairro: "Funcionários",
    notaMedia: 4.7,
    totalPlantoes: 51,
    docsChecados: true,
  },
  {
    id: "3",
    nome: "Carlos Henrique",
    profissao: "Enfermeiro",
    sexo: "Masculino",
    idade: 29,
    cidade: "Contagem",
    estado: "MG",
    bairro: "Eldorado",
    notaMedia: 4.6,
    totalPlantoes: 37,
    docsChecados: false,
  },
];

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

function formatDate(value?: string) {
  if (!value) return "--";

  const raw = value.includes("T") ? value.split("T")[0] : value;
  const [year, month, day] = raw.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatHour(value?: string) {
  if (!value) return "--";
  return value.slice(0, 5);
}

function formatRating(value?: number | null) {
  const safe = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return safe.toFixed(2).replace(".", ",");
}

function renderStars(value?: number | null) {
  const safe = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const rounded = Math.max(0, Math.min(5, Math.round(safe)));

  return Array.from({ length: 5 }).map((_, index) => {
    const filled = index < rounded;

    return (
      <Ionicons
        key={`star-${index}`}
        name={filled ? "star" : "star-outline"}
        size={14}
        color={STAR}
      />
    );
  });
}

function getInitials(value?: string | null) {
  if (!value) return "P";

  const parts = value
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "P";

  return parts.map((item) => item.charAt(0).toUpperCase()).join("");
}
function getParamValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] || fallback;
  }

  return value ?? fallback;
}

export default function VagaCandidatosScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

 const vagaId = getParamValue(params.vagaId, "");
const titulo =
  getParamValue(params.titulo) ||
  getParamValue(params.titulo_anuncio) ||
  getParamValue(params.titulo_personalizado) ||
  "Vaga sem título";

const status = getParamValue(params.status, "Publicada");
const dataPlantao =
  getParamValue(params.dataPlantao) || getParamValue(params.data_plantao);
const horarioInicio =
  getParamValue(params.horarioInicio) || getParamValue(params.horario_inicio);
const horarioFim =
  getParamValue(params.horarioFim) || getParamValue(params.horario_fim);
const cidade = getParamValue(params.cidade);
const estado = getParamValue(params.estado);
const bairro = getParamValue(params.bairro);

const valorPlantaoRaw =
  getParamValue(params.valorPlantao) || getParamValue(params.valor_plantao);
const valorPlantao = valorPlantaoRaw || 0;

const quantidadeCandidaturas = Number(
  getParamValue(params.quantidadeCandidaturas) ||
    getParamValue(params.applicationsCount) ||
    String(MOCK_CANDIDATOS.length)
);

  const candidatos = useMemo(() => MOCK_CANDIDATOS, []);

  function abrirCandidato(item: CandidateItem) {
  router.push({
    pathname: "/professional-profile-view",
    params: {
      vagaId,
      profissionalId: item.id,
      nomeCompleto: item.nome,
      cargo: item.profissao,
      sexo: item.sexo,
      idade: String(item.idade),
      cidade: item.cidade,
      estado: item.estado,
      bairro: item.bairro,
      notaMedia: String(item.notaMedia),
      totalAvaliacoes: "0",
      totalPlantoes: String(item.totalPlantoes),
      verificadoAtestado: item.docsChecados ? "true" : "false",
      verificadoAntecedentes: item.docsChecados ? "true" : "false",
      verificadoRg: item.docsChecados ? "true" : "false",
      verificadoCpf: item.docsChecados ? "true" : "false",
      verificadoEndereco: item.docsChecados ? "true" : "false",
      verificadoReferencias: item.docsChecados ? "true" : "false",
    },
  } as any);
}

  return (
    <View style={styles.container}>
      <AppHeader title="Candidatos da vaga" showBack />

      <FlatList
        data={candidatos}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 28,
        }}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryTitle}>{titulo}</Text>
                  <Text style={styles.summaryStatus}>{status}</Text>
                </View>

                <Text style={styles.summaryPrice}>
                  {formatCurrency(valorPlantao)}
                </Text>
              </View>

              <View style={styles.summaryInfoRow}>
                <Feather name="calendar" size={16} color={MUTED} />
                <Text style={styles.summaryInfoText}>
                  {formatDate(dataPlantao)}
                </Text>
              </View>

              <View style={styles.summaryInfoRow}>
                <Feather name="clock" size={16} color={MUTED} />
                <Text style={styles.summaryInfoText}>
                  {formatHour(horarioInicio)} às {formatHour(horarioFim)}
                </Text>
              </View>

              <View style={styles.summaryInfoRow}>
                <Feather name="map-pin" size={16} color={MUTED} />
                <Text style={styles.summaryInfoText}>
                  {[cidade && estado ? `${cidade}/${estado}` : cidade || estado, bairro]
                    .filter(Boolean)
                    .join(" • ") || "--"}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryBottomRow}>
                <View style={styles.summaryCandidateBadge}>
                  <Feather name="users" size={16} color={CLIENT_PRIMARY} />
                  <Text style={styles.summaryCandidateText}>
                    {quantidadeCandidaturas} candidatura
                    {quantidadeCandidaturas !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lista de candidatos</Text>
              <Text style={styles.sectionSubtitle}>
                Toque em um candidato para ver mais detalhes
              </Text>
            </View>
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Feather name="users" size={30} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Nenhum candidato ainda</Text>
            <Text style={styles.emptyText}>
              Quando profissionais se candidatarem a esta vaga, eles aparecerão aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.candidateCard}
            onPress={() => abrirCandidato(item)}
          >
            <View style={styles.candidateTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
              </View>

              <View style={styles.candidateInfoArea}>
                <Text style={styles.candidateName}>{item.nome}</Text>
                <Text style={styles.candidateProfession}>{item.profissao}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.sexo}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>{item.idade} anos</Text>
                </View>

                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={14} color={MUTED} />
                  <Text style={styles.locationText}>
                    {item.cidade}/{item.estado} • {item.bairro}
                  </Text>
                </View>
              </View>

              <Feather name="chevron-right" size={20} color="#94a3b8" />
            </View>

            <View style={styles.candidateBottomRow}>
              <View style={styles.ratingWrap}>
                <View style={styles.starsRow}>{renderStars(item.notaMedia)}</View>
                <Text style={styles.ratingText}>
                  {formatRating(item.notaMedia)}
                </Text>
              </View>

              <View
                style={[
                  styles.docBadge,
                  item.docsChecados ? styles.docBadgeOk : styles.docBadgePending,
                ]}
              >
                <Feather
                  name={item.docsChecados ? "shield" : "alert-circle"}
                  size={14}
                  color={item.docsChecados ? CLIENT_PRIMARY : "#b45309"}
                />
                <Text
                  style={[
                    styles.docBadgeText,
                    item.docsChecados
                      ? styles.docBadgeTextOk
                      : styles.docBadgeTextPending,
                  ]}
                >
                  {item.docsChecados ? "Documentos checados" : "Checagem pendente"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },

  summaryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  summaryStatus: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  summaryPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: CLIENT_PRIMARY,
  },

  summaryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  summaryInfoText: {
    flex: 1,
    fontSize: 14,
    color: MUTED,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },

  summaryBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },

  summaryCandidateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  summaryCandidateText: {
    fontSize: 13,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT,
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
  },

  candidateCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  candidateTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },

  candidateInfoArea: {
    flex: 1,
  },

  candidateName: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
  },

  candidateProfession: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  metaText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
  },

  metaDot: {
    fontSize: 12,
    color: "#94a3b8",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  locationText: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },

  candidateBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    gap: 10,
  },

  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  ratingText: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  docBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },

  docBadgeOk: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },

  docBadgePending: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },

  docBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  docBadgeTextOk: {
    color: CLIENT_PRIMARY,
  },

  docBadgeTextPending: {
    color: "#b45309",
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 34,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: MUTED,
    textAlign: "center",
  },
});