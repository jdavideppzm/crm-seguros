import { useState } from "react";
import { FileText, Upload, Check, ChevronDown, Trash2, Download, CheckCircle2 } from "lucide-react";
import type { Lead, ClientType, LeadDocument, Activity } from "@/types/crm";
import { CLIENT_TYPE_LABELS, REQUIRED_DOCS, COTIZACION_LABELS, INSPECCION_LABEL } from "@/types/crm";

interface DocumentsViewProps {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
}

export function DocumentsView({ lead, onUpdateLead }: DocumentsViewProps) {
  const [clientType, setClientType] = useState<ClientType>(lead.clientType || "natural");
  const [typeOpen, setTypeOpen] = useState(false);

  const documents = lead.documents || [];

  const handleTypeChange = (type: ClientType) => {
    setClientType(type); setTypeOpen(false);
    onUpdateLead({ ...lead, clientType: type });
  };

  const handleUpload = (label: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const isCotizacion = COTIZACION_LABELS.includes(label);
      let aseguradora: string | undefined;

      if (isCotizacion) {
        aseguradora = prompt("Nombre de la aseguradora para esta cotización:") || undefined;
      }

      const newDoc: LeadDocument = {
        id: Date.now().toString(),
        label,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toLocaleString("es-CO"),
        uploadedBy: "Usuario",
        aseguradora,
      };

      const updatedDocs = [...documents.filter((d) => d.label !== label), newDoc];

      // --- Auto-activity for cotizaciones ---
      const currentActivities: Activity[] = [...(lead.activities || [])];

      if (isCotizacion) {
        const fmt = (n: number) =>
          new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

        const lines = [
          `📥 Cotización recibida — ${aseguradora || label}`,
          `━━━━━━━━━━━━━━━━━━━━━━━━`,
          // Insured person
          `👤 Asegurado: ${lead.propietario}`,
          lead.tipoIdentificacion && lead.numeroIdentificacion
            ? `   ID: ${lead.tipoIdentificacion} ${lead.numeroIdentificacion}`
            : null,
          lead.fechaNacimiento ? `   Nacimiento: ${lead.fechaNacimiento}` : null,
          // Vehicle
          lead.placa ? `🚗 Placa: ${lead.placa}` : null,
          (lead.marca || lead.referenciaVehiculo)
            ? `   Vehículo: ${[lead.marca, lead.referenciaVehiculo, lead.modelo].filter(Boolean).join(" ")}`
            : null,
          lead.colorVehiculo ? `   Color: ${lead.colorVehiculo}` : null,
          lead.tipoServicio ? `   Servicio: ${lead.tipoServicio}` : null,
          lead.lugar ? `   Ciudad: ${lead.lugar}` : null,
          // Amounts
          lead.monto ? `💰 Valor asegurado: ${fmt(lead.monto)}` : null,
          lead.valorPrima ? `   Prima estimada: ${fmt(lead.valorPrima)}` : null,
          // Policy
          lead.tipPoliza ? `🛡 Tipo póliza: ${lead.tipPoliza}` : null,
          lead.tipoSeguro ? `   Ramo: ${lead.tipoSeguro}` : null,
          ``,
          `📄 Archivo: ${file.name}`,
          `🏢 Aseguradora: ${aseguradora || "Por confirmar"}`,
          `🕐 Subido: ${new Date().toLocaleString("es-CO")}`,
        ].filter((l) => l !== null).join("\n");

        currentActivities.unshift({
          id: Date.now().toString() + "_cotz",
          type: "doc_summary",
          text: lines,
          author: "Sistema",
          createdAt: new Date().toLocaleString("es-CO"),
        });
      }

      onUpdateLead({ ...lead, documents: updatedDocs, activities: currentActivities });
    };
    input.click();
  };

  const handleRemove = (label: string) => {
    const updatedDocs = documents.filter((d) => d.label !== label);
    const updates: Partial<Lead> = { documents: updatedDocs };
    if (lead.selectedCotizacion === label) updates.selectedCotizacion = undefined;
    onUpdateLead({ ...lead, ...updates });
  };

  const handleSelectCotizacion = (label: string) => {
    const doc = documents.find((d) => d.label === label);
    if (!doc) return;
    const isAlreadySelected = lead.selectedCotizacion === label;
    const newSelection = isAlreadySelected ? undefined : label;
    const newActivities: Activity[] = [...(lead.activities || [])];

    if (!isAlreadySelected) {
      // Add selection activity
      newActivities.unshift({
        id: Date.now().toString(),
        type: "doc_selected",
        text: `Cotización seleccionada: ${doc.aseguradora || label} (${doc.fileName})`,
        author: "Usuario",
        createdAt: new Date().toLocaleString("es-CO"),
      });

      // Add document summary activity with extracted info
      const summaryLines = [
        `📋 Resumen de cotización — ${doc.aseguradora || label}`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `👤 La persona asegurada:`,
        `• Nombre: ${lead.propietario}`,
        lead.tipoIdentificacion ? `• Identificación: ${lead.tipoIdentificacion} ${lead.numeroIdentificacion || ""}` : null,
        lead.fechaNacimiento ? `• Fecha nacimiento: ${lead.fechaNacimiento}` : null,
        lead.sexo ? `• Género: ${lead.sexo}` : null,
        ``,
        `🚗 El vehículo asegurado:`,
        lead.lugar ? `• Ciudad circulación: ${lead.lugar}` : null,
        lead.placa ? `• Placa: ${lead.placa}` : null,
        lead.marca ? `• Marca: ${lead.marca}` : null,
        lead.referenciaVehiculo ? `• Referencia: ${lead.referenciaVehiculo}` : null,
        lead.modelo ? `• Modelo: ${lead.modelo}` : null,
        lead.fasecolda ? `• Código Fasecolda: ${lead.fasecolda}` : null,
        lead.clase ? `• Clase: ${lead.clase}` : null,
        lead.tipoServicio ? `• Servicio: ${lead.tipoServicio}` : null,
        lead.colorVehiculo ? `• Color: ${lead.colorVehiculo}` : null,
        `• Valor asegurado: ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(lead.monto)}`,
        ``,
        `🛡 Aseguradora: ${doc.aseguradora || "No especificada"}`,
        `📄 Documento: ${doc.fileName}`,
      ].filter(Boolean).join("\n");

      newActivities.unshift({
        id: (Date.now() + 1).toString(),
        type: "doc_summary",
        text: summaryLines,
        author: "Sistema",
        createdAt: new Date().toLocaleString("es-CO"),
      });
    }

    const updates: Partial<Lead> = { selectedCotizacion: newSelection, activities: newActivities };
    if (!isAlreadySelected && doc.aseguradora) updates.insurance = doc.aseguradora;
    onUpdateLead({ ...lead, ...updates });
  };

  const handleDownload = (doc: LeadDocument) => {
    if (!doc.fileUrl) return;
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName || "documento.pdf";
    a.click();
  };

  const requiredDocs = REQUIRED_DOCS[clientType];
  const allDocLabels = [...requiredDocs, ...COTIZACION_LABELS, INSPECCION_LABEL];
  const uploadedCount = allDocLabels.filter((l) => documents.find(d => d.label === l)).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Tipo de cliente</label>
        <div className="relative">
          <button onClick={() => setTypeOpen(!typeOpen)} className="w-full flex items-center justify-between text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
            <span className="font-medium text-foreground">{CLIENT_TYPE_LABELS[clientType]}</span>
            <ChevronDown size={13} className={`text-muted-foreground transition-transform ${typeOpen ? "rotate-180" : ""}`} />
          </button>
          {typeOpen && (
            <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((type) => (
                <button key={type} onClick={() => handleTypeChange(type)} className={`w-full text-left text-xs px-3 py-2 hover:bg-muted transition-colors ${clientType === type ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}>
                  {CLIENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(uploadedCount / allDocLabels.length) * 100}%` }} />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">{uploadedCount}/{allDocLabels.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <DocSection title={`Documentos ${CLIENT_TYPE_LABELS[clientType]}`} labels={requiredDocs} documents={documents} onUpload={handleUpload} onRemove={handleRemove} onDownload={handleDownload} />

        <div>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cotizaciones de pólizas</h4>
          <div className="space-y-1.5">
            {COTIZACION_LABELS.map((label) => {
              const doc = documents.find((d) => d.label === label);
              const isSelected = lead.selectedCotizacion === label;
              return (
                <CotizacionRow key={label} label={label} doc={doc} isSelected={isSelected}
                  onUpload={() => handleUpload(label)} onRemove={() => handleRemove(label)}
                  onDownload={() => doc && handleDownload(doc)} onSelect={() => handleSelectCotizacion(label)} />
              );
            })}
          </div>
        </div>

        <DocSection title="Inspección" labels={[INSPECCION_LABEL]} documents={documents} onUpload={handleUpload} onRemove={handleRemove} onDownload={handleDownload} />
      </div>
    </div>
  );
}

function DocSection({ title, labels, documents, onUpload, onRemove, onDownload }: { title: string; labels: string[]; documents: LeadDocument[]; onUpload: (l: string) => void; onRemove: (l: string) => void; onDownload: (d: LeadDocument) => void }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">
        {labels.map((label) => {
          const doc = documents.find((d) => d.label === label);
          return <DocRow key={label} label={label} doc={doc} onUpload={() => onUpload(label)} onRemove={() => onRemove(label)} onDownload={() => doc && onDownload(doc)} />;
        })}
      </div>
    </div>
  );
}

