import React, { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { AppHeader } from "@/components/ui/AppHeader";
import { AppInput } from "@/components/ui/AppInput";
import { CustomModal } from "@/components/ui/CustomModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Step = 1 | 2 | 3;

type EmergencyContactItem = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  relationship: string;
};

type DropdownProps = {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  compact?: boolean;
};

const STEP_LABELS: Record<Step, string> = {
  1: "Pessoais",
  2: "Endereço",
  3: "Profissional",
};

const SEX_OPTIONS = ["Masculino", "Feminino", "Outros"];

const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const CLIENT_PRIMARY = "#16a34a";
const CLIENT_PRIMARY_DARK = "#14532d";
const CLIENT_BORDER_LIGHT = "#bbf7d0";

function createEmergencyContactItem(): EmergencyContactItem {
  return {
    id: String(Date.now() + Math.random()),
    name: "",
    phone: "",
    whatsapp: "",
    relationship: "",
  };
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function formatBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function normalizeBirthDateInput(value: string): string {
  const clean = value.trim();

  if (!clean) return "";

  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }
    }
  }

  return formatBirthDateInput(clean);
}

function formatBirthDateToIso(value: string) {
  const clean = value.trim();

  if (!clean) return null;

  if (clean.includes("/")) {
    const parts = clean.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
  }

  return clean;
}

