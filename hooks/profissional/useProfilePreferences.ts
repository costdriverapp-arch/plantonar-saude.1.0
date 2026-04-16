import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  loadProfilePreferences,
  saveProfilePreferences,
} from "@/lib/services/profile-preferences-service";
import {
  ProfilePreferencesInput,
} from "@/lib/profile/profile-preferences-engine";

const DEFAULT_RESTRICTIONS = [
  { id: "1", label: "Não realizo serviços domésticos", checked: false },
  { id: "2", label: "Não realizo trabalho de cozinheiro(a)", checked: false },
  { id: "3", label: "Não realizo trabalho de babá", checked: false },
  { id: "4", label: "Não realizo banho no leito", checked: false },
  { id: "5", label: "Não realizo troca de fraldas", checked: false },
  { id: "6", label: "Não acompanho paciente em consultas externas", checked: false },
  { id: "7", label: "Não durmo no local", checked: false },
  { id: "8", label: "Não aceito deslocamento para outras cidades", checked: false },
];

export function useProfilePreferences() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] = useState<ProfilePreferencesInput>({
    receiveOnlyMyState: false,
    receiveOnlyShiftJobs: false,
    receiveOnlyFixedJobs: false,
    restrictions: DEFAULT_RESTRICTIONS,
    otherRestrictions: [],
  });

  async function load() {
    try {
      if (!user?.id) return;

      const data = await loadProfilePreferences(user.id);

      setPreferences(data);
    } catch (error) {
      console.log("LOAD PREFERENCES ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      if (!user?.id) return;

      await saveProfilePreferences({
        authUserId: user.id,
        preferences,
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error?.message };
    }
  }

  function toggleRestriction(id: string) {
    setPreferences((prev) => ({
      ...prev,
      restrictions: prev.restrictions.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  }

  function setReceiveOnlyMyState(value: boolean) {
    setPreferences((prev) => ({
      ...prev,
      receiveOnlyMyState: value,
    }));
  }

  function setReceiveOnlyShiftJobs(value: boolean) {
    setPreferences((prev) => ({
      ...prev,
      receiveOnlyShiftJobs: value,
      receiveOnlyFixedJobs: value ? false : prev.receiveOnlyFixedJobs,
    }));
  }

  function setReceiveOnlyFixedJobs(value: boolean) {
    setPreferences((prev) => ({
      ...prev,
      receiveOnlyFixedJobs: value,
      receiveOnlyShiftJobs: value ? false : prev.receiveOnlyShiftJobs,
    }));
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  return {
    loading,
    preferences,
    setReceiveOnlyMyState,
    setReceiveOnlyShiftJobs,
    setReceiveOnlyFixedJobs,
    toggleRestriction,
    save,
  };
}