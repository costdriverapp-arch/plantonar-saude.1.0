import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { CustomModal } from "@/components/ui/CustomModal";
import { useApp } from "@/context/AppContext";
import { Application, JobVacancy } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

const VACANCIES_KEY = "@plantonar:vacancies_v2";

export default function VacancyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVacancyApplications, acceptApplication, rejectApplication } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [vacancy, setVacancy] = useState<JobVacancy | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmAccept, setConfirmAccept] = useState<Application | null>(null);
  const [confirmReject, setConfirmReject] = useState<Application | null>(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const vStored = await AsyncStorage.getItem(VACANCIES_KEY);
      const vAll: JobVacancy[] = vStored ? JSON.parse(vStored) : [];
      const found = vAll.find((v) => v.id === id);
      setVacancy(found || null);
      if (found) {
        const apps = await getVacancyApplications(found.id);
        setApplications(apps);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!confirmAccept) return;
    await acceptApplication(confirmAccept.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmAccept(null);
    setSelectedApp(null);
    setSuccessModal(true);
    loadData();
  };

  const handleReject = async () => {
    if (!confirmReject) return;
    await rejectApplication(confirmReject.id);
    setConfirmReject(null);
    setSelectedApp(null);
    loadData();
  };

  if (loading) return (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{vacancy?.title || "Detalhe da Vaga"}</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          vacancy ? (
            <View style={styles.vacancyInfo}>
              <Text style={styles.infoSectionTitle}>Informações da Vaga</Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Local: </Text>{vacancy.city}/{vacancy.state} • {vacancy.neighborhood} • CEP: {vacancy.cep}</Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Horário: </Text>{vacancy.workHours} | {vacancy.shiftDate}</Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Valor: </Text>{vacancy.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
              <Text style={styles.infoItem}><Text style={styles.infoLabel}>Status: </Text>{vacancy.status === "open" ? "Aberta" : vacancy.status === "filled" ? "Preenchida" : "Cancelada"}</Text>
              <Text style={[styles.infoSectionTitle, { marginTop: 12 }]}>Candidatos ({applications.length})</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Nenhum candidato ainda</Text>
          </View>
        }
        renderItem={({ item }) => {
          const pro = item.professional;
          const statusColors = { pending: "#f59e0b", accepted: "#16a34a", rejected: "#ef4444", cancelled: "#94a3b8", vacancy_filled: "#6366f1" };
          const statusLabels = { pending: "Aguardando", accepted: "Aceito", rejected: "Recusado", cancelled: "Cancelado", vacancy_filled: "Vaga Preenchida" };

          return (
            <TouchableOpacity
              style={styles.appCard}
              onPress={() => setSelectedApp(item)}
              activeOpacity={0.85}
            >
              <View style={styles.appCardLeft}>
                <View style={styles.appAvatar}>
                  <Feather name="user" size={22} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.appProfession}>{pro?.profession || "Profissional"}</Text>
                  <Text style={styles.appAge}>{pro?.city || "—"}</Text>
                </View>
              </View>
              <View>
                <View style={[styles.statusChip, { backgroundColor: statusColors[item.status] + "20" }]}>
                  <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                    {statusLabels[item.status]}
                  </Text>
                </View>
                {item.counterProposal && (
                  <Text style={styles.counterText}>
                    Contra: {item.counterProposal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {selectedApp && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity style={styles.backdrop} onPress={() => setSelectedApp(null)} />
          <View style={[styles.sheet, { paddingBottom: bottomPad + 12 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Perfil do Candidato</Text>
            <View style={styles.profileRow}>
              <View style={styles.profileAvatar}>
                <Feather name="user" size={36} color="#16a34a" />
              </View>
              <View>
                {selectedApp.status === "accepted" ? (
                  <>
                    <Text style={styles.profileName}>
                      {selectedApp.professional?.firstName} {selectedApp.professional?.lastName}
                    </Text>
                    <Text style={styles.profileInfo}>{selectedApp.professional?.phone}</Text>
                    <Text style={styles.profileInfo}>{selectedApp.professional?.cpf}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.profileName}>{selectedApp.professional?.profession || "Profissional"}</Text>
                    <Text style={styles.profileInfo}>Dados visíveis após aceite</Text>
                  </>
                )}
                <Text style={styles.profileCity}>{selectedApp.professional?.city || "—"}</Text>
              </View>
            </View>
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedChip}>
                <Feather name="shield" size={13} color="#16a34a" />
                <Text style={styles.verifiedText}>Documentos Verificados</Text>
              </View>
              <View style={styles.verifiedChip}>
                <Feather name="check-circle" size={13} color="#1e40af" />
                <Text style={[styles.verifiedText, { color: "#1e40af" }]}>Profissional Checado</Text>
              </View>
            </View>

            {selectedApp.status === "pending" && vacancy?.status === "open" && (
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => { setSelectedApp(null); setConfirmReject(selectedApp); }}>
                  <Feather name="x" size={16} color="#ef4444" />
                  <Text style={styles.rejectBtnText}>Recusar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => { setSelectedApp(null); setConfirmAccept(selectedApp); }}>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.acceptBtnText}>Aceitar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      <CustomModal
        visible={!!confirmAccept}
        onClose={() => setConfirmAccept(null)}
        title="Aceitar candidato?"
        message="Ao aceitar este candidato, a vaga será marcada como preenchida e outros candidatos serão notificados."
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
        buttons={[
          { label: "Cancelar", onPress: () => setConfirmAccept(null), variant: "secondary" },
          { label: "Aceitar", onPress: handleAccept, variant: "primary" },
        ]}
      />

      <CustomModal
        visible={!!confirmReject}
        onClose={() => setConfirmReject(null)}
        title="Recusar candidato?"
        message="O candidato será notificado sobre a recusa."
        icon={<Feather name="x-circle" size={40} color="#ef4444" />}
        buttons={[
          { label: "Cancelar", onPress: () => setConfirmReject(null), variant: "secondary" },
          { label: "Recusar", onPress: handleReject, variant: "danger" },
        ]}
      />

      <CustomModal
        visible={successModal}
        onClose={() => setSuccessModal(false)}
        title="Candidato Aceito!"
        message="A vaga foi preenchida. O profissional foi notificado."
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { backgroundColor: "#14532d", paddingHorizontal: 16, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {},
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 },
  list: { padding: 16 },
  vacancyInfo: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  infoSectionTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  infoItem: { fontSize: 13, color: "#475569", marginBottom: 4, lineHeight: 20 },
  infoLabel: { fontWeight: "600", color: "#0f172a" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: "#64748b" },
  appCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  appCardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  appAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" },
  appProfession: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  appAge: { fontSize: 12, color: "#64748b" },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-end" },
  statusText: { fontSize: 11, fontWeight: "700" },
  counterText: { fontSize: 11, color: "#6366f1", marginTop: 2, textAlign: "right" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 16 },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  profileAvatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center" },
  profileName: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  profileInfo: { fontSize: 13, color: "#475569" },
  profileCity: { fontSize: 12, color: "#64748b" },
  verifiedRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  verifiedChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  verifiedText: { fontSize: 11, fontWeight: "600", color: "#16a34a" },
  sheetActions: { flexDirection: "row", gap: 12 },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderColor: "#ef4444", borderRadius: 12, height: 48 },
  rejectBtnText: { color: "#ef4444", fontWeight: "600", fontSize: 15 },
  acceptBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#16a34a", borderRadius: 12, height: 48 },
  acceptBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
