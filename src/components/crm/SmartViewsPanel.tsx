import { useState } from "react";
import { Eye, Plus, X, Pencil, Trash2, Filter, Check, LucideIcon, Flame, Phone, FileText, Search, Star, Target, Package, Rocket, Briefcase, BarChart3, Bell, Shield, Calendar, Users, MapPin, CreditCard, Zap, Mail, Globe, Lock } from "lucide-react";
import * as Icons from "lucide-react";
import type { SmartView } from "@/types/crm";

interface SmartViewsPanelProps {
  smartViews: SmartView[];
  activeSmartViewId: string | null;
  onSelectSmartView: (id: string | null) => void;
  onUpdateSmartViews: (views: SmartView[]) => void;
  pipelineStages: { key: string; label: string; color: string }[];
}

export function SmartViewsPanel({
  smartViews, activeSmartViewId, onSelectSmartView, onUpdateSmartViews, pipelineStages,
}: SmartViewsPanelProps) {
  return (
    <div className="px-3 mt-4">
      <p className="px-3 mb-2 text-[11px] font-semibold text-sidebar-dark-fg uppercase tracking-widest flex items-center gap-1.5">
        <Eye size={10} /> Smart Views
      </p>
      {smartViews.map((sv) => (
        <button
          key={sv.id}
          onClick={() => onSelectSmartView(activeSmartViewId === sv.id ? null : sv.id)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
            activeSmartViewId === sv.id
              ? "bg-sidebar-dark-hover text-sidebar-dark-bright"
              : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            {sv.icon && Icons[sv.icon as keyof typeof Icons] ? (
              <div className="text-secondary/80">
                {(() => {
                  const Icon = Icons[sv.icon as keyof typeof Icons] as LucideIcon;
                  return <Icon size={14} />;
                })()}
              </div>
            ) : (
              <Eye size={14} className="text-secondary/80" />
            )}
            <span className="truncate">{sv.name}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// Settings component for managing Smart Views
export function SmartViewsSettings({
  smartViews, onUpdate, pipelineStages,
}: {
  smartViews: SmartView[];
  onUpdate: (views: SmartView[]) => void;
  pipelineStages: { key: string; label: string }[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<SmartView>>({ name: "", icon: "📋", filterType: "status", filterValue: "" });

  const handleSave = (isNew: boolean) => {
    if (!form.name?.trim()) return;
    const view: SmartView = {
      id: isNew ? Date.now().toString() : editingId!,
      name: form.name.trim(),
      icon: form.icon || "📋",
      filterType: form.filterType || "status",
      filterValue: form.filterValue || "",
      filterField: form.filterField,
    };
    if (isNew) {
      onUpdate([...smartViews, view]);
    } else {
      onUpdate(smartViews.map(sv => sv.id === editingId ? view : sv));
    }
    setForm({ name: "", icon: "📋", filterType: "status", filterValue: "" });
    setAdding(false);
    setEditingId(null);
  };

  const ICONS = [
    "Flame", "Phone", "FileText", "Search", "Star", "Target", "Package", "Rocket", 
    "Briefcase", "BarChart3", "Bell", "Shield", "Calendar", "Users", "MapPin", 
    "CreditCard", "Zap", "Mail", "Globe", "Lock", "Eye", "Check"
  ];

  return (
    <div className="space-y-2">
      {smartViews.map((sv) => {
        if (editingId === sv.id) {
          return (
            <SmartViewForm key={sv.id} form={form} setForm={setForm} pipelineStages={pipelineStages} icons={ICONS}
              onSave={() => handleSave(false)} onCancel={() => { setEditingId(null); setForm({ name: "", icon: "📋", filterType: "status", filterValue: "" }); }} />
          );
        }
        return (
          <div key={sv.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {(() => {
                  const Icon = (Icons[sv.icon as keyof typeof Icons] || Icons.Eye) as LucideIcon;
                  return <Icon size={16} />;
                })()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{sv.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  {sv.filterType === "status" ? "Estado" : sv.filterType === "assigned" ? "Asignado" : "Campo"}: {sv.filterValue}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditingId(sv.id); setForm(sv); }} className="p-1 rounded hover:bg-muted"><Pencil size={12} className="text-muted-foreground" /></button>
              <button onClick={() => onUpdate(smartViews.filter(s => s.id !== sv.id))} className="p-1 rounded hover:bg-destructive/10"><Trash2 size={12} className="text-destructive" /></button>
            </div>
          </div>
        );
      })}
      {adding ? (
        <SmartViewForm form={form} setForm={setForm} pipelineStages={pipelineStages} icons={ICONS}
          onSave={() => handleSave(true)} onCancel={() => { setAdding(false); setForm({ name: "", icon: "📋", filterType: "status", filterValue: "" }); }} isNew />
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors w-full justify-center">
          <Plus size={12} /> Nueva Smart View
        </button>
      )}
    </div>
  );
}

function SmartViewForm({ form, setForm, pipelineStages, icons, onSave, onCancel, isNew }: {
  form: Partial<SmartView>; setForm: (f: Partial<SmartView>) => void;
  pipelineStages: { key: string; label: string }[]; icons: string[];
  onSave: () => void; onCancel: () => void; isNew?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2`}>
      <div className="flex items-start gap-2">
        <div className="grid grid-cols-6 gap-1 p-1 bg-background border border-border rounded-lg max-h-[120px] overflow-y-auto custom-scrollbar">
          {icons.map(ic => {
            const Icon = Icons[ic as keyof typeof Icons] as LucideIcon;
            const isSelected = form.icon === ic;
            return (
              <button 
                key={ic} 
                onClick={() => setForm({ ...form, icon: ic })}
                className={`p-1.5 rounded-md transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-sm scale-110" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon size={14} />
              </button>
            );
          })}
        </div>
        <input value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la vista" className="flex-1 text-xs py-2 px-3 bg-background border border-border rounded-lg" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={form.filterType} onChange={e => setForm({ ...form, filterType: e.target.value as any })} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md">
          <option value="status">Por estado</option>
          <option value="assigned">Por asignado</option>
          <option value="field">Por campo</option>
        </select>
        {form.filterType === "status" ? (
          <select value={form.filterValue} onChange={e => setForm({ ...form, filterValue: e.target.value })} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md">
            <option value="">Seleccionar estado</option>
            {pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        ) : (
          <input value={form.filterValue || ""} onChange={e => setForm({ ...form, filterValue: e.target.value })} placeholder={form.filterType === "assigned" ? "Nombre del usuario" : "Valor"} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
        )}
      </div>
      {form.filterType === "field" && (
        <input value={form.filterField || ""} onChange={e => setForm({ ...form, filterField: e.target.value })} placeholder="Nombre del campo (ej: insurance, lugar)" className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
      )}
      <div className="flex gap-2">
        <button onClick={onSave} disabled={!form.name?.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">{isNew ? "Crear" : "Guardar"}</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
      </div>
    </div>
  );
}
