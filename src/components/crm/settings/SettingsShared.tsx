import React from "react";
import { Plus, Check, X } from "lucide-react";

export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ConfigCard({ title, description, children, onAdd }: { title: string; description: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      {(title || description) && (
        <div className="flex items-start justify-between mb-5">
          <div className="space-y-1">
            {title && <h3 className="text-sm font-bold text-foreground flex items-center gap-2">{title}</h3>}
            {description && <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>}
          </div>
          {onAdd && (
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Plus size={14} /> Agregar
            </button>
          )}
        </div>
      )}
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  );
}

export function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onChange(); }} 
      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${checked ? "bg-primary shadow-inner ring-4 ring-primary/10" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg border border-black/5 transition-all duration-300 ease-spring ${checked ? "left-7 scale-110" : "left-1"}`} />
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Check size={8} className={`text-white transition-opacity duration-300 ${checked ? "opacity-100" : "opacity-0"}`} />
        <X size={8} className={`text-muted-foreground transition-opacity duration-300 ${checked ? "opacity-0" : "opacity-100"}`} />
      </div>
    </button>
  );
}
