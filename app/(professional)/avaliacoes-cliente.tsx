import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { AppHeader } from "@/components/ui/AppHeader";
import colors from "@/constants/colors";
import { getReviewsRecebidas } from "@/lib/services/review-service";
import { getReviewStats } from "@/lib/services/review-stats-service";

const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const STAR = "#f59e0b";
const PROFESSIONAL_PRIMARY = "#2563eb";

function formatRating(value?: number | null) {
  const safe = typeof value === "number" ? value : 0;
  return safe.toFixed(2).replace(".", ",");
}

function renderStars(value?: number | null) {
  const safe = typeof value === "number" ? value : 0;
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

function getFirstName(value?: string | null) {
  if (!value) return "Cliente";
  const first = value.trim().split(" ")[0];
  return first || "Cliente";
}

function getInitial(value?: string | null) {
  const first = getFirstName(value);
  return first.charAt(0).toUpperCase();
}

export default function AvaliacoesClienteScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const clienteId = String(params.clienteId || "");
  const clienteNome = String(params.clienteNome || "Cliente");
  const cidade = String(params.cidade || "");
  const estado = String(params.estado || "");
  const bairro = String(params.bairro || "");

  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const avatarLetter = useMemo(() => getInitial(clienteNome), [clienteNome]);

  useEffect(() => {
    let active = true;

    async function carregar() {
      setLoading(true);

      const [reviewsRes, statsRes] = await Promise.all([
        getReviewsRecebidas(clienteId),
        getReviewStats(clienteId),
      ]);

      if (!active) return;

      if (reviewsRes.success) {
        setReviews(reviewsRes.data);
      } else {
        setReviews([]);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setStats(null);
      }

      setLoading(false);
    }

    if (clienteId) {
      carregar();
    } else {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [clienteId]);

  return (
    <View style={styles.container}>
      <AppHeader title="Avaliações do cliente" showBack />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={PROFESSIONAL_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 28,
          }}
          ListHeaderComponent={
            <View style={styles.profileCard}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{avatarLetter}</Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{getFirstName(clienteNome)}</Text>

                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={14} color={MUTED} />
                    <Text style={styles.locationText}>
                      {cidade}/{estado} • {bairro}
                    </Text>
                  </View>
                </View>

                <View style={styles.ratingBox}>
                  <View style={styles.starsRow}>
                    {renderStars(stats?.nota_media)}
                  </View>
                  <Text style={styles.ratingValue}>
                    {formatRating(stats?.nota_media)}
                  </Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <Text style={styles.statText}>
                  {stats?.total_avaliacoes || 0} avaliações
                </Text>
                <Text style={styles.statText}>
                  {stats?.total_plantoes || 0} plantões
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Feather
                name="message-square"
                size={28}
                color={colors.light.border}
              />
              <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
              <Text style={styles.emptyText}>
                As avaliações aparecerão aqui.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            return (
              <View style={styles.card}>
                <Text style={styles.roleText}>{item.cargo || "Avaliação"}</Text>

                <View style={styles.reviewRatingRow}>
                  <View style={styles.starsRow}>{renderStars(item.nota)}</View>
                  <Text style={styles.ratingSmall}>
                    {formatRating(item.nota)}
                  </Text>
                </View>

                <Text style={styles.comment}>
                  {item.comentario_predefinido}
                </Text>

                {!!item.comentario && (
                  <Text style={styles.commentExtra}>{item.comentario}</Text>
                )}
              </View>
            );
          }}
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

  profileCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PROFESSIONAL_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },

  profileInfo: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },

  ratingBox: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  ratingValue: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
    marginTop: 4,
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  statText: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
  },

  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  roleText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },

  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  ratingSmall: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
  },

  comment: {
    marginTop: 10,
    fontSize: 14,
    color: TEXT,
    fontWeight: "600",
    lineHeight: 21,
  },

  commentExtra: {
    marginTop: 6,
    fontSize: 14,
    color: MUTED,
    lineHeight: 21,
  },

  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
  },
});