export type ProfileBaseInput = {
  full_name?: string;
  phone?: string;
  whatsapp?: string;
  birth_date?: string;
  avatar?: string;
};

export type ProfileBaseResult = {
  isComplete: boolean;
  progress: number;
  missingFields: string[];
  nextStep: string | null;
};

const REQUIRED_FIELDS: (keyof ProfileBaseInput)[] = [
  "full_name",
  "phone",
  "birth_date",
];

export function resolveProfileBase(data: ProfileBaseInput): ProfileBaseResult {
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = data[field];

    if (typeof value === "string") {
      if (!value.trim()) {
        missingFields.push(field);
      }
      return;
    }

    if (!value) {
      missingFields.push(field);
    }
  });

  const total = REQUIRED_FIELDS.length;
  const filled = total - missingFields.length;
  const progress = Math.round((filled / total) * 100);

  return {
    isComplete: missingFields.length === 0,
    progress,
    missingFields,
    nextStep: missingFields.length > 0 ? "complete_basic_profile" : null,
  };
}