function SimpleDropdown({
  label,
  placeholder,
  value,
  options,
  onSelect,
  compact = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <View
      style={[
        compact ? styles.dropdownCompactWrap : styles.dropdownWrap,
        open && styles.dropdownWrapOpen,
      ]}
    >
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          compact && styles.dropdownTriggerCompact,
          open && styles.dropdownTriggerOpen,
        ]}
        onPress={toggle}
        activeOpacity={0.85}
      >
        <Text style={[styles.dropdownTriggerText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownListBox}>
          <ScrollView
            nestedScrollEnabled
            style={styles.dropdownListScroll}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option, index) => {
              const active = option === value;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.dropdownListItem,
                    active && styles.dropdownListItemActive,
                    index === options.length - 1 && styles.dropdownListItemLast,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownListItemText,
                      active && styles.dropdownListItemTextActive,
                    ]}
                  >
                    {option}
                  </Text>

                  {active ? (
                    <Feather name="check" size={16} color={CLIENT_PRIMARY_DARK} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function ClientProfileForm() {
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState<Step>(1);
  const [infoModal, setInfoModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Não foi possível salvar os dados.");
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(
    `${user?.firstName || ""}${user?.lastName ? ` ${user.lastName}` : ""}`.trim()
  );
  const [gender, setGender] = useState((user as any)?.gender || "");
  const [socialName, setSocialName] = useState((user as any)?.socialName || "");
  const [birthDate, setBirthDate] = useState(
    normalizeBirthDateInput((user as any)?.birthDate || "")
  );
  const [cpf] = useState(formatCPF(user?.cpf || ""));
  const [rg, setRg] = useState((user as any)?.rg || "");
  const [phone, setPhone] = useState(formatPhone(user?.phone || ""));
  const [whatsapp, setWhatsapp] = useState(formatPhone(user?.whatsapp || ""));
  const [email] = useState(user?.email || "");

  const [cep, setCep] = useState(formatCEP((user as any)?.cep || ""));
  const [street, setStreet] = useState((user as any)?.street || "");
  const [number, setNumber] = useState((user as any)?.number || "");
  const [complement, setComplement] = useState((user as any)?.complement || "");
  const [neighborhood, setNeighborhood] = useState((user as any)?.neighborhood || "");
  const [city, setCity] = useState((user as any)?.city || "");
  const [uf, setUf] = useState((user as any)?.state || "");

  const [profession, setProfession] = useState((user as any)?.profession || "");

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactItem[]>(
    Array.isArray((user as any)?.emergencyContacts) && (user as any).emergencyContacts.length > 0
      ? (user as any).emergencyContacts.map((item: any) => ({
          id: item.id || String(Date.now() + Math.random()),
          name: item.name || "",
          phone: formatPhone(item.phone || ""),
          whatsapp: formatPhone(item.whatsapp || ""),
          relationship: item.relationship || "",
        }))
      : [createEmergencyContactItem()]
  );

  const birthDateRef = useRef<TextInput>(null);
  const rgRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const whatsappRef = useRef<TextInput>(null);

  const cepRef = useRef<TextInput>(null);
  const streetRef = useRef<TextInput>(null);
  const numberRef = useRef<TextInput>(null);
  const complementRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);

  const professionRef = useRef<TextInput>(null);

  const goToPosition = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  const updateEmergencyContactItem = React.useCallback(
    (id: string, key: keyof EmergencyContactItem, value: string) => {
      const nextValue =
        key === "phone" || key === "whatsapp" ? formatPhone(value) : value;

      setEmergencyContacts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [key]: nextValue } : item
        )
      );
    },
    []
  );

  const addEmergencyContactItem = () => {
    if (emergencyContacts.length >= 3) return;
    setEmergencyContacts((prev) => [...prev, createEmergencyContactItem()]);
  };

  const removeEmergencyContactItem = (id: string) => {
    setEmergencyContacts((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const goNext = React.useCallback(() => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
    goToPosition(0);
  }, []);

  const goBack = React.useCallback(() => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
    goToPosition(0);
  }, []);

  const goToStep = React.useCallback((targetStep: Step) => {
    setStep(targetStep);
    goToPosition(0);
  }, []);

  const sanitizeEmergencyContacts = (items: EmergencyContactItem[]) => {
    return items
      .map((item) => ({
        id: item.id,
        name: item.name.trim(),
        phone: item.phone.trim().replace(/\D/g, ""),
        whatsapp: item.whatsapp.trim().replace(/\D/g, ""),
        relationship: item.relationship.trim(),
      }))
      .filter((item) => item.name || item.phone || item.whatsapp || item.relationship);
  };

  const handleSaveProfile = React.useCallback(async () => {
    if (saving) return;

    const normalizedFullName = fullName.trim();
    const normalizedPhone = phone.trim();
    const normalizedBirthDate = birthDate.trim();
    const normalizedProfession = profession.trim();

    if (!normalizedFullName || !normalizedPhone || !normalizedBirthDate) {
      setModalMessage("Preencha nome completo, telefone e data de nascimento.");
      setInfoModal(true);
      return;
    }

    if (!normalizedProfession) {
      setModalMessage("Preencha a profissão no step profissional.");
      setInfoModal(true);
      return;
    }

    try {
      if (!user?.id) {
        setModalMessage("Usuário não encontrado.");
        setInfoModal(true);
        return;
      }

      setSaving(true);

      const isoBirthDate = formatBirthDateToIso(normalizedBirthDate);
      const sanitizedEmergencyContacts = sanitizeEmergencyContacts(emergencyContacts);

      const profilePayload = {
        auth_user_id: user.id,
        role: user.role,
        email: email.trim().toLowerCase(),
        cpf: cpf.trim().replace(/\D/g, ""),
        rg: rg.trim(),
        phone: phone.trim().replace(/\D/g, ""),
        whatsapp: whatsapp.trim().replace(/\D/g, ""),
        birth_date: isoBirthDate,
        full_name: normalizedFullName,
        gender: gender.trim(),
        social_name: socialName.trim(),

        cep: cep.trim().replace(/\D/g, ""),
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: uf.trim(),

        profession: normalizedProfession,
        emergency_contacts: sanitizedEmergencyContacts,

        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(profilePayload, {
        onConflict: "auth_user_id",
      });

      if (error) {
        setModalMessage(error.message || "Não foi possível salvar os dados.");
        setInfoModal(true);
        return;
      }

      await updateUser(
        {
          firstName: normalizedFullName,
          lastName: "",
          phone: profilePayload.phone,
          whatsapp: profilePayload.whatsapp,
          rg: profilePayload.rg,
          birthDate: profilePayload.birth_date || "",
          gender: profilePayload.gender,
          socialName: profilePayload.social_name,
          cep: profilePayload.cep,
          street: profilePayload.street,
          number: profilePayload.number,
          complement: profilePayload.complement,
          neighborhood: profilePayload.neighborhood,
          city: profilePayload.city,
          state: profilePayload.state,
          profession: profilePayload.profession,
          emergencyContacts: sanitizedEmergencyContacts,
        } as any
      );

      setSaveModal(true);
    } catch (error: any) {
      setModalMessage(error?.message || "Não foi possível salvar os dados.");
      setInfoModal(true);
    } finally {
      setSaving(false);
    }
  }, [
    saving,
    fullName,
    phone,
    birthDate,
    profession,
    user,
    email,
    cpf,
    rg,
    whatsapp,
    gender,
    socialName,
    cep,
    street,
    number,
    complement,
    neighborhood,
    city,
    uf,
    emergencyContacts,
    updateUser,
  ]);

  const footerContent = React.useMemo(() => {
    if (step === 1) {
      return (
        <>
          <PrimaryButton
            title={saving ? "Salvando..." : "Salvar"}
            onPress={handleSaveProfile}
            variant="secondary"
            style={styles.footerBtnSmall}
          />

          <PrimaryButton
            title="Próximo >"
            onPress={goNext}
            style={styles.footerBtnSmall}
          />
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <PrimaryButton
            title="Voltar"
            onPress={goBack}
            variant="secondary"
            style={styles.footerBtnSmall}
          />

          <PrimaryButton
            title={saving ? "Salvando..." : "Salvar"}
            onPress={handleSaveProfile}
            variant="secondary"
            style={styles.footerBtnSmall}
          />

          <PrimaryButton
            title="Próximo >"
            onPress={goNext}
            style={styles.footerBtnSmall}
          />
        </>
      );
    }

    return (
      <>
        <PrimaryButton
          title="Voltar"
          onPress={goBack}
          variant="secondary"
          style={styles.footerBtnSmall}
        />

        <PrimaryButton
          title={saving ? "Salvando..." : "Salvar"}
          onPress={handleSaveProfile}
          style={styles.footerBtnSmall}
        />
      </>
    );
  }, [step, saving, handleSaveProfile, goBack, goNext]);

  return (
    <View style={styles.container}>
      <AppHeader title="Ficha cadastral" showBack />

      <View style={styles.stepsWrapper}>
        {[1, 2, 3].map((item) => {
          const current = item as Step;
          const active = step === current;

          return (
            <TouchableOpacity
              key={current}
              activeOpacity={0.85}
              onPress={() => goToStep(current)}
              style={[styles.stepItem, active && styles.stepItemActive]}
            >
              <Text style={[styles.stepItemText, active && styles.stepItemTextActive]}>
                {STEP_LABELS[current]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          removeClippedSubviews={false}
          contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados pessoais</Text>

              <AppInput
                label="Nome completo"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Digite seu nome completo"
                leftIcon="user"
                returnKeyType="next"
                onSubmitEditing={() => birthDateRef.current?.focus()}
                onFocus={() => goToPosition(120)}
              />

              <SimpleDropdown
                label="Sexo"
                placeholder="Selecionar sexo"
                value={gender}
                options={SEX_OPTIONS}
                onSelect={setGender}
              />

              {gender === "Outros" ? (
                <AppInput
                  label="Nome social"
                  value={socialName}
                  onChangeText={setSocialName}
                  placeholder="Digite o nome social"
                  leftIcon="edit-3"
                  returnKeyType="next"
                  onFocus={() => goToPosition(250)}
                />
              ) : null}

              <AppInput
                label="E-mail"
                value={email}
                onChangeText={() => {}}
                placeholder="Seu e-mail"
                leftIcon="mail"
                editable={false}
              />

              <AppInput
                ref={birthDateRef}
                label="Data de nascimento"
                value={birthDate}
                onChangeText={(value) => setBirthDate(formatBirthDateInput(value))}
                placeholder="DD/MM/AAAA"
                leftIcon="calendar"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => rgRef.current?.focus()}
                onFocus={() => goToPosition(360)}
              />

              <AppInput
                label="CPF"
                value={cpf}
                onChangeText={() => {}}
                placeholder="000.000.000-00"
                leftIcon="credit-card"
                editable={false}
              />

              <AppInput
                ref={rgRef}
                label="RG"
                value={rg}
                onChangeText={setRg}
                placeholder="Digite o RG"
                leftIcon="file-text"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                onFocus={() => goToPosition(500)}
              />

              <AppInput
                ref={phoneRef}
                label="Telefone"
                value={phone}
                onChangeText={(value) => setPhone(formatPhone(value))}
                placeholder="(00) 00000-0000"
                leftIcon="phone"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => whatsappRef.current?.focus()}
                onFocus={() => goToPosition(560)}
              />

              <AppInput
                ref={whatsappRef}
                label="WhatsApp"
                value={whatsapp}
                onChangeText={(value) => setWhatsapp(formatPhone(value))}
                placeholder="(00) 00000-0000"
                leftIcon="message-circle"
                keyboardType="phone-pad"
                returnKeyType="done"
                onFocus={() => goToPosition(620)}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Endereço</Text>

              <View style={[styles.row, styles.rowZIndexHigh]}>
                <View style={styles.colNeighborhood}>
                  <AppInput
                    label="Bairro"
                    value={neighborhood}
                    onChangeText={setNeighborhood}
                    placeholder="Nome do bairro"
                    leftIcon="map"
                    returnKeyType="next"
                    onFocus={() => goToPosition(120)}
                  />
                </View>

                <View style={styles.colCep}>
                  <AppInput
                    ref={cepRef}
                    label="CEP"
                    value={cep}
                    onChangeText={(value) => setCep(formatCEP(value))}
                    placeholder="00000-000"
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => streetRef.current?.focus()}
                    onFocus={() => goToPosition(120)}
                  />
                </View>
              </View>

              <AppInput
                ref={streetRef}
                label="Rua / Logradouro"
                value={street}
                onChangeText={setStreet}
                placeholder="Nome da rua"
                leftIcon="navigation"
                returnKeyType="next"
                onSubmitEditing={() => numberRef.current?.focus()}
                onFocus={() => goToPosition(220)}
              />

              <View style={[styles.row, styles.rowZIndexHigh]}>
                <View style={styles.colNumber}>
                  <AppInput
                    ref={numberRef}
                    label="Número"
                    value={number}
                    onChangeText={setNumber}
                    placeholder="123"
                    leftIcon="home"
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="next"
                    onSubmitEditing={() => complementRef.current?.focus()}
                    onFocus={() => goToPosition(300)}
                  />
                </View>

                <View style={styles.colComplement}>
                  <AppInput
                    ref={complementRef}
                    label="Complemento"
                    value={complement}
                    onChangeText={setComplement}
                    placeholder="Apto, bloco, etc."
                    leftIcon="layout"
                    returnKeyType="next"
                    onSubmitEditing={() => cityRef.current?.focus()}
                    onFocus={() => goToPosition(300)}
                  />
                </View>
              </View>

              <View style={[styles.row, styles.rowZIndexTop]}>
                <View style={styles.colCity}>
                  <AppInput
                    ref={cityRef}
                    label="Cidade"
                    value={city}
                    onChangeText={setCity}
                    placeholder="Nome da cidade"
                    leftIcon="map-pin"
                    returnKeyType="done"
                    onFocus={() => goToPosition(380)}
                  />
                </View>

                <View style={styles.colUf}>
                  <SimpleDropdown
                    label="UF"
                    placeholder="UF"
                    value={uf}
                    options={UF_OPTIONS}
                    onSelect={setUf}
                    compact
                  />
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados profissionais</Text>

              <AppInput
                ref={professionRef}
                label="Profissão"
                value={profession}
                onChangeText={setProfession}
                placeholder="Digite sua profissão"
                leftIcon="briefcase"
                returnKeyType="done"
                onFocus={() => goToPosition(120)}
              />

              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitleSmall}>Contato em caso de emergência</Text>

                {emergencyContacts.length < 3 ? (
                  <TouchableOpacity onPress={addEmergencyContactItem} activeOpacity={0.8}>
                    <Feather name="plus-circle" size={20} color={CLIENT_PRIMARY_DARK} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {emergencyContacts.map((item, index) => (
                <EmergencyContactItemComponent
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={updateEmergencyContactItem}
                  onRemove={
                    emergencyContacts.length > 1
                      ? () => removeEmergencyContactItem(item.id)
                      : undefined
                  }
                />
              ))}

              <View style={styles.noticeBoxStatic}>
                <Text style={styles.noticeTextStatic}>
                  Você pode indicar até 3 contatos de emergência para situações
                  importantes relacionadas ao atendimento.
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 0) }]}>
        <View style={styles.footerButtonsRow}>{footerContent}</View>
      </View>

      <CustomModal
        visible={infoModal}
        onClose={() => setInfoModal(false)}
        title="Erro ao salvar"
        message={modalMessage}
        icon={<Feather name="alert-circle" size={40} color="#ef4444" />}
      />

      <CustomModal
        visible={saveModal}
        onClose={() => setSaveModal(false)}
        title="Perfil salvo"
        message="Seus dados foram salvos com sucesso."
        icon={<Feather name="check-circle" size={40} color="#16a34a" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  stepsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    gap: 8,
  },

  stepItem: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: CLIENT_BORDER_LIGHT,
    backgroundColor: "#fff",
  },

  stepItemActive: {
    backgroundColor: CLIENT_PRIMARY,
    borderColor: CLIENT_PRIMARY,
  },

  stepItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },

  stepItemTextActive: {
    color: "#fff",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 14,
    overflow: "visible",
  },

  innerCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },

  sectionTitleSmall: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },

  innerCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 4,
  },

  dropdownWrap: {
    marginBottom: 12,
    zIndex: 10,
  },

  dropdownCompactWrap: {
    marginBottom: 12,
    zIndex: 10,
  },

  dropdownWrapOpen: {
    zIndex: 9999,
    elevation: 9999,
  },

  dropdownTrigger: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownTriggerCompact: {
    minHeight: 56,
  },

  dropdownTriggerOpen: {
    borderColor: CLIENT_PRIMARY,
  },

  dropdownTriggerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },

  dropdownPlaceholder: {
    color: "#94a3b8",
  },

  dropdownListBox: {
    marginTop: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
    overflow: "hidden",
    position: "absolute",
    top: 74,
    zIndex: 9999,
    elevation: 9999,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dropdownListScroll: {
    maxHeight: 220,
  },

  dropdownListItem: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },

  dropdownListItemActive: {
    backgroundColor: "#ecfdf5",
  },

  dropdownListItemLast: {
    borderBottomWidth: 0,
  },

  dropdownListItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  dropdownListItemTextActive: {
    color: CLIENT_PRIMARY_DARK,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  rowZIndexHigh: {
    zIndex: 20,
  },

  rowZIndexTop: {
    zIndex: 999,
  },

  colCep: {
    flex: 0.9,
  },

  colNeighborhood: {
    flex: 1.5,
  },

  colNumber: {
    flex: 0.7,
  },

  colComplement: {
    flex: 1.3,
  },

  colCity: {
    flex: 1.5,
  },

  colUf: {
    flex: 0.5,
    zIndex: 9999,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  noticeBoxStatic: {
    borderRadius: 16,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: CLIENT_BORDER_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },

  noticeTextStatic: {
    fontSize: 13,
    lineHeight: 18,
    color: CLIENT_PRIMARY_DARK,
    fontWeight: "600",
  },

  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    zIndex: 999,
    elevation: 20,
  },

  footerButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },

  footerBtnSmall: {
    flex: 1,
  },
});

