import React, { useState } from "react";
import { MapPin, Trash2, X } from "lucide-react";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface OriginsSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function OriginsSection({ config, updateConfig, setConfirmDelete }: OriginsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader title="Canales de Origen" description="Registra cómo llegan los prospectos para analizar el ROI de marketing." />
      <ConfigCard title="Orígenes de Leads" description="Define los puntos de entrada de tus clientes." onAdd={() => setAdding(true)}>
        <div className="space-y-2">
          {config.leadOrigins.map((lo) => (
            <div key={lo.id} className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                   <MapPin size={14} />
                </div>
                <span className="text-sm font-bold text-foreground">{lo.name}</span>
              </div>
              <button 
                onClick={() => setConfirmDelete({ 
                  id: lo.id, 
                  title: `¿Eliminar origen "${lo.name}"?`, 
                  onConfirm: () => updateConfig({ leadOrigins: config.leadOrigins.filter(o => o.id !== lo.id) }) 
                })} 
                className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {adding && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Instagram Ads" className="flex-1 text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" autoFocus />
              <button onClick={() => { if (newName.trim()) { updateConfig({ leadOrigins: [...config.leadOrigins, { id: Date.now().toString(), name: newName.trim() }] }); setNewName(""); setAdding(false); } }} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20">Añadir</button>
              <button onClick={() => setAdding(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"><X size={16} /></button>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}
