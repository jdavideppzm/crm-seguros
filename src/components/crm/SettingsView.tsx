import { useState } from "react";
import {
  Settings, Table2, LayoutGrid, BarChart3, CalendarDays,
  Plus, X, Eye, EyeOff, GripVertical, Save,
} from "lucide-react";

interface SettingsViewProps {
  visibleViews: Record<string, boolean>;
  onToggleView: (view: string) => void;
  customReportSections: CustomReportSection[];
  onUpdateReportSections: (sections: CustomReportSection[]) => void;
}

export interface CustomReportSection {
  id: string;
  title: string;
  type: "bar" | "pie" | "table" | "metric";
  groupBy: string;
  visible: boolean;
}

const VIEW_LIST = [
  { key: "pipeline", label: "Pipeline", icon: Table2 },
  { key: "kanban", label: "Kanban", icon: LayoutGrid },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "reports", label: "Reportes", icon: BarChart3 },
];

const GROUP_BY_OPTIONS = [
  { value: "state", label: "Estado" },
  { value: "assignedTo", label: "Responsable" },
  { value: "lugar", label: "Ciudad" },
  { value: "tipoSeguro", label: "Tipo de seguro" },
  { value: "insurance", label: "Aseguradora" },
];

const CHART_TYPES = [
  { value: "bar", label: "📊 Barras" },
  { value: "pie", label: "🥧 Circular" },
  { value: "table", label: "📋 Tabla" },
  { value: "metric", label: "📈 Métrica" },
];

export function SettingsView({ visibleViews, onToggleView, customReportSections, onUpdateReportSections }: SettingsViewProps) {
  const [adding, setAdding] = useState(false);
  const [newSection, setNewSection] = useState<Partial<CustomReportSection>>({
    type: "bar",
    groupBy: "state",
  });

  const handleAddSection = () => {
    if (!newSection.title?.trim()) return;
    const section: CustomReportSection = {
      id: Date.now().toString(),
      title: newSection.title.trim(),
      type: (newSection.type || "bar") as any,
      groupBy: newSection.groupBy || "state",
      visible: true,
    };
    onUpdateReportSections([...customReportSections, section]);
    setNewSection({ type: "bar", groupBy: "state" });
    setAdding(false);
  };

  const toggleSection = (id: string) => {
    onUpdateReportSections(
      customReportSections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const removeSection = (id: string) => {
    onUpdateReportSections(customReportSections.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Settings size={20} />
          Configuración
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Personaliza las vistas y secciones del CRM.</p>
      </div>

      {/* Visible Views */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Vistas visibles</h3>
        <p className="text-xs text-muted-foreground mb-4">Activa o desactiva las secciones del sidebar.</p>
        <div className="space-y-2">
          {VIEW_LIST.map((view) => {
            const Icon = view.icon;
            const isVisible = visibleViews[view.key] !== false;
            return (
              <div key={view.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Icon size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{view.label}</span>
                </div>
                <button
                  onClick={() => onToggleView(view.key)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    isVisible ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${
                    isVisible ? "left-5" : "left-0.5"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Report Sections */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Secciones de Reportes</h3>
            <p className="text-xs text-muted-foreground mt-1">Crea gráficos y métricas personalizadas.</p>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={12} /> Nueva sección
          </button>
        </div>

        {/* Existing sections */}
        <div className="space-y-2">
          {customReportSections.map((section) => (
            <div key={section.id} className="flex items-center justify-between py-2 px-3 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2.5">
                <GripVertical size={14} className="text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">{section.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {CHART_TYPES.find((c) => c.value === section.type)?.label} · Agrupado por {GROUP_BY_OPTIONS.find((g) => g.value === section.groupBy)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleSection(section.id)} className="p-1 rounded hover:bg-muted transition-colors">
                  {section.visible ? <Eye size={13} className="text-primary" /> : <EyeOff size={13} className="text-muted-foreground" />}
                </button>
                <button onClick={() => removeSection(section.id)} className="p-1 rounded hover:bg-destructive/10 transition-colors">
                  <X size={13} className="text-destructive" />
                </button>
              </div>
            </div>
          ))}

          {customReportSections.length === 0 && !adding && (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No hay secciones personalizadas aún.</p>
              <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline mt-1">
                + Crear primera sección
              </button>
            </div>
          )}
        </div>

        {/* Add form */}
        {adding && (
          <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground">Nueva sección de reporte</span>
              <button onClick={() => setAdding(false)} className="text-muted-foreground hover:text-foreground">
                <X size={12} />
              </button>
            </div>

            <input
              placeholder="Nombre de la sección"
              value={newSection.title || ""}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Tipo</label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value as any })}
                  className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
                >
                  {CHART_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Agrupar por</label>
                <select
                  value={newSection.groupBy}
                  onChange={(e) => setNewSection({ ...newSection, groupBy: e.target.value })}
                  className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
                >
                  {GROUP_BY_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddSection}
              disabled={!newSection.title?.trim()}
              className="w-full text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              Crear sección
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