const EmergencyContactItemComponent = React.memo(function ({
  item,
  index,
  onChange,
  onRemove,
}: any) {
  const handleNameChange = React.useCallback(
    (value: string) => {
      onChange(item.id, "name", value);
    },
    [item.id, onChange]
  );

  const handlePhoneChange = React.useCallback(
    (value: string) => {
      onChange(item.id, "phone", value);
    },
    [item.id, onChange]
  );

  const handleWhatsappChange = React.useCallback(
    (value: string) => {
      onChange(item.id, "whatsapp", value);
    },
    [item.id, onChange]
  );

  const handleRelationshipChange = React.useCallback(
    (value: string) => {
      onChange(item.id, "relationship", value);
    },
    [item.id, onChange]
  );

  return (
    <View style={styles.innerCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.innerCardTitle}>Contato {index + 1}</Text>

        {onRemove && (
          <TouchableOpacity onPress={onRemove} activeOpacity={0.8}>
            <Feather name="trash-2" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <AppInput
        label="Nome"
        value={item.name}
        onChangeText={handleNameChange}
        leftIcon="user"
      />

      <AppInput
        label="Telefone"
        value={item.phone}
        onChangeText={handlePhoneChange}
        leftIcon="phone"
        keyboardType="phone-pad"
      />

      <AppInput
        label="WhatsApp"
        value={item.whatsapp}
        onChangeText={handleWhatsappChange}
        leftIcon="message-circle"
        keyboardType="phone-pad"
      />

      <AppInput
        label="Parentesco / relação"
        value={item.relationship}
        onChangeText={handleRelationshipChange}
        leftIcon="users"
      />
    </View>
  );
});