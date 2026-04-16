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
import { useProfileForm } from "../../hooks/profissional/useProfileForm";

type Step = 1 | 2 | 3;

type EducationItem = {
  id: string;
  level: string;
  technicalCourseName: string;
  year: string;
  hasCertificate: boolean;
  graduationCourse: string;
  otherGraduationCourse: string;
  classRegistry: string;
};

type ReferenceItem = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
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
  2: "Escolaridade",
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

const EDUCATION_OPTIONS = [
  "Ensino médio completo",
  "Curso técnico",
  "Tecnólogo",
  "Superior incompleto",
  "Graduação",
  "Pós-graduação",
];

const HEALTH_COURSE_OPTIONS = [
  "Enfermagem",
  "Fisioterapia",
  "Psicologia",
  "Medicina",
  "Nutrição",
  "Farmácia",
  "Biomedicina",
  "Terapia Ocupacional",
  "Fonoaudiologia",
  "Serviço Social",
  "Outros",
];

const PROFESSION_OPTIONS = [
  "Acompanhante Hospitalar",
 "Acompanhante Domiciliar",
  "Enfermeiro(a)",
  "Técnico(a) em Enfermagem",
  "Auxiliar de Enfermagem",
  "Cuidador(a) de Idosos",
  "Fisioterapeuta",
  "Psicólogo(a)",
  "Nutricionista",
  "Farmacêutico(a)",
  "Fonoaudiólogo(a)",
  "Médico",
  "Outros",
];

const EXPERIENCE_OPTIONS = [
  "Sem experiência",
  "1 a 3 anos",
  "Mais de 5 anos",
];

function createEducationItem(): EducationItem {
  return {
    id: String(Date.now() + Math.random()),
    level: "",
    technicalCourseName: "",
    year: "",
    hasCertificate: false,
    graduationCourse: "",
    otherGraduationCourse: "",
    classRegistry: "",
  };
}

