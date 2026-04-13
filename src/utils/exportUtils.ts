import { Lead } from "@/types/crm";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { formatMonto } from "./crm";

/**
 * Exporta un array de leads a formato CSV.
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
 * Exporta un array de leads a formato Excel (.xlsx).
 */
export function exportLeadsToExcel(leads: Lead[], filename = "export_leads.xlsx") {
  if (!leads.length) return;

  const data = leads.map(l => ({
    "ID": l.id,
    "Fecha": l.fecha,
    "Nombre": l.propietario,
    "Placa": l.placa,
    "Aseguradora": l.insurance,
    "Teléfono": l.phone,
    "Email": l.email,
    "Estado": l.state,
    "Monto": l.monto,
    "Valor Prima": l.valorPrima,
    "Ciudad": l.lugar,
    "Referencia": l.reference
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  XLSX.writeFile(workbook, filename);
}

/**
 * Exporta un array de leads a formato PDF.
 */
export async function exportLeadsToPDF(leads: Lead[], companyName = "CRM Compass", logoUrl?: string) {
  if (!leads.length) return;

  const doc = new jsPDF();
  const title = `Reporte de Leads - ${companyName}`;
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total de registros: ${leads.length}`, 14, 35);

  const tableData = leads.map(l => [
    l.fecha?.split(' ')[0] || "",
    l.propietario,
    l.placa || "",
    l.insurance || "",
    l.state || "",
    formatMonto(l.valorPrima || 0)
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Fecha', 'Propietario', 'Placa', 'Aseguradora', 'Estado', 'Valor Prima']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillStyle: 'F', fillColor: [59, 130, 246] },
    styles: { fontSize: 8, cellPadding: 2 },
  });

  doc.save(`reporte_leads_${Date.now()}.pdf`);
}
