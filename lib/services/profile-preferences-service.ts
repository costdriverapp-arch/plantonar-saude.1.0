import { supabase } from "../supabase";
import {
  ProfilePreferencesInput,
  ProfilePreferencesPayload,
  buildProfilePreferencesPayload,
  resolveProfilePreferencesFromProfile,
} from "../profile/profile-preferences-engine";

export type SaveProfilePreferencesInput = {
  authUserId: string;
  preferences: ProfilePreferencesInput;
};

export async function loadProfilePreferences(authUserId: string) {
  if (!authUserId?.trim()) {
    throw new Error("Usuário inválido para carregar preferências.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      receive_only_my_state,
      receive_only_shift_jobs,
      receive_only_fixed_jobs,
      restrictions,
      other_restrictions
    `)
    .eq("auth_user_id", authUserId)
    .single();

  if (error) {
    throw new Error(error.message || "Erro ao carregar preferências.");
  }

  return resolveProfilePreferencesFromProfile(data);
}

export async function saveProfilePreferences({
  authUserId,
  preferences,
}: SaveProfilePreferencesInput): Promise<ProfilePreferencesPayload> {
  if (!authUserId?.trim()) {
    throw new Error("Usuário inválido para salvar preferências.");
  }

  const payload = buildProfilePreferencesPayload(preferences);

  const { error } = await supabase
    .from("profiles")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", authUserId);

  if (error) {
    throw new Error(error.message || "Erro ao salvar preferências.");
  }

  return payload;
}