import { BarChart3, CalendarDays, LayoutGrid, Table2, Settings, Plus, Bell, Eye } from "lucide-react";
import type { PipelineStatus, PipelineStageConfig, SmartView, CompanyInfo } from "@/types/crm";
import { DEFAULT_PIPELINE_STAGES } from "@/types/crm";

type ViewType = "pipeline" | "kanban" | "reports" | "agenda" | "settings" | "alerts";

interface CrmSidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  statusFilter: PipelineStatus | null;
  onStatusFilter: (status: PipelineStatus | null) => void;
  statusCounts: Record<PipelineStatus, number>;
  totalLeads: number;
  scheduledCount?: number;
  visibleViews?: Record<string, boolean>;
  statusLabels?: Record<string, string>;
  onCreateLead?: () => void;
  pipelineStages?: PipelineStageConfig[];
  alertCount?: number;
  smartViews?: SmartView[];
  activeSmartViewId?: string | null;
  onSelectSmartView?: (id: string | null) => void;
  companyInfo?: CompanyInfo;
}

export function CrmSidebar({ activeView, onViewChange, statusFilter, onStatusFilter, statusCounts, totalLeads, scheduledCount = 0, visibleViews = {}, statusLabels = {}, onCreateLead, pipelineStages, alertCount = 0, smartViews = [], activeSmartViewId, onSelectSmartView, companyInfo }: CrmSidebarProps) {
  const stages = pipelineStages || DEFAULT_PIPELINE_STAGES;

  return (
    <aside className="w-56 shrink-0 bg-sidebar-dark-bg h-screen flex flex-col">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          {companyInfo?.logoUrl ? (
            <img src={companyInfo.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-sidebar-dark-active flex items-center justify-center">
              <LayoutGrid size={16} className="text-sidebar-dark-bright" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-semibold text-sidebar-dark-bright leading-tight">{companyInfo?.name || "SheetFlow"}</h1>
            <p className="text-[11px] text-sidebar-dark-fg leading-tight">Gestión de cartera</p>
          </div>
        </div>
      </div>

      {onCreateLead && (
        <div className="px-3 mb-2">
          <button onClick={onCreateLead}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sidebar-dark-active text-sidebar-dark-bright text-xs font-medium hover:bg-primary/80 transition-colors">
            <Plus size={14} /> Nuevo Lead
          </button>
        </div>
      )}

      <nav className="px-3 space-y-0.5">
        {visibleViews["pipeline"] !== false && <NavItem icon={<Table2 size={16} />} label="Pipeline" active={activeView === "pipeline"} onClick={() => onViewChange("pipeline")} />}
        {visibleViews["kanban"] !== false && <NavItem icon={<LayoutGrid size={16} />} label="Kanban" active={activeView === "kanban"} onClick={() => onViewChange("kanban")} />}
        {visibleViews["agenda"] !== false && <NavItem icon={<CalendarDays size={16} />} label="Agenda" active={activeView === "agenda"} badge={scheduledCount > 0 ? scheduledCount : undefined} />}
        {visibleViews["reports"] !== false && <NavItem icon={<BarChart3 size={16} />} label="Reportes" active={activeView === "reports"} onClick={() => onViewChange("reports")} />}
        {visibleViews["alerts"] !== false && <NavItem icon={<Bell size={16} />} label="Alertas" active={activeView === "alerts"} onClick={() => onViewChange("alerts")} badge={alertCount > 0 ? alertCount : undefined} />}
        <div className="pt-2 mt-2 border-t border-sidebar-dark-border">
          <NavItem icon={<Settings size={16} />} label="Configuración" active={activeView === "settings"} onClick={() => onViewChange("settings")} />
        </div>
      </nav>

      <div className="px-3 mt-6 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold text-sidebar-dark-fg uppercase tracking-widest">Filtros</p>
        <button onClick={() => onStatusFilter(null)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${statusFilter === null && !activeSmartViewId ? "bg-sidebar-dark-hover text-sidebar-dark-bright" : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"}`}>
          <span>Todos</span>
          <span className="font-mono text-[11px] opacity-60">{totalLeads}</span>
        </button>
        {stages.map((stage) => (
          <button key={stage.key} onClick={() => onStatusFilter(stage.key)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${statusFilter === stage.key ? "bg-sidebar-dark-hover text-sidebar-dark-bright" : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"}`}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
              {stage.label}
            </span>
            <span className="font-mono text-[11px] opacity-60">{statusCounts[stage.key] || 0}</span>
          </button>
        ))}

        {/* Smart Views */}
        {smartViews.length > 0 && (
          <div className="mt-4">
            <p className="px-3 mb-2 text-[11px] font-semibold text-sidebar-dark-fg uppercase tracking-widest flex items-center gap-1.5">
              <Eye size={10} /> Smart Views
            </p>
            {smartViews.map((sv) => (
              <button
                key={sv.id}
                onClick={() => onSelectSmartView?.(activeSmartViewId === sv.id ? null : sv.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                  activeSmartViewId === sv.id
                    ? "bg-sidebar-dark-hover text-sidebar-dark-bright"
                    : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
                }`}
              >
                <span>{sv.icon}</span>
                <span className="truncate">{sv.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-auto px-5 py-4 border-t border-sidebar-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sidebar-dark-active flex items-center justify-center text-[11px] font-semibold text-sidebar-dark-bright">U</div>
          <div>
            <p className="text-xs text-sidebar-dark-bright leading-tight">Usuario</p>
            <p className="text-[11px] text-sidebar-dark-fg leading-tight">Sheets conectado</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick?: () => void; badge?: number }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${active ? "bg-sidebar-dark-active text-sidebar-dark-bright shadow-sm" : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1">{badge}</span>
      )}
    </button>
  );
}
