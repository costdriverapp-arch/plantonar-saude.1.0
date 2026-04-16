export type RestrictionItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type OtherRestrictionItem = {
  id: string;
  label: string;
};

export type ProfilePreferencesInput = {
  receiveOnlyMyState: boolean;
  receiveOnlyShiftJobs: boolean;
  receiveOnlyFixedJobs: boolean;
  restrictions: RestrictionItem[];
  otherRestrictions: OtherRestrictionItem[];
};

export type ProfilePreferencesPayload = {
  receive_only_my_state: boolean;
  receive_only_shift_jobs: boolean;
  receive_only_fixed_jobs: boolean;
  restrictions: RestrictionItem[];
  other_restrictions: OtherRestrictionItem[];
};

const DEFAULT_RESTRICTIONS: RestrictionItem[] = [
  { id: "1", label: "Não realizo serviços domésticos", checked: false },
  { id: "2", label: "Não realizo trabalho de cozinheiro(a)", checked: false },
  { id: "3", label: "Não realizo trabalho de babá", checked: false },
  { id: "4", label: "Não realizo banho no leito", checked: false },
  { id: "5", label: "Não realizo troca de fraldas", checked: false },
  { id: "6", label: "Não acompanho paciente em consultas externas", checked: false },
  { id: "7", label: "Não durmo no local", checked: false },
  { id: "8", label: "Não aceito deslocamento para outras cidades", checked: false },
];

export function toggleRestrictionItem(
  restrictions: RestrictionItem[],
  id: string
): RestrictionItem[] {
  return restrictions.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );
}

export function setReceiveOnlyShiftJobsValue(
  value: boolean,
  current: ProfilePreferencesInput
): ProfilePreferencesInput {
  if (value) {
    return {
      ...current,
      receiveOnlyShiftJobs: true,
      receiveOnlyFixedJobs: false,
    };
  }

  return {
    ...current,
    receiveOnlyShiftJobs: false,
  };
}

export function setReceiveOnlyFixedJobsValue(
  value: boolean,
  current: ProfilePreferencesInput
): ProfilePreferencesInput {
  if (value) {
    return {
      ...current,
      receiveOnlyFixedJobs: true,
      receiveOnlyShiftJobs: false,
    };
  }

  return {
    ...current,
    receiveOnlyFixedJobs: false,
  };
}

export function normalizeRestrictions(
  restrictions: RestrictionItem[]
): RestrictionItem[] {
  return restrictions.map((item) => ({
    id: String(item.id),
    label: item.label.trim(),
    checked: !!item.checked,
  }));
}

export function normalizeOtherRestrictions(
  restrictions: OtherRestrictionItem[]
): OtherRestrictionItem[] {
  return restrictions
    .map((item) => ({
      id: String(item.id),
      label: item.label.trim(),
    }))
    .filter((item) => item.label.length > 0);
}

export function hasCheckedOtherRestriction(
  restrictions: RestrictionItem[]
): boolean {
  return restrictions.some(
    (item) => item.label.trim().toLowerCase() === "outras" && item.checked
  );
}

export function setOtherRestrictionsEnabled(
  value: boolean,
  restrictions: RestrictionItem[],
  otherRestrictions: OtherRestrictionItem[]
): {
  restrictions: RestrictionItem[];
  otherRestrictions: OtherRestrictionItem[];
} {
  const updatedRestrictions = restrictions.map((item) => {
    if (item.label.trim().toLowerCase() === "outras") {
      return {
        ...item,
        checked: value,
      };
    }

    return item;
  });

  return {
    restrictions: updatedRestrictions,
    otherRestrictions: value ? otherRestrictions : [],
  };
}

export function createOtherRestrictionItem(): OtherRestrictionItem {
  return {
    id: String(Date.now() + Math.random()),
    label: "",
  };
}

export function addOtherRestrictionItem(
  otherRestrictions: OtherRestrictionItem[]
): OtherRestrictionItem[] {
  return [...otherRestrictions, createOtherRestrictionItem()];
}

export function updateOtherRestrictionItem(
  otherRestrictions: OtherRestrictionItem[],
  id: string,
  value: string
): OtherRestrictionItem[] {
  return otherRestrictions.map((item) =>
    item.id === id ? { ...item, label: value } : item
  );
}

export function removeOtherRestrictionItem(
  otherRestrictions: OtherRestrictionItem[],
  id: string
): OtherRestrictionItem[] {
  return otherRestrictions.filter((item) => item.id !== id);
}

export function buildProfilePreferencesPayload(
  input: ProfilePreferencesInput
): ProfilePreferencesPayload {
  const normalizedRestrictions = normalizeRestrictions(input.restrictions);
  const otherEnabled = hasCheckedOtherRestriction(normalizedRestrictions);

  const receiveOnlyShiftJobs =
    !!input.receiveOnlyShiftJobs && !input.receiveOnlyFixedJobs;

  const receiveOnlyFixedJobs =
    !!input.receiveOnlyFixedJobs && !input.receiveOnlyShiftJobs;

  return {
    receive_only_my_state: !!input.receiveOnlyMyState,
    receive_only_shift_jobs: receiveOnlyShiftJobs,
    receive_only_fixed_jobs: receiveOnlyFixedJobs,
    restrictions: normalizedRestrictions,
    other_restrictions: otherEnabled
      ? normalizeOtherRestrictions(input.otherRestrictions)
      : [],
  };
}

export function resolveProfilePreferencesFromProfile(profile: any) {
  const restrictionsFromDb = Array.isArray(profile?.restrictions)
    ? normalizeRestrictions(profile.restrictions)
    : [];

  const restrictions = DEFAULT_RESTRICTIONS.map((defaultItem) => {
    const found = restrictionsFromDb.find((r) => r.id === defaultItem.id);

    return found
      ? { ...defaultItem, checked: found.checked }
      : defaultItem;
  });

  const otherRestrictions = Array.isArray(profile?.other_restrictions)
    ? normalizeOtherRestrictions(profile.other_restrictions)
    : [];

  const shift = !!profile?.receive_only_shift_jobs;
  const fixed = !!profile?.receive_only_fixed_jobs;

  return {
    receiveOnlyMyState: !!profile?.receive_only_my_state,
    receiveOnlyShiftJobs: shift && !fixed,
    receiveOnlyFixedJobs: fixed && !shift,
    restrictions,
    otherRestrictions,
  };
}