function DocRow({ label, doc, onUpload, onRemove, onDownload }: { label: string; doc?: LeadDocument; onUpload: () => void; onRemove: () => void; onDownload: () => void }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${doc ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"}`}>
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${doc ? "bg-primary/10" : "bg-muted"}`}>
        {doc ? <Check size={12} className="text-primary" /> : <FileText size={12} className="text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground truncate">{label}</p>
        {doc && <p className="text-[10px] text-muted-foreground truncate">📄 {doc.fileName} · {doc.uploadedAt}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {doc ? (
          <>
            <button onClick={onDownload} className="p-1 rounded hover:bg-muted transition-colors" title="Descargar PDF"><Download size={12} className="text-muted-foreground" /></button>
            <button onClick={onRemove} className="p-1 rounded hover:bg-destructive/10 transition-colors" title="Eliminar"><Trash2 size={12} className="text-destructive" /></button>
          </>
        ) : (
          <button onClick={onUpload} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"><Upload size={10} />Subir PDF</button>
        )}
      </div>
    </div>
  );
}

function CotizacionRow({ label, doc, isSelected, onUpload, onRemove, onDownload, onSelect }: { label: string; doc?: LeadDocument; isSelected: boolean; onUpload: () => void; onRemove: () => void; onDownload: () => void; onSelect: () => void }) {
  return (
    <div className={`rounded-lg border transition-colors ${isSelected ? "border-status-lograr/40 bg-status-lograr/5" : doc ? "border-primary/20 bg-primary/5" : "border-border bg-muted/30 hover:bg-muted/50"}`}>
      <div className="flex items-center gap-2.5 px-3 py-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isSelected ? "bg-status-lograr/15" : doc ? "bg-primary/10" : "bg-muted"}`}>
          {isSelected ? <CheckCircle2 size={12} className="text-status-lograr" /> : doc ? <Check size={12} className="text-primary" /> : <FileText size={12} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground truncate">{label}</p>
          {doc && (
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground truncate">📄 {doc.fileName}</p>
              {doc.aseguradora && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isSelected ? "bg-status-lograr/15 text-status-lograr" : "bg-muted text-muted-foreground"}`}>
                  🛡 {doc.aseguradora}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {doc ? (
            <>
              <button onClick={onSelect} className={`p-1.5 rounded-md transition-colors text-[10px] font-bold ${isSelected ? "bg-status-lograr/15 text-status-lograr" : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"}`} title={isSelected ? "Deseleccionar" : "Elegir"}>
                {isSelected ? "✓ Elegida" : "Elegir"}
              </button>
              <button onClick={onDownload} className="p-1 rounded hover:bg-muted transition-colors"><Download size={12} className="text-muted-foreground" /></button>
              <button onClick={onRemove} className="p-1 rounded hover:bg-destructive/10 transition-colors"><Trash2 size={12} className="text-destructive" /></button>
            </>
          ) : (
            <button onClick={onUpload} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"><Upload size={10} />Subir PDF</button>
          )}
        </div>
      </div>
      {isSelected && (
        <div className="px-3 pb-2 pt-0">
          <p className="text-[10px] font-medium text-status-lograr">✅ Cotización elegida — info extraída al historial de actividades</p>
        </div>
      )}
    </div>
  );
}
