import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppHeader } from "@/components/ui/AppHeader";
import colors from "@/constants/colors";

type NotificationType =
  | "nova_vaga"
  | "candidatura_aceita"
  | "candidatura_recusada"
  | "contraproposta_resposta"
  | "contratado"
  | "plantao"
  | "avaliacao"
  | "sistema";

type NotificationItem = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  criadoEm: string;
  dadosExtra?: {
    vagaId?: string;
    profissionalId?: string;
    clienteId?: string;
    route?: string;
  } | null;
};

const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const PROFESSIONAL_PRIMARY = "#2563eb";
const PROFESSIONAL_SECONDARY = "#1d4ed8";
const INFO = "#2563eb";
const WARNING = "#f59e0b";
const DANGER = "#dc2626";
const SUCCESS = "#16a34a";

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    titulo: "Nova vaga disponível",
    mensagem: "Uma nova vaga compatível com seu perfil foi publicada.",
    tipo: "nova_vaga",
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    dadosExtra: { route: "/(professional)/(tabs)/vacancies" },
  },
  {
    id: "2",
    titulo: "Candidatura aceita",
    mensagem: "Sua candidatura foi aceita. Confira os detalhes do plantão.",
    tipo: "candidatura_aceita",
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    dadosExtra: { route: "/(professional)/(tabs)/applications" },
  },
  {
    id: "3",
    titulo: "Contraproposta respondida",
    mensagem: "O cliente respondeu sua contraproposta em uma das vagas.",
    tipo: "contraproposta_resposta",
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    dadosExtra: { route: "/(professional)/(tabs)/applications" },
  },
  {
    id: "4",
    titulo: "Plantão confirmado",
    mensagem: "Seu plantão foi confirmado e já aparece no seu fluxo.",
    tipo: "contratado",
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    dadosExtra: { route: "/(professional)/(tabs)/applications" },
  },
  {
    id: "5",
    titulo: "Avaliação disponível",
    mensagem: "O plantão foi encerrado. Sua avaliação já pode ser enviada.",
    tipo: "avaliacao",
    lida: true,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    dadosExtra: { route: "/(professional)/(tabs)" },
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin}min atrás`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d atrás`;

  return date.toLocaleDateString("pt-BR");
}

function iconForTipo(tipo: NotificationType) {
  switch (tipo) {
    case "nova_vaga":
      return "briefcase-outline";
    case "candidatura_aceita":
      return "checkmark-circle-outline";
    case "candidatura_recusada":
      return "close-circle-outline";
    case "contraproposta_resposta":
      return "swap-horizontal-outline";
    case "contratado":
      return "calendar-outline";
    case "plantao":
      return "time-outline";
    case "avaliacao":
      return "star-outline";
    default:
      return "notifications-outline";
  }
}

function colorForTipo(tipo: NotificationType) {
  switch (tipo) {
    case "nova_vaga":
      return INFO;
    case "candidatura_aceita":
      return SUCCESS;
    case "candidatura_recusada":
      return DANGER;
    case "contraproposta_resposta":
      return WARNING;
    case "contratado":
      return PROFESSIONAL_SECONDARY;
    case "plantao":
      return INFO;
    case "avaliacao":
      return WARNING;
    default:
      return MUTED;
  }
}

