import { useState, lazy, Suspense } from "react";
import { UserManagement } from "./UserManagement";
import * as Icons from "lucide-react";
import { 
  Settings, Save, History, ChevronRight 
} from "lucide-react";
import { exportBackup } from "@/utils/backup";
import { toast } from "sonner";
import { SmartViewsSettings } from "./SmartViewsPanel";

// New segmented components
import { GeneralSection } from "./settings/GeneralSection";
import { CompanySection } from "./settings/CompanySection";
import { CustomizationSection } from "./settings/CustomizationSection";
import { PipelineSection } from "./settings/PipelineSection";
import { InsurersSection } from "./settings/InsurersSection";
import { PoliciesSection } from "./settings/PoliciesSection";
import { OriginsSection } from "./settings/OriginsSection";
import { PaymentsSection } from "./settings/PaymentsSection";
import { AutomationSection } from "./settings/AutomationSection";
import { ChecklistSection } from "./settings/ChecklistSection";
import { SecuritySection } from "./settings/SecuritySection";
import { BulkImportSection } from "./settings/BulkImportSection";
import type { CrmConfig } from "@/types/crm";

interface SettingsViewProps {
  config: CrmConfig;
  onUpdateConfig: (config: CrmConfig) => void;
}

type SettingsSection = 
  | "general" | "company" | "customization" | "users" | "pipeline" 
  | "insurers" | "policies" | "origins" | "payments" | "automations" 
  | "smartviews" | "checklist" | "security" | "bulkimport";

/**
 * Helper to render Lucide icons by name safely
 */
function DynamicIcon({ name, size = 18, className = "" }: { name: string; size?: number; className?: string }) {
  const Icon = (Icons as any)[name];
  if (!Icon) return <Settings size={size} className={className} />;
  return <Icon size={size} className={className} />;
}

const SETTINGS_SECTIONS: { key: SettingsSection; label: string; iconName: string; description: string }[] = [
  { key: "general", label: "General", iconName: "Settings", description: "Visibilidad y módulos" },
  { key: "company", label: "Datos de la empresa", iconName: "Building2", description: "Identidad corporativa" },
  { key: "customization", label: "Personalización", iconName: "Palette", description: "Colores y temas" },
  { key: "users", label: "Usuarios y permisos", iconName: "Users", description: "Equipo y accesos" },
  { key: "pipeline", label: "Pipeline de ventas", iconName: "Table2", description: "Etapas comerciales" },
  { key: "insurers", label: "Aseguradoras", iconName: "Shield", description: "Catálogo y comisiones" },
  { key: "policies", label: "Tipos de póliza", iconName: "FileText", description: "Productos y ramos" },
  { key: "origins", label: "Origen de leads", iconName: "MapPin", description: "Canales de marketing" },
  { key: "payments", label: "Estados de pago", iconName: "CreditCard", description: "Semáforo comercial" },
  { key: "automations", label: "Automatizaciones", iconName: "Zap", description: "Reglas inteligentes" },
  { key: "smartviews", label: "Smart Views", iconName: "Eye", description: "Vistas personalizadas" },
  { key: "checklist", label: "Checklist emisión", iconName: "Check", description: "Requisitos de cierre" },
  { key: "bulkimport", label: "Importación Masiva", iconName: "Upload", description: "Carga desde Excel" },
  { key: "security", label: "Seguridad y Respaldo", iconName: "ShieldCheck", description: "PIN y Logs" },
];

export function SettingsView({ config, onUpdateConfig }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [isDirty, setIsDirty] = useState(false);
  const [localConfig, setLocalConfig] = useState<CrmConfig>(config);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string; onConfirm: () => void } | null>(null);

  const updateConfig = (partial: Partial<CrmConfig>) => {
    setLocalConfig({ ...localConfig, ...partial });
    setIsDirty(true);
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
    setIsDirty(false);
    toast.success("Configuración guardada correctamente");
  };

  const handleDiscard = () => {
    setLocalConfig(config);
    setIsDirty(false);
    toast.info("Cambios descartados");
  };

  const groups = [
    { label: "Empresa", keys: ["company", "customization", "general"] },
    { label: "Comercial", keys: ["pipeline", "insurers", "policies", "origins", "payments"] },
    { label: "Operaciones", keys: ["automations", "smartviews", "checklist", "bulkimport"] },
    { label: "Sistema", keys: ["users", "security"] },
  ];

  const renderContent = () => {
    const props = { config: localConfig, updateConfig, setConfirmDelete };
    
    switch (activeSection) {
      case "general": return <GeneralSection config={localConfig} updateConfig={updateConfig} />;
      case "company": return <CompanySection config={localConfig} updateConfig={updateConfig} />;
      case "customization": return <CustomizationSection config={localConfig} updateConfig={updateConfig} />;
      case "users": return <UserManagement config={localConfig} updateConfig={updateConfig} />;
      case "pipeline": return <PipelineSection {...props} />;
      case "insurers": return <InsurersSection {...props} />;
      case "policies": return <PoliciesSection {...props} />;
      case "origins": return <OriginsSection {...props} />;
      case "payments": return <PaymentsSection {...props} />;
      case "automations": return <AutomationSection {...props} />;
      case "smartviews": return (
        <SmartViewsSettings 
          smartViews={localConfig.smartViews || []} 
          onUpdate={(views) => updateConfig({ smartViews: views })} 
          pipelineStages={localConfig.pipelineStages || []} 
        />
      );
      case "checklist": return <ChecklistSection {...props} />;
      case "bulkimport": return <BulkImportSection config={localConfig} updateConfig={updateConfig} />;
      case "security": return <SecuritySection config={localConfig} updateConfig={updateConfig} />;
      default: return null;
    }
  };

  if (!config) return null;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground uppercase tracking-tight">Panel de Configuración</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Auditoría y Gestión de Infraestructura CRM</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
              <button onClick={handleDiscard} className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">Descartar</button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Save size={14} /> Guardar Cambios
              </button>
            </div>
          )}
          
          <div className="hidden md:flex items-center gap-2 ml-4">
            <button onClick={() => exportBackup(localConfig)} title="Copia de Seguridad" className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-primary transition-all">
              <History size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <div className="w-80 border-r border-border bg-card/30 flex flex-col overflow-y-auto custom-scrollbar p-6">
          {groups.map((group, gIdx) => (
            <div key={group.label} className={gIdx > 0 ? "mt-8" : ""}>
              <p className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 opacity-50">{group.label}</p>
              <div className="space-y-1">
                {group.keys.map((key) => {
                  const item = SETTINGS_SECTIONS.find(s => s.key === key)!;
                  const isActive = activeSection === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key as SettingsSection)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[1.25rem] transition-all group ${
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <DynamicIcon name={item.iconName} className={`shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="text-[11px] font-black uppercase tracking-tight truncate">{item.label}</p>
                        <p className={`text-[9px] font-medium truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{item.description}</p>
                      </div>
                      {isActive && <ChevronRight size={14} className="animate-in slide-in-from-left-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 bg-gradient-to-br from-background via-background to-primary/5">
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-700">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-2">{confirmDelete.title}</h3>
            <p className="text-sm text-muted-foreground mb-8">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => { confirmDelete.onConfirm(); setConfirmDelete(null); }}
                className="flex-1 py-3 rounded-2xl bg-destructive text-white text-xs font-black uppercase tracking-widest"
              >
                Eliminar
              </button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground text-xs font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
