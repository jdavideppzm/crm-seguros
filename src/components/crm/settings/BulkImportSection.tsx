import React, { useState } from "react";
import { Download, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";
import { useCrmStore } from "@/store/crmStore";

interface BulkImportSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

export function BulkImportSection({ config, updateConfig }: BulkImportSectionProps) {
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(0);
  const addLead = useCrmStore(state => state.createLead);

  const TEMPLATE_HEADERS = [
    'Nombre Propietario', 'Placa / Referencia', 'Aseguradora', 'Tipo de Seguro',
    'Teléfono', 'Email', 'Ciudad', 'Estado Pipeline', 'Monto', 'Responsable', 'Fecha Vencimiento', 'Notas'
  ];

  const downloadTemplate = async () => {
    const { utils, writeFile } = await import('xlsx');
    const ws = utils.aoa_to_sheet([TEMPLATE_HEADERS, [
      'Juan Pérez', 'ABC123', 'Sura', 'Autos', '+57 300 0000000',
      'cliente@email.com', 'Bogotá', 'nuevo', '1500000', 'Ana López',
      '2026-12-31', 'Cliente referido'
    ]]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Leads');
    writeFile(wb, 'plantilla_importacion_leads.xlsx');
    toast.success('Plantilla descargada correctamente');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { read, utils } = await import('xlsx');
    const buffer = await file.arrayBuffer();
    const wb = read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = utils.sheet_to_json(ws, { header: 1 });
    const [header, ...data] = rows;
    const parsed = data.filter(r => r[0]).map(r => ({
      propietario: r[0] || '',
      placa: r[1] || '',
      insurance: r[2] || '',
      tipoSeguro: r[3] || '',
      phone: r[4] || '',
      email: r[5] || '',
      lugar: r[6] || '',
      state: r[7] || 'nuevo',
      monto: parseFloat(String(r[8] || '0').replace(/[^0-9.]/g, '')) || 0,
      assignedTo: r[9] || '',
      expirationDate: r[10] || '',
      remark: r[11] || '',
    }));
    setPreview(parsed);
    toast.success(`${parsed.length} registros encontrados. Revisa el preview antes de importar.`);
  };

  const handleImport = async () => {
    setImporting(true);
    setDone(0);
    try {
      for (let i = 0; i < preview.length; i++) {
        const row = preview[i];
        const lead = {
          id: Date.now().toString() + i + Math.random().toString(36).substr(2, 5),
          fecha: new Date().toLocaleDateString('es-CO'),
          reference: row.placa,
          followUp: '',
          notes: [],
          activities: [],
          documents: [],
          opportunities: [],
          tasks: [],
          ...row,
        };
        await addLead(lead);
        setDone(i + 1);
      }
      toast.success(`✅ ${preview.length} leads importados correctamente`);
      setPreview([]);
    } catch (error) {
      toast.error("Error durante la importación masiva");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Importación Masiva de Leads" description="Carga múltiples clientes desde un archivo Excel o CSV con nuestra plantilla oficial." />

      <ConfigCard title="Paso 1 — Descargar Plantilla" description="Descarga la plantilla oficial en formato Excel con todos los campos necesarios.">
        <div className="flex items-center gap-4">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Download size={16} /> Descargar Plantilla Excel
          </button>
          <div>
            <p className="text-xs font-bold text-foreground mb-0.5">plantilla_importacion_leads.xlsx</p>
            <p className="text-[10px] text-muted-foreground">{TEMPLATE_HEADERS.length} columnas · Incluye ejemplo de datos</p>
          </div>
        </div>
      </ConfigCard>

      <ConfigCard title="Paso 2 — Subir Archivo" description="Sube tu archivo completado. Soporta .xlsx, .xls y .csv">
        <label className="flex flex-col items-center justify-center w-full py-10 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
            <Upload size={28} />
          </div>
          <p className="text-sm font-bold text-foreground mb-1">Arrastra tu archivo aquí o haz clic para seleccionar</p>
          <p className="text-[10px] text-muted-foreground">Soporta .xlsx, .xls, .csv · Máximo 5000 filas</p>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
        </label>
      </ConfigCard>

      {preview.length > 0 && (
        <ConfigCard title={`Paso 3 — Confirmar Importación (${preview.length} registros)`} description="Revisa los datos antes de crear los leads en el sistema.">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-[10px]">
              <thead className="bg-muted/50">
                <tr>{['Propietario','Placa','Aseguradora','Estado','Monto','Ciudad'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-black uppercase text-muted-foreground tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-2 font-medium">{row.propietario}</td>
                    <td className="px-3 py-2 font-mono">{row.placa}</td>
                    <td className="px-3 py-2">{row.insurance}</td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">{row.state}</span></td>
                    <td className="px-3 py-2 font-mono">{Number(row.monto).toLocaleString('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0})}</td>
                    <td className="px-3 py-2">{row.lugar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="text-[10px] text-muted-foreground text-center py-2 border-t border-border">... y {preview.length - 10} registros más</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {importing ? `Importando ${done}/${preview.length}...` : `✅ Importar ${preview.length} Leads`}
            </button>
            <button onClick={() => setPreview([])} className="px-4 py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-all">
              Cancelar
            </button>
          </div>
        </ConfigCard>
      )}
    </div>
  );
}