export default function ProfessionalNotificationsScreen() {
  const insets = useSafeAreaInsets();

  const [notificacoes, setNotificacoes] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

  const naoLidas = useMemo(
    () => notificacoes.filter((item) => !item.lida).length,
    [notificacoes]
  );

  const lidas = useMemo(
    () => notificacoes.filter((item) => item.lida).length,
    [notificacoes]
  );

  function marcarComoLida(id: string) {
    setNotificacoes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lida: true } : item))
    );
  }

  function marcarTodasComoLidas() {
    setNotificacoes((prev) => prev.map((item) => ({ ...item, lida: true })));
  }

  function apagarNotificacao(id: string) {
    setNotificacoes((prev) => prev.filter((item) => item.id !== id));
  }

  function limparLidas() {
    setNotificacoes((prev) => prev.filter((item) => !item.lida));
  }

  function confirmarApagar(id: string) {
    Alert.alert(
      "Apagar notificação",
      "Essa notificação será removida da lista.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => apagarNotificacao(id),
        },
      ]
    );
  }

  function confirmarLimparLidas() {
    Alert.alert(
      "Limpar notificações lidas",
      "Todas as notificações já lidas serão removidas da lista.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: limparLidas,
        },
      ]
    );
  }

  function handleNotifPress(item: NotificationItem) {
    if (!item.lida) {
      marcarComoLida(item.id);
    }

    if (item.dadosExtra?.route) {
      router.push(item.dadosExtra.route as any);
      return;
    }
  }

  function renderTopActions() {
    if (!notificacoes.length) return null;

    return (
      <View style={styles.topActionsWrap}>
        <View style={styles.counterCard}>
          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{naoLidas}</Text>
            <Text style={styles.counterLabel}>não lidas</Text>
          </View>

          <View style={styles.counterDivider} />

          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{lidas}</Text>
            <Text style={styles.counterLabel}>lidas</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          {naoLidas > 0 && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryActionButton}
              onPress={marcarTodasComoLidas}
            >
              <Feather
                name="check-circle"
                size={16}
                color={PROFESSIONAL_PRIMARY}
              />
              <Text style={styles.secondaryActionText}>
                Marcar todas como lidas
              </Text>
            </TouchableOpacity>
          )}

          {lidas > 0 && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryActionButton}
              onPress={confirmarLimparLidas}
            >
              <Feather name="trash-2" size={16} color={DANGER} />
              <Text style={[styles.secondaryActionText, { color: DANGER }]}>
                Limpar lidas
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  function renderItem({ item }: { item: NotificationItem }) {
    const iconColor = colorForTipo(item.tipo);

    return (
      <Pressable
        onPress={() => handleNotifPress(item)}
        style={[styles.card, !item.lida && styles.cardUnread]}
      >
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: `${iconColor}15`,
            },
          ]}
        >
          <Ionicons
            name={iconForTipo(item.tipo) as any}
            size={20}
            color={iconColor}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !item.lida && styles.titleUnread]}>
              {item.titulo}
            </Text>

            {!item.lida && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.message} numberOfLines={2}>
            {item.mensagem}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.timeText}>{formatDate(item.criadoEm)}</Text>

            <View style={styles.inlineActions}>
              {!item.lida && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => marcarComoLida(item.id)}
                  style={styles.inlineButton}
                >
                  <Feather
                    name="check"
                    size={15}
                    color={PROFESSIONAL_PRIMARY}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => confirmarApagar(item.id)}
                style={styles.inlineButton}
              >
                <Feather name="trash-2" size={15} color={DANGER} />
              </TouchableOpacity>

              {!!item.dadosExtra?.route && (
                <View style={styles.chevronWrap}>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.light?.border || "#9ca3af"}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Notificações" showBack />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={PROFESSIONAL_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 28,
            flexGrow: 1,
          }}
          ListHeaderComponent={renderTopActions()}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name="notifications-off-outline"
                  size={30}
                  color={colors.light?.border || "#9ca3af"}
                />
              </View>

              <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
              <Text style={styles.emptyText}>
                Quando houver novidades importantes, elas aparecerão aqui.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  topActionsWrap: {
    marginBottom: 14,
  },

  counterCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterItem: {
    flex: 1,
    alignItems: "center",
  },

  counterDivider: {
    width: 1,
    height: 34,
    backgroundColor: BORDER,
    marginHorizontal: 10,
  },

  counterValue: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  counterLabel: {
    marginTop: 2,
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },

  actionRow: {
    marginTop: 12,
    gap: 10,
  },

  secondaryActionButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  secondaryActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: PROFESSIONAL_PRIMARY,
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },

  cardUnread: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cardContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
  },

  titleUnread: {
    fontWeight: "800",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PROFESSIONAL_PRIMARY,
  },

  message: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
  },

  bottomRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  timeText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "600",
  },

  inlineActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  inlineButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },

  chevronWrap: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCard: {
    marginTop: 12,
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 24,
    paddingVertical: 34,
    alignItems: "center",
  },

  emptyIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: TEXT,
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
    textAlign: "center",
  },
});