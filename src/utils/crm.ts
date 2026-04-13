import { Lead } from "@/types/crm";

/**
 * Genera un enlace de WhatsApp con un mensaje preestablecido.
 */
export function getWhatsAppLink(lead: Lead) {
  const phone = lead.phone || lead.phones?.[0]?.value || "";
  if (!phone) return null;

  // Limpiar el número de teléfono para que solo tenga dígitos
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Agregar el prefijo de país si no lo tiene. 
  // Para Colombia (57) por defecto si no empieza por 57 y tiene 10 dígitos.
  let finalPhone = cleanPhone;
  if (cleanPhone.length === 10 && !cleanPhone.startsWith("57")) {
    finalPhone = `57${cleanPhone}`;
  }

  const message = `Hola ${lead.propietario}, te saludo de tu agencia de seguros. 👋 ¿Cómo vas con tu gestión de ${lead.insurance || "la póliza"} para tu vehículo ${lead.placa ? `placa ${lead.placa}` : ""}?`;
  
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Exporta un array de leads a formato CSV y descarga el archivo.
 */
export function exportLeadsToCSV(leads: Lead[], filename = "export_leads.csv") {
  if (!leads.length) return;

  const headers = [
    "ID", "Fecha", "Nombre", "Placa", "Aseguradora", "Teléfono", "Email", 
    "Estado", "Monto", "Valor Prima", "Ciudad", "Referencia"
  ];

  const rows = leads.map(l => [
    l.id,
    l.fecha,
    `"${l.propietario.replace(/"/g, '""')}"`,
    l.placa,
    l.insurance,
    l.phone,
    l.email,
    l.state,
    l.monto,
    l.valorPrima || 0,
    l.lugar,
    `"${(l.reference || "").replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
/**
 * Formatea un número como moneda colombiana (COP).
 */
export function formatMonto(monto?: number) {
  if (monto === undefined || monto === null) return "$ 0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(monto);
}
