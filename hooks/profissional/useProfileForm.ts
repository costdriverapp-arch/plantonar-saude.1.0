import { useMemo } from "react";
import { resolveProfileBase } from "@/lib/profile/profile-engine";

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

type Input = {
  fullName: string;
  gender: string;
  socialName: string;
  birthDate: string;
  cpf: string;
  rg: string;
  phone: string;
  whatsapp: string;
  email: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  uf: string;
  profession: string;
  otherProfession: string;
  experience: string;
  criminalRecordStatus: string;
  allowContactReferences: boolean;
  educationItems: EducationItem[];
  references: ReferenceItem[];
};

export function useProfileForm(data: Input) {
  const formBase = useMemo(
    () => ({
      full_name: data.fullName,
      gender: data.gender,
      social_name: data.socialName,
      birth_date: data.birthDate,
      cpf: data.cpf,
      rg: data.rg,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
    }),
    [
      data.fullName,
      data.gender,
      data.socialName,
      data.birthDate,
      data.cpf,
      data.rg,
      data.phone,
      data.whatsapp,
      data.email,
    ]
  );

  const addressData = useMemo(
    () => ({
      cep: data.cep,
      street: data.street,
      number: data.number,
      complement: data.complement,
      neighborhood: data.neighborhood,
      city: data.city,
      uf: data.uf,
    }),
    [
      data.cep,
      data.street,
      data.number,
      data.complement,
      data.neighborhood,
      data.city,
      data.uf,
    ]
  );

  const professionalData = useMemo(
    () => ({
      profession: data.profession,
      otherProfession: data.otherProfession,
      experience: data.experience,
      criminalRecordStatus: data.criminalRecordStatus,
      allowContactReferences: data.allowContactReferences,
      references: data.references,
    }),
    [
      data.profession,
      data.otherProfession,
      data.experience,
      data.criminalRecordStatus,
      data.allowContactReferences,
      data.references,
    ]
  );

  const payload = useMemo(
    () => ({
      ...formBase,
      address: addressData,
      education: data.educationItems,
      professional: professionalData,
    }),
    [formBase, addressData, data.educationItems, professionalData]
  );

  const profileBase = useMemo(() => {
    return resolveProfileBase(formBase);
  }, [formBase]);

  return {
    payload,
    profileBase,
  };
}