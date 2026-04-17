import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { AppHeader } from "@/components/ui/AppHeader";
import { CustomModal } from "@/components/ui/CustomModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { uploadProfileAvatar } from "@/lib/services/profile-avatar-service";
import { supabase } from "@/lib/supabase";

type ObservationItem = {
  id: string;
  label: string;
  checked: boolean;
};

type CandidateGenderPreference = "female" | "male" | "indifferent";

const CLIENT_PRIMARY = "#16a34a";
const CLIENT_PRIMARY_DARK = "#14532d";
const CLIENT_ACCENT = "#dcfce7";
const CLIENT_BORDER = "#86efac";

const INITIAL_OBSERVATIONS: ObservationItem[] = [
  {
    id: "1",
    label: "Responder mensagens sobre o andamento do plantão",
    checked: false,
  },
  {
    id: "2",
    label: "Zelar pela higiene do quarto ou leito do paciente",
    checked: false,
  },
  {
    id: "3",
    label: "Auxiliar na alimentação do paciente",
    checked: false,
  },
  {
    id: "4",
    label: "Comunicar imediatamente qualquer intercorrência durante o plantão",
    checked: false,
  },
  {
    id: "5",
    label: "Respeitar os horários combinados para início e término do plantão",
    checked: false,
  },
  {
    id: "6",
    label: "Manter o ambiente organizado durante todo o atendimento",
    checked: false,
  },
  {
    id: "7",
    label: "Tratar o paciente e familiares com respeito e cordialidade",
    checked: false,
  },
  {
    id: "8",
    label: "Informar caso haja necessidade de materiais ou suporte adicional",
    checked: false,
  },
];

