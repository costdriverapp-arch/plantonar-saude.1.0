import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  ScrollView,
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
const CLIENT_PRIMARY_DARK = "#14532d";
const CLIENT_ACCENT = "#dcfce7";
const CLIENT_BORDER = "#86efac";
const INFO = "#2563eb";
const STAR = "#f59e0b";

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

function formatPhone(value?: string | null) {
  if (!value) return "--";

  const digits = value.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return value || "--";
}

function normalizePhoneForLink(value?: string | null) {
  const digits = (value || "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatBirthDate(value?: string | null) {
  if (!value) return "--";

  try {
    const date = new Date(value);

    if (isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return value;
  }
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
        size={16}
        color={STAR}
      />
    );
  });
}

function parseBooleanParam(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function getChecklistItems(params: Record<string, any>) {
  return [
    {
      key: "atestado",
      label: "Atestado",
      checked: parseBooleanParam(params.verificadoAtestado),
    },
    {
      key: "antecedentes",
      label: "Antecedentes",
      checked: parseBooleanParam(params.verificadoAntecedentes),
    },
    {
      key: "rg",
      label: "RG",
      checked: parseBooleanParam(params.verificadoRg),
    },
    {
      key: "cpf",
      label: "CPF",
      checked: parseBooleanParam(params.verificadoCpf),
    },
    {
      key: "endereco",
      label: "Endereço",
      checked: parseBooleanParam(params.verificadoEndereco),
    },
    {
      key: "referencias",
      label: "Referências de trabalho",
      checked: parseBooleanParam(params.verificadoReferencias),
    },
  ];
}

export default function ProfessionalProfileViewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const profissionalId = String(
    params.profissionalId || params.professionalId || ""
  );
  const nomeCompleto = String(
    params.nomeCompleto || params.nome || "Profissional"
  );
  const cargo = String(params.cargo || params.profissao || "Profissional");
  const telefone = String(params.telefone || "");
  const whatsapp = String(params.whatsapp || params.telefone || "");
  const cidade = String(params.cidade || "");
  const estado = String(params.estado || "");
  const bairro = String(params.bairro || "");
  const cep = String(params.cep || "");
  const dataNascimento = String(
    params.dataNascimento || params.birthDate || ""
  );
  const notaMedia = Number(params.notaMedia || 0);
  const totalAvaliacoes = Number(params.totalAvaliacoes || 0);
  const totalPlantoes = Number(params.totalPlantoes || 0);

  const checklistItems = useMemo(
    () => getChecklistItems(params as Record<string, any>),
    [params]
  );

  const totalChecados = checklistItems.filter((item) => item.checked).length;
  const whatsappLink = `https://wa.me/${normalizePhoneForLink(whatsapp)}`;
  const phoneLink = `tel:${(telefone || "").replace(/\D/g, "")}`;

  async function handleOpenWhatsApp() {
    if (!normalizePhoneForLink(whatsapp)) return;
    await Linking.openURL(whatsappLink);
  }

  async function handleCall() {
    if (!(telefone || "").replace(/\D/g, "")) return;
    await Linking.openURL(phoneLink);
  }

  function handleVerAvaliacoes() {
    router.push({
      pathname: "/avaliacoes-profissional",
      params: {
        profissionalId,
        profissionalNome: nomeCompleto,
        cidade,
        estado,
        bairro,
      },
    });
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Perfil do profissional" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 28,
          },
        ]}
      >
        <View style={styles.badgeCard}>
          <Text style={styles.badgeProfession}>{cargo}</Text>

          <View style={styles.badgeTopRow}>
            <View style={styles.photoUploadBox}>
              <View style={styles.photoBox}>
                <Text style={styles.avatarText}>{getInitials(nomeCompleto)}</Text>
              </View>
            </View>

            <View style={styles.badgeInfo}>
              <Text style={styles.badgeName}>{nomeCompleto}</Text>
              <Text style={styles.badgeLine}>
                Data. Nasc: {formatBirthDate(dataNascimento)}
              </Text>
              <Text style={styles.badgeLine}>Bairro: {bairro || "--"}</Text>
              <Text style={styles.badgeLine}>CEP: {cep || "--"}</Text>
              <Text style={styles.badgeLine}>
                Cidade: {cidade || "--"}/{estado || "--"}
              </Text>
            </View>
          </View>

          <View style={styles.verifiedRow}>
            <Feather name="shield" size={15} color={CLIENT_PRIMARY} />
            <Text style={styles.verifiedText}>
              Profissional checado e apto para o trabalho.
            </Text>
          </View>
        </View>

        <View style={styles.profileMetricsCard}>
          <View style={styles.metricCard}>
            <View style={styles.starsRow}>{renderStars(notaMedia)}</View>
            <Text style={styles.metricValue}>{formatRating(notaMedia)}</Text>
            <Text style={styles.metricLabel}>Nota média</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalAvaliacoes || 0}</Text>
            <Text style={styles.metricLabel}>Avaliações</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalPlantoes || 0}</Text>
            <Text style={styles.metricLabel}>Plantões</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.viewReviewsButton}
          onPress={handleVerAvaliacoes}
        >
          <Feather name="star" size={18} color="#ffffff" />
          <Text style={styles.viewReviewsButtonText}>Ver avaliações</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <Text style={styles.sectionDescription}>
            Após o pagamento, os dados de contato ficam liberados para o cliente.
          </Text>

          <View style={styles.contactInfoWrap}>
            <View style={styles.contactInfoRow}>
              <Feather name="phone" size={16} color={CLIENT_PRIMARY} />
              <Text style={styles.contactInfoText}>
                Telefone: {formatPhone(telefone)}
              </Text>
            </View>

            <View style={styles.contactInfoRow}>
              <Ionicons
                name="logo-whatsapp"
                size={16}
                color={CLIENT_PRIMARY}
              />
              <Text style={styles.contactInfoText}>
                WhatsApp: {formatPhone(whatsapp)}
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.secondaryButton,
                !normalizePhoneForLink(whatsapp) && styles.buttonDisabled,
              ]}
              onPress={handleOpenWhatsApp}
              disabled={!normalizePhoneForLink(whatsapp)}
            >
              <Ionicons name="logo-whatsapp" size={18} color={CLIENT_PRIMARY} />
              <Text style={styles.secondaryButtonText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.primaryButton,
                !(telefone || "").replace(/\D/g, "") && styles.buttonDisabled,
              ]}
              onPress={handleCall}
              disabled={!(telefone || "").replace(/\D/g, "")}
            >
              <Feather name="phone-call" size={18} color="#ffffff" />
              <Text style={styles.primaryButtonText}>Ligar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Checagens da Plantonar</Text>

            <View style={styles.checkedPill}>
              <Feather name="shield" size={14} color={CLIENT_PRIMARY} />
              <Text style={styles.checkedPillText}>
                {totalChecados}/{checklistItems.length} checados
              </Text>
            </View>
          </View>

          <Text style={styles.sectionDescription}>
            Estes são os dados informados como checados pela Plantonar para este
            profissional.
          </Text>

          <View style={styles.checklistWrap}>
            {checklistItems.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.checkRow,
                  item.checked ? styles.checkRowOk : styles.checkRowPending,
                ]}
              >
                <View
                  style={[
                    styles.checkIconWrap,
                    item.checked
                      ? styles.checkIconWrapOk
                      : styles.checkIconWrapPending,
                  ]}
                >
                  <Feather
                    name={item.checked ? "check" : "minus"}
                    size={16}
                    color={item.checked ? CLIENT_PRIMARY : MUTED}
                  />
                </View>

                <View style={styles.checkTextArea}>
                  <Text style={styles.checkLabel}>{item.label}</Text>
                  <Text style={styles.checkStatus}>
                    {item.checked
                      ? "Checado pela Plantonar"
                      : "Ainda não checado"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Feather name="info" size={18} color={INFO} />
          <Text style={styles.infoText}>
            Depois vamos ligar esta tela à regra real de aceite, pagamento
            confirmado, notificação do profissional e bloqueio das candidaturas
            conflitantes.
          </Text>
        </View>
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
    paddingTop: 12,
  },

  badgeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: CLIENT_PRIMARY,
    marginBottom: 14,
    shadowColor: CLIENT_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },

  badgeTopRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },

  photoUploadBox: {
    width: 98,
    alignItems: "center",
    justifyContent: "center",
  },

  photoBox: {
    width: 110,
    height: 132,
    borderRadius: 20,
    backgroundColor: CLIENT_ACCENT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: CLIENT_BORDER,
    overflow: "hidden",
  },

  avatarText: {
    color: CLIENT_PRIMARY_DARK,
    fontSize: 32,
    fontWeight: "800",
  },

  badgeInfo: {
    flex: 1,
    justifyContent: "center",
  },

  badgeProfession: {
    fontSize: 20,
    fontWeight: "800",
    color: "#26bc08",
    marginBottom: 14,
    textAlign: "center",
  },

  badgeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },

  badgeLine: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },

  verifiedRow: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#dcfce7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  verifiedText: {
    fontSize: 13,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
    textAlign: "center",
  },

  profileMetricsCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "stretch",
  },

  metricCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  metricDivider: {
    width: 1,
    backgroundColor: BORDER,
    marginHorizontal: 6,
  },

  starsRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    marginBottom: 8,
    flexWrap: "nowrap",
  },

  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    lineHeight: 15,
    textAlign: "center",
  },

  metricLabel: {
    marginTop: 2,
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
    textAlign: "center",
  },

  viewReviewsButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  viewReviewsButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionTitle: {
    flex: 1,
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

  checkedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  checkedPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  contactInfoWrap: {
    marginTop: 14,
    gap: 10,
  },

  contactInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  contactInfoText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    fontWeight: "600",
  },

  actionButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: CLIENT_PRIMARY,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
  },

  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: CLIENT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  checklistWrap: {
    marginTop: 14,
    gap: 10,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },

  checkRowOk: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },

  checkRowPending: {
    backgroundColor: "#f8fafc",
    borderColor: BORDER,
  },

  checkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  checkIconWrapOk: {
    backgroundColor: "#dcfce7",
  },

  checkIconWrapPending: {
    backgroundColor: "#f1f5f9",
  },

  checkTextArea: {
    flex: 1,
  },

  checkLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  checkStatus: {
    marginTop: 4,
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },

  infoCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 14,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#1e40af",
    fontWeight: "600",
  },
});