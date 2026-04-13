import React, { useState } from "react";
import { Check, X, Pencil, Trash2 } from "lucide-react";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface PaymentsSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function PaymentsSection({ config, updateConfig, setConfirmDelete }: PaymentsSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newPayment, setNewPayment] = useState({ label: "", color: "#6B7280" });
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader title="Gestión de Pagos" description="Configura el semáforo comercial para el seguimiento de recaudos." />
      <ConfigCard title="Estados de Cobro" description="Haz clic en cualquier estado para editar su nombre y color." onAdd={() => setAdding(true)}>
        <div className="space-y-3">
          {config.paymentStatuses.map((ps) => (
            <div key={ps.id}>
              {editingId === ps.id ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-primary/30 bg-primary/5 animate-in zoom-in-95">
                  <input
                    type="color"
                    value={ps.color}
                    onChange={e => updateConfig({ paymentStatuses: config.paymentStatuses.map(p => p.id === ps.id ? { ...p, color: e.target.value } : p) })}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer shrink-0"
                  />
                  <input
                    value={ps.label}
                    onChange={e => updateConfig({ paymentStatuses: config.paymentStatuses.map(p => p.id === ps.id ? { ...p, label: e.target.value } : p) })}
                    className="flex-1 text-sm font-bold py-2 px-3 bg-background border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />
                  <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all group">
                  <button
                    className="flex items-center gap-4 flex-1 text-left"
                    onClick={() => setEditingId(ps.id)}
                    title="Clic para editar"
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: ps.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{ps.label}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{ps.color} · clic para editar</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({
                      id: ps.id,
                      title: `¿Eliminar estado "${ps.label}"?`,
                      onConfirm: () => updateConfig({ paymentStatuses: config.paymentStatuses.filter(p => p.id !== ps.id) })
                    })}
                    className="p-2 rounded-xl hover:bg-destructive/10 text-destructive transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
          {adding && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <input type="color" value={newPayment.color} onChange={e => setNewPayment({ ...newPayment, color: e.target.value })} className="w-10 h-10 rounded-full border-2 border-white cursor-pointer" />
                <input value={newPayment.label} onChange={e => setNewPayment({ ...newPayment, label: e.target.value })} placeholder="Ej: Pago parcial" className="flex-1 text-sm py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" autoFocus />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (newPayment.label.trim()) { updateConfig({ paymentStatuses: [...config.paymentStatuses, { id: Date.now().toString(), ...newPayment }] }); setNewPayment({ label: "", color: "#6B7280" }); setAdding(false); } }} className="flex-1 text-xs py-2 rounded-xl bg-primary text-primary-foreground font-bold">Agregar</button>
                <button onClick={() => setAdding(false)} className="px-4 py-2 text-xs rounded-xl border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}
