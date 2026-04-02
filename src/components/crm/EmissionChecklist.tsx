import { useState } from "react";
import { CheckCircle2, Circle, ClipboardCheck, AlertCircle } from "lucide-react";
import type { Lead, EmissionCheckItem } from "@/types/crm";

interface EmissionChecklistProps {
  lead: Lead;
  checklistItems: EmissionCheckItem[];
  onUpdateLead: (lead: Lead) => void;
}

export function EmissionChecklist({ lead, checklistItems, onUpdateLead }: EmissionChecklistProps) {
  const completedChecks = lead.emissionChecklist || {};
  const completedCount = checklistItems.filter(item => completedChecks[item.id]).length;
  const totalCount = checklistItems.length;
  const allComplete = completedCount === totalCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleCheck = (itemId: string) => {
    const updated = { ...completedChecks, [itemId]: !completedChecks[itemId] };
    onUpdateLead({ ...lead, emissionChecklist: updated });
  };

  return (
    <div className="border-b border-border">
      <div className="px-4 py-2.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <ClipboardCheck size={13} className={allComplete ? "text-primary" : ""} />
        CHECKLIST DE EMISIÓN
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${allComplete ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-700"}`}>
          {completedCount}/{totalCount}
        </span>
      </div>

      <div className="px-4 pb-3">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="space-y-1.5">
          {checklistItems.map((item) => {
            const checked = completedChecks[item.id] || false;
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                  checked ? "bg-primary/5 border border-primary/20" : "bg-muted/30 border border-border hover:bg-muted/50"
                }`}
              >
                {checked ? (
                  <CheckCircle2 size={15} className="text-primary shrink-0" />
                ) : (
                  <Circle size={15} className="text-muted-foreground shrink-0" />
                )}
                <span className={`text-xs ${checked ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {!allComplete && (
          <div className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle size={12} className="text-amber-600 shrink-0" />
            <span className="text-[10px] text-amber-700">Completa todos los ítems antes de cerrar la venta</span>
          </div>
        )}
      </div>
    </div>
  );
}
