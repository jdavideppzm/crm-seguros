import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envMap = {};
try {
  const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)="(.*)"$/);
    if (match) envMap[match[1]] = match[2];
  });
} catch (e) {
  console.error("No se pudo leer .env", e);
}

const url = envMap['VITE_SUPABASE_URL'];
const key = envMap['VITE_SUPABASE_PUBLISHABLE_KEY'];

if (!url || !key) {
  console.error("Faltan credenciales URL o KEY");
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
