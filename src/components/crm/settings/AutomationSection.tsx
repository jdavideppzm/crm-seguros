import React, { useState } from "react";
import { Zap, Plus, Trash2, Check, X, Settings, Layout, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ConfigCard, ToggleSwitch } from "./SettingsShared";
import { CrmConfig, AutomationRule, ACTION_LABELS } from "@/types/crm";

interface AutomationSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function AutomationSection({ config, updateConfig, setConfirmDelete }: AutomationSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({ 
    name: "", 
    trigger: { type: "status_change" }, 
    action: { type: "create_activity" } 
  });

  const triggerLabels: Record<string, string> = {
    status_change: "Cambio de Estado",
    days_inactive: "Días sin Actividad",
    lead_created: "Lead Creado"
  };

  const actionLabels = ACTION_LABELS;

  return (
    <div className="space-y-6">
      <SectionHeader title="Automatizaciones" description="Reglas inteligentes para automatizar tareas, avisos y cambios de etapa." />
      
      <ConfigCard title="Reglas Configuradas" description="Gestiona el comportamiento automático de tu CRM." onAdd={() => setAdding(true)}>
        <div className="space-y-4">
          {config.automationRules.map((rule) => (
            <div key={rule.id} className={`p-5 rounded-[24px] border transition-all ${rule.enabled ? "bg-muted/30 border-border hover:shadow-lg" : "bg-muted/10 border-border/40 opacity-50 grayscale"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className={`p-3 rounded-2xl ${rule.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Zap size={20} className={rule.enabled ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">{rule.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">ID: {rule.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ToggleSwitch checked={rule.enabled} onChange={() => updateConfig({ automationRules: config.automationRules.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r) })} />
                  <button onClick={() => setConfirmDelete({ id: rule.id, title: `¿Eliminar regla "${rule.name}"?`, onConfirm: () => updateConfig({ automationRules: config.automationRules.filter(r => r.id !== rule.id) }) })} className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-background/50 border border-border/50">
                <div className="flex flex-col gap-1">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SI (IF)</p>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                      <span className="text-xs font-bold text-foreground">{triggerLabels[rule.trigger.type] || rule.trigger.type}</span>
                      {rule.trigger.daysInactive && <span className="px-1.5 py-0.5 rounded-md bg-muted text-[9px] font-black text-muted-foreground uppercase">{rule.trigger.daysInactive} días</span>}
                      {rule.trigger.toStatus && <span className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/20 text-[9px] font-black text-primary uppercase">→ {config.pipelineStages.find(s => s.key === rule.trigger.toStatus)?.label || rule.trigger.toStatus}</span>}
                   </div>
                </div>
                
                <div className="h-px bg-border/50 w-full md:hidden" />
                
                <div className="flex flex-col gap-1">
                   <p className="text-[9px] font-black text-primary uppercase tracking-widest">ENTONCES (THEN)</p>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      <span className="text-xs font-bold text-foreground">{actionLabels[rule.action.type] || rule.action.type}</span>
                      {rule.action.activityText && <span className="text-[10px] font-medium text-muted-foreground italic truncate max-w-[150px]">"{rule.action.activityText}"</span>}
                      {rule.action.targetStatus && <span className="px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/20 text-[9px] font-black text-primary uppercase">Mover a {config.pipelineStages.find(s => s.key === rule.action.targetStatus)?.label || rule.action.targetStatus}</span>}
                   </div>
                </div>
              </div>
            </div>
          ))}

          {adding && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-6 animate-in slide-in-from-bottom-2 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary text-primary-foreground"><PlusCircle size={16} /></div>
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Nueva Automatización</p>
              </div>
              
              <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nombre de la Regla</label>
                  <input 
                  value={newRule.name || ""} 
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })} 
                  placeholder="Ej: Seguimiento clientes inactivos" 
                  className="w-full text-xs py-2.5 px-4 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none font-medium" 
                  autoFocus 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 flex items-center gap-2">SI OCURRE... (IF)</label>
                    <select 
                       value={newRule.trigger?.type} 
                       onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, type: e.target.value as any } })} 
                       className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none font-bold"
                    >
                      <option value="status_change">Cambio de estado</option>
                      <option value="days_inactive">Días sin actividad</option>
                      <option value="lead_created">Lead creado</option>
                    </select>
                  </div>
                  <div className="p-3 bg-background/50 border border-dashed border-border rounded-xl min-h-[60px]">
                    {newRule.trigger?.type === "status_change" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">¿A qué etapa cambia?</label>
                        <select value={newRule.trigger?.toStatus || ""} onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, toStatus: e.target.value } })} className="w-full text-xs py-2 border border-border rounded-xl outline-none">
                          {config.pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                    )}
                    {newRule.trigger?.type === "days_inactive" && (
                       <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">¿Cuántos días?</label>
                        <input type="number" value={newRule.trigger?.daysInactive || ""} onChange={e => setNewRule({ ...newRule, trigger: { ...newRule.trigger!, daysInactive: Number(e.target.value) } })} placeholder="Ej: 3" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl outline-none" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 flex items-center gap-2">ENTONCES HACER... (THEN)</label>
                    <select 
                       value={newRule.action?.type} 
                       onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, type: e.target.value as any } })} 
                       className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none font-bold"
                    >
                      <option value="create_activity">Crear tarea / recordatorio</option>
                      <option value="change_status">Mover a otra etapa</option>
                      <option value="send_alert">Alertar al sistema</option>
                    </select>
                  </div>
                  <div className="p-3 bg-background/50 border border-dashed border-border rounded-xl min-h-[60px]">
                    {newRule.action?.type === "create_activity" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Texto de la tarea</label>
                        <input value={newRule.action?.activityText || ""} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, activityText: e.target.value } })} placeholder="Ej: Llamar para cierre" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl outline-none" />
                      </div>
                    )}
                    {newRule.action?.type === "change_status" && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mover a:</label>
                        <select value={newRule.action?.targetStatus || ""} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, targetStatus: e.target.value } })} className="w-full text-xs py-2 border border-border rounded-xl outline-none">
                          {config.pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      </div>
                    )}
                    {(newRule.action?.type === "send_alert") && (
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Mensaje</label>
                        <input value={newRule.action?.alertMessage || ""} onChange={e => setNewRule({ ...newRule, action: { ...newRule.action!, alertMessage: e.target.value } })} placeholder="Ej: Nuevo lead asignado" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl outline-none" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => {
                  if (newRule.name?.trim()) {
                    updateConfig({ automationRules: [...config.automationRules, { ...newRule, id: Date.now().toString(), enabled: true } as AutomationRule] });
                    setNewRule({ name: "", trigger: { type: "status_change" }, action: { type: "create_activity" } });
                    setAdding(false);
                    toast.success("Regla activada con éxito");
                  }
                }} disabled={!newRule.name?.trim()} className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40">Activar Regla Automática</button>
                <button onClick={() => setAdding(false)} className="px-6 py-3 text-xs rounded-2xl border border-border text-muted-foreground font-bold hover:bg-muted transition-all">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}
