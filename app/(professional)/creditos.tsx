import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import {
  createProfessionalSubscription,
  cancelProfessionalSubscription,
} from "@/lib/services/professional-subscription-service";

type CreditPackage = {
  id: "3creditos" | "5creditos" | "10creditos";
  qtd: number;
  preco: number;
  destaque?: boolean;
  tag?: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
};

type SubscriptionRow = {
  id: string;
  profile_id: string;
  plan_code: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  price_original: number;
  price_paid: number;
  discount_percent: number | null;
  discount_starts_at: string | null;
  discount_ends_at: string | null;
  started_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  gateway: string | null;
  gateway_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const PACOTES: CreditPackage[] = [
  {
    id: "3creditos",
    qtd: 3,
    preco: 39.9,
    destaque: false,
    icon: "zap",
    color: "#F59E0B",
  },
  {
    id: "5creditos",
    qtd: 5,
    preco: 59.9,
    destaque: true,
    tag: "Melhor escolha",
    icon: "award",
    color: "#2563EB",
  },
  {
    id: "10creditos",
    qtd: 10,
    preco: 99.9,
    destaque: false,
    tag: "Melhor custo",
    icon: "award",
    color: "#14B8A6",
  },
];

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatDateBR(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "--";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getOriginalPrice(value: number) {
  return value * 2;
}

export default function CreditosScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { user } = useAuth();
  const { credits, addCredits } = useApp();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAssinatura, setLoadingAssinatura] = useState(false);
  const [loadingPlano, setLoadingPlano] = useState(true);
  const [assinaturaAtual, setAssinaturaAtual] = useState<SubscriptionRow | null>(null);

  const isAssinante = assinaturaAtual?.status === "active";

  const beneficios = [
    "Candidaturas ilimitadas",
    "Mais liberdade para se candidatar sem depender de créditos",
    "Melhor opção para quem busca trabalho com frequência",
    "Condição especial de lançamento garantida por 12 meses",
  ];

  const carregarProfileId = useCallback(async () => {
    if (!user?.id) {
      setProfileId(null);
      setLoadingPerfil(false);
      return;
    }

    try {
      setLoadingPerfil(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfileId(data?.id ?? null);
    } catch (error) {
      console.log("LOAD PROFILE ID ERROR:", error);
      setProfileId(null);
    } finally {
      setLoadingPerfil(false);
    }
  }, [user?.id]);

  useEffect(() => {
    carregarProfileId();
  }, [carregarProfileId]);

  const carregarAssinatura = useCallback(async () => {
    if (!profileId) {
      setAssinaturaAtual(null);
      setLoadingPlano(false);
      return;
    }

    try {
      setLoadingPlano(true);

      const { data, error } = await supabase
        .from("professional_subscriptions")
        .select("*")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.log("LOAD SUBSCRIPTION ERROR:", error);
        setAssinaturaAtual(null);
        return;
      }

      if (!data) {
        setAssinaturaAtual(null);
        return;
      }

      setAssinaturaAtual(data as SubscriptionRow);
    } catch (error) {
      console.log("LOAD SUBSCRIPTION CATCH:", error);
      setAssinaturaAtual(null);
    } finally {
      setLoadingPlano(false);
    }
  }, [profileId]);

  useEffect(() => {
    carregarAssinatura();
  }, [carregarAssinatura]);

  const doComprar = async (pacote: CreditPackage) => {
    if (!profileId) {
      if (Platform.OS === "web") {
        (globalThis as any).alert?.("Perfil profissional não encontrado.");
      } else {
        Alert.alert("Erro", "Perfil profissional não encontrado.");
      }
      return;
    }

    setLoadingId(pacote.id);

    try {
      const { error } = await supabase.from("professional_credit_purchases").insert({
        profile_id: profileId,
        credits_amount: pacote.qtd,
        bonus_credits: 0,
        price_original: pacote.preco,
        price_paid: pacote.preco,
        payment_status: "paid",
        payment_method: "internal",
        gateway: "internal",
        gateway_reference: null,
        package_code: pacote.id,
        package_name: `${pacote.qtd} créditos`,
        description: `Pacote com ${pacote.qtd} créditos`,
        paid_at: new Date().toISOString(),
      });

      if (error) {
        console.log("PROFESSIONAL CREDIT PURCHASE ERROR:", error);
        throw error;
      }

      await addCredits(pacote.qtd);

      const msg = `${pacote.qtd} créditos foram adicionados à sua conta.`;

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Compra realizada!", msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível completar a compra.";

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Erro", msg);
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleComprar = (pacote: CreditPackage) => {
    const msg = `Deseja adquirir ${pacote.qtd} créditos por ${formatCurrency(
      pacote.preco
    )}?`;

    if (Platform.OS === "web") {
      if ((globalThis as any).confirm?.(msg)) {
        doComprar(pacote);
      }
    } else {
      Alert.alert("Confirmar compra", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Comprar", onPress: () => doComprar(pacote) },
      ]);
    }
  };

  const doAssinar = async () => {
    if (!profileId) return;

    setLoadingAssinatura(true);

    try {
      await createProfessionalSubscription(profileId);

      await carregarAssinatura();

      const msg =
        "Seu plano ilimitado foi ativado com o valor promocional garantido por 12 meses.";

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Assinatura ativada!", msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível ativar a assinatura.";

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Erro", msg);
      }
    } finally {
      setLoadingAssinatura(false);
    }
  };

  const handleAssinar = () => {
    const msg =
      "Plano ilimitado por R$ 179,90/mês.\n\nCondição especial de lançamento com 50% OFF garantida por 12 meses.\n\nDeseja continuar?";

    if (Platform.OS === "web") {
      if ((globalThis as any).confirm?.(msg)) {
        doAssinar();
      }
    } else {
      Alert.alert("Assinar Plano Ilimitado", msg, [
        { text: "Cancelar", style: "cancel" },
        { text: "Assinar", onPress: doAssinar },
      ]);
    }
  };

  const doCancelar = async () => {
    if (!assinaturaAtual?.id) return;

    setLoadingAssinatura(true);

    try {
      await cancelProfessionalSubscription(assinaturaAtual.id);

      await carregarAssinatura();

      const msg = "Sua assinatura foi cancelada com sucesso.";

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Assinatura cancelada", msg);
      }
    } catch (err: any) {
      const msg = err?.message || "Não foi possível cancelar a assinatura.";

      if (Platform.OS === "web") {
        (globalThis as any).alert?.(msg);
      } else {
        Alert.alert("Erro", msg);
      }
    } finally {
      setLoadingAssinatura(false);
    }
  };

  const handleCancelarAssinatura = () => {
    const msg = "Tem certeza que deseja cancelar sua assinatura ilimitada?";

    if (Platform.OS === "web") {
      if ((globalThis as any).confirm?.(msg)) {
        doCancelar();
      }
    } else {
      Alert.alert("Cancelar assinatura", msg, [
        { text: "Manter assinatura", style: "cancel" },
        { text: "Cancelar assinatura", style: "destructive", onPress: doCancelar },
      ]);
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#123C86", "#2F80ED"]}
        style={[styles.headerGradient, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(professional)/(tabs)/dashboard");
              }
            }}
            style={styles.backBtn}
          >
            <Feather name="arrow-left" size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Créditos</Text>

          <View style={{ width: 36 }} />
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceIconWrap}>
            <Feather name={isAssinante ? "star" : "zap"} size={28} color="#F59E0B" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.balanceLabel}>Status atual</Text>
            <Text style={styles.balanceValue}>
              {isAssinante
                ? "Plano ilimitado ativo"
                : `${credits} crédito${credits !== 1 ? "s" : ""}`}
            </Text>

            {isAssinante && (
              <Text style={styles.balanceExpiry}>
                Garantido até {formatDateBR(assinaturaAtual?.expires_at)}
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingTop: 20, paddingBottom: botPad + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {!isAssinante && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Como funcionam os créditos?</Text>

              <View style={styles.infoCard}>
                <InfoItem
                  icon="send"
                  text="Cada crédito libera 1 candidatura extra quando você quiser se candidatar a mais vagas."
                />
                <InfoItem
                  icon="clock"
                  text="Os créditos ficam na sua conta e podem ser usados quando você precisar."
                />
                <InfoItem
                  icon="zap"
                  text="Se você se candidata com frequência, o plano ilimitado pode valer mais a pena."
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Pacotes disponíveis</Text>

            {PACOTES.map((pacote) => (
              <Pressable
                key={pacote.id}
                style={({ pressed }) => [
                  styles.pacoteCard,
                  pacote.destaque && styles.pacoteDestaque,
                  pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
                ]}
                onPress={() => handleComprar(pacote)}
                disabled={!!loadingId || loadingAssinatura || loadingPerfil}
              >
                {pacote.tag ? (
                  <View style={[styles.tagBadge, { backgroundColor: pacote.color }]}>
                    <Text style={styles.tagText}>{pacote.tag}</Text>
                  </View>
                ) : null}

                <View
                  style={[
                    styles.pacoteIcon,
                    { backgroundColor: `${pacote.color}15` },
                  ]}
                >
                  <Feather name={pacote.icon} size={24} color={pacote.color} />
                </View>

                <View style={styles.pacoteInfo}>
                  <Text style={styles.pacoteQtd}>{pacote.qtd} créditos</Text>
                  <Text style={styles.pacoteUnit}>
                    {formatCurrency(pacote.preco / pacote.qtd)} por crédito
                  </Text>
                </View>

                <View style={styles.pacoteRight}>
                  {loadingId === pacote.id ? (
                    <ActivityIndicator size="small" color={pacote.color} />
                  ) : (
                    <>
                      <View style={styles.priceColumn}>
                        <Text style={styles.precoAntigo}>
                          {formatCurrency(getOriginalPrice(pacote.preco))}
                        </Text>
                        <Text style={[styles.pacotePreco, { color: pacote.color }]}>
                          {formatCurrency(pacote.preco)}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#94A3B8" />
                    </>
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Plano ilimitado</Text>

        {loadingPlano ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text style={styles.loadingText}>Carregando plano...</Text>
          </View>
        ) : isAssinante ? (
          <View style={[styles.assinaturaCard, styles.assinaturaAtiva]}>
            <View style={styles.assinaturaHeader}>
              <View style={[styles.pacoteIcon, { backgroundColor: "#8B5CF620" }]}>
                <Feather name="star" size={24} color="#8B5CF6" />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.assinaturaTitleRow}>
                  <Text style={styles.pacoteQtd}>Plano ilimitado</Text>

                  <View style={styles.ativoBadge}>
                    <Text style={styles.ativoText}>Ativo</Text>
                  </View>
                </View>

                <Text style={styles.pacoteUnit}>
                  Valor promocional garantido até {formatDateBR(assinaturaAtual?.expires_at)}
                </Text>
              </View>
            </View>

            <View style={styles.beneficiosList}>
              {beneficios.map((b) => (
                <BeneficioItem key={b} text={b} />
              ))}
            </View>

            <Pressable
              style={styles.cancelarBtn}
              onPress={handleCancelarAssinatura}
              disabled={loadingAssinatura}
            >
              {loadingAssinatura ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.cancelarText}>Cancelar assinatura</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.assinaturaCard,
              pressed && { opacity: 0.94, transform: [{ scale: 0.988 }] },
            ]}
            onPress={handleAssinar}
            disabled={loadingAssinatura || !!loadingId}
          >
            <View style={[styles.tagBadge, { backgroundColor: "#8B5CF6" }]}>
              <Text style={styles.tagText}>Lançamento</Text>
            </View>

            <View style={styles.assinaturaHeader}>
              <View style={[styles.pacoteIcon, { backgroundColor: "#8B5CF620" }]}>
                <Feather name="star" size={24} color="#8B5CF6" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.pacoteQtd}>Plano ilimitado</Text>
                <Text style={styles.pacoteUnit}>
                  Menos de R$ 6 por dia para se candidatar sem limite
                </Text>
              </View>

              <View style={styles.pacoteRightColumn}>
                {loadingAssinatura ? (
                  <ActivityIndicator size="small" color="#8B5CF6" />
                ) : (
                  <>
                    <Text style={styles.precoAntigo}>{formatCurrency(359.9)}</Text>
                    <Text style={[styles.pacotePreco, { color: "#8B5CF6" }]}>
                      {formatCurrency(179.9)}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <View style={styles.assinaturaDivider} />

            <View style={styles.beneficiosList}>
              {beneficios.map((b) => (
                <BeneficioItem key={b} text={b} />
              ))}

              <BeneficioItem text="Assinando agora, você garante 50% OFF por 12 meses." />
            </View>

            <View style={styles.economiaBox}>
              <Feather name="trending-down" size={16} color="#14B8A6" />
              <Text style={styles.economiaText}>
                Você terá o valor de R$179,90 garantido durante os próximos 12 meses,
                com 14 candidaturas no mês, você já paga o plano sem limites.
              </Text>
            </View>

            <View style={styles.assinarBtnWrap}>
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                style={styles.assinarBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Feather name="star" size={18} color="#FFFFFF" />
                <Text style={styles.assinarBtnText}>
                  Assinar agora — {formatCurrency(179.9)}/mês
                </Text>
              </LinearGradient>
            </View>
          </Pressable>
        )}

        <View style={styles.footerNote}>
          <Feather name="shield" size={16} color="#14B8A6" />
          <Text style={styles.footerText}>
            Pagamento ainda em modo interno. A estrutura já está pronta para ligar
            ao sistema real de vendas depois.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({
  icon,
  text,
}: {
  icon: keyof typeof Feather.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Feather name={icon} size={18} color="#2563EB" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function BeneficioItem({ text }: { text: string }) {
  return (
    <View style={styles.beneficioItem}>
      <Feather name="check-circle" size={18} color="#14B8A6" />
      <Text style={styles.beneficioText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  balanceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },

  balanceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245,158,11,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.72)",
  },

  balanceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  balanceExpiry: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    marginTop: 2,
  },

  infoSection: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: 20,
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    marginBottom: 24,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  infoText: {
    fontSize: 14,
    color: "#475569",
    flex: 1,
    lineHeight: 20,
  },

  pacoteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  pacoteDestaque: {
    borderColor: "#2563EB",
    borderWidth: 2,
  },

  tagBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },

  tagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  pacoteIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  pacoteInfo: {
    flex: 1,
  },

  pacoteQtd: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  pacoteUnit: {
    fontSize: 12,
    color: "#64748B",
  },

  pacoteRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  pacoteRightColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  priceColumn: {
    alignItems: "flex-end",
    justifyContent: "center",
  },

  pacotePreco: {
    fontSize: 16,
    fontWeight: "800",
  },

  precoAntigo: {
    fontSize: 12,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },

  assinaturaCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#8B5CF6",
    overflow: "hidden",
  },

  assinaturaAtiva: {
    borderColor: "#14B8A6",
  },

  assinaturaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  assinaturaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  assinaturaDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  beneficiosList: {
    gap: 10,
    marginTop: 14,
  },

  beneficioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  beneficioText: {
    fontSize: 14,
    color: "#0F172A",
    flex: 1,
    lineHeight: 20,
  },

  ativoBadge: {
    backgroundColor: "rgba(20,184,166,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  ativoText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#14B8A6",
  },

  assinarBtnWrap: {
    marginTop: 16,
  },

  assinarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },

  assinarBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  cancelarBtn: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.25)",
  },

  cancelarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },

  economiaBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "rgba(20,184,166,0.10)",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },

  economiaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#14B8A6",
    lineHeight: 18,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
  },

  footerText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
    lineHeight: 18,
  },

  loadingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    fontSize: 13,
    color: "#64748B",
  },
});