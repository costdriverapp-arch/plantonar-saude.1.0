import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ggosddngopzcxrcvhtns.supabase.co";
const supabaseAnonKey = "sb_publishable_yBbTgIvyY-xKPikbbBmfsg_h2zwG17z";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function testarSupabaseMinimo() {
  try {
    console.log("TESTE SUPABASE: iniciando");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("TESTE SUPABASE SESSION:", session?.user?.id || null);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    console.log("TESTE SUPABASE DATA:", data);
    console.log("TESTE SUPABASE ERROR:", error);

    return { data, error };
  } catch (err) {
    console.log("TESTE SUPABASE CATCH:", err);
    return { data: null, error: err };
  }
}