function formatBirthDate(value?: string) {
  if (!value) return "--";

  try {
    const date = new Date(value);

    if (isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return value;
  }
}

function formatCPF(value?: string) {
  if (!value) return "--";

  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9
  )}-${digits.slice(9)}`;
}

export default function ClientProfile() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [logoutModal, setLogoutModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Erro ao salvar.");
  const [photoErrorModal, setPhotoErrorModal] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState(
    "Não foi possível atualizar a foto."
  );
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingProfileData, setLoadingProfileData] = useState(true);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (user as any)?.avatar || null
  );

  const [receiveOnlyMyCity, setReceiveOnlyMyCity] = useState(false);
  const [preferredCandidateGender, setPreferredCandidateGender] =
    useState<CandidateGenderPreference>("indifferent");
  const [observations, setObservations] =
    useState<ObservationItem[]>(INITIAL_OBSERVATIONS);

  const fullName = `${user?.firstName || ""}${
    user?.lastName ? ` ${user.lastName}` : ""
  }`.trim();
  const socialName = (user as any)?.socialName || "";
  const displayName = socialName || fullName || "Nome completo";

  const birthDateRaw = (user as any)?.birthDate || "";
  const cpf = user?.cpf || "--";
  const rg = (user as any)?.rg || "--";

  const city =
    (user as any)?.city ||
    (user as any)?.address?.city ||
    (user as any)?.endereco?.cidade ||
    "--";

  const uf =
    (user as any)?.state ||
    (user as any)?.uf ||
    (user as any)?.address?.state ||
    (user as any)?.endereco?.uf ||
    "--";

  const selectedObservationCount = useMemo(
    () => observations.filter((item) => item.checked).length,
    [observations]
  );

  useEffect(() => {
    let mounted = true;

    async function loadClientProfileExtras() {
      if (!user?.id) {
        setLoadingProfileData(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "receive_only_city_candidates, preferred_candidate_gender, important_observations, avatar"
          )
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (error || !data || !mounted) {
          setLoadingProfileData(false);
          return;
        }

        if (data.avatar) {
          setAvatarUrl(data.avatar);
        }

        setReceiveOnlyMyCity(!!data.receive_only_city_candidates);

        const gender = data.preferred_candidate_gender as
          | CandidateGenderPreference
          | null;

        if (
          gender === "female" ||
          gender === "male" ||
          gender === "indifferent"
        ) {
          setPreferredCandidateGender(gender);
        }

        const savedObservations = Array.isArray(data.important_observations)
          ? data.important_observations
          : [];

        if (savedObservations.length > 0) {
          const next = INITIAL_OBSERVATIONS.map((item) => ({
            ...item,
            checked: savedObservations.includes(item.label),
          }));

          setObservations(next);
        }
      } catch {
      } finally {
        if (mounted) {
          setLoadingProfileData(false);
        }
      }
    }

    loadClientProfileExtras();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const toggleObservation = (id: string) => {
    setObservations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handlePickImage = async () => {
    try {
      if (!user?.id) {
        setPhotoErrorMessage("Usuário não encontrado.");
        setPhotoErrorModal(true);
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setPhotoErrorMessage("Permissão da galeria não concedida.");
        setPhotoErrorModal(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUri = result.assets[0]?.uri;

      if (!imageUri) {
        setPhotoErrorMessage("Imagem inválida.");
        setPhotoErrorModal(true);
        return;
      }

      setLoadingPhoto(true);

      const uploadResult = await uploadProfileAvatar({
        authUserId: user.id,
        imageUri,
        oldAvatarUrl: avatarUrl,
      });

      setAvatarUrl(uploadResult.avatarUrl);
    } catch (error: any) {
      setPhotoErrorMessage(
        error?.message || "Não foi possível atualizar a foto."
      );
      setPhotoErrorModal(true);
    } finally {
      setLoadingPhoto(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user?.id) {
      setErrorMessage("Usuário não encontrado.");
      setErrorModal(true);
      return;
    }

    try {
      setLoadingSave(true);

      const selectedObservations = observations
        .filter((item) => item.checked)
        .map((item) => item.label);

      const { error } = await supabase
        .from("profiles")
        .update({
          receive_only_city_candidates: receiveOnlyMyCity,
          preferred_candidate_gender: preferredCandidateGender,
          important_observations: selectedObservations,
          updated_at: new Date().toISOString(),
        })
        .eq("auth_user_id", user.id);

      if (error) {
        throw error;
      }

      setSaveModal(true);
    } catch (error: any) {
      setErrorMessage(error?.message || "Erro ao salvar.");
      setErrorModal(true);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleLogout = async () => {
    setLogoutModal(false);
    await signOut();
    router.replace("/(auth)/welcome");
  };

  const headerRightContent = (
    <TouchableOpacity
      onPress={() => setLogoutModal(true)}
      activeOpacity={0.8}
      style={styles.logoutBox}
    >
      <Feather name="log-out" size={14} color="#fff" />
      <Text style={styles.logoutText}>Sair</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Perfil do usuário"
        showBack
        rightContent={headerRightContent}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.badgeCard}>
          <Text style={styles.badgeProfession}>Cliente Plantonar Saúde</Text>

          <View style={styles.badgeTopRow}>
            <TouchableOpacity
              style={styles.photoUploadBox}
              activeOpacity={0.85}
              onPress={handlePickImage}
              disabled={loadingPhoto}
            >
              <View style={styles.photoBox}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="camera" size={42} color={CLIENT_PRIMARY_DARK} />
                )}

                {loadingPhoto && (
                  <View style={styles.photoLoadingOverlay}>
                    <Text style={styles.photoLoadingText}>...</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.badgeInfo}>
              <Text style={styles.badgeName}>{displayName}</Text>
              <Text style={styles.badgeLine}>
                Nascimento: {formatBirthDate(birthDateRaw)}
              </Text>
              <Text style={styles.badgeLine}>CPF: {formatCPF(cpf)}</Text>
              <Text style={styles.badgeLine}>RG: {rg}</Text>
              <Text style={styles.badgeLine}>
                {city} / {uf}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            router.push("/(client)/profile-form");
          }}
          style={styles.nextButton}
        >
          <Feather name="arrow-right" size={18} color="#fff" />
          <Text style={styles.nextButtonText}>Ficha cadastral</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            router.push("/client-avaliacao" as any);
          }}
          style={styles.nextButton}
        >
          <Feather name="star" size={18} color="#fff" />
          <Text style={styles.nextButtonText}>Avaliação</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>
              Receber somente candidatos da minha cidade
            </Text>
            <Switch
              value={receiveOnlyMyCity}
              onValueChange={setReceiveOnlyMyCity}
              trackColor={{ false: "#cbd5e1", true: "#86efac" }}
              thumbColor={receiveOnlyMyCity ? CLIENT_PRIMARY : "#f8fafc"}
            />
          </View>

          <Text style={styles.preferenceSubTitle}>
            Preferência de sexo do profissional
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setPreferredCandidateGender("female")}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radioCircle,
                preferredCandidateGender === "female" && styles.radioCircleActive,
              ]}
            >
              {preferredCandidateGender === "female" && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>
              Receber somente candidatos do sexo feminino
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setPreferredCandidateGender("male")}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radioCircle,
                preferredCandidateGender === "male" && styles.radioCircleActive,
              ]}
            >
              {preferredCandidateGender === "male" && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>
              Receber somente candidatos do sexo masculino
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setPreferredCandidateGender("indifferent")}
            style={styles.radioRow}
          >
            <View
              style={[
                styles.radioCircle,
                preferredCandidateGender === "indifferent" &&
                  styles.radioCircleActive,
              ]}
            >
              {preferredCandidateGender === "indifferent" && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>Indiferente</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Observações importantes</Text>
            <Text style={styles.sectionCount}>
              {selectedObservationCount} selecionada
              {selectedObservationCount !== 1 ? "s" : ""}
            </Text>
          </View>

          {loadingProfileData ? (
            <Text style={styles.loadingText}>Carregando observações...</Text>
          ) : (
            observations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleObservation(item.id)}
                activeOpacity={0.85}
                style={styles.checkRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.checked && styles.checkboxActive,
                  ]}
                >
                  {item.checked && <Feather name="check" size={14} color="#fff" />}
                </View>
                <Text style={styles.checkText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          )}

          <PrimaryButton
            title={loadingSave ? "Salvando..." : "Salvar preferências"}
            onPress={handleSavePreferences}
            loading={loadingSave}
            style={styles.preferencesSaveButton}
          />
        </View>
      </ScrollView>

      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        title="Sair da conta"
        message="Tem certeza que deseja sair?"
        icon={<Feather name="log-out" size={40} color="#ef4444" />}
        buttons={[
          {
            label: "Cancelar",
            onPress: () => setLogoutModal(false),
            variant: "secondary",
          },
          { label: "Sair", onPress: handleLogout, variant: "danger" },
        ]}
      />

      <CustomModal
        visible={saveModal}
        onClose={() => setSaveModal(false)}
        title="Preferências salvas"
        message="As preferências do cliente foram atualizadas com sucesso."
        icon={<Feather name="check-circle" size={40} color={CLIENT_PRIMARY} />}
      />

      <CustomModal
        visible={errorModal}
        onClose={() => setErrorModal(false)}
        title="Erro ao salvar"
        message={errorMessage}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />

      <CustomModal
        visible={photoErrorModal}
        onClose={() => setPhotoErrorModal(false)}
        title="Erro ao atualizar foto"
        message={photoErrorMessage}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  logoutBox: {
    alignItems: "center",
    justifyContent: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "600",
  },

  badgeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: CLIENT_PRIMARY,
    marginBottom: 14,
    shadowColor: CLIENT_PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },

  badgeTopRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },

  photoUploadBox: {
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  photoBox: {
    width: 120,
    height: 140,
    borderRadius: 20,
    backgroundColor: CLIENT_ACCENT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: CLIENT_BORDER,
    overflow: "hidden",
  },

  photoImage: {
    width: "100%",
    height: "100%",
  },

  photoLoadingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(20,83,45,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  photoLoadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  badgeInfo: {
    flex: 1,
    justifyContent: "center",
  },

  badgeProfession: {
    fontSize: 20,
    fontWeight: "800",
    color: "#26bc08",
    marginBottom: 14,
    textAlign: "center",
  },

  badgeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },

  badgeLine: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },

  nextButton: {
    width: "100%",
    marginBottom: 14,
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: CLIENT_PRIMARY_DARK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  nextButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },

  sectionCount: {
    fontSize: 12,
    fontWeight: "700",
    color: CLIENT_PRIMARY,
    marginBottom: 14,
  },

  preferenceRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 4,
  },

  preferenceText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },

  preferenceSubTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 12,
    marginBottom: 12,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  radioCircleActive: {
    borderColor: CLIENT_PRIMARY,
    backgroundColor: "#ecfdf5",
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CLIENT_PRIMARY,
  },

  radioText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "600",
  },

  loadingText: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },

  preferencesSaveButton: {
    width: "100%",
    marginTop: 10,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 1,
  },

  checkboxActive: {
    backgroundColor: CLIENT_PRIMARY,
    borderColor: CLIENT_PRIMARY,
  },

  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "600",
  },
});