import React, { useState } from "react";
import { Tag, Trash2, X } from "lucide-react";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface PoliciesSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function PoliciesSection({ config, updateConfig, setConfirmDelete }: PoliciesSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader title="Ramos y Productos" description="Define los tipos de póliza que comercializa tu agencia." />
      <ConfigCard title="Tipos de Póliza" description="Estos aparecerán en el selector al crear nuevos leads." onAdd={() => setAdding(true)}>
        <div className="space-y-3">
          {config.policyTypes.map((pt) => (
            <div key={pt.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                   <Tag size={14} />
                </div>
                <span className="text-sm font-bold text-foreground">{pt.name}</span>
              </div>
              <button 
                onClick={() => setConfirmDelete({
                   id: pt.id,
                   title: `¿Eliminar ramo "${pt.name}"?`,
                   onConfirm: () => updateConfig({ policyTypes: config.policyTypes.filter(p => p.id !== pt.id) })
                })} 
                className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Multiriesgo Hogar" className="flex-1 text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" autoFocus />
              <button onClick={() => { if (newName.trim()) { updateConfig({ policyTypes: [...config.policyTypes, { id: Date.now().toString(), name: newName.trim() }] }); setNewName(""); setAdding(false); } }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">Añadir</button>
              <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"><X size={16} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}
