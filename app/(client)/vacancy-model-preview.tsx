import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
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
    patologias:
      "Paciente idoso com necessidade de supervisão contínua, podendo apresentar limitações físicas leves, risco de queda, esquecimentos e necessidade de apoio em atividades rotineiras.",
    cuidados:
      "Supervisionar o paciente durante o plantão, auxiliar na locomoção quando necessário, acompanhar alimentação, hidratação e medicações já organizadas, observar sinais gerais e comunicar qualquer intercorrência à família.",
    particularidades:
      "Manter atenção com deslocamentos dentro da casa, horários combinados, rotina já estabelecida pelo paciente e cordialidade no trato com familiares.",
    tarefas:
      "Acompanhar o paciente durante o período do plantão. Auxiliar nas atividades básicas do dia. Estimular hidratação e alimentação. Observar mudanças de comportamento. Comunicar intercorrências.",
  },
  {
    id: "paciente-acamado",
    title: "Paciente acamado",
    description: "Paciente acamado com mobilidade reduzida ou ausente.",
    iconType: "material",
    iconName: "bed-outline",
    iconBg: "#efecff",
    iconColor: "#6d5df6",
    patologias:
      "Paciente acamado, com limitação importante de mobilidade, podendo estar em recuperação, condição neurológica, fragilidade severa ou dependência total para atividades básicas.",
    cuidados:
      "Realizar mudança de decúbito conforme orientação, auxiliar na higiene, observar conforto, prevenir lesões por pressão, acompanhar sinais gerais e comunicar intercorrências imediatamente.",
    particularidades:
      "Exige atenção com posicionamento, conforto, higiene rigorosa, observação da pele e cuidado ao movimentar o paciente.",
    tarefas:
      "Mudança de decúbito. Higiene no leito. Troca de fraldas ou roupas quando necessário. Auxílio na alimentação. Observação contínua do estado geral.",
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
    patologias:
      "Paciente com demência, Alzheimer ou quadro de confusão mental, podendo apresentar desorientação, esquecimento, agitação, alterações de humor e necessidade de supervisão próxima.",
    cuidados:
      "Garantir segurança, manter ambiente calmo, orientar com paciência, supervisionar deslocamentos, acompanhar alimentação e medicações já separadas, observando alterações comportamentais.",
    particularidades:
      "Evitar discussões, manter comunicação simples, ter atenção especial para saídas inesperadas, quedas e momentos de agitação.",
    tarefas:
      "Supervisionar continuamente. Auxiliar em higiene e alimentação. Redirecionar com calma em momentos de confusão. Observar comportamento. Comunicar intercorrências à família.",
  },
  {
    id: "pos-cirurgico",
    title: "Pós-cirúrgico",
    description: "Paciente em recuperação após procedimento cirúrgico.",
    iconType: "feather",
    iconName: "briefcase",
    iconBg: "#e7f8ef",
    iconColor: "#10b981",
    patologias:
      "Paciente em fase de recuperação após cirurgia, com necessidade de monitoramento, repouso, auxílio em deslocamentos e observação de sinais de desconforto ou complicação.",
    cuidados:
      "Observar dor, sinais gerais, auxiliar na locomoção com segurança, apoiar higiene e alimentação, acompanhar medicações conforme orientação e comunicar sinais de alerta.",
    particularidades:
      "Atenção com curativos, limitação de movimentos, dor, risco de queda e necessidade de repouso adequado.",
    tarefas:
      "Acompanhar recuperação no plantão. Auxiliar em deslocamentos. Apoiar higiene e alimentação. Observar sintomas. Informar qualquer intercorrência.",
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
    patologias:
      "Paciente com mobilidade reduzida por sequelas neurológicas, ortopédicas ou limitações crônicas, necessitando de auxílio para se movimentar com segurança.",
    cuidados:
      "Auxiliar em transferências, deslocamentos e posicionamento, sempre com atenção à segurança, conforto e prevenção de quedas.",
    particularidades:
      "Necessário cuidado ao levantar, sentar, caminhar e posicionar o paciente. Observar dor, cansaço e equilíbrio.",
    tarefas:
      "Auxiliar na locomoção. Apoiar higiene e alimentação. Organizar ambiente para segurança. Acompanhar mudanças de posição. Comunicar intercorrências.",
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
    patologias:
      "Paciente com doenças crônicas e rotina de uso contínuo de medicamentos, necessitando de controle de horários e observação de sinais gerais.",
    cuidados:
      "Acompanhar horários dos medicamentos já organizados pela família ou equipe responsável, observar sinais gerais, alimentação e hidratação, e comunicar alterações importantes.",
    particularidades:
      "Atenção rigorosa aos horários combinados, confirmação do que já está separado e observação de reações ou sintomas atípicos.",
    tarefas:
      "Lembrar e acompanhar horários dos medicamentos. Observar sinais gerais. Apoiar alimentação e hidratação. Comunicar intercorrências.",
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
    patologias:
      "Paciente com limitação respiratória crônica, podendo fazer uso de oxigênio suplementar e necessitar de observação mais próxima do padrão respiratório.",
    cuidados:
      "Observar conforto respiratório, posicionamento, uso correto do oxigênio conforme já instalado, sinais de desconforto e comunicar qualquer piora imediatamente.",
    particularidades:
      "Atenção a cansaço excessivo, dificuldade para respirar, agitação, queda do conforto respiratório e posicionamento adequado.",
    tarefas:
      "Acompanhar padrão respiratório. Auxiliar no conforto e posicionamento. Observar uso do oxigênio. Comunicar intercorrências.",
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
    patologias:
      "Paciente com feridas ou lesões de pele que exigem observação contínua, cuidado local e atenção com higiene e conforto.",
    cuidados:
      "Observar região afetada, manter higiene e conforto, seguir orientações previamente definidas pela família ou equipe e comunicar sinais de piora.",
    particularidades:
      "Atenção com dor, secreção, sangramento, odor, desconforto e necessidade de preservar a integridade da pele.",
    tarefas:
      "Observar feridas. Auxiliar na higiene. Posicionar adequadamente. Comunicar alterações importantes. Manter conforto do paciente.",
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
    patologias:
      "Paciente em cuidados paliativos, com foco em conforto, dignidade, controle de desconfortos e acolhimento durante o plantão.",
    cuidados:
      "Priorizar conforto, higiene, posicionamento, acolhimento e observação sensível de sinais de desconforto, sempre comunicando intercorrências à família.",
    particularidades:
      "Necessita abordagem calma, respeitosa e atenta. Foco principal no conforto do paciente e no cuidado humanizado.",
    tarefas:
      "Manter conforto. Auxiliar higiene. Reposicionar conforme necessidade. Acompanhar sinais de desconforto. Apoiar família com comunicação respeitosa.",
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
    patologias:
      "Paciente pediátrico ou adolescente com necessidade de observação, rotina de cuidados especiais e acompanhamento durante o plantão.",
    cuidados:
      "Acompanhar rotina combinada, observar comportamento, apoiar alimentação, higiene e conforto, sempre com atenção ao acolhimento e segurança.",
    particularidades:
      "Exige comunicação cuidadosa, atenção ao comportamento, rotina familiar e suporte afetivo durante o plantão.",
    tarefas:
      "Acompanhar rotina. Auxiliar em higiene e alimentação. Observar sinais gerais. Garantir conforto e segurança. Comunicar intercorrências.",
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
    patologias:
      "Paciente internado em ambiente hospitalar que necessita acompanhante para suporte, observação e auxílio durante a permanência.",
    cuidados:
      "Acompanhar o paciente durante o período, auxiliar em demandas básicas permitidas, observar sinais gerais e manter comunicação com familiares.",
    particularidades:
      "Seguir regras do ambiente hospitalar, manter postura adequada e observar orientações da equipe local.",
    tarefas:
      "Acompanhar o paciente. Auxiliar em demandas básicas. Observar estado geral. Comunicar intercorrências e atualizações à família.",
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
    patologias:
      "Paciente em atendimento domiciliar com necessidades variadas, exigindo acompanhamento, apoio em rotina e observação contínua durante o plantão.",
    cuidados:
      "Auxiliar conforme necessidade do paciente, mantendo conforto, segurança, organização do ambiente e comunicação de intercorrências.",
    particularidades:
      "Pode envolver rotina ampla de cuidados, exigindo atenção, organização e adaptação ao contexto domiciliar.",
    tarefas:
      "Acompanhar paciente no domicílio. Apoiar higiene, alimentação e conforto. Organizar ambiente. Observar estado geral. Comunicar intercorrências.",
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
      <MaterialCommunityIcons name={iconName as any} size={18} color={iconColor} />
    );
  }

  return <Ionicons name={iconName as any} size={18} color={iconColor} />;
}

function SectionCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

export default function VacancyModelPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { modelId } = useLocalSearchParams<{ modelId?: string }>();

  const model = useMemo(() => {
    return MODELS.find((item) => item.id === modelId) || MODELS[0];
  }, [modelId]);

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
        title="Modelo pronto"
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
        <View style={styles.heroCard}>
          <View style={[styles.iconBox, { backgroundColor: model.iconBg }]}>
            <ModelIcon
              iconType={model.iconType}
              iconName={model.iconName}
              iconColor={model.iconColor}
            />
          </View>

          <View style={styles.heroTextBox}>
            <Text style={styles.heroTitle}>{model.title}</Text>
            <Text style={styles.heroDescription}>{model.description}</Text>
          </View>
        </View>

        <SectionCard title="Patologias / Diagnóstico" text={model.patologias} />
        <SectionCard
          title="Descrição dos cuidados necessários"
          text={model.cuidados}
        />
        <SectionCard
          title="Particularidades do paciente"
          text={model.particularidades}
        />
        <SectionCard title="Tarefas do profissional" text={model.tarefas} />

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.useButton}
          onPress={() =>
            router.replace({
              pathname: "/(client)/create-vacancy",
              params: { modelId: model.id },
            })
          }
        >
          <Text style={styles.useButtonText}>Usar este modelo</Text>
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

  headerIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CLIENT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  heroTextBox: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: TEXT_SOFT,
    fontWeight: "500",
  },

  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  sectionText: {
    fontSize: 13,
    lineHeight: 19,
    color: TEXT_SOFT,
    fontWeight: "500",
  },

  useButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  useButtonText: {
    fontSize: 17,
    lineHeight: 20,
    color: WHITE,
    fontWeight: "800",
  },
});