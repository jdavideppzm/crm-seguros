import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Faltan credenciales URL o KEY. Asegurate de que Bun cargue el .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function test() {
  console.log("Probando conexión a public.leads...");
  const { data, error } = await supabase.from('leads').select('*').limit(1);
  console.log("Resultado de Leads:");
  if (error) {
    console.error(error);
  } else {
    console.log("Tabla Leads leida correctamente. Datos:", data);
  }
}

test();
