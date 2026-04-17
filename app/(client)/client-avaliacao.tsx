import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";
import colors from "@/constants/colors";

type ReviewItem = {
  id: string;
  cargo: string;
  nota: number;
  comentario?: string | null;
};

const CLIENT_PRIMARY = "#16a34a";
const BG = "#f8fafc";
const CARD = "#ffffff";
const TEXT = "#111827";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const STAR = "#f59e0b";

const MOCK_CLIENT = {
  nome: "Júnio",
  cidade: "Belo Horizonte",
  estado: "MG",
  bairro: "Santo Antônio",
  nota: 5,
};

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "1",
    cargo: "Técnico de Enfermagem",
    nota: 5,
    comentario:
      "Cliente educado, atencioso e passou todas as orientações com clareza.",
  },
  {
    id: "2",
    cargo: "Cuidador de Idosos",
    nota: 5,
    comentario:
      "Ambiente organizado e comunicação muito boa durante todo o plantão.",
  },
  {
    id: "3",
    cargo: "Enfermeiro(a)",
    nota: 5,
    comentario: "",
  },
];

function getFirstName(value?: string | null) {
  if (!value) return "Cliente";
  const first = value.trim().split(" ")[0];
  return first || "Cliente";
}

function getInitial(value?: string | null) {
  const first = getFirstName(value);
  return first.charAt(0).toUpperCase();
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

export default function ClientReviewsScreen() {
  const insets = useSafeAreaInsets();
  const firstName = getFirstName(MOCK_CLIENT.nome);
  const avatarLetter = getInitial(MOCK_CLIENT.nome);
  const hasReviews = MOCK_REVIEWS.length > 0;

  return (
    <View style={styles.container}>
      <AppHeader title="Avaliações" showBack />

      <FlatList
        data={MOCK_REVIEWS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 28,
          },
        ]}
        ListHeaderComponent={
          <View style={styles.profileCard}>
            <View style={styles.profileTopRow}>
              <View style={styles.profileLeft}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </View>

                <View style={styles.profileTextArea}>
                  <Text style={styles.clientName}>{firstName}</Text>

                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={14} color={MUTED} />
                    <Text style={styles.locationText}>
                      {`${MOCK_CLIENT.cidade}/${MOCK_CLIENT.estado} • ${MOCK_CLIENT.bairro}`}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.ratingBox}>
                <View style={styles.starsRow}>
                  {renderStars(MOCK_CLIENT.nota)}
                </View>
                <Text style={styles.ratingValue}>
                  {formatRating(MOCK_CLIENT.nota)}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Feather name="message-square" size={28} color={colors.light.border} />
            <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
            <Text style={styles.emptyText}>
              As avaliações e comentários feitos pelos profissionais aparecerão aqui.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const hasComment =
            typeof item.comentario === "string" &&
            item.comentario.trim().length > 0;

          return (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewTitleArea}>
                  <Text style={styles.roleText}>
                    {item.cargo} avaliou
                  </Text>

                  <View style={styles.reviewRatingRow}>
                    <View style={styles.starsRow}>
                      {renderStars(item.nota)}
                    </View>
                    <Text style={styles.reviewRatingValue}>
                      {formatRating(item.nota)}
                    </Text>
                  </View>
                </View>
              </View>

              {hasComment && (
                <Text style={styles.commentText}>{item.comentario}</Text>
              )}
            </View>
          );
        }}
      />

      {!hasReviews && <View />}
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

  profileTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  profileLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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

  clientName: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  ratingValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
  },

  reviewCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },

  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  reviewTitleArea: {
    flex: 1,
  },

  roleText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 8,
  },

  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reviewRatingValue: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  commentText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: MUTED,
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
    lineHeight: 22,
    color: MUTED,
    textAlign: "center",
  },
});