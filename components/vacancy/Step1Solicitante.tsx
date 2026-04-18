import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppInput } from "@/components/ui/AppInput";

const BLUE = "#1f69c6";
const GREEN = "#44a04a";
const LIGHT_BAR = "#d6dfeb";
const CHIP_BG = "#dde6f1";
const CHIP_TEXT = "#6c7a90";

const SEXOS = ["Masculino", "Feminino", "Não informar"];
const TIPOS_VAGA = ["Plantão único", "Plantão cumulado", "Folguista", "Fixo mensal"];

type Props = {
  solicitanteNome: string;
  setSolicitanteNome: (value: string) => void;
  telefone: string;
  setTelefone: (value: string) => void;
  whatsapp: string;
  setWhatsapp: (value: string) => void;
  nomePaciente: string;
  setNomePaciente: (value: string) => void;
  sexoPaciente: string;
  setSexoPaciente: (value: string) => void;
  idadePaciente: string;
  setIdadePaciente: (value: string) => void;
  tipoVaga: string;
  setTipoVaga: (value: string) => void;
  onNext: () => void;
};

export default function Step1Solicitante({
  solicitanteNome,
  setSolicitanteNome,
  telefone,
  setTelefone,
  whatsapp,
  setWhatsapp,
  nomePaciente,
  setNomePaciente,
  sexoPaciente,
  setSexoPaciente,
  idadePaciente,
  setIdadePaciente,
  tipoVaga,
  setTipoVaga,
  onNext,
}: Props) {
  return (
    <>
      <AppInput
        label="Nome completo do solicitante"
        value={solicitanteNome}
        onChangeText={setSolicitanteNome}
        placeholder="Patrícia Oliveira Nunes"
      />

      <AppInput
        label="Telefone"
        value={telefone}
        onChangeText={setTelefone}
        placeholder="(31)99100-0010"
        keyboardType="phone-pad"
      />

      <AppInput
        label="WhatsApp"
        value={whatsapp}
        onChangeText={setWhatsapp}
        placeholder="(31)99999-9999"
        keyboardType="phone-pad"
      />

      <AppInput
        label="Nome do paciente"
        value={nomePaciente}
        onChangeText={setNomePaciente}
        placeholder="Nome completo"
      />

      <Text style={styles.fieldLabel}>Sexo do paciente</Text>
      <View style={styles.chipsRow}>
        {SEXOS.map((item) => {
          const selected = sexoPaciente === item;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setSexoPaciente(item)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <AppInput
        label="Idade do paciente"
        value={idadePaciente}
        onChangeText={setIdadePaciente}
        placeholder="Ex: 72"
        keyboardType="numeric"
      />

      <Text style={styles.fieldLabel}>Tipo de vaga</Text>
      <View style={styles.chipsRowWrap}>
        {TIPOS_VAGA.map((item) => {
          const selected = tipoVaga === item;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.chip, selected && styles.chipSelectedStrong]}
              onPress={() => setTipoVaga(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelectedStrong,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.singleButtonRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.primaryButton}
          onPress={onNext}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 2,
  },

  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },

  chipsRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  chip: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: CHIP_BG,
    alignItems: "center",
    justifyContent: "center",
  },

  chipSelected: {
    backgroundColor: "#cfdcf1",
  },

  chipSelectedStrong: {
    backgroundColor: "#e6f0ff",
    borderWidth: 1.5,
    borderColor: BLUE,
  },

  chipText: {
    fontSize: 11,
    lineHeight: 14,
    color: CHIP_TEXT,
    fontWeight: "700",
  },

  chipTextSelected: {
    color: "#5f6f87",
  },

  chipTextSelectedStrong: {
    color: BLUE,
  },

  singleButtonRow: {
    marginTop: 8,
  },

  primaryButton: {
    width: "100%",
    minHeight: 54,
    borderRadius: 10,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    fontSize: 17,
    lineHeight: 20,
    color: "#ffffff",
    fontWeight: "800",
  },
});