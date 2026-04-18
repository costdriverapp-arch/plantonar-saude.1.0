import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { AppInput } from "@/components/ui/AppInput";

const BLUE = "#1f69c6";
const WHITE = "#ffffff";
const BORDER = "#dce7f5";
const TEXT = "#111827";
const TEXT_SOFT = "#7a8ba3";

type Props = {
  patologias: string;
  setPatologias: (value: string) => void;
  cuidados: string;
  setCuidados: (value: string) => void;
  particularidades: string;
  setParticularidades: (value: string) => void;
  tarefas: string;
  setTarefas: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

export default function Step3Paciente({
  patologias,
  setPatologias,
  cuidados,
  setCuidados,
  particularidades,
  setParticularidades,
  tarefas,
  setTarefas,
  onBack,
  onNext,
}: Props) {
  return (
    <>
      {/* MODELOS */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.modelCard}
        onPress={() => router.push("/(client)/vacancy-models")}
      >
        <View style={styles.modelIcon}>
          <Feather name="zap" size={16} color={BLUE} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.modelTitle}>Usar modelo pronto</Text>
          <Text style={styles.modelSubtitle}>
            Preencha automaticamente com base na patologia
          </Text>
        </View>

        <Feather name="chevron-right" size={18} color={TEXT_SOFT} />
      </TouchableOpacity>

      <AppInput
        label="Patologias / Diagnóstico"
        value={patologias}
        onChangeText={setPatologias}
        placeholder="Descreva a condição do paciente"
        multiline
        numberOfLines={4}
      />

      <AppInput
        label="Cuidados necessários"
        value={cuidados}
        onChangeText={setCuidados}
        placeholder="Ex: auxílio na locomoção, medicação..."
        multiline
        numberOfLines={4}
      />

      <AppInput
        label="Particularidades"
        value={particularidades}
        onChangeText={setParticularidades}
        placeholder="Algo importante sobre o paciente"
        multiline
        numberOfLines={3}
      />

      <AppInput
        label="Tarefas do profissional"
        value={tarefas}
        onChangeText={setTarefas}
        placeholder="O que o profissional deverá fazer"
        multiline
        numberOfLines={4}
      />

      <View style={styles.footerActions}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.backInline}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={16} color={BLUE} />
          <Text style={styles.backInlineText}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryButtonFlex}
          onPress={onNext}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  modelCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  modelIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e8f0ff",
    alignItems: "center",
    justifyContent: "center",
  },

  modelTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  modelSubtitle: {
    fontSize: 12,
    color: TEXT_SOFT,
    marginTop: 2,
  },

  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
    marginBottom: 8,
  },

  backInline: {
    minHeight: 48,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  backInlineText: {
    fontSize: 15,
    color: BLUE,
    fontWeight: "700",
  },

  primaryButtonFlex: {
    flex: 1,
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 17,
    color: "#ffffff",
    fontWeight: "800",
  },
});