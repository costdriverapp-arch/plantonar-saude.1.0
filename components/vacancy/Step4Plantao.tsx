import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AppInput } from "@/components/ui/AppInput";

const BLUE = "#1f69c6";
const WHITE = "#ffffff";
const TEXT = "#0f172a";
const TEXT_SOFT = "#64748b";
const BORDER = "#d9e2ec";
const CHIP_BG = "#dde6f1";
const CHIP_TEXT = "#6c7a90";
const INFO_BG = "#dcecff";
const INFO_TEXT = "#3f7ed8";
const CLIENT_GREEN = "#16a34a";

const TURNOS = ["Diurno", "Noturno", "Plantão 12h", "Plantão 24h"];
const DURACOES = ["24 horas", "48 horas", "72 horas"];
const TITULOS_ANUNCIO = [
  "Acompanhante hospitalar Diurno",
  "Acompanhante hospitalar Noturno",
  "Acompanhante Residencial Diurno",
  "Acompanhante Residencial Noturno",
  "Cuidadora de idosos",
  "Cuidador de Idosos (masculino)",
  "Auxiliar de Enfermagem",
  "Auxiliar de Enfermagem (masculino)",
  "Técnica em Enfermagem",
  "Técnico em Enfermagem (masculino)",
  "Enfermeira",
  "Enfermeira Diurna",
  "Enfermeira Noturna",
  "Enfermeiro (Masculino)",
  "Fonoaudiólogo(a)",
  "Médico(a)",
  "Psicólogo(a)",
  "Terapeuta Ocupacional",
  "Outro",
];

function CalendarPreviewDay({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <View style={[styles.calendarDay, active && styles.calendarDayActive]}>
      <Text style={[styles.calendarDayText, active && styles.calendarDayTextActive]}>
        {label}
      </Text>
    </View>
  );
}

type Props = {
  tituloAnuncio: string;
  setTituloAnuncio: (value: string) => void;
  tituloOutro: string;
  setTituloOutro: (value: string) => void;
  showTituloModal: boolean;
  setShowTituloModal: (value: boolean) => void;
  turno: string;
  setTurno: (value: string) => void;
  tarefas: string;
  setTarefas: (value: string) => void;
  valorPlantao: string;
  setValorPlantao: (value: string) => void;
  duracao: string;
  setDuracao: (value: string) => void;
  mostrarPrecoPublicacao: boolean;
  setMostrarPrecoPublicacao: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
};

