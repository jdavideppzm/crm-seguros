import { useState } from "react";
import { FileText, Upload, Check, ChevronDown, Trash2, Eye } from "lucide-react";
import type { Lead, ClientType, LeadDocument } from "@/types/crm";
import {
  CLIENT_TYPE_LABELS,
  REQUIRED_DOCS,
  COTIZACION_LABELS,
  INSPECCION_LABEL,
} from "@/types/crm";

interface DocumentsViewProps {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
}

export function DocumentsView({ lead, onUpdateLead }: DocumentsViewProps) {
  const [clientType, setClientType] = useState<ClientType>(lead.clientType || "natural");
  const [typeOpen, setTypeOpen] = useState(false);

  const documents = lead.documents || [];

  const handleTypeChange = (type: ClientType) => {
    setClientType(type);
    setTypeOpen(false);
    onUpdateLead({ ...lead, clientType: type });
  };

  const getDocStatus = (label: string): LeadDocument | undefined => {
    return documents.find((d) => d.label === label);
  };

  const handleUpload = (label: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const newDoc: LeadDocument = {
        id: Date.now().toString(),
        label,
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        uploadedAt: new Date().toLocaleString("es-CO"),
        uploadedBy: "Usuario",
      };

      const updatedDocs = [...documents.filter((d) => d.label !== label), newDoc];
      onUpdateLead({ ...lead, documents: updatedDocs });
    };
    input.click();
  };

  const handleRemove = (label: string) => {
    const updatedDocs = documents.filter((d) => d.label !== label);
    onUpdateLead({ ...lead, documents: updatedDocs });
  };

  const requiredDocs = REQUIRED_DOCS[clientType];
  const allDocLabels = [...requiredDocs, ...COTIZACION_LABELS, INSPECCION_LABEL];
  const uploadedCount = allDocLabels.filter((l) => getDocStatus(l)).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Client type selector */}
      <div className="px-4 py-3 border-b border-border">
        <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
          Tipo de cliente
        </label>
        <div className="relative">
          <button
            onClick={() => setTypeOpen(!typeOpen)}
            className="w-full flex items-center justify-between text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <span className="font-medium text-foreground">{CLIENT_TYPE_LABELS[clientType]}</span>
            <ChevronDown size={13} className={`text-muted-foreground transition-transform ${typeOpen ? "rotate-180" : ""}`} />
          </button>
          {typeOpen && (
            <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {(Object.keys(CLIENT_TYPE_LABELS) as ClientType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`w-full text-left text-xs px-3 py-2 hover:bg-muted transition-colors ${
                    clientType === type ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  {CLIENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(uploadedCount / allDocLabels.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">
            {uploadedCount}/{allDocLabels.length}
          </span>
        </div>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Required docs by client type */}
        <DocSection
          title={`Documentos ${CLIENT_TYPE_LABELS[clientType]}`}
          labels={requiredDocs}
          documents={documents}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        {/* Cotizaciones */}
        <DocSection
          title="Cotizaciones de pólizas"
          labels={COTIZACION_LABELS}
          documents={documents}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />

        {/* Inspección */}
        <DocSection
          title="Inspección"
          labels={[INSPECCION_LABEL]}
          documents={documents}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}

function DocSection({
  title,
  labels,
  documents,
  onUpload,
  onRemove,
}: {
  title: string;
  labels: string[];
  documents: LeadDocument[];
  onUpload: (label: string) => void;
  onRemove: (label: string) => void;
}) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">
        {labels.map((label) => {
          const doc = documents.find((d) => d.label === label);
          return (
            <DocRow
              key={label}
              label={label}
              doc={doc}
              onUpload={() => onUpload(label)}
              onRemove={() => onRemove(label)}
            />
          );
        })}
      </div>
    </div>
  );
}

function DocRow({
  label,
  doc,
  onUpload,
  onRemove,
}: {
  label: string;
  doc?: LeadDocument;
  onUpload: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors ${
        doc
          ? "border-primary/20 bg-primary/5"
          : "border-border bg-muted/30 hover:bg-muted/50"
      }`}
    >
      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
        doc ? "bg-primary/10" : "bg-muted"
      }`}>
        {doc ? (
          <Check size={12} className="text-primary" />
        ) : (
          <FileText size={12} className="text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground truncate">{label}</p>
        {doc && (
          <p className="text-[10px] text-muted-foreground truncate">
            {doc.fileName} · {doc.uploadedAt}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {doc ? (
          <>
            {doc.fileUrl && (
              <button
                onClick={() => window.open(doc.fileUrl, "_blank")}
                className="p-1 rounded hover:bg-muted transition-colors"
                title="Ver documento"
              >
                <Eye size={12} className="text-muted-foreground" />
              </button>
            )}
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-destructive/10 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={12} className="text-destructive" />
            </button>
          </>
        ) : (
          <button
            onClick={onUpload}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors"
          >
            <Upload size={10} />
            Subir
          </button>
        )}
      </div>
    </div>
  );
}
