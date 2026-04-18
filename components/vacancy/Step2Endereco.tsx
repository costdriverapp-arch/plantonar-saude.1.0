import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { AppInput } from "@/components/ui/AppInput";

const BLUE = "#1f69c6";
const TEXT = "#0f172a";
const TEXT_SOFT = "#64748b";
const CLIENT_GREEN = "#16a34a";

type Props = {
  usarMeuEndereco: boolean;
  setUsarMeuEndereco: (value: boolean) => void;
  cep: string;
  setCep: (value: string) => void;
  rua: string;
  setRua: (value: string) => void;
  numero: string;
  setNumero: (value: string) => void;
  complemento: string;
  setComplemento: (value: string) => void;
  bairro: string;
  setBairro: (value: string) => void;
  cidade: string;
  setCidade: (value: string) => void;
  estado: string;
  setEstado: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function Step2Endereco({
  usarMeuEndereco,
  setUsarMeuEndereco,
  cep,
  setCep,
  rua,
  setRua,
  numero,
  setNumero,
  complemento,
  setComplemento,
  bairro,
  setBairro,
  cidade,
  setCidade,
  estado,
  setEstado,
  onBack,
  onNext,
}: Props) {
  return (
    <>
      <View style={styles.addressHeaderRow}>
        <Text style={styles.addressTitle}>Endereço do plantão</Text>

        <View style={styles.addressSwitchRow}>
          <Text style={styles.addressSwitchText}>Meu endereço</Text>
          <Switch
            value={usarMeuEndereco}
            onValueChange={setUsarMeuEndereco}
            trackColor={{ false: "#cbd5e1", true: "#86efac" }}
            thumbColor={usarMeuEndereco ? CLIENT_GREEN : "#ffffff"}
          />
        </View>
      </View>

      <AppInput
        label="CEP"
        value={cep}
        onChangeText={(value) => setCep(formatCep(value))}
        placeholder="00000-000"
        keyboardType="numeric"
      />

      <AppInput
        label="Rua / Logradouro"
        value={rua}
        onChangeText={setRua}
        placeholder="Rua Exemplo"
      />

      <View style={styles.row}>
        <View style={styles.smallCol}>
          <AppInput
            label="Número"
            value={numero}
            onChangeText={setNumero}
            placeholder="123"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.largeCol}>
          <AppInput
            label="Complemento"
            value={complemento}
            onChangeText={setComplemento}
            placeholder="Apto, bloco..."
          />
        </View>
      </View>

      <AppInput
        label="Bairro"
        value={bairro}
        onChangeText={setBairro}
        placeholder="Nome do bairro"
      />

      <View style={styles.row}>
        <View style={styles.cityCol}>
          <AppInput
            label="Cidade"
            value={cidade}
            onChangeText={setCidade}
            placeholder="Belo Horizonte"
          />
        </View>

        <View style={styles.ufCol}>
          <AppInput
            label="UF"
            value={estado}
            onChangeText={(value) => setEstado(value.toUpperCase().slice(0, 2))}
            placeholder="MG"
            autoCapitalize="characters"
            maxLength={2}
          />
        </View>
      </View>

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
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 2,
  },

  addressTitle: {
    fontSize: 13,
    lineHeight: 17,
    color: TEXT,
    fontWeight: "800",
  },

  addressSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  addressSwitchText: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  smallCol: {
    flex: 0.9,
  },

  largeCol: {
    flex: 1.3,
  },

  cityCol: {
    flex: 1.4,
  },

  ufCol: {
    flex: 0.6,
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
    lineHeight: 18,
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
    lineHeight: 20,
    color: "#ffffff",
    fontWeight: "800",
  },
});