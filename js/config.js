/* =========================================================
   config.js · Conexión con Supabase (clave pública). Se carga el primero.
   ========================================================= */
/* =========================================================
   SISTEMA DE PEDIDOS INTELIGENTE - GASTROGNOMO
   ========================================================= */

const SUPABASE_URL = 'https://refrscscreylowmocfcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XiXjP4gjaQUXf84U6-5QZw_Dw-YhdSu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
