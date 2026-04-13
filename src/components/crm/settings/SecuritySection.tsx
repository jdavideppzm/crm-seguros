import React, { useState } from "react";
import { History, Check, Shield, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface SecuritySectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

export function SecuritySection({ config, updateConfig }: SecuritySectionProps) {
  const [showLogs, setShowLogs] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const handleSetPin = () => {
    if (pinInput.length === 4) {
      updateConfig({ securityPin: pinInput });
      setPinInput("");
      toast.success("PIN de seguridad actualizado");
    } else {
      toast.error("El PIN debe ser de 4 dígitos");
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Seguridad y Acceso" description="Configura el acceso al panel y revisa los registros de actividad." />
      
      <ConfigCard title="PIN de Acceso" description="Solicitar un código para entrar a la configuración (demo).">
        <div className="flex items-center gap-4">
          <input 
            type="password" 
            maxLength={4} 
            placeholder="****" 
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
            className="w-24 text-center text-lg font-bold py-2 bg-muted/40 border border-border rounded-xl tracking-[0.5em] focus:ring-primary/40 outline-none" 
          />
          <button 
            onClick={handleSetPin}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-95"
          >
            Establecer PIN
          </button>
          {config.securityPin && (
             <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold uppercase">
                <Check size={12} /> PIN Activo
             </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 italic">
           Actual: {config.securityPin ? "••••" : "No establecido"}. Este PIN protege el acceso a configuraciones críticas.
        </p>
      </ConfigCard>

      <ConfigCard title="Registro de Actividad" description="Últimos eventos realizados en el sistema.">
        <button onClick={() => setShowLogs(!showLogs)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted border border-border text-xs font-medium hover:bg-muted/80 transition-all">
          <History size={14} /> {showLogs ? "Ocultar historial" : "Ver historial completo"}
        </button>
        {showLogs && (
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {(config.activityLogs || []).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-muted/20 border border-border/50 text-[11px] group hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                     {log.action}
                  </span>
                  <span className="text-[9px] text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">{log.createdAt}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{log.details}</p>
                <p className="text-[9px] mt-1 font-semibold uppercase opacity-40">Por {log.userName}</p>
              </div>
            ))}
            {(!config.activityLogs || config.activityLogs.length === 0) && (
              <div className="py-12 text-center">
                 <p className="text-xs text-muted-foreground">No hay registros de actividad aún.</p>
              </div>
            )}
          </div>
        )}
      </ConfigCard>

      <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/20 mt-8">
        <h4 className="text-sm font-bold text-destructive flex items-center gap-2 mb-1">
          <AlertCircle size={16} /> Zona de Peligro
        </h4>
        <p className="text-xs text-muted-foreground mb-4">Estas acciones borrarán datos permanentemente de la nube.</p>
        <button 
           onClick={() => alert("Función protegida por administrador principal.")}
           className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-all"
        >
          Borrar todos los leads
        </button>
      </div>
    </div>
  );
}
