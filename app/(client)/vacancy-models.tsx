import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";

const BG = "#eef3f9";
const WHITE = "#ffffff";
const TEXT = "#111827";
const TEXT_SOFT = "#7a8ba3";
const BORDER = "#dce7f5";
const BLUE = "#1f69c6";
const CLIENT_GREEN = "#16a34a";

const MODELS = [
  {
    id: "idoso-supervisao",
    title: "Idoso com supervisão",
    description:
      "Idoso com necessidade de supervisão e acompanhamento nas atividades diárias.",
    iconType: "feather",
    iconName: "eye",
    iconBg: "#e8f7f2",
    iconColor: "#16a34a",
  },
  {
    id: "paciente-acamado",
    title: "Paciente acamado",
    description: "Paciente acamado com mobilidade reduzida ou ausente.",
    iconType: "material",
    iconName: "bed-outline",
    iconBg: "#efecff",
    iconColor: "#6d5df6",
  },
  {
    id: "demencia-confusao",
    title: "Demência / Confusão mental",
    description:
      "Paciente com demência, Alzheimer ou quadro de confusão mental.",
    iconType: "ion",
    iconName: "help-circle-outline",
    iconBg: "#f2ebff",
    iconColor: "#8b5cf6",
  },
  {
    id: "pos-cirurgico",
    title: "Pós-cirúrgico",
    description: "Paciente em recuperação após procedimento cirúrgico.",
    iconType: "feather",
    iconName: "briefcase",
    iconBg: "#e7f8ef",
    iconColor: "#10b981",
  },
  {
    id: "mobilidade-reduzida",
    title: "Mobilidade reduzida",
    description:
      "Paciente com dificuldade de locomoção (sequelas de AVC, fraturas, artrose, etc.).",
    iconType: "material",
    iconName: "human-cane",
    iconBg: "#ffedf6",
    iconColor: "#ec4899",
  },
  {
    id: "controle-medicamentos",
    title: "Controle de medicamentos",
    description:
      "Paciente com uso contínuo de múltiplos medicamentos (diabetes, hipertensão, etc.).",
    iconType: "ion",
    iconName: "flower-outline",
    iconBg: "#fff4df",
    iconColor: "#f59e0b",
  },
  {
    id: "oxigenio-respiratorio",
    title: "Oxigênio / Problema respiratório",
    description:
      "Paciente com doença respiratória crônica (DPOC, enfisema, fibrose) em uso de oxigênio.",
    iconType: "ion",
    iconName: "cloud-outline",
    iconBg: "#e7f6ff",
    iconColor: "#38bdf8",
  },
  {
    id: "curativos-feridas",
    title: "Curativos / Feridas",
    description:
      "Paciente com feridas que necessitam curativos regulares (úlceras, pé diabético, etc.).",
    iconType: "material",
    iconName: "pill",
    iconBg: "#fff1f1",
    iconColor: "#ef4444",
  },
  {
    id: "cuidados-paliativos",
    title: "Cuidados paliativos / Conforto",
    description:
      "Paciente em cuidados paliativos ou fase terminal. Prioridade: conforto e qualidade.",
    iconType: "ion",
    iconName: "heart",
    iconBg: "#f6edff",
    iconColor: "#a855f7",
  },
  {
    id: "crianca-adolescente",
    title: "Criança / Adolescente",
    description:
      "Criança ou adolescente com necessidade de cuidados especiais de saúde.",
    iconType: "ion",
    iconName: "happy-outline",
    iconBg: "#fff1e8",
    iconColor: "#f97316",
  },
  {
    id: "acompanhante-hospitalar",
    title: "Acompanhante hospitalar",
    description:
      "Paciente internado que necessita acompanhante para suporte durante a permanência.",
    iconType: "material",
    iconName: "hospital-building",
    iconBg: "#efeaff",
    iconColor: "#8b5cf6",
  },
  {
    id: "home-care-geral",
    title: "Home Care geral",
    description:
      "Paciente em atendimento domiciliar com necessidades variadas de cuidados.",
    iconType: "ion",
    iconName: "home-outline",
    iconBg: "#e8f8ef",
    iconColor: "#10b981",
  },
];

function ModelIcon({
  iconType,
  iconName,
  iconColor,
}: {
  iconType: string;
  iconName: string;
  iconColor: string;
}) {
  if (iconType === "feather") {
    return <Feather name={iconName as any} size={18} color={iconColor} />;
  }

  if (iconType === "material") {
    return (
      <MaterialCommunityIcons
        name={iconName as any}
        size={18}
        color={iconColor}
      />
    );
  }

  return <Ionicons name={iconName as any} size={18} color={iconColor} />;
}

export default function VacancyModelsScreen() {
  const insets = useSafeAreaInsets();

  const rightContent = (
    <View style={styles.headerIconBadge}>
      <MaterialCommunityIcons
        name="crown-outline"
        size={17}
        color="#ffffff"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Modelos prontos"
        showBack
        rightContent={rightContent}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 22,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Selecione a patologia e preencha o formulário automaticamente
        </Text>

        <View style={styles.list}>
          {MODELS.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/(client)/vacancy-model-preview",
                  params: { modelId: item.id },
                })
              }
            >
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <ModelIcon
                  iconType={item.iconType}
                  iconName={item.iconName}
                  iconColor={item.iconColor}
                />
              </View>

              <View style={styles.cardTextBox}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color={TEXT_SOFT} />
            </TouchableOpacity>
          ))}
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

  headerIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CLIENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SOFT,
    marginBottom: 14,
  },

  list: {
    gap: 10,
  },

  card: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 74,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTextBox: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 3,
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "500",
  },
});