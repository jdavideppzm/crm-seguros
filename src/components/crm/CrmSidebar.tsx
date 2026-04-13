import { useState } from "react";
import { BarChart3, CalendarDays, LayoutGrid, Table2, Settings, Plus, Bell, Eye, ChevronDown, ChevronRight, Shield, Users, Trash2, Filter, MessageSquare, Landmark, ShieldCheck } from "lucide-react";
import type { Lead, PipelineStatus, PipelineStageConfig, SmartView, CompanyInfo } from "@/types/crm";
import { DEFAULT_PIPELINE_STAGES } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";
import { JedaelLogo } from "../auth/JedaelLogo";
import { PermissionGuard } from "./PermissionGuard";

type ViewType = "pipeline" | "kanban" | "clients" | "reports" | "agenda" | "settings" | "alerts" | "dashboard" | "renewals" | "communications" | "commissions";

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
  onRedistributeLeads?: (leadIds: string[], user: string) => void;
  onBulkUpdateLeads?: (leadIds: string[], updates: Partial<Lead>) => void;
  onBulkDeleteLeads?: (leadIds: string[]) => void;
  onCreateSmartView?: (view: SmartView) => void;
  onUpdateSmartViews?: (views: SmartView[]) => void;
  onCreateLead?: () => void;
  pipelineStages?: PipelineStageConfig[];
  alertCount?: number;
  smartViews?: SmartView[];
  activeSmartViewId?: string | null;
  onSelectSmartView?: (id: string | null) => void;
  companyInfo?: CompanyInfo;
  leads?: Lead[];
  logoUrl?: string;
}

