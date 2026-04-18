import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { AppHeader } from "@/components/ui/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import colors, { gradientsByRole } from "@/constants/colors";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

export default function ClientCreditosScreen() {
  const { user } = useAuth();
  const { clientPlanType, clientCandidateLimit, clientJobDurationHours } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!user) return null;

  const isMonthly = clientPlanType === "monthly";
  const isYearly = clientPlanType === "yearly";
  const hasSubscription = isMonthly || isYearly;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.light.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: botPad + 32 }}
    >
     <AppHeader title="Pagamentos" showBack />

      <View style={styles.content}>
        <SectionTitle
          title="Como funciona"
          onPress={() => router.push("/" as any)}
          hideArrow
        />

        <View style={styles.infoCard}>
          <InfoRow
            icon="document-text-outline"
            text="Publicação avulsa por R$ 19,90"
          />
          <InfoRow
            icon="time-outline"
            text={`Cada vaga avulsa fica ativa por ${clientJobDurationHours} horas`}
          />
          <InfoRow
            icon="people-outline"
            text={`Seu plano atual permite até ${clientCandidateLimit} candidatos por anúncio`}
          />
          <InfoRow
            icon="person-outline"
            text="A liberação dos dados do profissional selecionado é cobrada separadamente"
          />
        </View>

        <SectionTitle title="Tabela de preços" hideArrow />

        <View style={styles.pricingCard}>
          <PriceRow
            icon="document-text-outline"
            title="Publicar vaga avulsa"
            description="72 horas de duração • até 3 candidatos"
            value="R$ 19,90"
            iconBg={colors.light.accent}
            iconColor={colors.light.primary}
            valueColor={colors.light.primary}
          />

          <Divider />

          <PriceRow
  icon="person-outline"
  title="Liberar dados do profissional"
  description="Cobrança separada ao selecionar um candidato"
  value={
    <View style={{ alignItems: "flex-end" }}>
      <Text style={{ fontSize: 11, color: colors.light.mutedForeground }}>
        a partir de
      </Text>
      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.light.success }}>
        R$ 49,90
      </Text>
      <Text style={{ fontSize: 11, color: colors.light.mutedForeground }}>
        Avulso
      </Text>
    </View>
  }
  iconBg="rgba(22,163,74,0.10)"
  iconColor={colors.light.success}
  valueColor={colors.light.success}