function createReferenceItem(): ReferenceItem {
  return {
    id: String(Date.now() + Math.random()),
    name: "",
    phone: "",
    whatsapp: "",
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
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  return value;
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

function formatSignedAt(value: Date) {
  const local = new Date(value);

  const day = String(local.getDate()).padStart(2, "0");
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const year = local.getFullYear();

  const hour = String(local.getHours()).padStart(2, "0");
  const minute = String(local.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} às ${hour}:${minute}`;
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

  return (
    <View style={compact ? styles.dropdownCompactWrap : styles.dropdownWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TouchableOpacity
        style={[
          styles.dropdownTrigger,
          compact && styles.dropdownTriggerCompact,
          open && styles.dropdownTriggerOpen,
        ]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.85}
      >
        <Text style={[styles.dropdownTriggerText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
      </TouchableOpacity>

      {open ? (
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
                    <Feather name="check" size={16} color="#1e40af" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

export default function ProfileForm() {
const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState<Step>(1);
  const [infoModal, setInfoModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("Não foi possível salvar os dados.");
  const [saving, setSaving] = useState(false);

console.log("ACCEPTED TERMS AT:", (user as any)?.acceptedTermsAt);

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

  const [educationItems, setEducationItems] = useState<EducationItem[]>(
    Array.isArray((user as any)?.education) && (user as any).education.length > 0
      ? (user as any).education
      : [createEducationItem()]
  );

  const [profession, setProfession] = useState((user as any)?.profession || "");
  const [otherProfession, setOtherProfession] = useState((user as any)?.otherProfession || "");
  const [experience, setExperience] = useState((user as any)?.experience || "");

  const [references, setReferences] = useState<ReferenceItem[]>(
  Array.isArray((user as any)?.references) && (user as any).references.length > 0
    ? (user as any).references.map((item: any) => ({
        ...item,
        phone: formatPhone(item.phone || ""),
        whatsapp: formatPhone(item.whatsapp || ""),
      }))
    : [createReferenceItem()]
);

  const [criminalRecordStatus, setCriminalRecordStatus] = useState(
    (user as any)?.criminalRecordStatus || ""
  );

  const allowContactReferences = true;
  const signedAt = useMemo(() => {
  const raw = (user as any)?.acceptedTermsAt;

  if (!raw) return "";

  const iso = String(raw).replace(" ", "T");

  return formatSignedAt(new Date(iso));
}, [(user as any)?.acceptedTermsAt]);

  const { payload, profileBase } = useProfileForm({
    fullName,
    gender,
    socialName,
    birthDate,
    cpf,
    rg,
    phone,
    whatsapp,
    email,
    cep,
    street,
    number,
    complement,
    neighborhood,
    city,
    uf,
    profession,
    otherProfession,
    experience,
    criminalRecordStatus,
    allowContactReferences,
    educationItems,
    references,
  });

  const emailRef = useRef<TextInput>(null);
  const birthDateRef = useRef<TextInput>(null);
  const rgRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const whatsappRef = useRef<TextInput>(null);
  const neighborhoodRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const streetRef = useRef<TextInput>(null);
  const numberRef = useRef<TextInput>(null);
  const complementRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const otherProfessionRef = useRef<TextInput>(null);

  const goToPosition = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  const updateField = (field: string, value: string) => {
    switch (field) {
      case "full_name":
        setFullName(value);
        break;
      case "gender":
        setGender(value);
        break;
      case "social_name":
        setSocialName(value);
        break;
      case "birth_date":
        setBirthDate(formatBirthDateInput(value));
        break;
      case "rg":
        setRg(value);
        break;
      case "phone":
        setPhone(formatPhone(value));
        break;
      case "whatsapp":
        setWhatsapp(formatPhone(value));
        break;
      case "neighborhood":
        setNeighborhood(value);
        break;
      case "cep":
        setCep(formatCEP(value));
        break;
      case "street":
        setStreet(value);
        break;
      case "number":
        setNumber(value);
        break;
      case "complement":
        setComplement(value);
        break;
      case "city":
        setCity(value);
        break;
      case "uf":
        setUf(value);
        break;
    }
  };

  const updateEducationItem = (
    id: string,
    key: keyof EducationItem,
    value: string | boolean
  ) => {
    setEducationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const addEducationItem = () => {
    setEducationItems((prev) => [...prev, createEducationItem()]);
  };

  const removeEducationItem = (id: string) => {
    setEducationItems((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const updateReferenceItem = (
    id: string,
    key: keyof ReferenceItem,
    value: string
  ) => {
    const nextValue =
      key === "phone" || key === "whatsapp" ? formatPhone(value) : value;

    setReferences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: nextValue } : item))
    );
  };

  const addReferenceItem = () => {
    setReferences((prev) => [...prev, createReferenceItem()]);
  };

  const removeReferenceItem = (id: string) => {
    setReferences((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const goNext = () => {
    setStep((prev) => (prev < 3 ? ((prev + 1) as Step) : prev));
    goToPosition(0);
  };

  const goBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev));
    goToPosition(0);
  };

  const goToStep = (targetStep: Step) => {
    setStep(targetStep);
    goToPosition(0);
  };

  const formatBirthDateToIso = (value: string) => {
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
  };

  const sanitizeEducationItems = (items: EducationItem[]) => {
    return items.map((item) => ({
      id: item.id,
      level: item.level.trim(),
      technicalCourseName: item.technicalCourseName.trim(),
      year: item.year.trim(),
      hasCertificate: item.hasCertificate,
      graduationCourse: item.graduationCourse.trim(),
      otherGraduationCourse: item.otherGraduationCourse.trim(),
      classRegistry: item.classRegistry.trim(),
    }));
  };

  const sanitizeReferenceItems = (items: ReferenceItem[]) => {
    return items.map((item) => ({
      id: item.id,
      name: item.name.trim(),
      phone: item.phone.trim().replace(/\D/g, ""),
      whatsapp: item.whatsapp.trim().replace(/\D/g, ""),
    }));
  };

  const handleSaveProfile = async () => {
    if (saving) return;

    const normalizedFullName = fullName.trim();
    const normalizedPhone = phone.trim();
    const normalizedBirthDate = birthDate.trim();

    if (!profileBase.isComplete || !normalizedFullName || !normalizedPhone || !normalizedBirthDate) {
      setModalMessage("Preencha nome completo, telefone e data de nascimento.");
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

      const profilePayload = {
        auth_user_id: user.id,
        role: user.role,
        email: payload.email.trim().toLowerCase(),
        cpf: payload.cpf.trim().replace(/\D/g, ""),
        rg: payload.rg.trim(),
        phone: payload.phone.trim().replace(/\D/g, ""),
        whatsapp: payload.whatsapp.trim().replace(/\D/g, ""),
        birth_date: isoBirthDate,
        full_name: payload.full_name.trim(),
        gender: payload.gender.trim(),
        social_name: payload.social_name.trim(),

        cep: payload.address.cep.trim().replace(/\D/g, ""),
        street: payload.address.street.trim(),
        number: payload.address.number.trim(),
        complement: payload.address.complement.trim(),
        neighborhood: payload.address.neighborhood.trim(),
        city: payload.address.city.trim(),
        state: payload.address.uf.trim(),

        profession: payload.professional.profession.trim(),
        other_profession: payload.professional.otherProfession.trim(),
        experience: payload.professional.experience.trim(),
        criminal_record_status: payload.professional.criminalRecordStatus.trim(),
        allow_contact_references: true,
        education: sanitizeEducationItems(payload.education),
        professional_references: sanitizeReferenceItems(payload.professional.references),

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

await updateUser(({
  firstName: profilePayload.full_name,
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
  otherProfession: profilePayload.other_profession,
  experience: profilePayload.experience,
  criminalRecordStatus: profilePayload.criminal_record_status,
  education: profilePayload.education,
  references: profilePayload.professional_references,
}) as any);

setSaveModal(true);
    } catch (error: any) {
      setModalMessage(error?.message || "Não foi possível salvar os dados.");
      setInfoModal(true);
    } finally {
      setSaving(false);
    }
  };

  const footerButtons = useMemo(() => {
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
  }, [goBack, goNext, saving, step]);

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
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 92 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados pessoais, endereço e contato</Text>

              <AppInput
                label="Nome completo"
                value={fullName}
                onChangeText={(value) => updateField("full_name", value)}
                placeholder="Digite seu nome completo"
                leftIcon="user"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
                onFocus={() => goToPosition(120)}
              />

              <SimpleDropdown
                label="Sexo"
                placeholder="Selecionar sexo"
                value={gender}
                options={SEX_OPTIONS}
                onSelect={(value) => updateField("gender", value)}
              />

              {gender === "Outros" ? (
                <AppInput
                  label="Nome social"
                  value={socialName}
                  onChangeText={(value) => updateField("social_name", value)}
                  placeholder="Digite o nome social"
                  leftIcon="edit-3"
                  returnKeyType="next"
                  onSubmitEditing={() => birthDateRef.current?.focus()}
                  onFocus={() => goToPosition(280)}
                />
              ) : null}

              <AppInput
                ref={emailRef}
                label="E-mail"
                value={email}
                onChangeText={() => {}}
                placeholder="Seu e-mail"
                leftIcon="mail"
                editable={false}
                returnKeyType="next"
                onSubmitEditing={() => birthDateRef.current?.focus()}
                onFocus={() => goToPosition(340)}
              />

              <AppInput
                ref={birthDateRef}
                label="Data de nascimento"
                value={birthDate}
                onChangeText={(value) => updateField("birth_date", value)}
                placeholder="DD/MM/AAAA"
                leftIcon="calendar"
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => rgRef.current?.focus()}
                onFocus={() => goToPosition(400)}
              />

              <AppInput
                label="CPF"
                value={cpf}
                onChangeText={() => {}}
                placeholder="000.000.000-00"
                leftIcon="credit-card"
                editable={false}
                returnKeyType="next"
                onSubmitEditing={() => rgRef.current?.focus()}
                onFocus={() => goToPosition(460)}
              />

              <AppInput
                ref={rgRef}
                label="RG"
                value={rg}
                onChangeText={(value) => updateField("rg", value)}
                placeholder="Digite o RG"
                leftIcon="file-text"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                onFocus={() => goToPosition(520)}
              />

              <AppInput
                ref={phoneRef}
                label="Telefone"
                value={phone}
                onChangeText={(value) => updateField("phone", value)}
                placeholder="(00) 00000-0000"
                leftIcon="phone"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => whatsappRef.current?.focus()}
                onFocus={() => goToPosition(580)}
              />

              <AppInput
                ref={whatsappRef}
                label="WhatsApp"
                value={whatsapp}
                onChangeText={(value) => updateField("whatsapp", value)}
                placeholder="(00) 00000-0000"
                leftIcon="message-circle"
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => neighborhoodRef.current?.focus()}
                onFocus={() => goToPosition(640)}
              />

              <View style={styles.row}>
                <View style={styles.colNeighborhood}>
                  <AppInput
                    ref={neighborhoodRef}
                    label="Bairro"
                    value={neighborhood}
                    onChangeText={(value) => updateField("neighborhood", value)}
                    placeholder="Nome do bairro"
                    leftIcon="map-pin"
                    returnKeyType="next"
                    onSubmitEditing={() => cepRef.current?.focus()}
                    onFocus={() => goToPosition(720)}
                  />
                </View>

                <View style={styles.colCep}>
                  <AppInput
                    ref={cepRef}
                    label="CEP"
                    value={cep}
                    onChangeText={(value) => updateField("cep", value)}
                    placeholder="00000-000"
                    keyboardType="number-pad"
                    returnKeyType="next"
                    onSubmitEditing={() => streetRef.current?.focus()}
                    onFocus={() => goToPosition(720)}
                  />
                </View>
              </View>

              <AppInput
                ref={streetRef}
                label="Rua / Logradouro"
                value={street}
                onChangeText={(value) => updateField("street", value)}
                placeholder="Nome da rua"
                leftIcon="map"
                returnKeyType="next"
                onSubmitEditing={() => numberRef.current?.focus()}
                onFocus={() => goToPosition(800)}
              />

              <View style={styles.row}>
                <View style={styles.colNumber}>
                  <AppInput
                    ref={numberRef}
                    label="Número"
                    value={number}
                    onChangeText={(value) => updateField("number", value)}
                    placeholder="123"
                    leftIcon="home"
                    keyboardType="numbers-and-punctuation"
                    returnKeyType="next"
                    onSubmitEditing={() => complementRef.current?.focus()}
                    onFocus={() => goToPosition(880)}
                  />
                </View>

                <View style={styles.colComplement}>
                  <AppInput
                    ref={complementRef}
                    label="Complemento"
                    value={complement}
                    onChangeText={(value) => updateField("complement", value)}
                    placeholder="Apto, bloco, etc."
                    leftIcon="layout"
                    returnKeyType="next"
                    onSubmitEditing={() => cityRef.current?.focus()}
                    onFocus={() => goToPosition(880)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.colCity}>
                  <AppInput
                    ref={cityRef}
                    label="Cidade"
                    value={city}
                    onChangeText={(value) => updateField("city", value)}
                    placeholder="Nome da cidade"
                    leftIcon="navigation"
                    returnKeyType="done"
                    onFocus={() => goToPosition(960)}
                  />
                </View>

                <View style={styles.colUf}>
                  <SimpleDropdown
                    label="UF"
                    placeholder="UF"
                    value={uf}
                    options={UF_OPTIONS}
                    onSelect={(value) => updateField("uf", value)}
                    compact
                  />
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Escolaridade</Text>
                <TouchableOpacity onPress={addEducationItem} activeOpacity={0.8}>
                  <Feather name="plus-circle" size={20} color="#1e40af" />
                </TouchableOpacity>
              </View>

              {educationItems.map((item, index) => {
                const showTechnicalFields =
                  item.level === "Curso técnico" || item.level === "Tecnólogo";

                const showHigherFields =
                  item.level === "Superior incompleto" ||
                  item.level === "Graduação" ||
                  item.level === "Pós-graduação";

                return (
                  <View key={item.id} style={styles.innerCard}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.innerCardTitle}>Formação {index + 1}</Text>
                      {educationItems.length > 1 ? (
                        <TouchableOpacity
                          onPress={() => removeEducationItem(item.id)}
                          activeOpacity={0.8}
                        >
                          <Feather name="trash-2" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <SimpleDropdown
                      label="Escolaridade"
                      placeholder="Selecionar escolaridade"
                      value={item.level}
                      options={EDUCATION_OPTIONS}
                      onSelect={(value) => updateEducationItem(item.id, "level", value)}
                    />

                    {showTechnicalFields ? (
                      <>
                        <AppInput
                          label="Nome do curso"
                          value={item.technicalCourseName}
                          onChangeText={(value) =>
                            updateEducationItem(item.id, "technicalCourseName", value)
                          }
                          placeholder="Digite o nome do curso"
                          leftIcon="book-open"
                        />

                        <View style={styles.row}>
                          <View style={styles.colYear}>
                            <AppInput
                              label="Ano"
                              value={item.year}
                              onChangeText={(value) =>
                                updateEducationItem(
                                  item.id,
                                  "year",
                                  value.replace(/\D/g, "").slice(0, 4)
                                )
                              }
                              placeholder="Ex: 2022"
                              leftIcon="calendar"
                              keyboardType="number-pad"
                            />
                          </View>

                          <View style={styles.colCertificateInfo}>
                            <View style={styles.infoBoxSmall}>
                              <Text style={styles.infoBoxSmallText}>
                                Certificado informado no cadastro da formação.
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ) : null}

                    {showHigherFields ? (
                      <>
                        <SimpleDropdown
                          label="Curso / Graduação"
                          placeholder="Selecionar curso"
                          value={item.graduationCourse}
                          options={HEALTH_COURSE_OPTIONS}
                          onSelect={(value) =>
                            updateEducationItem(item.id, "graduationCourse", value)
                          }
                        />

                        {item.graduationCourse === "Outros" ? (
                          <AppInput
                            label="Nome do curso / graduação"
                            value={item.otherGraduationCourse}
                            onChangeText={(value) =>
                              updateEducationItem(item.id, "otherGraduationCourse", value)
                            }
                            placeholder="Digite o nome do curso"
                            leftIcon="edit-3"
                          />
                        ) : null}

                        <AppInput
                          label="Registro de classe"
                          value={item.classRegistry}
                          onChangeText={(value) =>
                            updateEducationItem(item.id, "classRegistry", value)
                          }
                          placeholder="Digite o registro"
                          leftIcon="shield"
                        />
                      </>
                    ) : null}
                  </View>
                );
              })}

              <View style={styles.attestationHeader}>
                <Text style={styles.sectionTitleSmall}>Atestado de antecedentes</Text>
                <TouchableOpacity onPress={() => setInfoModal(true)} activeOpacity={0.8}>
                  <Feather name="info" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <SimpleDropdown
                label="Status"
                placeholder="Selecionar status"
                value={criminalRecordStatus}
                options={["Positivo", "Negativo"]}
                onSelect={setCriminalRecordStatus}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dados profissionais</Text>

              <SimpleDropdown
                label="Profissão"
                placeholder="Selecionar profissão"
                value={profession}
                options={PROFESSION_OPTIONS}
                onSelect={setProfession}
              />

              {profession === "Outros" ? (
                <AppInput
                  ref={otherProfessionRef}
                  label="Outra profissão"
                  value={otherProfession}
                  onChangeText={setOtherProfession}
                  placeholder="Digite a profissão"
                  leftIcon="briefcase"
                  returnKeyType="done"
                />
              ) : null}

              <SimpleDropdown
                label="Experiência na área da saúde"
                placeholder="Selecionar experiência"
                value={experience}
                options={EXPERIENCE_OPTIONS}
                onSelect={setExperience}
              />

              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitleSmall}>Referências</Text>
                <TouchableOpacity onPress={addReferenceItem} activeOpacity={0.8}>
                  <Feather name="plus-circle" size={20} color="#1e40af" />
                </TouchableOpacity>
              </View>

              {references.map((item, index) => (
                <View key={item.id} style={styles.innerCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.innerCardTitle}>Referência {index + 1}</Text>
                    {references.length > 1 ? (
                      <TouchableOpacity
                        onPress={() => removeReferenceItem(item.id)}
                        activeOpacity={0.8}
                      >
                        <Feather name="trash-2" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <AppInput
                    label="Nome"
                    value={item.name}
                    onChangeText={(value) => updateReferenceItem(item.id, "name", value)}
                    placeholder="Nome da referência"
                    leftIcon="user"
                  />

                  <AppInput
                    label="Telefone"
                    value={item.phone}
                    onChangeText={(value) => updateReferenceItem(item.id, "phone", value)}
                    placeholder="(00) 00000-0000"
                    leftIcon="phone"
                    keyboardType="phone-pad"
                  />

                  <AppInput
                    label="WhatsApp"
                    value={item.whatsapp}
                    onChangeText={(value) => updateReferenceItem(item.id, "whatsapp", value)}
                    placeholder="(00) 00000-0000"
                    leftIcon="message-circle"
                    keyboardType="phone-pad"
                  />
                </View>
              ))}

              <View style={styles.noticeBoxStatic}>
                <Text style={styles.noticeTextStatic}>
                  Autorizo a Plantonar Saúde a entrar em contato com minhas referências
                  conforme termo e política de uso.
                </Text>
                <Text style={styles.noticeSignedText}>
  Assinado: {signedAt || "--"}
</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footerBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <View style={styles.footerButtonsRow}>{footerButtons}</View>
        </View>
      </KeyboardAvoidingView>

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
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
  },

  stepItemActive: {
    backgroundColor: "#1e40af",
    borderColor: "#1e40af",
  },

  stepItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
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
  },

  dropdownCompactWrap: {
    marginBottom: 12,
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
    borderColor: "#1e40af",
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
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    overflow: "hidden",
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
    backgroundColor: "#eff6ff",
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
    color: "#1e40af",
  },

  row: {
    flexDirection: "row",
    gap: 12,
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
},

  colYear: {
    flex: 0.8,
  },

  colCertificateInfo: {
    flex: 1.2,
    justifyContent: "flex-end",
    paddingBottom: 6,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  attestationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },

  noticeBoxStatic: {
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },

  noticeTextStatic: {
    fontSize: 13,
    lineHeight: 18,
    color: "#1e3a8a",
    fontWeight: "600",
  },

  noticeSignedText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "700",
  },

  infoBoxSmall: {
    minHeight: 56,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },

  infoBoxSmallText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#1e3a8a",
    fontWeight: "600",
  },

  footerBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },

  footerButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },

  footerBtnSmall: {
    flex: 1,
  },
});