import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";
import colors from "@/constants/colors";
import { criarReview } from "@/lib/services/review-service";
import {
  getReviewCommentOptions,
  type ReviewCommentOption,
} from "@/lib/services/review-comment-options-service";
import { useAuth } from "@/context/AuthContext";

const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const CLIENT_PRIMARY = "#16a34a";
const STAR = "#f59e0b";

function getFirstName(value?: string | null) {
  if (!value) return "Profissional";
  const first = value.trim().split(" ")[0];
  return first || "Profissional";
}

function getInitial(value?: string | null) {
  const first = getFirstName(value);
  return first.charAt(0).toUpperCase();
}

export default function AvaliarProfissionalScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [nota, setNota] = useState(0);
  const [comentarioLivre, setComentarioLivre] = useState("");
  const [opcoes, setOpcoes] = useState<ReviewCommentOption[]>([]);
  const [opcaoSelecionada, setOpcaoSelecionada] =
    useState<ReviewCommentOption | null>(null);

  const [loadingOpcoes, setLoadingOpcoes] = useState(false);
  const [loadingEnviar, setLoadingEnviar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const profissionalNome = String(params.profissionalNome || "Profissional");
  const profissionalAuthUserId = String(params.profissionalAuthUserId || "");
  const cargo = String(params.cargo || "");
  const vagaId = String(params.vagaId || "");
  const plantaoId = params.plantaoId ? String(params.plantaoId) : null;
  const contratacaoId = params.contratacaoId
    ? String(params.contratacaoId)
    : null;
  const plantaoEncerrado = String(params.plantaoEncerrado || "") === "true";

  const avatarLetter = useMemo(
    () => getInitial(profissionalNome),
    [profissionalNome]
  );

  useEffect(() => {
    let active = true;

    async function carregarOpcoes() {
      if (!nota) {
        setOpcoes([]);
        setOpcaoSelecionada(null);
        return;
      }

      setLoadingOpcoes(true);
      setErro(null);
      setOpcaoSelecionada(null);

      const result = await getReviewCommentOptions({
        roleAvaliador: "client",
        roleAvaliado: "professional",
        nota,
      });

      if (!active) return;

      if (!result.success) {
        setOpcoes([]);
        setErro(result.error || "Erro ao carregar opções.");
      } else {
        setOpcoes(result.data);
      }

      setLoadingOpcoes(false);
    }

    carregarOpcoes();

    return () => {
      active = false;
    };
  }, [nota]);

  const podeMostrarComentarioLivre = nota === 5;

  const botaoDesabilitado =
    loadingEnviar ||
    !user?.id ||
    !vagaId ||
    !profissionalAuthUserId ||
    !plantaoEncerrado ||
    nota < 1 ||
    !opcaoSelecionada;

  async function handleEnviar() {
    if (botaoDesabilitado) return;

    setLoadingEnviar(true);
    setErro(null);

    const result = await criarReview({
      vagaId,
      plantaoId,
      contratacaoId,
      avaliadorAuthUserId: user!.id,
      avaliadoAuthUserId: profissionalAuthUserId,
      avaliadorRole: "client",
      avaliadoRole: "professional",
      nota,
      comentarioOpcaoId: opcaoSelecionada!.id,
      comentarioPredefinido: opcaoSelecionada!.label,
      comentario: podeMostrarComentarioLivre ? comentarioLivre : null,
      cargo: cargo || null,
      plantaoEncerrado,
    });

    setLoadingEnviar(false);

    if (!result.success) {
      setErro(result.error || "Erro ao enviar avaliação.");
      return;
    }

    router.back();
  }

  function renderStars() {
    return (
      <View style={styles.starsWrap}>
        {Array.from({ length: 5 }).map((_, index) => {
          const value = index + 1;
          const filled = value <= nota;

          return (
            <TouchableOpacity
              key={`star-${value}`}
              activeOpacity={0.85}
              onPress={() => setNota(value)}
              style={styles.starButton}
            >
              <Ionicons
                name={filled ? "star" : "star-outline"}
                size={34}
                color={STAR}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Avaliar profissional" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 28,
          },
        ]}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </View>

            <View style={styles.profileTextArea}>
              <Text style={styles.profileName}>{getFirstName(profissionalNome)}</Text>

              {!!cargo && (
                <View style={styles.infoRow}>
                  <Feather name="briefcase" size={14} color={MUTED} />
                  <Text style={styles.infoText}>{cargo}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Feather name="check-circle" size={14} color={CLIENT_PRIMARY} />
                <Text style={styles.infoText}>
                  {plantaoEncerrado
                    ? "Plantão encerrado, avaliação liberada"
                    : "A avaliação só será liberada após o encerramento do plantão"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sua nota</Text>
          <Text style={styles.sectionDescription}>
            Escolha de 1 a 5 estrelas para avaliar este profissional.
          </Text>

          {renderStars()}

          {nota > 0 && (
            <Text style={styles.noteText}>
              {nota === 1 && "Avaliação muito abaixo do esperado"}
              {nota === 2 && "Avaliação abaixo do esperado"}
              {nota === 3 && "Avaliação razoável"}
              {nota === 4 && "Boa avaliação"}
              {nota === 5 && "Excelente avaliação"}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Comentário da avaliação</Text>
          <Text style={styles.sectionDescription}>
            Escolha uma opção pronta. O campo livre só aparece em avaliações de 5 estrelas.
          </Text>

          {!nota ? (
            <View style={styles.infoBox}>
              <Feather name="message-square" size={18} color={MUTED} />
              <Text style={styles.infoBoxText}>
                Selecione a nota primeiro para carregar os comentários.
              </Text>
            </View>
          ) : loadingOpcoes ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="small" color={CLIENT_PRIMARY} />
              <Text style={styles.loaderText}>Carregando opções...</Text>
            </View>
          ) : opcoes.length === 0 ? (
            <View style={styles.infoBox}>
              <Feather name="alert-circle" size={18} color={MUTED} />
              <Text style={styles.infoBoxText}>
                Nenhuma opção encontrada para essa nota.
              </Text>
            </View>
          ) : (
            <View style={styles.optionsWrap}>
              {opcoes.map((item) => {
                const selecionado = opcaoSelecionada?.id === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={[
                      styles.optionButton,
                      selecionado && styles.optionButtonSelected,
                    ]}
                    onPress={() => setOpcaoSelecionada(item)}
                  >
                    <View
                      style={[
                        styles.optionRadio,
                        selecionado && styles.optionRadioSelected,
                      ]}
                    >
                      {selecionado && <View style={styles.optionRadioInner} />}
                    </View>

                    <Text
                      style={[
                        styles.optionText,
                        selecionado && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {podeMostrarComentarioLivre && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Comentário complementar</Text>
            <Text style={styles.sectionDescription}>
              Opcional. Use este campo apenas se quiser complementar a avaliação de 5 estrelas.
            </Text>

            <TextInput
              value={comentarioLivre}
              onChangeText={(text) => setComentarioLivre(text.slice(0, 300))}
              placeholder="Escreva um complemento da sua avaliação"
              placeholderTextColor={colors.light?.border || "#9ca3af"}
              multiline
              textAlignVertical="top"
              style={styles.textArea}
              maxLength={300}
            />

            <Text style={styles.counterText}>{comentarioLivre.length}/300</Text>
          </View>
        )}

        {!!erro && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.submitButton,
            botaoDesabilitado && styles.submitButtonDisabled,
          ]}
          onPress={handleEnviar}
          disabled={botaoDesabilitado}
        >
          {loadingEnviar ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="send" size={18} color="#ffffff" />
              <Text style={styles.submitButtonText}>Enviar avaliação</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  profileCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLetter: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },

  profileTextArea: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 6,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
  },

  sectionDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
  },

  starsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 6,
  },

  starButton: {
    padding: 4,
  },

  noteText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  infoBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: MUTED,
  },

  loaderBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  loaderText: {
    marginTop: 8,
    fontSize: 13,
    color: MUTED,
  },

  optionsWrap: {
    marginTop: 14,
    gap: 10,
  },

  optionButton: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  optionButtonSelected: {
    borderColor: CLIENT_PRIMARY,
    backgroundColor: "#f0fdf4",
  },

  optionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },

  optionRadioSelected: {
    borderColor: CLIENT_PRIMARY,
  },

  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLIENT_PRIMARY,
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT,
    fontWeight: "600",
  },

  optionTextSelected: {
    color: CLIENT_PRIMARY,
  },

  textArea: {
    marginTop: 14,
    minHeight: 120,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: TEXT,
  },

  counterText: {
    marginTop: 8,
    textAlign: "right",
    fontSize: 12,
    color: MUTED,
  },

  errorBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#b91c1c",
    fontWeight: "600",
  },

  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});