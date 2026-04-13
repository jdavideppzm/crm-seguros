import { Lead, CrmConfig, CrmAlert, ChatMessage } from "@/types/crm";

interface BackupData {
  version: string;
  timestamp: string;
  leads: Lead[];
  config: CrmConfig;
  alerts: CrmAlert[];
  chatMessages: ChatMessage[];
}

/**
 * Deriva una clave criptográfica a partir de un PIN/Password
 */
async function deriveKey(pin: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Exporta los datos a un archivo .compass-backup
 */
export async function exportBackup(data: Omit<BackupData, "version" | "timestamp">, pin?: string) {
  const fullData: BackupData = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    ...data,
  };

  const jsonString = JSON.stringify(fullData);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonString);

  let finalBlob: Blob;

  if (pin) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pin, salt);
    
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv } as any,
      key,
      encodedData
    );

    // El archivo final contiene: SALT(16) + IV(12) + DATA
    const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);
    
    finalBlob = new Blob([combined], { type: "application/octet-stream" });
  } else {
    finalBlob = new Blob([jsonString], { type: "application/json" });
  }

  const url = URL.createObjectURL(finalBlob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `respaldo_crm_${dateStr}${pin ? '_protegido' : ''}.compass-backup`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Importa los datos desde un archivo de respaldo
 */
export async function importBackup(file: File, pin?: string): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as ArrayBuffer;
        
        if (pin) {
          const uint8 = new Uint8Array(content);
          const salt = uint8.slice(0, 16);
          const iv = uint8.slice(16, 28);
          const data = uint8.slice(28);
          
          const key = await deriveKey(pin, salt);
          const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv } as any,
            key,
            data
          );
          
          const dec = new TextDecoder();
          const json = dec.decode(decrypted);
          resolve(JSON.parse(json));
        } else {
          const dec = new TextDecoder();
          const json = dec.decode(content);
          resolve(JSON.parse(json));
        }
      } catch (err) {
        console.error("Error al descifrar o procesar el archivo:", err);
        reject(new Error(pin ? "PIN incorrecto o archivo corrupto." : "Archivo inválido."));
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsArrayBuffer(file);
  });
}
