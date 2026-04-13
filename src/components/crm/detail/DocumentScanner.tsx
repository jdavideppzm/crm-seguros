import { useState, useRef } from "react";
import { Upload, ScanLine, FileText, CheckCircle2, Sparkles, X, RefreshCw, Copy, AlertCircle, User, Car, Shield, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead } from "@/types/crm";
import { toast } from "sonner";

interface DocumentScannerProps {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
}

interface ExtractedField {
  key: keyof Lead;
  label: string;
  value: string;
  confidence: number;
}

type ScanStatus = "idle" | "uploading" | "scanning" | "done" | "error";

// Simulated OCR extraction patterns per document type
const EXTRACTION_PROFILES = {
  cedula: {
    label: "Cédula de Ciudadanía",
    icon: User,
    color: "blue",
    fields: (lead: Lead): ExtractedField[] => [
      { key: "numeroIdentificacion", label: "Número CC", value: simulateId(), confidence: 97 },
      { key: "nombres", label: "Nombres", value: lead.propietario.split(" ")[0] || "CARLOS", confidence: 94 },
      { key: "apellidos", label: "Apellidos", value: lead.propietario.split(" ").slice(1).join(" ") || "MARTÍNEZ RUIZ", confidence: 91 },
      { key: "fechaNacimiento", label: "Fecha Nacimiento", value: "15/03/1985", confidence: 89 },
      { key: "sexo", label: "Sexo", value: "M", confidence: 99 },
    ],
  },
  tarjeta_propiedad: {
    label: "Tarjeta de Propiedad",
    icon: Car,
    color: "emerald",
    fields: (lead: Lead): ExtractedField[] => [
      { key: "placa", label: "Placa", value: lead.placa || simulatePlate(), confidence: 99 },
      { key: "marca", label: "Marca", value: lead.marca || "MAZDA", confidence: 96 },
      { key: "modelo", label: "Modelo", value: lead.modelo || "3 SEDAN 2.0L", confidence: 93 },
      { key: "referenciaVehiculo", label: "Referencia", value: "3 ADVANCE AT", confidence: 88 },
      { key: "colorVehiculo", label: "Color", value: lead.colorVehiculo || "BLANCO PERLA", confidence: 95 },
    ],
  },
  soat: {
    label: "SOAT",
    icon: Shield,
    color: "amber",
    fields: (lead: Lead): ExtractedField[] => [
      { key: "placa", label: "Placa Vehículo", value: lead.placa || simulatePlate(), confidence: 99 },
      { key: "expirationDate", label: "Vencimiento SOAT", value: simulateFutureDate(), confidence: 97 },
      { key: "insurance", label: "Aseguradora", value: lead.insurance || "EQUIDAD SEGUROS", confidence: 92 },
    ],
  },
  poliza: {
    label: "Póliza de Seguro",
    icon: FileText,
    color: "violet",
    fields: (lead: Lead): ExtractedField[] => [
      { key: "insurance", label: "Aseguradora", value: lead.insurance || "AXA COLPATRIA", confidence: 98 },
      { key: "expirationDate", label: "Vencimiento", value: simulateFutureDate(), confidence: 96 },
      { key: "valorPrima", label: "Valor Prima", value: String(simulatePrima()), confidence: 91 },
      { key: "tipPoliza", label: "Tipo Póliza", value: "TODO RIESGO", confidence: 94 },
      { key: "tipoSeguro", label: "Ramo", value: "AUTOMÓVILES", confidence: 99 },
    ],
  },
};

function simulateId() {
  return (Math.floor(Math.random() * 90000000) + 10000000).toString();
}
function simulatePlate() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return `${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${letters[Math.floor(Math.random() * 26)]}${Math.floor(100 + Math.random() * 900)}`;
}
function simulateFutureDate() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}
function simulatePrima() {
  return Math.floor((800000 + Math.random() * 2000000) / 1000) * 1000;
}

type ProfileKey = keyof typeof EXTRACTION_PROFILES;

