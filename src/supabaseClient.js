import { createClient } from '@supabase/supabase-js';

// Default Supabase configuration from environment or localStorage
const getStoredConfig = () => {
  const url = localStorage.getItem('kp_supabase_url') || import.meta.env.VITE_SUPABASE_URL || '';
  const key = localStorage.getItem('kp_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url, key };
};

export const getSupabaseClient = () => {
  const { url, key } = getStoredConfig();
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (e) {
      console.warn('Gagal menginisialisasi Supabase client:', e);
      return null;
    }
  }
  return null;
};

export const testSupabaseConnection = async (url, key) => {
  try {
    const client = createClient(url, key);
    const { data, error } = await client.from('lokasi_piket').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase berhasil!' };
  } catch (err) {
    return { success: false, message: err.message || 'Koneksi gagal diperiksa.' };
  }
};
