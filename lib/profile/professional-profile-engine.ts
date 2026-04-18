export type ProfessionalProfileInput = {
  profession?: string;
  experience?: string;
  service_city?: string;
  service_state?: string;
  professional_register?: string;
};

export type ProfessionalProfileResult = {
  canApplyJobs: boolean;
  progress: number;
  missingFields: string[];
  nextStep: string | null;
};

const REQUIRED_FIELDS: (keyof ProfessionalProfileInput)[] = [
  "profession",
  "experience",
  "service_city",
];

export function resolveProfessionalProfile(
  data: ProfessionalProfileInput
): ProfessionalProfileResult {
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    if (!data[field]) {
      missingFields.push(field);
    }
  });

  const total = REQUIRED_FIELDS.length;
  const filled = total - missingFields.length;

  const progress = Math.round((filled / total) * 100);

  return {
    canApplyJobs: missingFields.length === 0,
    progress,
    missingFields,
    nextStep:
      missingFields.length > 0 ? "complete_professional_data" : null,
  };
}