/>

          <Divider />

          <PriceRow
            icon="calendar-outline"
            title="Plano mensal"
            description="Até 5 candidatos por anúncio"
            value="R$ 199,90"
            iconBg="rgba(30,64,175,0.10)"
            iconColor={colors.light.primary}
            valueColor={colors.light.primary}
          />

          <Divider />

          <PriceRow
            icon="ribbon-outline"
            title="Plano anual"
            description="Até 10 candidatos por anúncio"
            value="R$ 759,90"
            iconBg="rgba(245,158,11,0.10)"
            iconColor={colors.light.warning}
            valueColor={colors.light.warning}
          />
        </View>

        <SectionTitle title="Publicação avulsa" hideArrow />

        <View style={styles.planCard}>
          <View style={styles.tagBadge}>
            <Text style={styles.tagBadgeText}>Avulso</Text>
          </View>

          <View style={styles.planHeaderRow}>
            <View
              style={[
                styles.planIconWrap,
                { backgroundColor: colors.light.accent },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={colors.light.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>1 publicação de vaga</Text>
              <Text style={styles.planDescription}>
                Duração de 72 horas • até 3 candidatos
              </Text>
            </View>

            <Text style={[styles.planPrice, { color: colors.light.primary }]}>
              R$ 19,90
            </Text>
          </View>

          <PrimaryButton
            title="Usar publicação avulsa"
            onPress={() => router.push("/publicar" as any)}
            style={{ marginTop: 16 }}
          />
        </View>

        <SectionTitle title="Assinaturas" hideArrow />

        <View
          style={[
            styles.planCard,
            isMonthly && {
              borderColor: colors.light.success,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.tagBadgeBlue}>
            <Text style={styles.tagBadgeText}>{isMonthly ? "Ativo" : "Mensal"}</Text>
          </View>

          <View style={styles.planHeaderRow}>
            <View
              style={[
                styles.planIconWrap,
                { backgroundColor: "rgba(30,64,175,0.10)" },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={22}
                color={colors.light.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>Plano mensal</Text>
              <Text style={styles.planDescription}>
                Até 5 candidatos por anúncio
              </Text>
            </View>

            <Text style={[styles.planPrice, { color: colors.light.primary }]}>
              R$ 199,90
            </Text>
          </View>

          <View style={styles.benefitsList}>
            <BenefitItem text="Mais praticidade para quem publica com frequência" />
            <BenefitItem text="Até 5 candidatos por anúncio" />
            <BenefitItem text="Melhor previsibilidade no custo mensal" />
          </View>

          {!isMonthly && (
            <PrimaryButton
              title="Assinar plano mensal"
              onPress={() => router.push("/creditos" as any)}
              style={{ marginTop: 16 }}
            />
          )}
        </View>

        <View
          style={[
            styles.planCard,
            isYearly && {
              borderColor: colors.light.success,
              borderWidth: 2,
            },
          ]}
        >
          <View style={styles.tagBadgeGold}>
            <Text style={styles.tagBadgeText}>
              {isYearly ? "Ativo" : "Melhor custo"}
            </Text>
          </View>

          <View style={styles.planHeaderRow}>
            <View
              style={[
                styles.planIconWrap,
                { backgroundColor: "rgba(245,158,11,0.10)" },
              ]}
            >
              <Ionicons
                name="ribbon-outline"
                size={22}
                color={colors.light.warning}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>Plano anual</Text>
              <Text style={styles.planDescription}>
                Até 10 candidatos por anúncio
              </Text>
            </View>

            <Text style={[styles.planPrice, { color: colors.light.warning }]}>
              R$ 759,90
            </Text>
          </View>

          <View style={styles.benefitsList}>
            <BenefitItem text="Mais economia para quem usa a plataforma o ano todo" />
            <BenefitItem text="Equivale a R$ 63,33/mês" />
            <BenefitItem text="Economia de R$ 1.639,90 em relação a 12 meses do mensal" />
            <BenefitItem text="Mais alcance com até 10 candidatos por anúncio" />
          </View>

          <View style={styles.economyBox}>
            <Ionicons
              name="trending-down-outline"
              size={16}
              color={colors.light.success}
            />
            <Text style={styles.economyText}>
              O plano anual reduz bastante o custo mensal equivalente e é ideal
              para quem contrata com frequência.
            </Text>
          </View>

          {!isYearly && (
            <PrimaryButton
              title="Assinar plano anual"
              onPress={() => router.push("/creditos" as any)}
              style={{ marginTop: 16 }}
            />
          )}
        </View>

        <View style={styles.footerNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.light.success}
          />
          <Text style={styles.footerText}>
            Pagamentos e planos organizados para facilitar a publicação das vagas
            e a gestão dos candidatos.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionTitle({
  title,
  onPress,
  hideArrow = false,
}: {
  title: string;
  onPress?: () => void;
  hideArrow?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!hideArrow && onPress ? (
        <Pressable onPress={onPress}>
          <Feather name="arrow-right" size={18} color={colors.light.primary} />
        </Pressable>
      ) : (
        <View style={{ width: 18 }} />
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.72)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.light.primary} />
      <Text style={styles.infoRowText}>{text}</Text>
    </View>
  );
}

function PriceRow({
  icon,
  title,
  description,
  value,
  iconBg,
  iconColor,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}) {
  return (
    <View style={styles.priceRow}>
      <View style={styles.priceLeft}>
        <View style={[styles.priceIconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.priceTitle}>{title}</Text>
          <Text style={styles.priceDescription}>{description}</Text>
        </View>
      </View>

      {typeof value === "string" ? (
  <Text style={[styles.priceValue, { color: valueColor }]}>{value}</Text>
) : (
  value
)}
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={colors.light.success}
      />
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGrad: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconPlaceholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.76)",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.light.warning,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.72)",
    textAlign: "center",
  },
  content: {
    padding: 16,
    gap: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.light.foreground,
  },
  infoCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoRowText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.light.mutedForeground,
  },
  pricingCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  priceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  priceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.light.foreground,
  },
  priceDescription: {
    fontSize: 11,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 12,
  },
  planCard: {
    backgroundColor: colors.light.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    overflow: "hidden",
  },
  tagBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  tagBadgeBlue: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  tagBadgeGold: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.light.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  planHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  planIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.light.foreground,
  },
  planDescription: {
    fontSize: 12,
    color: colors.light.mutedForeground,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "700",
  },
  benefitsList: {
    gap: 10,
    marginTop: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: colors.light.foreground,
  },
  economyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(22,163,74,0.10)",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  economyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: colors.light.success,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 4,
    marginTop: 4,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: colors.light.mutedForeground,
  },
});