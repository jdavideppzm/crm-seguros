import React, { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface ChecklistSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function ChecklistSection({ config, updateConfig, setConfirmDelete }: ChecklistSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader title="Checklist de Emisión" description="Define los requisitos obligatorios para finalizar una venta." />
      <ConfigCard title="Ítems del Checklist" description="Estos ítems aparecerán en el panel de detalle cuando un lead alcance las etapas finales." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.emissionChecklist.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                   <Check size={14} />
                </div>
                <span className="text-sm font-bold text-foreground">{item.label}</span>
              </div>
              <button 
                onClick={() => setConfirmDelete({ 
                  id: item.id, 
                  title: `¿Eliminar ítem "${item.label}"?`, 
                  onConfirm: () => updateConfig({ emissionChecklist: config.emissionChecklist.filter(i => i.id !== item.id) }) 
                })} 
                className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-2">
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Ej: Tarjeta de propiedad" className="flex-1 text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" autoFocus />
              <button onClick={() => { if (newLabel.trim()) { updateConfig({ emissionChecklist: [...config.emissionChecklist, { id: Date.now().toString(), label: newLabel.trim(), required: true }] }); setNewLabel(""); setAdding(false); } }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">Añadir</button>
              <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"><X size={16} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}
