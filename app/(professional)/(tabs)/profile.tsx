import { useProfilePreferences } from "@/hooks/profissional/useProfilePreferences";
import React, { useMemo, useState } from "react";
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

type RestrictionItem = {
  id: string;
  label: string;
  checked: boolean;
};

const INITIAL_RESTRICTIONS: RestrictionItem[] = [
  { id: "1", label: "Não realizo serviços domésticos", checked: false },
  { id: "2", label: "Não realizo trabalho de cozinheiro(a)", checked: false },
  { id: "3", label: "Não realizo trabalho de babá", checked: false },
  { id: "4", label: "Não realizo banho no leito", checked: false },
  { id: "5", label: "Não realizo troca de fraldas", checked: false },
  { id: "6", label: "Não acompanho paciente em consultas externas", checked: false },
  { id: "7", label: "Não durmo no local", checked: false },
  { id: "8", label: "Não aceito deslocamento para outras cidades", checked: false },
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
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export default function ProfessionalProfile() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
const {
  preferences,
  setReceiveOnlyMyState,
  setReceiveOnlyShiftJobs,
  setReceiveOnlyFixedJobs,
  toggleRestriction,
  save,
} = useProfilePreferences();
  const [logoutModal, setLogoutModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Erro ao salvar.");
  const [photoErrorModal, setPhotoErrorModal] = useState(false);
  const [photoErrorMessage, setPhotoErrorMessage] = useState("Não foi possível atualizar a foto.");
  const [loadingPhoto, setLoadingPhoto] = useState(false);


  const [avatarUrl, setAvatarUrl] = useState<string | null>((user as any)?.avatar || null);

  const fullName = `${user?.firstName || ""}${user?.lastName ? ` ${user.lastName}` : ""}`.trim();
  const socialName = (user as any)?.socialName || "";
  const displayName = socialName || fullName || "Nome completo";

  const rawProfession =
  (user as any)?.profession ||
  (user as any)?.profissao ||
  "";

const otherProfession =
  (user as any)?.otherProfession ||
  (user as any)?.other_profession ||
  "";

const profession =
  rawProfession === "Outros"
    ? otherProfession || "Profissão"
    : rawProfession || "Profissão";

const gender =
  (user as any)?.gender ||
  (user as any)?.sexo ||
  (user as any)?.sex ||
  "--";

const birthDateRaw =
  (user as any)?.birth_date ||
  (user as any)?.birthDate ||
  "";

const cpf = user?.cpf || "--";
const rg = (user as any)?.rg || "--";

const city =
  (user as any)?.city ||
  (user as any)?.cidade ||
  (user as any)?.address?.city ||
  (user as any)?.endereco?.cidade ||
  "--";
console.log("USER PROFILE:", user);
const uf =
  (user as any)?.state ||
  (user as any)?.uf ||
  (user as any)?.estado ||
  (user as any)?.address?.state ||
  (user as any)?.endereco?.uf ||
  "--";
const displayRestrictions = useMemo(
  () => preferences.restrictions || [],
  [preferences.restrictions]
);
  
  const handlePickImage = async () => {
    try {
      if (!user?.id) {
        setPhotoErrorMessage("Usuário não encontrado.");
        setPhotoErrorModal(true);
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
      setPhotoErrorMessage(error?.message || "Não foi possível atualizar a foto.");
      setPhotoErrorModal(true);
    } finally {
      setLoadingPhoto(false);
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
          <Text style={styles.badgeProfession}>{profession}</Text>

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
                  <Feather name="camera" size={42} color="#1e40af" />
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
            router.push("/profile-form");
          }}
          style={styles.nextButton}
        >
          <Feather name="arrow-right" size={18} color="#fff" />
          <Text style={styles.nextButtonText}>Ficha cadastral</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Receber apenas vagas do meu estado</Text>
            <Switch value={preferences.receiveOnlyMyState} onValueChange={setReceiveOnlyMyState} />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Receber somente vagas de plantão</Text>
            <Switch value={preferences.receiveOnlyShiftJobs} onValueChange={setReceiveOnlyShiftJobs} />
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText}>Receber somente vagas de trabalho fixo</Text>
            <Switch value={preferences.receiveOnlyFixedJobs} onValueChange={setReceiveOnlyFixedJobs} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Atividades que não realizo</Text>

          {displayRestrictions.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => toggleRestriction(item.id)}
              activeOpacity={0.85}
              style={styles.checkRow}
            >
              <View style={[styles.checkbox, item.checked && styles.checkboxActive]}>
                {item.checked && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.checkText}>{item.label}</Text>
            </TouchableOpacity>
          ))}

          <PrimaryButton
            title="Salvar preferências"
            onPress={async () => {
  const result = await save();

  if (result?.success) {
    setSaveModal(true);
  } else {
    setErrorMessage(result?.error || "Erro ao salvar.");
    setErrorModal(true);
  }
}}
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
          { label: "Cancelar", onPress: () => setLogoutModal(false), variant: "secondary" },
          { label: "Sair", onPress: handleLogout, variant: "danger" },
        ]}
      />

      <CustomModal
        visible={saveModal}
        onClose={() => setSaveModal(false)}
        title="Preferências salvas"
        message="Preferências atualizadas com sucesso."
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
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
  borderColor: "#2563eb", // azul borda
  marginBottom: 14,

  // sombra azul iOS
  shadowColor: "#2563eb",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.25,
  shadowRadius: 10,

  // sombra Android
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
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#bfdbfe",
    overflow: "hidden",
  },

  photoImage: {
    width: "100%",
    height: "100%",
  },

  badgeInfo: {
    flex: 1,
    justifyContent: "center",
  },

  badgeProfession: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
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
    backgroundColor: "#1e40af",
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
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
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },

  checkText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#334155",
    fontWeight: "600",
  },
});