import React from "react";
import { Eye, Check, X, ArrowUpCircle, FileText } from "lucide-react";
import { SectionHeader, ConfigCard, ToggleSwitch } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface GeneralSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

const VIEW_LIST = [
  { key: "pipeline", label: "Pipeline (Tabla)", icon: FileText },
  { key: "kanban", label: "Kanban (Tablero)" },
  { key: "agenda", label: "Agenda (Tareas)" },
  { key: "reports", label: "Reportes (BI)" },
];

export function GeneralSection({ config, updateConfig }: GeneralSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Configuración General" description="Gestiona la visibilidad de módulos, campos y comportamiento global." />

      <ConfigCard title="Módulos Visibles" description="Selecciona qué pestañas estarán disponibles en el menú principal.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {VIEW_LIST.map((view) => (
            <div key={view.key} className="flex items-center justify-between p-4 rounded-[20px] bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-background border border-border shadow-sm group-hover:scale-110 transition-transform ${config.visibleViews[view.key] !== false ? 'text-primary' : 'text-muted-foreground opacity-40'}`}>
                  <Eye size={16} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-tight ${config.visibleViews[view.key] !== false ? 'text-foreground' : 'text-muted-foreground'}`}>{view.label}</span>
              </div>
              <ToggleSwitch 
                checked={config.visibleViews[view.key] !== false} 
                onChange={() => {
                  const nextVisible = { ...config.visibleViews, [view.key]: !config.visibleViews[view.key] };
                  updateConfig({ visibleViews: nextVisible });
                }} 
              />
            </div>
          ))}
        </div>
      </ConfigCard>

      <ConfigCard title="Actualización Automática" description="Sincronizar cambios en tiempo real con la nube (Supabase).">
        <div className="flex items-center justify-between p-4 rounded-[20px] bg-muted/30 border border-border/50">
           <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-background border border-border shadow-sm text-primary">
                 <ArrowUpCircle size={16} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-xs font-bold text-foreground uppercase tracking-tight">Auto-Sincronización</p>
                 <p className="text-[10px] text-muted-foreground font-medium">Recomendado para equipos colaborativos.</p>
              </div>
           </div>
           <ToggleSwitch checked={true} onChange={() => {}} />
        </div>
      </ConfigCard>
    </div>
  );
}
