import { useState, useMemo } from "react";
import { 
  BarChart3, 
  Upload, 
  Search, 
  Landmark, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Settings2,
  Table as TableIcon,
  Filter,
  Download,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  MinusCircle
} from "lucide-react";
import type { Lead, CrmConfig } from "@/types/crm";
import { motion, AnimatePresence } from "framer-motion";
import { formatMonto } from "@/utils/crm";
import { toast } from "sonner";

interface CommissionViewProps {
  leads: Lead[];
  config: CrmConfig;
  onUpdateLead: (lead: Lead) => void;
}

interface ReconciliationItem {
  id: string;
  placa: string;
  client: string;
  crmCommission: number;
  fileCommission: number;
  diff: number;
  status: "match" | "discrepancy" | "not_found";
  originalLead?: Lead;
}

export function CommissionView({ leads, config, onUpdateLead }: CommissionViewProps) {
  const [step, setStep] = useState<"upload" | "mapping" | "reconcile">("upload");
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({
    idColumn: "",
    commissionColumn: "",
    premiumColumn: ""
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map(r => r.split(",").map(c => c.trim().replace(/\"/g, '')));
      if (rows.length < 2) {
        toast.error("El archivo parece estar vacío");
        return;
      }
      setHeaders(rows[0]);
      setFileData(rows.slice(1).filter(r => r.length > 1));
      setStep("mapping");
    };
    reader.readAsText(file);
  };

  const wonLeads = useMemo(() => {
    return leads.filter(l => l.state === config.pipelineStages.find(s => s.finalType === "ganado")?.key);
  }, [leads, config.pipelineStages]);

  const reconciliationResults = useMemo(() => {
    if (step !== "reconcile") return [];
    
    const idIdx = headers.indexOf(mapping.idColumn);
    const commIdx = headers.indexOf(mapping.commissionColumn);
    
    return fileData.map((row, idx) => {
      const placaStr = row[idIdx]?.toUpperCase() || "";
      const fileComm = parseFloat(row[commIdx]?.replace(/\$|\.|\,/g, '') || "0");
      
      const lead = wonLeads.find(l => l.placa?.toUpperCase() === placaStr || l.numeroIdentificacion === placaStr);
      
      if (!lead) {
        return {
          id: `row-${idx}`,
          placa: placaStr,
          client: "No encontrado",
          crmCommission: 0,
          fileCommission: fileComm,
          diff: -fileComm,
          status: "not_found"
        } as ReconciliationItem;
      }

      const crmComm = lead.comisionCalculada || 0;
      const diff = fileComm - crmComm;
      const status = Math.abs(diff) < 100 ? "match" : "discrepancy";

      return {
        id: lead.id,
        placa: lead.placa,
        client: lead.propietario,
        crmCommission: crmComm,
        fileCommission: fileComm,
        diff,
        status,
        originalLead: lead
      } as ReconciliationItem;
    });
  }, [step, fileData, headers, mapping, wonLeads]);

  const stats = useMemo(() => {
    return {
      total: reconciliationResults.length,
      matches: reconciliationResults.filter(r => r.status === "match").length,
      discrepancies: reconciliationResults.filter(r => r.status === "discrepancy").length,
      notFound: reconciliationResults.filter(r => r.status === "not_found").length
    };
  }, [reconciliationResults]);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background/50 backdrop-blur-3xl animate-in fade-in duration-700 p-6 lg:p-10 space-y-10 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Conciliación de Comisiones</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
            Audita las liquidaciones de las aseguradoras contra tus registros internos para asegurar que cada peso sea pagado.
          </p>
        </div>

        {step !== "upload" && (
           <button 
             onClick={() => setStep("upload")}
             className="px-6 py-2.5 bg-muted rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all"
           >
             Cargar otro archivo
           </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto py-20"
          >
            <label className="group relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/60 hover:border-primary/40 rounded-[40px] bg-card/20 backdrop-blur-xl transition-all cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div className="p-6 rounded-3xl bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                 <Upload size={32} />
              </div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Subir Liquidación</h3>
              <p className="text-sm text-muted-foreground text-center font-medium opacity-60">Sube el archivo CSV o Excel exportado de la aseguradora para iniciar la auditoría.</p>
              <div className="mt-8 px-6 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">Seleccionar Archivo</div>
            </label>
          </motion.div>
        )}

        {step === "mapping" && (
          <motion.div 
            key="mapping"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl mx-auto bg-card/30 backdrop-blur-2xl border border-border/40 rounded-[40px] p-10 shadow-2xl space-y-10"
          >
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                   <Settings2 size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Mapeador de Inteligencia</h3>
                   <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Asigna las columnas del archivo</p>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6">
                <MappingSelect 
                  label="Identificador (Placa o Póliza)" 
                  options={headers} 
                  value={mapping.idColumn} 
                  onChange={v => setMapping(p => ({...p, idColumn: v}))}
                />
                <MappingSelect 
                  label="Comisión Pagada" 
                  options={headers} 
                  value={mapping.commissionColumn} 
                  onChange={v => setMapping(p => ({...p, commissionColumn: v}))}
                />
                <MappingSelect 
                  label="Prima Total (Opcional)" 
                  options={headers} 
                  value={mapping.premiumColumn} 
                  onChange={v => setMapping(p => ({...p, premiumColumn: v}))}
                />
             </div>

             <button 
               onClick={() => {
                 if (!mapping.idColumn || !mapping.commissionColumn) {
                   toast.error("Por favor asigna al menos la columna de ID y Comisión");
                   return;
                 }
                 setStep("reconcile");
               }}
               className="w-full py-4 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                Ejecutar Auditoría <ChevronRight size={18} />
             </button>
          </motion.div>
        )}

        {step === "reconcile" && (
           <motion.div 
             key="reconcile"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="space-y-8"
           >
              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <AuditKPI label="Registros" value={stats.total.toString()} icon={<TableIcon size={18} />} color="primary" />
                 <AuditKPI label="Conciliados" value={stats.matches.toString()} icon={<CheckCircle2 size={18} />} color="emerald" />
                 <AuditKPI label="Discrepancias" value={stats.discrepancies.toString()} icon={<AlertTriangle size={18} />} color="amber" />
                 <AuditKPI label="No Encontrados" value={stats.notFound.toString()} icon={<XCircle size={18} />} color="red" />
              </div>

              {/* Results Table */}
              <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[40px] overflow-hidden shadow-2xl">
                 <div className="p-8 border-b border-border/40 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Resultados de Comparación</h3>
                    <div className="flex gap-2">
                       <button className="px-4 py-2 rounded-xl bg-muted/40 text-[10px] font-black uppercase tracking-widest border border-border/40 hover:bg-muted transition-all">Exportar PDF</button>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-muted/10">
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identificador</th>
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cliente</th>
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Previsto CRM</th>
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pagado (Aseg)</th>
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Diferencia</th>
                             <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Acciones</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-border/20">
                          {reconciliationResults.map(item => (
                             <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                         item.status === 'match' ? 'bg-emerald-500/10 text-emerald-500' :
                                         item.status === 'discrepancy' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                                      }`}>
                                         {item.status === 'match' ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                                      </div>
                                      <span className="font-black text-[13px] text-foreground uppercase tracking-tighter">{item.placa}</span>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase">{item.client}</td>
                                <td className="px-8 py-5 text-sm font-black text-foreground">{formatMonto(item.crmCommission)}</td>
                                <td className={`px-8 py-5 text-sm font-black ${item.status === 'discrepancy' ? 'text-amber-500' : 'text-foreground'}`}>
                                   {formatMonto(item.fileCommission)}
                                </td>
                                <td className={`px-8 py-5 text-sm font-black ${item.diff < 0 ? 'text-red-500' : item.diff > 0 ? 'text-emerald-500' : 'text-emerald-500'}`}>
                                   {item.diff === 0 ? "SIN DIFERENCIA" : (item.diff > 0 ? "+" : "") + formatMonto(item.diff)}
                                </td>
                                <td className="px-8 py-5 text-right">
                                   <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {item.status !== 'match' && item.originalLead && (
                                         <button 
                                           onClick={() => {
                                             onUpdateLead({ ...item.originalLead!, comisionCalculada: item.fileCommission, paymentStatus: "PAGADO" });
                                             toast.success(`Corregido y marcado como pagado: ${item.placa}`);
                                           }}
                                           className="p-2 rounded-xl bg-primary text-white hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                           title="Corregir y Marcar Pagado"
                                         >
                                            <RefreshCw size={14} />
                                         </button>
                                      )}
                                      <button className="p-2 rounded-xl bg-muted/40 hover:bg-muted transition-all">
                                         <MoreVertical size={14} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MappingSelect({ label, options, value, onChange }: any) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 ml-2">{label}</label>
       <select 
         value={value} 
         onChange={e => onChange(e.target.value)}
         className="w-full bg-muted/30 border border-border/40 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
       >
          <option value="">Selecciona columna...</option>
          {options.map((h: string) => (
             <option key={h} value={h}>{h}</option>
          ))}
       </select>
    </div>
  );
}

function AuditKPI({ label, value, icon, color }: any) {
  const colors: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
  };
  return (
    <div className={`p-6 rounded-[32px] border ${colors[color]} bg-card/40 backdrop-blur-xl shadow-xl flex flex-col justify-between`}>
       <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-white/10">{icon}</div>
       </div>
       <div className="mt-6">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
          <p className="text-2xl font-black tabular-nums tracking-tighter">{value}</p>
       </div>
    </div>
  );
}
