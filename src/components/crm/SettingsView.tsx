import { useState } from "react";
import {
  Settings, Table2, LayoutGrid, BarChart3, CalendarDays,
  Plus, X, Eye, EyeOff, GripVertical, Pencil, Trash2,
} from "lucide-react";
import type { CrmConfig, PaymentStatusConfig, IdTypeConfig, CustomReportSection } from "@/types/crm";
import { STATUS_CONFIG, ALL_STATUSES, getStatusLabel } from "@/types/crm";

interface SettingsViewProps {
  config: CrmConfig;
  onUpdateConfig: (config: CrmConfig) => void;
}

const VIEW_LIST = [
  { key: "pipeline", label: "Pipeline", icon: Table2 },
  { key: "kanban", label: "Kanban", icon: LayoutGrid },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "reports", label: "Reportes", icon: BarChart3 },
];

const GROUP_BY_OPTIONS = [
  { value: "state", label: "Estado" },
  { value: "assignedTo", label: "Responsable" },
  { value: "lugar", label: "Ciudad" },
  { value: "tipoSeguro", label: "Tipo de seguro" },
  { value: "insurance", label: "Aseguradora" },
  { value: "paymentStatus", label: "Estado de pago" },
];

const CHART_TYPES = [
  { value: "bar", label: "📊 Barras" },
  { value: "pie", label: "🥧 Circular" },
  { value: "table", label: "📋 Tabla" },
  { value: "metric", label: "📈 Métrica" },
];