export function CrmSidebar({
  activeView, onViewChange, statusFilter, onStatusFilter, statusCounts,
  totalLeads, scheduledCount = 0, visibleViews = {}, onCreateLead,
  pipelineStages, alertCount = 0, smartViews = [], activeSmartViewId,
  onSelectSmartView, companyInfo, onUpdateSmartViews, leads = [], logoUrl,
}: CrmSidebarProps) {
  const stages = pipelineStages || DEFAULT_PIPELINE_STAGES;
  const { displayName, signOut, isAdmin } = useAuth();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [smartViewsOpen, setSmartViewsOpen] = useState(true);

  // Lead count per Smart View
  const smartViewCounts = smartViews.reduce<Record<string, number>>((acc, sv) => {
    acc[sv.id] = leads.filter(l => {
      if (sv.filterType === "status") return l.state === sv.filterValue;
      if (sv.filterType === "assigned") return l.assignedTo === sv.filterValue;
      if (sv.filterType === "field") {
        const field = sv.filterField;
        const val = sv.filterValue;
        if (field === "expirationDate" && val === "incoming") {
          if (!l.expirationDate) return false;
          const diff = (new Date(l.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 30;
        }
        if (field === "smartCategory") return l.smartCategory === sv.id || l.smartCategory === sv.name;
        if (field) return (l as any)[field] === val;
      }
      return false;
    }).length;
    return acc;
  }, {});

  return (
    <aside className="w-60 shrink-0 bg-[#0F1115] h-screen flex flex-col border-r border-[#1E2228] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo / Brand */}
      <div className="px-6 py-7 relative z-10">
        <div className="flex items-center gap-3.5 group cursor-default">
          <div className="relative">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-contain border border-white/10 shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <JedaelLogo className="w-full h-full" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F1115]" title="Sistema Activo" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-black text-white leading-none uppercase tracking-tight mb-1">{companyInfo?.name || "Jedael"}</h1>
            <p className="text-[9px] text-sidebar-dark-fg flex items-center gap-1.5 leading-none font-black opacity-40 uppercase tracking-[0.15em]">
              <Shield size={9} className="text-primary/70" /> {isAdmin ? "ADMN" : "CRM"} COMPASS
            </p>
          </div>
        </div>
      </div>

      {/* New Lead Button */}
      <div className="px-4 mb-5">
        <button
          onClick={onCreateLead}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all duration-200 hover:border-primary/30 hover:scale-[1.02] active:scale-95 shadow-lg group"
        >
          <div className="p-1 rounded-md bg-primary/10 text-primary group-hover:bg-primary transition-colors group-hover:text-white">
            <Plus size={11} strokeWidth={3} />
          </div>
          <span>Nuevo Registro</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">

        {/* === MAIN NAV === */}
        <nav className="px-3 space-y-0.5 pb-2">
          <NavItem icon={<LayoutGrid size={16} />} label="Vancentral Dashboard" active={activeView === "dashboard"} onClick={() => onViewChange("dashboard")} />

          {/* Section: Gestión de Datos */}
          <SectionLabel>Gestión de Datos</SectionLabel>
          {visibleViews["pipeline"] !== false && <NavItem icon={<Table2 size={16} />} label={isAdmin ? "Pipeline Maestro" : "Pipeline"} active={activeView === "pipeline"} onClick={() => onViewChange("pipeline")} />}
          {visibleViews["kanban"] !== false && <NavItem icon={<LayoutGrid size={16} />} label="Vista Kanban" active={activeView === "kanban"} onClick={() => onViewChange("kanban")} />}
          <NavItem icon={<Users size={16} />} label="Clientes" active={activeView === "clients"} onClick={() => onViewChange("clients")} />
          <NavItem icon={<Landmark size={16} />} label="Conciliación" active={activeView === "commissions"} onClick={() => onViewChange("commissions")} />
          <NavItem 
            icon={<CalendarDays size={16} />} 
            label="Renovaciones" 
            active={activeView === "renewals"} 
            onClick={() => onViewChange("renewals")} 
            badge={leads.filter(l => {
              const wonStage = stages.find(s => s.finalType === "ganado");
              if (!wonStage || l.state !== wonStage.key) return false;
              if (!l.expirationDate) return false;
              const diff = (new Date(l.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
              return diff >= 0 && diff <= 30;
            }).length || undefined}
          />
          {visibleViews["agenda"] !== false && <NavItem icon={<CalendarDays size={16} />} label="Agenda Global" active={activeView === "agenda"} onClick={() => onViewChange("agenda")} badge={scheduledCount > 0 ? scheduledCount : undefined} />}

          {/* Section: Inteligencia */}
          <SectionLabel>Inteligencia</SectionLabel>
          <NavItem icon={<MessageSquare size={16} />} label="Comunicaciones" active={activeView === "communications"} onClick={() => onViewChange("communications")} />
          {visibleViews["reports"] !== false && <NavItem icon={<BarChart3 size={16} />} label="Análisis Avanzado" active={activeView === "reports"} onClick={() => onViewChange("reports")} />}
          {visibleViews["alerts"] !== false && <NavItem icon={<Bell size={16} />} label="Centro de Alertas" active={activeView === "alerts"} onClick={() => onViewChange("alerts")} badge={alertCount > 0 ? alertCount : undefined} />}

          {/* Sistema - Settings moved to footer area */}
        </nav>

        {/* === FILTROS === */}
        <div className="mt-1 border-t border-white/[0.06]">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full flex items-center gap-2 px-5 py-2.5 group transition-colors hover:bg-white/[0.03]"
          >
            <Filter size={9} className="text-muted-foreground/40 shrink-0" />
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex-1 text-left">Filtros</span>
            {filtersOpen
              ? <ChevronDown size={10} className="text-muted-foreground/30 shrink-0" />
              : <ChevronRight size={10} className="text-muted-foreground/30 shrink-0" />
            }
          </button>

          {filtersOpen && (
            <div className="px-3 pb-2 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              {/* Todos */}
              <button
                onClick={() => onStatusFilter(null)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                  statusFilter === null && !activeSmartViewId
                    ? "bg-white/10 text-white"
                    : "text-sidebar-dark-fg hover:bg-white/5 hover:text-sidebar-dark-bright"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                  Todos
                </span>
                <span className="font-mono text-[10px] opacity-50">{totalLeads}</span>
              </button>

              {/* Per-stage filters */}
              {stages.map((stage) => (
                <button
                  key={stage.key}
                  onClick={() => onStatusFilter(stage.key)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    statusFilter === stage.key
                      ? "bg-white/10 text-white"
                      : "text-sidebar-dark-fg hover:bg-white/5 hover:text-sidebar-dark-bright"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="truncate">{stage.label}</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-50 shrink-0">{statusCounts[stage.key] || 0}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === SMART VIEWS === */}
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setSmartViewsOpen(!smartViewsOpen)}
            className="w-full flex items-center gap-2 px-5 py-2.5 group transition-colors hover:bg-white/[0.03]"
          >
            <Eye size={9} className="text-primary/50 shrink-0" />
            <span className="text-[9px] font-black text-primary/50 uppercase tracking-[0.2em] flex-1 text-left">Smart Views</span>
            <span className="text-[9px] font-black bg-primary/10 text-primary/60 px-1.5 py-0.5 rounded-md shrink-0">{smartViews.length}</span>
            {smartViewsOpen
              ? <ChevronDown size={10} className="text-primary/30 shrink-0" />
              : <ChevronRight size={10} className="text-primary/30 shrink-0" />
            }
          </button>

          {smartViewsOpen && (
            <div className="px-3 pb-3 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
              {smartViews.length === 0 && (
                <p className="text-[10px] text-sidebar-dark-fg/40 px-3 py-3 text-center italic leading-relaxed">
                  Sin vistas creadas.<br />Selecciona leads en el Pipeline.
                </p>
              )}
              {smartViews.map((sv) => {
                const count = smartViewCounts[sv.id] ?? 0;
                const isActive = activeSmartViewId === sv.id;
                return (
                  <div
                    key={sv.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectSmartView?.(isActive ? null : sv.id)}
                    onKeyDown={(e) => e.key === "Enter" && onSelectSmartView?.(isActive ? null : sv.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 group/sv cursor-pointer ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20"
                        : "text-sidebar-dark-fg hover:bg-white/5 hover:text-sidebar-dark-bright border border-transparent"
                    }`}
                  >
                    <span className="text-sm shrink-0 leading-none">{sv.icon}</span>
                    <span className="truncate flex-1 text-left text-[11px]">{sv.name}</span>
                    <span className={`text-[9px] font-black font-mono px-1 py-0.5 rounded shrink-0 ${
                      isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-sidebar-dark-fg/40"
                    }`}>{count}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar Smart View "${sv.name}"?`)) {
                          onUpdateSmartViews?.(smartViews.filter(v => v.id !== sv.id));
                        }
                      }}
                      className="p-1 rounded opacity-0 group-hover/sv:opacity-100 hover:bg-destructive/10 hover:text-destructive text-destructive/40 transition-all shrink-0"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Panel de Control — at the bottom */}
      <PermissionGuard section="settings" fallback={null}>
        <div className="px-3 pt-4 pb-6 border-t border-[#1E2228]">
          <NavItem icon={<Settings size={16} />} label="Panel de Control" active={activeView === "settings"} onClick={() => onViewChange("settings")} />
        </div>
      </PermissionGuard>
    </aside>
  );
}

// Section label — same premium look as "Gestión de Datos" / "Inteligencia"
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1 px-3">
      <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{children}</p>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active: boolean; onClick?: () => void; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-sidebar-dark-active text-sidebar-dark-bright shadow-sm"
          : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
      }`}
    >
      {icon}
      <span className="flex-1 text-left truncate">{label}</span>
      {badge !== undefined && (
        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white px-1 shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
}
