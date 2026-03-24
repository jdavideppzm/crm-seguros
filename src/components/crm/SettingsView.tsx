import { useState } from "react";
import {
  Settings, Table2, LayoutGrid, BarChart3, CalendarDays,
  Plus, X, Eye, EyeOff, GripVertical, Pencil, Trash2, Check,
  Shield, FileText, Users, Zap, Tag, MapPin, CreditCard, ChevronRight,
} from "lucide-react";
import type {
  CrmConfig, PaymentStatusConfig, IdTypeConfig, CustomReportSection,
  PipelineStageConfig, LeadFormFieldConfig, InsuranceCompany, PolicyType,
  LeadOrigin, AutomationRule, CrmUser,
} from "@/types/crm";

interface SettingsViewProps {
  config: CrmConfig;
  onUpdateConfig: (config: CrmConfig) => void;
}

type SettingsSection = "general" | "users" | "pipeline" | "insurers" | "policies" | "origins" | "payments" | "automations";

const SETTINGS_SECTIONS: { key: SettingsSection; label: string; icon: typeof Settings; description: string }[] = [
  { key: "general", label: "General", icon: Settings, description: "Vistas, formularios y tipos de documento" },
  { key: "users", label: "Usuarios y permisos", icon: Users, description: "Gestión de equipo comercial" },
  { key: "pipeline", label: "Pipeline de ventas", icon: Table2, description: "Etapas del proceso y estados finales" },
  { key: "insurers", label: "Aseguradoras", icon: Shield, description: "Catálogo de aseguradoras y comisiones" },
  { key: "policies", label: "Tipos de póliza", icon: FileText, description: "Todo riesgo, parcial, SOAT..." },
  { key: "origins", label: "Origen de leads", icon: MapPin, description: "Cómo llegan los clientes" },
  { key: "payments", label: "Estados de pago", icon: CreditCard, description: "Semáforo y condiciones de pago" },
  { key: "automations", label: "Automatizaciones", icon: Zap, description: "Reglas trigger → acción" },
];

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
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  const updateConfig = (partial: Partial<CrmConfig>) => onUpdateConfig({ ...config, ...partial });

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings size={16} /> Configuración
          </h2>
          <p className="text-[11px] text-muted-foreground mt-1">Panel central del sistema</p>
        </div>
        <nav className="px-2 pb-4 space-y-0.5">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{section.label}</p>
                </div>
                <ChevronRight size={12} className="shrink-0 opacity-40" />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {activeSection === "general" && <GeneralSection config={config} updateConfig={updateConfig} />}
          {activeSection === "users" && <UsersSection config={config} updateConfig={updateConfig} />}
          {activeSection === "pipeline" && <PipelineSection config={config} updateConfig={updateConfig} />}
          {activeSection === "insurers" && <InsurersSection config={config} updateConfig={updateConfig} />}
          {activeSection === "policies" && <PoliciesSection config={config} updateConfig={updateConfig} />}
          {activeSection === "origins" && <OriginsSection config={config} updateConfig={updateConfig} />}
          {activeSection === "payments" && <PaymentsSection config={config} updateConfig={updateConfig} />}
          {activeSection === "automations" && <AutomationsSection config={config} updateConfig={updateConfig} />}
        </div>
      </div>
    </div>
  );
}