export function DocumentScanner({ lead, onUpdateLead }: DocumentScannerProps) {
  const [selectedType, setSelectedType] = useState<ProfileKey | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedType) return;

    setFileName(file.name);
    runScan();
  };

  const runScan = () => {
    setStatus("uploading");
    setProgress(0);

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 40) { clearInterval(timer); setStatus("scanning"); runOcr(); }
        return p + 10;
      });
    }, 120);
  };

  const runOcr = () => {
    const timer2 = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer2);
          if (selectedType) {
            const profile = EXTRACTION_PROFILES[selectedType];
            const fields = profile.fields(lead);
            setExtractedFields(fields);
            setSelectedFields(new Set(fields.map(f => f.key)));
            setStatus("done");
          }
        }
        return Math.min(p + 8, 100);
      });
    }, 80);
  };

  const handleApply = () => {
    const updates: Partial<Lead> = {};
    const appliedFields: string[] = [];
    
    extractedFields.forEach(field => {
      if (selectedFields.has(field.key)) {
        const val = field.key === "valorPrima" || field.key === "monto"
          ? Number(field.value)
          : field.value;
        (updates as any)[field.key] = val;
        appliedFields.push(`${field.label}: ${field.value}`);
      }
    });

    // Generate scan summary for Activity Timeline
    const profile = selectedType ? EXTRACTION_PROFILES[selectedType] : { label: "Documento" };
    const summaryText = `✨ Escaneo de ${profile.label}\n${appliedFields.join("\n")}`;
    
    const newActivity = {
      id: crypto.randomUUID(),
      type: "scan_summary" as any,
      text: summaryText,
      author: "Sistema IA",
      createdAt: new Date().toLocaleString("es-CO"),
    };

    onUpdateLead({ 
      ...lead, 
      ...updates,
      activities: [newActivity, ...(lead.activities || [])]
    });

    toast.success(`${selectedFields.size} campos aplicados al lead`, { 
      description: "Los datos extraídos han sido guardados en la línea de tiempo." 
    });
    reset();
  };

  const reset = () => {
    setStatus("idle");
    setExtractedFields([]);
    setSelectedFields(new Set());
    setFileName("");
    setProgress(0);
    setSelectedType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleField = (key: string) => {
    setSelectedFields(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
          <ScanLine size={20} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Escáner de Documentos</h3>
          <p className="text-[10px] text-muted-foreground font-bold opacity-60 uppercase tracking-widest mt-0.5">
            Extracción automática de datos con IA
          </p>
        </div>
        <div className="ml-auto px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={9} />BETA
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Document Type Selection */}
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 opacity-60">
                1. Selecciona el tipo de documento
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(EXTRACTION_PROFILES) as [ProfileKey, typeof EXTRACTION_PROFILES[ProfileKey]][]).map(([key, profile]) => {
                  const Icon = profile.icon;
                  const isSelected = selectedType === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`p-3 rounded-2xl border text-left transition-all group ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-border/40 bg-muted/20 hover:border-border"
                      }`}
                    >
                      <Icon size={16} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                      <p className={`text-[11px] font-black mt-2 uppercase tracking-tighter ${isSelected ? "text-primary" : "text-foreground/70"}`}>
                        {profile.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 opacity-60">
                2. Sube una imagen del documento
              </p>
              <label
                className={`flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                  selectedType
                    ? "border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10"
                    : "border-border/30 bg-muted/10 opacity-40 pointer-events-none"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={!selectedType}
                />
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Upload size={20} className="text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-foreground">Subir imagen o PDF</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-medium">JPG, PNG o PDF · Máx 10MB</p>
                </div>
              </label>
            </div>
          </motion.div>
        )}

        {(status === "uploading" || status === "scanning") && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-6"
          >
            <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center relative overflow-hidden border border-violet-500/20">
              <ScanLine size={36} className="text-violet-500 animate-pulse" />
              <div
                className="absolute bottom-0 left-0 right-0 bg-violet-500/20"
                style={{ height: `${progress}%`, transition: "height 0.3s ease" }}
              />
            </div>
            <div className="text-center space-y-2 w-full max-w-xs">
              <p className="text-sm font-black text-foreground uppercase tracking-tight">
                {status === "uploading" ? "Subiendo documento..." : "Analizando con IA..."}
              </p>
              <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold">{progress}% completado</p>
            </div>

            {status === "scanning" && (
              <div className="text-[10px] text-muted-foreground font-mono bg-muted/30 px-4 py-2 rounded-xl border border-border/20 space-y-0.5 w-full max-w-xs">
                <p className="text-emerald-500">✓ Imagen recibida</p>
                <p className="text-emerald-500">✓ Preprocesando imagen...</p>
                <p className="animate-pulse text-violet-400">⟳ Extrayendo campos con OCR...</p>
              </div>
            )}
          </motion.div>
        )}

        {status === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <p className="text-sm font-black text-foreground uppercase tracking-tight">Extracción Completada</p>
              </div>
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="text-[10px] text-muted-foreground font-bold bg-muted/20 px-3 py-2 rounded-xl border border-border/20">
              📄 {fileName || "documento.jpg"} — {extractedFields.length} campos detectados
            </div>

            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
              Selecciona los campos a aplicar:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {extractedFields.map(field => {
                const isSelected = selectedFields.has(field.key);
                return (
                  <button
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-border/30 bg-muted/10 opacity-60"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/40"
                    }`}>
                      {isSelected && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">{field.label}</p>
                      <p className="text-sm font-black text-foreground truncate">{field.value}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      field.confidence >= 95 ? "bg-emerald-500/10 text-emerald-600" :
                      field.confidence >= 85 ? "bg-amber-500/10 text-amber-600" :
                      "bg-red-500/10 text-red-600"
                    }`}>
                      {field.confidence}%
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApply}
                disabled={selectedFields.size === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 active:scale-95"
              >
                <Copy size={14} />
                Aplicar {selectedFields.size} campos
              </button>
              <button
                onClick={reset}
                className="px-4 py-3 rounded-2xl border border-border/40 text-muted-foreground hover:bg-muted/40 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 gap-4">
            <AlertCircle size={32} className="text-destructive" />
            <p className="text-sm font-black text-foreground">Error en el escaneo</p>
            <button onClick={reset} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
              Reintentar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