export function SettingsView({ config, onUpdateConfig }: SettingsViewProps) {
  const [addingReport, setAddingReport] = useState(false);
  const [newSection, setNewSection] = useState<Partial<CustomReportSection>>({ type: "bar", groupBy: "state" });
  const [addingPayment, setAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ label: "", color: "#6B7280" });
  const [addingIdType, setAddingIdType] = useState(false);
  const [newIdType, setNewIdType] = useState({ code: "", label: "" });
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState("");
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editLabelValue, setEditLabelValue] = useState("");

  const updateConfig = (partial: Partial<CrmConfig>) => onUpdateConfig({ ...config, ...partial });

  // Report sections
  const handleAddSection = () => {
    if (!newSection.title?.trim()) return;
    const section: CustomReportSection = { id: Date.now().toString(), title: newSection.title.trim(), type: (newSection.type || "bar") as any, groupBy: newSection.groupBy || "state", visible: true };
    updateConfig({ customReportSections: [...config.customReportSections, section] });
    setNewSection({ type: "bar", groupBy: "state" }); setAddingReport(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Settings size={20} />Configuración</h2>
        <p className="text-sm text-muted-foreground mt-1">Personaliza las vistas, estados, semáforo de pago y más.</p>
      </div>

      {/* Visible Views */}
      <ConfigCard title="Vistas visibles" description="Activa o desactiva las secciones del sidebar.">
        <div className="space-y-2">
          {VIEW_LIST.map((view) => {
            const Icon = view.icon;
            const isVisible = config.visibleViews[view.key] !== false;
            return (
              <div key={view.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5"><Icon size={16} className="text-muted-foreground" /><span className="text-sm text-foreground">{view.label}</span></div>
                <ToggleSwitch checked={isVisible} onChange={() => updateConfig({ visibleViews: { ...config.visibleViews, [view.key]: !isVisible } })} />
              </div>
            );
          })}
        </div>
      </ConfigCard>

      {/* Pipeline Status Labels */}
      <ConfigCard title="Estados del pipeline" description="Personaliza los nombres de cada estado.">
        <div className="space-y-2">
          {ALL_STATUSES.map((status) => {
            const isEditing = editingLabel === status;
            const currentLabel = getStatusLabel(status, config.statusLabels);
            return (
              <div key={status} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input value={editLabelValue} onChange={(e) => setEditLabelValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { updateConfig({ statusLabels: { ...config.statusLabels, [status]: editLabelValue } }); setEditingLabel(null); } }}
                      className="flex-1 text-sm py-1 px-2 bg-muted/50 border border-border rounded-md" autoFocus />
                    <button onClick={() => { updateConfig({ statusLabels: { ...config.statusLabels, [status]: editLabelValue } }); setEditingLabel(null); }} className="text-primary"><Pencil size={12} /></button>
                    <button onClick={() => setEditingLabel(null)} className="text-muted-foreground"><X size={12} /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-foreground">{currentLabel}</span>
                    <button onClick={() => { setEditingLabel(status); setEditLabelValue(currentLabel); }} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil size={12} /></button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ConfigCard>

      {/* Payment Status (Semáforo) */}
      <ConfigCard title="Semáforo de pago" description="Gestiona las condiciones de pago con colores." onAdd={() => setAddingPayment(true)}>
        <div className="space-y-2">
          {config.paymentStatuses.map((ps) => (
            <div key={ps.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full border-2 border-border" style={{ backgroundColor: ps.color }} />
                <span className="text-sm text-foreground">{ps.label}</span>
              </div>
              <button onClick={() => updateConfig({ paymentStatuses: config.paymentStatuses.filter(p => p.id !== ps.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {addingPayment && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input type="color" value={newPayment.color} onChange={(e) => setNewPayment({ ...newPayment, color: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
              <input value={newPayment.label} onChange={(e) => setNewPayment({ ...newPayment, label: e.target.value })} placeholder="Nombre condición" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <button onClick={() => { if (newPayment.label.trim()) { updateConfig({ paymentStatuses: [...config.paymentStatuses, { id: Date.now().toString(), key: newPayment.label.toLowerCase().replace(/\s/g, "_"), label: newPayment.label, color: newPayment.color }] }); setNewPayment({ label: "", color: "#6B7280" }); setAddingPayment(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAddingPayment(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>

      {/* ID Types */}
      <ConfigCard title="Tipos de identificación" description="Gestiona los tipos de documento." onAdd={() => setAddingIdType(true)}>
        <div className="space-y-2">
          {config.idTypes.map((idt) => (
            <div key={idt.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2"><span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{idt.code}</span><span className="text-sm text-foreground">{idt.label}</span></div>
              <button onClick={() => updateConfig({ idTypes: config.idTypes.filter(i => i.id !== idt.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {addingIdType && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input value={newIdType.code} onChange={(e) => setNewIdType({ ...newIdType, code: e.target.value })} placeholder="Código" className="w-16 text-xs py-1.5 px-2 bg-background border border-border rounded-md font-mono" autoFocus />
              <input value={newIdType.label} onChange={(e) => setNewIdType({ ...newIdType, label: e.target.value })} placeholder="Nombre" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              <button onClick={() => { if (newIdType.code && newIdType.label) { updateConfig({ idTypes: [...config.idTypes, { id: Date.now().toString(), ...newIdType }] }); setNewIdType({ code: "", label: "" }); setAddingIdType(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAddingIdType(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>

      {/* Service Types */}
      <ConfigCard title="Tipos de servicio" description="Particular, Público, u otros." onAdd={() => setAddingService(true)}>
        <div className="space-y-2">
          {config.serviceTypes.map((st, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <span className="text-sm text-foreground">{st}</span>
              <button onClick={() => updateConfig({ serviceTypes: config.serviceTypes.filter((_, idx) => idx !== i) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {addingService && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Tipo de servicio" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <button onClick={() => { if (newService.trim()) { updateConfig({ serviceTypes: [...config.serviceTypes, newService.trim()] }); setNewService(""); setAddingService(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAddingService(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>

      {/* Report Sections */}
      <ConfigCard title="Secciones de reportes" description="Crea gráficos y métricas personalizadas." onAdd={() => setAddingReport(true)}>
        <div className="space-y-2">
          {config.customReportSections.map((section) => (
            <div key={section.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2.5"><GripVertical size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">{section.title}</p>
                  <p className="text-[10px] text-muted-foreground">{CHART_TYPES.find(c => c.value === section.type)?.label} · {GROUP_BY_OPTIONS.find(g => g.value === section.groupBy)?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateConfig({ customReportSections: config.customReportSections.map(s => s.id === section.id ? { ...s, visible: !s.visible } : s) })} className="p-1 rounded hover:bg-muted">
                  {section.visible ? <Eye size={13} className="text-primary" /> : <EyeOff size={13} className="text-muted-foreground" />}
                </button>
                <button onClick={() => updateConfig({ customReportSections: config.customReportSections.filter(s => s.id !== section.id) })} className="p-1 rounded hover:bg-destructive/10"><X size={13} className="text-destructive" /></button>
              </div>
            </div>
          ))}
          {config.customReportSections.length === 0 && !addingReport && (
            <div className="text-center py-6"><p className="text-xs text-muted-foreground">No hay secciones personalizadas.</p></div>
          )}
          {addingReport && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <input placeholder="Nombre de la sección" value={newSection.title || ""} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newSection.type} onChange={(e) => setNewSection({ ...newSection, type: e.target.value as any })} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  {CHART_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <select value={newSection.groupBy} onChange={(e) => setNewSection({ ...newSection, groupBy: e.target.value })} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  {GROUP_BY_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddSection} disabled={!newSection.title?.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Crear</button>
                <button onClick={() => setAddingReport(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}

function ConfigCard({ title, description, children, onAdd }: { title: string; description: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            <Plus size={12} /> Agregar
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${checked ? "left-5" : "left-0.5"}`} />
    </button>
  );
}
