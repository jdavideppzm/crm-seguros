import { useState } from "react";
import {
  ChevronDown, ChevronRight, Plus, X, Lightbulb, Car, Heart,
  GraduationCap, Home, Activity, Briefcase, HelpCircle, ExternalLink,
} from "lucide-react";
import type { Lead, Opportunity, OpportunityType, OpportunityStatus } from "@/types/crm";
import {
  OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS, OPPORTUNITY_TYPE_FIELDS, USERS,
} from "@/types/crm";

const TYPE_ICONS: Record<OpportunityType, typeof Car> = {
  vehiculo: Car,
  vida: Heart,
  educacion: GraduationCap,
  hogar: Home,
  salud: Activity,
  empresarial: Briefcase,
  otro: HelpCircle,
};

const STATUS_COLORS: Record<OpportunityStatus, string> = {
  nueva: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  en_progreso: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  ganada: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  perdida: "bg-red-500/15 text-red-700 dark:text-red-400",
  reactivar: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};

interface Props {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
  onCreateLeadFromOpportunity?: (parentLead: Lead, opportunity: Opportunity) => void;
}

export function OpportunitiesSection({ lead, onUpdateLead, onCreateLeadFromOpportunity }: Props) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<Opportunity> & { typeFields?: Record<string, string> }>({ type: "vehiculo", status: "nueva", typeFields: {} });

  const opportunities = lead.opportunities || [];
  const currentTypeFields = OPPORTUNITY_TYPE_FIELDS[(form.type || "vehiculo") as OpportunityType] || [];

  const handleAdd = () => {
    if (!form.type || !form.description?.trim()) return;
    const opp: Opportunity = {
      id: Date.now().toString(),
      type: form.type as OpportunityType,
      status: (form.status || "nueva") as OpportunityStatus,
      description: form.description.trim(),
      placa: form.typeFields?.placa?.trim() || form.placa?.trim() || undefined,
      url: form.url?.trim() || undefined,
      monto: form.monto || undefined,
      aseguradora: form.aseguradora?.trim() || undefined,
      createdAt: new Date().toLocaleString("es-CO"),
      createdBy: "Usuario",
      typeFields: form.typeFields,
    };

    const updatedOpportunities = [...opportunities, opp];
    
    // Add activity
    const newActivities = [
      {
        id: Date.now().toString() + "_opp",
        type: "note" as const,
        text: `Nueva oportunidad: ${OPPORTUNITY_TYPE_LABELS[opp.type]} — ${opp.description}`,
        author: "Usuario",
        createdAt: new Date().toLocaleString("es-CO"),
      },
      ...(lead.activities || []),
    ];

    onUpdateLead({ ...lead, opportunities: updatedOpportunities, activities: newActivities });

    // Create linked lead
    if (onCreateLeadFromOpportunity) {
      onCreateLeadFromOpportunity(lead, opp);
    }

    setForm({ type: "vehiculo", status: "nueva", typeFields: {} });
    setAdding(false);
  };

  const handleStatusChange = (id: string, status: OpportunityStatus) => {
    const updated = opportunities.map((o) => (o.id === id ? { ...o, status } : o));
    onUpdateLead({ ...lead, opportunities: updated });
  };

  const handleRemove = (id: string) => {
    onUpdateLead({ ...lead, opportunities: opportunities.filter((o) => o.id !== id) });
  };

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <Lightbulb size={13} />
        OPORTUNIDADES
        <span className="ml-auto text-[10px] font-bold bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center">
          {opportunities.length}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setAdding(true); setOpen(true); }}
          className="ml-1 p-0.5 rounded hover:bg-muted transition-colors"
        >
          <Plus size={12} />
        </button>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2">
          {opportunities.map((opp) => {
            const Icon = TYPE_ICONS[opp.type];
            return (
              <div key={opp.id} className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-1.5">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} className="text-primary shrink-0" />
                    <span className="text-xs font-medium text-foreground">{OPPORTUNITY_TYPE_LABELS[opp.type]}</span>
                  </div>
                  <button onClick={() => handleRemove(opp.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={11} />
                  </button>
                </div>

                <p className="text-[11px] text-foreground/80 leading-snug">{opp.description}</p>

                {/* Type-specific fields */}
                {opp.typeFields && Object.entries(opp.typeFields).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(opp.typeFields).filter(([, v]) => v).map(([k, v]) => (
                      <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1">
                  <select
                    value={opp.status}
                    onChange={(e) => handleStatusChange(opp.id, e.target.value as OpportunityStatus)}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border-0 cursor-pointer ${STATUS_COLORS[opp.status]}`}
                  >
                    {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  {opp.placa && (
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{opp.placa}</span>
                  )}
                </div>

                {opp.aseguradora && <p className="text-[10px] text-muted-foreground">🛡 {opp.aseguradora}</p>}
                {opp.monto && <p className="text-[10px] font-mono text-muted-foreground">{formatMonto(opp.monto)}</p>}
                {opp.url && (
                  <a href={opp.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5 truncate">
                    <ExternalLink size={9} /> {opp.url}
                  </a>
                )}
                <p className="text-[9px] text-muted-foreground">{opp.createdBy} · {opp.createdAt}</p>
              </div>
            );
          })}

          {opportunities.length === 0 && !adding && (
            <div className="text-center py-3">
              <p className="text-[11px] text-muted-foreground">Sin oportunidades</p>
              <button onClick={() => setAdding(true)} className="text-[11px] text-primary hover:underline mt-1">
                + Agregar oportunidad
              </button>
            </div>
          )}

          {/* Add form */}
          {adding && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Nueva oportunidad</span>
                <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={12} />
                </button>
              </div>

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as OpportunityType, typeFields: {} })}
                className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
              >
                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <input
                placeholder="Descripción (ej: Ford Fiesta 2024)"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
              />

              {/* Type-specific fields */}
              {currentTypeFields.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Campos {OPPORTUNITY_TYPE_LABELS[(form.type || "vehiculo") as OpportunityType]}</p>
                  {currentTypeFields.map((field) => (
                    <input
                      key={field.key}
                      placeholder={`${field.label}: ${field.placeholder}`}
                      value={form.typeFields?.[field.key] || ""}
                      onChange={(e) => setForm({
                        ...form,
                        typeFields: { ...form.typeFields, [field.key]: e.target.value },
                      })}
                      className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <input
                  placeholder="Aseguradora"
                  value={form.aseguradora || ""}
                  onChange={(e) => setForm({ ...form, aseguradora: e.target.value })}
                  className="text-xs py-1.5 px-2 bg-background border border-border rounded-md"
                />
                <input
                  placeholder="Monto"
                  type="number"
                  value={form.monto || ""}
                  onChange={(e) => setForm({ ...form, monto: Number(e.target.value) || undefined })}
                  className="text-xs py-1.5 px-2 bg-background border border-border rounded-md font-mono"
                />
              </div>

              <input
                placeholder="URL (opcional)"
                value={form.url || ""}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
              />

              <p className="text-[10px] text-muted-foreground">
                💡 Al agregar, se creará un nuevo lead vinculado a este cliente.
              </p>

              <button
                onClick={handleAdd}
                disabled={!form.description?.trim()}
                className="w-full text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                Agregar oportunidad
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
