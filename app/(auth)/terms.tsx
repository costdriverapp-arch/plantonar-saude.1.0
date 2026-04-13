import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos e Privacidade</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 20 }]}>
        <Text style={styles.sectionTitle}>Termos de Uso</Text>
        <Text style={styles.body}>
          Bem-vindo ao Plantonar Saúde. Ao utilizar nossos serviços, você concorda com os seguintes
          termos e condições.{"\n\n"}
          <Text style={styles.bold}>1. Uso do Serviço</Text>{"\n"}
          O Plantonar Saúde é uma plataforma de conexão entre profissionais de saúde e clientes que
          necessitam de cuidados. A plataforma não é empregadora de nenhum profissional cadastrado.
          {"\n\n"}
          <Text style={styles.bold}>2. Responsabilidades do Profissional</Text>{"\n"}
          O profissional é responsável por manter seus dados atualizados, possuir registro no
          conselho de classe competente e pela qualidade dos serviços prestados.{"\n\n"}
          <Text style={styles.bold}>3. Responsabilidades do Cliente</Text>{"\n"}
          O cliente é responsável por fornecer informações verdadeiras sobre as necessidades do
          paciente e pelas condições de trabalho oferecidas.{"\n\n"}
          <Text style={styles.bold}>4. Sistema de Créditos</Text>{"\n"}
          Cada profissional possui um crédito diário gratuito para candidatura. Créditos adicionais
          podem ser adquiridos. Créditos não são cumulativos e vencem ao final de cada dia.{"\n\n"}
          <Text style={styles.bold}>5. Cancelamentos</Text>{"\n"}
          O profissional pode cancelar sua candidatura antes do aceite sem perder o crédito. Após o
          aceite, cancelamentos devem ser comunicados ao cliente diretamente.
        </Text>

        <Text style={styles.sectionTitle}>Política de Privacidade</Text>
        <Text style={styles.body}>
          <Text style={styles.bold}>1. Dados Coletados</Text>{"\n"}
          Coletamos dados pessoais como nome, CPF, RG, e-mail, telefone e endereço para fins de
          cadastro e verificação de identidade.{"\n\n"}
          <Text style={styles.bold}>2. Uso dos Dados</Text>{"\n"}
          Seus dados são utilizados exclusivamente para operação da plataforma, comunicação sobre
          vagas e candidaturas, e verificação de identidade e habilitação profissional.{"\n\n"}
          <Text style={styles.bold}>3. Compartilhamento</Text>{"\n"}
          Dados básicos do profissional (foto, profissão, cidade) são visíveis para clientes. Dados
          pessoais completos só são compartilhados após o aceite da candidatura.{"\n\n"}
          <Text style={styles.bold}>4. Segurança</Text>{"\n"}
          Adotamos medidas técnicas e organizacionais para proteger seus dados pessoais contra acesso
          não autorizado.{"\n\n"}
          <Text style={styles.bold}>5. Seus Direitos</Text>{"\n"}
          Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através
          do nosso canal de suporte.{"\n\n"}
          Dúvidas? Entre em contato: suporte@plantanarsaude.com.br{"\n"}
          Nexortec - 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    alignSelf: "flex-start",
    padding: 4,
    paddingTop: 12,
  },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  content: { padding: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 8,
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 24,
  },
  bold: {
    fontWeight: "700",
    color: "#0f172a",
  },
});