export default function Step4Plantao({
  tituloAnuncio,
  setTituloAnuncio,
  tituloOutro,
  setTituloOutro,
  showTituloModal,
  setShowTituloModal,
  turno,
  setTurno,
  tarefas,
  setTarefas,
  valorPlantao,
  setValorPlantao,
  duracao,
  setDuracao,
  mostrarPrecoPublicacao,
  setMostrarPrecoPublicacao,
  onBack,
  onSubmit,
}: Props) {
  return (
    <>
      <Text style={styles.fieldLabel}>Título do anúncio</Text>
      <Pressable
        style={styles.selectBox}
        onPress={() => setShowTituloModal(true)}
      >
        <Text
          style={[
            styles.selectText,
            !tituloAnuncio && styles.placeholderText,
          ]}
        >
          {tituloAnuncio || "Toque para selecionar..."}
        </Text>
        <Feather name="chevron-down" size={18} color={TEXT_SOFT} />
      </Pressable>

      {tituloAnuncio === "Outro" && (
        <AppInput
          label="Título personalizado"
          value={tituloOutro}
          onChangeText={(value) => setTituloOutro(value.slice(0, 80))}
          placeholder="Digite o título do anúncio"
          maxLength={80}
        />
      )}

      <Text style={styles.fieldLabel}>Data do plantão</Text>
      <Pressable style={styles.calendarBox}>
        <View style={styles.calendarHeader}>
          <View style={styles.calendarTitleRow}>
            <Feather name="calendar" size={16} color={BLUE} />
            <Text style={styles.calendarTitle}>Selecionar no calendário</Text>
          </View>
          <Text style={styles.calendarMonth}>Agosto 2026</Text>
        </View>

        <View style={styles.calendarWeekRow}>
          <Text style={styles.calendarWeekText}>D</Text>
          <Text style={styles.calendarWeekText}>S</Text>
          <Text style={styles.calendarWeekText}>T</Text>
          <Text style={styles.calendarWeekText}>Q</Text>
          <Text style={styles.calendarWeekText}>Q</Text>
          <Text style={styles.calendarWeekText}>S</Text>
          <Text style={styles.calendarWeekText}>S</Text>
        </View>

        <View style={styles.calendarGrid}>
          {["27", "28", "29", "30", "31", "1", "2"].map((day, index) => (
            <CalendarPreviewDay key={`w1-${day}`} label={day} active={index >= 5} />
          ))}
          {["3", "4", "5", "6", "7", "8", "9"].map((day, index) => (
            <CalendarPreviewDay key={`w2-${day}`} label={day} active={index === 2 || index === 4} />
          ))}
          {["10", "11", "12", "13", "14", "15", "16"].map((day, index) => (
            <CalendarPreviewDay key={`w3-${day}`} label={day} active={index === 1 || index === 5} />
          ))}
        </View>
      </Pressable>

      <TouchableOpacity activeOpacity={0.85} style={styles.addDateButton}>
        <Feather name="plus" size={16} color={BLUE} />
        <Text style={styles.addDateButtonText}>Adicionar mais dias e horários</Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Horário de entrada</Text>
      <Pressable style={styles.timeBox}>
        <View style={styles.timeLeft}>
          <Feather name="clock" size={16} color={BLUE} />
          <Text style={styles.timePlaceholder}>Selecionar horário</Text>
        </View>
        <Feather name="chevron-right" size={16} color={TEXT_SOFT} />
      </Pressable>

      <Text style={styles.fieldLabel}>Horário de saída</Text>
      <Pressable style={styles.timeBox}>
        <View style={styles.timeLeft}>
          <Feather name="clock" size={16} color={BLUE} />
          <Text style={styles.timePlaceholder}>Selecionar horário</Text>
        </View>
        <Feather name="chevron-right" size={16} color={TEXT_SOFT} />
      </Pressable>

      <Text style={styles.fieldLabel}>Turno</Text>
      <View style={styles.chipsRowWrap}>
        {TURNOS.map((item) => {
          const selected = turno === item;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => setTurno(item)}
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
        label="Tarefas do profissional"
        value={tarefas}
        onChangeText={setTarefas}
        placeholder="Mudança de decúbito a cada 2h. Banho no leito. Troca de fraldas. Alimentação. Medicamentos."
        multiline
        numberOfLines={4}
      />

      <AppInput
        label="Valor do plantão (mín. R$ 140,00)"
        value={valorPlantao}
        onChangeText={setValorPlantao}
        placeholder="Ex: 350,00"
        keyboardType="numeric"
      />

      <Text style={styles.fieldLabel}>Duração do anúncio (máx. 72h)</Text>
      <View style={styles.chipsRow}>
        {DURACOES.map((item) => {
          const selected = duracao === item;
          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              style={[styles.chip, selected && styles.chipSelectedStrong]}
              onPress={() => setDuracao(item)}
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

      <View style={styles.durationHintRow}>
        <Feather name="clock" size={12} color="#97a6ba" />
        <Text style={styles.durationHintText}>
          A vaga será automaticamente encerrada após 72h
        </Text>
      </View>

      <View style={styles.priceToggleRow}>
        <Text style={styles.priceToggleLabel}>Mostrar aviso de publicação</Text>
        <Switch
          value={mostrarPrecoPublicacao}
          onValueChange={setMostrarPrecoPublicacao}
          trackColor={{ false: "#cbd5e1", true: "#86efac" }}
          thumbColor={mostrarPrecoPublicacao ? CLIENT_GREEN : "#ffffff"}
        />
      </View>

      {mostrarPrecoPublicacao && (
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={INFO_TEXT} />
          <Text style={styles.infoBoxText}>
            A plataforma cobra R$ 19,90 pela publicação. O pagamento do plantão é
            feito diretamente ao profissional.
          </Text>
        </View>
      )}

      <View style={styles.footerActionsLast}>
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
          onPress={onSubmit}
        >
          <Text style={styles.primaryButtonText}>Publicar vaga</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showTituloModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTituloModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTituloModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Título do anúncio</Text>
              <Pressable onPress={() => setShowTituloModal(false)}>
                <Feather name="x" size={20} color={TEXT} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {TITULOS_ANUNCIO.map((item) => {
                const selected = tituloAnuncio === item;
                return (
                  <Pressable
                    key={item}
                    style={styles.modalItem}
                    onPress={() => {
                      setTituloAnuncio(item);
                      setShowTituloModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        selected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {selected ? <Feather name="check" size={18} color={BLUE} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 2,
  },

  selectBox: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  selectText: {
    fontSize: 15,
    color: TEXT,
    fontWeight: "500",
    flex: 1,
    paddingRight: 12,
  },

  placeholderText: {
    color: "#97a6ba",
  },

  calendarBox: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },

  calendarHeader: {
    marginBottom: 12,
  },

  calendarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  calendarTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: BLUE,
  },

  calendarMonth: {
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  calendarWeekText: {
    width: 34,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  calendarDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f3f7fb",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarDayActive: {
    backgroundColor: "#d8f5df",
    borderWidth: 1,
    borderColor: CLIENT_GREEN,
  },

  calendarDayText: {
    fontSize: 12,
    lineHeight: 14,
    color: "#7b8ba3",
    fontWeight: "700",
  },

  calendarDayTextActive: {
    color: "#14532d",
  },

  addDateButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cfe0f3",
    backgroundColor: "#f5f9ff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },

  addDateButtonText: {
    fontSize: 13,
    lineHeight: 16,
    color: BLUE,
    fontWeight: "700",
  },

  timeBox: {
    width: "100%",
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: WHITE,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timePlaceholder: {
    fontSize: 15,
    color: "#97a6ba",
    fontWeight: "500",
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

  durationHintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: -2,
    marginBottom: 12,
  },

  durationHintText: {
    fontSize: 11,
    lineHeight: 14,
    color: "#97a6ba",
    fontWeight: "500",
  },

  priceToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 2,
  },

  priceToggleLabel: {
    flex: 1,
    marginRight: 12,
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_SOFT,
    fontWeight: "700",
  },

  infoBox: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: INFO_BG,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 18,
  },

  infoBoxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: INFO_TEXT,
    fontWeight: "500",
  },

  footerActionsLast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  modalCard: {
    width: "100%",
    maxHeight: "75%",
    borderRadius: 18,
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  modalTitle: {
    fontSize: 16,
    color: TEXT,
    fontWeight: "800",
  },

  modalItem: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalItemText: {
    flex: 1,
    paddingRight: 12,
    fontSize: 15,
    color: TEXT,
    fontWeight: "500",
  },

  modalItemTextSelected: {
    color: BLUE,
    fontWeight: "700",
  },
});