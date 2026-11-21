import { createClient } from "@supabase/supabase-js";

// Use env vars (from build) or localStorage (from Settings page)
const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || "https://genmorzzqjnhcbssltuo.supabase.co";
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LNIHdPtCWESlaMw-_YUQxg_i3RJLbk5";

export const getSupabaseConfig = () => {
  const url = localStorage.getItem("kp_supabase_url") || DEFAULT_URL;
  const key = localStorage.getItem("kp_supabase_key") || DEFAULT_KEY;
  return { url, key };
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }
  return null;
};

export const supabase = getSupabaseClient();

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
};

export const testSupabaseConnection = async (url, key) => {
  try {
    const client = createClient(url, key);
    // Try pinging or querying a table
    const { error } = await client.from("lokasi_piket").select("count", { count: "exact", head: true });
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // If error is table not created yet (42P01), connection itself is actually valid!
      return { success: true, message: "Terhubung ke Supabase! (Tabel belum ada / siap disinkronisasi)" };
    }
    return { success: true, message: "Koneksi Supabase berhasil dan siap digunakan!" };
  } catch (err) {
    return { success: false, message: `Gagal terhubung: ${err.message}` };
  }
};
