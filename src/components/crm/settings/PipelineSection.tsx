import React, { useState } from "react";
import { ArrowUp, ArrowDown, Pencil, Trash2, Check, X } from "lucide-react";
import { SectionHeader, ConfigCard, ToggleSwitch } from "./SettingsShared";
import { CrmConfig, PipelineStageConfig } from "@/types/crm";

interface PipelineSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function PipelineSection({ config, updateConfig, setConfirmDelete }: PipelineSectionProps) {
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
            <div key={stage.id} className="flex items-center justify-between py-2 px-4 rounded-2xl border border-border bg-muted/30 hover:bg-muted/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="relative group/color">
                   <input type="color" value={stage.color} onChange={e => updateConfig({ pipelineStages: config.pipelineStages.map(s => s.id === stage.id ? { ...s, color: e.target.value } : s) })} className="w-6 h-6 rounded-full border-2 border-white shadow-sm cursor-pointer" />
                   <div className="absolute inset-0 rounded-full border border-black/10 pointer-events-none" />
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 duration-200">
                    <input value={editStageLabel} onChange={e => setEditStageLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveStageLabel(stage.id); if (e.key === "Escape") setEditingStage(null); }}
                      className="text-xs py-1 px-3 bg-background border border-border rounded-xl w-48 focus:ring-primary/40 outline-none" autoFocus />
                    <button onClick={() => handleSaveStageLabel(stage.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><Check size={12} /></button>
                    <button onClick={() => setEditingStage(null)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted-foreground/10"><X size={12} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-foreground">{stage.label}</span>
                     {stage.isFinal && (
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${stage.finalType === "ganado" ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
                         {stage.finalType === "ganado" ? "EXITOSO" : "PERDIDO"}
                       </span>
                     )}
                  </div>
                )}
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex rounded-lg overflow-hidden border border-border bg-background mr-2">
                     <button onClick={() => moveStage(stage.id, "up")} className="p-1.5 hover:bg-muted text-muted-foreground transition-colors"><ArrowUp size={12} /></button>
                     <div className="w-px bg-border" />
                     <button onClick={() => moveStage(stage.id, "down")} className="p-1.5 hover:bg-muted text-muted-foreground transition-colors"><ArrowDown size={12} /></button>
                  </div>
                  <button onClick={() => { setEditingStage(stage.id); setEditStageLabel(stage.label); }} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"><Pencil size={14} /></button>
                  <button 
                    onClick={() => setConfirmDelete({
                      id: stage.id,
                      title: `¿Eliminar etapa "${stage.label}"?`,
                      onConfirm: () => handleDeleteStage(stage.id)
                    })}
                    disabled={config.pipelineStages.length <= 2} 
                    className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ConfigCard>
  );

  return (
    <div className="space-y-6">
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
    </div>
  );
}