// ===== GENERAL =====
function GeneralSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [addingReport, setAddingReport] = useState(false);
  const [newSection, setNewSection] = useState<Partial<CustomReportSection>>({ type: "bar", groupBy: "state" });
  const [addingIdType, setAddingIdType] = useState(false);
  const [newIdType, setNewIdType] = useState({ code: "", label: "" });
  const [addingService, setAddingService] = useState(false);
  const [newService, setNewService] = useState("");

  return (
    <>
      <SectionHeader title="General" description="Vistas visibles, tipos de documento y reportes personalizados." />

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

      <ConfigCard title="Formulario nuevo lead" description="Elige qué campos aparecen al crear un lead y cuáles son obligatorios.">
        <div className="space-y-1">
          {config.leadFormFields.map((field) => (
            <div key={field.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-foreground">{field.label}</span>
                {field.required && field.enabled && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1 py-0.5 rounded">REQ</span>}
              </div>
              <div className="flex items-center gap-2">
                {field.enabled && (
                  <button onClick={() => updateConfig({ leadFormFields: config.leadFormFields.map(f => f.key === field.key ? { ...f, required: !f.required } : f) })}
                    className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${field.required ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    Obligatorio
                  </button>
                )}
                <ToggleSwitch checked={field.enabled} onChange={() => updateConfig({ leadFormFields: config.leadFormFields.map(f => f.key === field.key ? { ...f, enabled: !f.enabled } : f) })} />
              </div>
            </div>
          ))}
        </div>
      </ConfigCard>

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
                <button onClick={() => { if (newSection.title?.trim()) { updateConfig({ customReportSections: [...config.customReportSections, { id: Date.now().toString(), title: newSection.title.trim(), type: (newSection.type || "bar") as any, groupBy: newSection.groupBy || "state", visible: true }] }); setNewSection({ type: "bar", groupBy: "state" }); setAddingReport(false); } }} disabled={!newSection.title?.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Crear</button>
                <button onClick={() => setAddingReport(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// ===== USERS =====
function UsersSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "vendedor" as const });

  return (
    <>
      <SectionHeader title="Usuarios y permisos" description="Gestiona tu equipo comercial, roles y asignación de leads." />

      <ConfigCard title="Equipo" description="Admin: acceso completo. Vendedor: solo sus leads asignados." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{user.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {user.role === "admin" ? "Admin" : "Vendedor"}
                </span>
                <ToggleSwitch checked={user.active} onChange={() => updateConfig({ users: config.users.map(u => u.id === user.id ? { ...u, active: !u.active } : u) })} />
                <button onClick={() => updateConfig({ users: config.users.filter(u => u.id !== user.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
              </div>
            </div>
          ))}
          {adding && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Nombre" className="text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
                <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              </div>
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                <option value="vendedor">Vendedor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => { if (newUser.name.trim()) { updateConfig({ users: [...config.users, { id: Date.now().toString(), ...newUser, active: true }] }); setNewUser({ name: "", email: "", role: "vendedor" }); setAdding(false); } }} disabled={!newUser.name.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Crear usuario</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// ===== PIPELINE =====
function PipelineSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [addingStage, setAddingStage] = useState(false);
  const [newStage, setNewStage] = useState({ label: "", color: "#6B7280", isFinal: false, finalType: "" as "" | "ganado" | "perdido" });
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editStageLabel, setEditStageLabel] = useState("");

  const processStages = config.pipelineStages.filter(s => !s.isFinal).sort((a, b) => a.order - b.order);
  const finalStages = config.pipelineStages.filter(s => s.isFinal).sort((a, b) => a.order - b.order);

  const handleAddStage = () => {
    if (!newStage.label.trim()) return;
    const key = newStage.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    const maxOrder = Math.max(...config.pipelineStages.map(s => s.order), -1);
    const stage: PipelineStageConfig = {
      id: Date.now().toString(), key, label: newStage.label.trim(), color: newStage.color,
      isFinal: newStage.isFinal, finalType: newStage.isFinal ? (newStage.finalType as any || "ganado") : undefined,
      order: maxOrder + 1,
    };
    updateConfig({ pipelineStages: [...config.pipelineStages, stage] });
    setNewStage({ label: "", color: "#6B7280", isFinal: false, finalType: "" }); setAddingStage(false);
  };

  const handleDeleteStage = (stageId: string) => {
    if (config.pipelineStages.length <= 2) return;
    updateConfig({ pipelineStages: config.pipelineStages.filter(s => s.id !== stageId) });
  };

  const handleSaveStageLabel = (stageId: string) => {
    if (!editStageLabel.trim()) return;
    updateConfig({ pipelineStages: config.pipelineStages.map(s => s.id === stageId ? { ...s, label: editStageLabel.trim() } : s) });
    setEditingStage(null);
  };

  const moveStage = (stageId: string, direction: "up" | "down") => {
    const stages = [...config.pipelineStages].sort((a, b) => a.order - b.order);
    const idx = stages.findIndex(s => s.id === stageId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= stages.length) return;
    const tempOrder = stages[idx].order;
    stages[idx] = { ...stages[idx], order: stages[swapIdx].order };
    stages[swapIdx] = { ...stages[swapIdx], order: tempOrder };
    updateConfig({ pipelineStages: stages });
  };

  const renderStageList = (stages: PipelineStageConfig[], title: string, subtitle: string) => (
    <ConfigCard title={title} description={subtitle} onAdd={() => setAddingStage(true)}>
      <div className="space-y-2">
        {stages.map((stage) => {
          const isEditing = editingStage === stage.id;
          return (
            <div key={stage.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <input type="color" value={stage.color} onChange={e => updateConfig({ pipelineStages: config.pipelineStages.map(s => s.id === stage.id ? { ...s, color: e.target.value } : s) })} className="w-5 h-5 rounded border-0 cursor-pointer" />
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input value={editStageLabel} onChange={e => setEditStageLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveStageLabel(stage.id); if (e.key === "Escape") setEditingStage(null); }}
                      className="text-sm py-0.5 px-2 bg-background border border-border rounded-md w-40" autoFocus />
                    <button onClick={() => handleSaveStageLabel(stage.id)} className="text-primary"><Check size={12} /></button>
                    <button onClick={() => setEditingStage(null)} className="text-muted-foreground"><X size={12} /></button>
                  </div>
                ) : (
                  <span className="text-sm text-foreground">{stage.label}</span>
                )}
                {stage.isFinal && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${stage.finalType === "ganado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {stage.finalType === "ganado" ? "GANADO" : "PERDIDO"}
                  </span>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1">
                  <button onClick={() => moveStage(stage.id, "up")} className="p-1 rounded hover:bg-muted text-muted-foreground text-xs">↑</button>
                  <button onClick={() => moveStage(stage.id, "down")} className="p-1 rounded hover:bg-muted text-muted-foreground text-xs">↓</button>
                  <button onClick={() => { setEditingStage(stage.id); setEditStageLabel(stage.label); }} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil size={12} /></button>
                  <button onClick={() => handleDeleteStage(stage.id)} disabled={config.pipelineStages.length <= 2} className="p-1 rounded hover:bg-destructive/10 disabled:opacity-30"><Trash2 size={12} className="text-destructive" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );

  return (
    <>
      <SectionHeader title="Pipeline de ventas" description="Define las etapas del proceso comercial y los estados finales (ganado/perdido)." />
      {renderStageList(processStages, "Etapas del proceso", "Flujo secuencial de venta. Puedes reordenar, renombrar o agregar etapas.")}
      {renderStageList(finalStages, "Estados finales", "Resultado de cierre: ganado o perdido.")}

      {addingStage && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">Nueva etapa</p>
          <div className="flex items-center gap-2">
            <input type="color" value={newStage.color} onChange={e => setNewStage({ ...newStage, color: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
            <input value={newStage.label} onChange={e => setNewStage({ ...newStage, label: e.target.value })} placeholder="Nombre" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={newStage.isFinal} onChange={e => setNewStage({ ...newStage, isFinal: e.target.checked })} className="rounded" />
              Es estado final
            </label>
            {newStage.isFinal && (
              <select value={newStage.finalType} onChange={e => setNewStage({ ...newStage, finalType: e.target.value as any })} className="text-xs py-1 px-2 bg-background border border-border rounded-md">
                <option value="ganado">Ganado</option>
                <option value="perdido">Perdido</option>
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddStage} disabled={!newStage.label.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Agregar</button>
            <button onClick={() => setAddingStage(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}

// ===== INSURERS =====
function InsurersSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newInsurer, setNewInsurer] = useState({ name: "", commission: 0, contact: "", notes: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <>
      <SectionHeader title="Aseguradoras" description="Catálogo de aseguradoras con comisiones y datos de contacto." />

      <ConfigCard title="Catálogo de aseguradoras" description="Cada lead puede seleccionar una aseguradora de esta lista. La comisión se calcula automáticamente." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.insuranceCompanies.map((ins) => {
            const isEditing = editingId === ins.id;
            return (
              <div key={ins.id} className="rounded-lg border border-border bg-muted/30 p-3">
                {isEditing ? (
                  <InsuranceEditForm
                    insurer={ins}
                    onSave={(updated) => { updateConfig({ insuranceCompanies: config.insuranceCompanies.map(i => i.id === ins.id ? updated : i) }); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{ins.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{ins.name}</p>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="font-mono font-bold text-primary">{ins.commission}%</span>
                          {ins.contact && <span>· {ins.contact}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingId(ins.id)} className="p-1 rounded hover:bg-muted text-muted-foreground"><Pencil size={12} /></button>
                      <button onClick={() => updateConfig({ insuranceCompanies: config.insuranceCompanies.filter(i => i.id !== ins.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {adding && (
            <InsuranceEditForm
              insurer={{ id: "", name: newInsurer.name, commission: newInsurer.commission, contact: newInsurer.contact, notes: newInsurer.notes }}
              onSave={(ins) => { updateConfig({ insuranceCompanies: [...config.insuranceCompanies, { ...ins, id: Date.now().toString() }] }); setAdding(false); setNewInsurer({ name: "", commission: 0, contact: "", notes: "" }); }}
              onCancel={() => setAdding(false)}
              isNew
            />
          )}
        </div>
      </ConfigCard>
    </>
  );
}

function InsuranceEditForm({ insurer, onSave, onCancel, isNew }: { insurer: InsuranceCompany; onSave: (ins: InsuranceCompany) => void; onCancel: () => void; isNew?: boolean }) {
  const [form, setForm] = useState(insurer);
  return (
    <div className={`space-y-2 ${isNew ? "rounded-lg border border-primary/30 bg-primary/5 p-3" : ""}`}>
      <div className="grid grid-cols-2 gap-2">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
        <input type="number" value={form.commission} onChange={e => setForm({ ...form, commission: Number(e.target.value) })} placeholder="Comisión %" className="text-xs py-1.5 px-2 bg-background border border-border rounded-md font-mono" />
      </div>
      <input value={form.contact || ""} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Contacto (email/teléfono)" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
      <input value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
      <div className="flex gap-2">
        <button onClick={() => { if (form.name.trim()) onSave(form); }} disabled={!form.name.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">{isNew ? "Crear" : "Guardar"}</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
      </div>
    </div>
  );
}

// ===== POLICIES =====
function PoliciesSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <>
      <SectionHeader title="Tipos de póliza" description="Define los tipos de producto que ofreces." />
      <ConfigCard title="Tipos disponibles" description="Se mostrarán como opción al crear o editar un lead." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.policyTypes.map((pt) => (
            <div key={pt.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2"><Tag size={13} className="text-primary" /><span className="text-sm text-foreground">{pt.name}</span></div>
              <button onClick={() => updateConfig({ policyTypes: config.policyTypes.filter(p => p.id !== pt.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del tipo de póliza" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <button onClick={() => { if (newName.trim()) { updateConfig({ policyTypes: [...config.policyTypes, { id: Date.now().toString(), name: newName.trim() }] }); setNewName(""); setAdding(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAdding(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// ===== ORIGINS =====
function OriginsSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <>
      <SectionHeader title="Origen de leads" description="Registra cómo llegan los clientes potenciales." />
      <ConfigCard title="Orígenes disponibles" description="Se podrán asignar a cada lead para análisis de canales." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.leadOrigins.map((lo) => (
            <div key={lo.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2"><MapPin size={13} className="text-primary" /><span className="text-sm text-foreground">{lo.name}</span></div>
              <button onClick={() => updateConfig({ leadOrigins: config.leadOrigins.filter(o => o.id !== lo.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del origen" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <button onClick={() => { if (newName.trim()) { updateConfig({ leadOrigins: [...config.leadOrigins, { id: Date.now().toString(), name: newName.trim() }] }); setNewName(""); setAdding(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAdding(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// ===== PAYMENTS =====
function PaymentsSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newPayment, setNewPayment] = useState({ label: "", color: "#6B7280" });

  return (
    <>
      <SectionHeader title="Estados de pago" description="Semáforo de pago para seguimiento visual de cobros." />
      <ConfigCard title="Condiciones de pago" description="Estos colores aparecen junto al nombre de la aseguradora en cada lead." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.paymentStatuses.map((ps) => (
            <div key={ps.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full border-2 border-border" style={{ backgroundColor: ps.color }} />
                <span className="text-sm text-foreground">{ps.label}</span>
              </div>
              <button onClick={() => updateConfig({ paymentStatuses: config.paymentStatuses.filter(p => p.id !== ps.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg border border-primary/30 bg-primary/5">
              <input type="color" value={newPayment.color} onChange={(e) => setNewPayment({ ...newPayment, color: e.target.value })} className="w-8 h-8 rounded border-0 cursor-pointer" />
              <input value={newPayment.label} onChange={(e) => setNewPayment({ ...newPayment, label: e.target.value })} placeholder="Nombre condición" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <button onClick={() => { if (newPayment.label.trim()) { updateConfig({ paymentStatuses: [...config.paymentStatuses, { id: Date.now().toString(), key: newPayment.label.toLowerCase().replace(/\s/g, "_"), label: newPayment.label, color: newPayment.color }] }); setNewPayment({ label: "", color: "#6B7280" }); setAdding(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Agregar</button>
              <button onClick={() => setAdding(false)} className="text-muted-foreground"><X size={12} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// ===== AUTOMATIONS =====
function AutomationsSection({ config, updateConfig }: { config: CrmConfig; updateConfig: (p: Partial<CrmConfig>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: "",
    trigger: { type: "status_change", toStatus: config.pipelineStages[1]?.key },
    action: { type: "create_activity", activityText: "" },
  });

  const triggerLabels: Record<string, string> = { status_change: "Cambio de estado", days_inactive: "Días sin actividad", lead_created: "Lead creado" };
  const actionLabels: Record<string, string> = { create_activity: "Crear actividad", change_status: "Cambiar estado", send_alert: "Enviar alerta" };

  return (
    <>
      <SectionHeader title="Automatizaciones" description="Define reglas automáticas: Trigger → Acción." />

      <ConfigCard title="Reglas activas" description="Cuando se cumple un trigger, la acción se ejecuta automáticamente." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.automationRules.map((rule) => (
            <div key={rule.id} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">{rule.name}</p>
                <div className="flex items-center gap-2">
                  <ToggleSwitch checked={rule.enabled} onChange={() => updateConfig({ automationRules: config.automationRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r) })} />
                  <button onClick={() => updateConfig({ automationRules: config.automationRules.filter(r => r.id !== rule.id) })} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">⚡ {triggerLabels[rule.trigger.type]}</span>
                {rule.trigger.toStatus && <span className="text-muted-foreground">→ {rule.trigger.toStatus}</span>}
                {rule.trigger.daysInactive && <span className="text-muted-foreground">({rule.trigger.daysInactive} días)</span>}
                <span className="text-muted-foreground">→</span>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">🎯 {actionLabels[rule.action.type]}</span>
              </div>
            </div>
          ))}

          {adding && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <input value={newRule.name || ""} onChange={e => setNewRule({ ...newRule, name: e.target.value })} placeholder="Nombre de la regla" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground block mb-1">Trigger</label>
                  <select value={newRule.trigger?.type} onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, type: e.target.value as any } })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                    <option value="status_change">Cambio de estado</option>
                    <option value="days_inactive">Días sin actividad</option>
                    <option value="lead_created">Lead creado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground block mb-1">Acción</label>
                  <select value={newRule.action?.type} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, type: e.target.value as any } })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                    <option value="create_activity">Crear actividad</option>
                    <option value="change_status">Cambiar estado</option>
                    <option value="send_alert">Enviar alerta</option>
                  </select>
                </div>
              </div>
              {newRule.trigger?.type === "status_change" && (
                <select value={newRule.trigger?.toStatus || ""} onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, toStatus: e.target.value } })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  {config.pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              )}
              {newRule.trigger?.type === "days_inactive" && (
                <input type="number" value={newRule.trigger?.daysInactive || ""} onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, daysInactive: Number(e.target.value) } })} placeholder="Días" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              )}
              {newRule.action?.type === "create_activity" && (
                <input value={newRule.action?.activityText || ""} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, activityText: e.target.value } })} placeholder="Texto de la actividad" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              )}
              {newRule.action?.type === "change_status" && (
                <select value={newRule.action?.targetStatus || ""} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, targetStatus: e.target.value } })} className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  {config.pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={() => {
                  if (newRule.name?.trim()) {
                    updateConfig({ automationRules: [...config.automationRules, { ...newRule, id: Date.now().toString(), enabled: true } as AutomationRule] });
                    setNewRule({ name: "", trigger: { type: "status_change" }, action: { type: "create_activity" } });
                    setAdding(false);
                  }
                }} disabled={!newRule.name?.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Crear regla</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </>
  );
}

// === Shared Components ===

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
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
