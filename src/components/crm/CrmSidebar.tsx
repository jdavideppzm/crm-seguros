import { BarChart3, LayoutGrid, Table2, Users, Bell, Search } from "lucide-react";
import type { PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";

interface CrmSidebarProps {
  activeView: "pipeline" | "kanban" | "reports";
  onViewChange: (view: "pipeline" | "kanban" | "reports") => void;
  statusFilter: PipelineStatus | null;
  onStatusFilter: (status: PipelineStatus | null) => void;
  statusCounts: Record<PipelineStatus, number>;
  totalLeads: number;
}

const statusOrder: PipelineStatus[] = [
  "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

const statusDotColor: Record<PipelineStatus, string> = {
  emitir: "bg-status-emitir",
  agendar: "bg-status-agendar",
  devolucion: "bg-status-devolucion",
  seguimiento: "bg-status-seguimiento",
  recolectar: "bg-status-recolectar",
  lograr: "bg-status-lograr",
  bloqueo: "bg-status-bloqueo",
  bienvenida: "bg-status-bienvenida",
};

export function CrmSidebar({ activeView, onViewChange, statusFilter, onStatusFilter, statusCounts, totalLeads }: CrmSidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-sidebar-dark-bg h-screen flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-dark-active flex items-center justify-center">
            <LayoutGrid size={16} className="text-sidebar-dark-bright" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-dark-bright leading-tight">SheetFlow</h1>
            <p className="text-[11px] text-sidebar-dark-fg leading-tight">Gestión de cartera</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        <NavItem icon={<Table2 size={16} />} label="Pipeline" active={activeView === "pipeline"} onClick={() => onViewChange("pipeline")} />
        <NavItem icon={<LayoutGrid size={16} />} label="Kanban" active={activeView === "kanban"} onClick={() => onViewChange("kanban")} />
        <NavItem icon={<BarChart3 size={16} />} label="Reportes" active={activeView === "reports"} onClick={() => onViewChange("reports")} />
      </nav>

      {/* Status Filters */}
      <div className="px-3 mt-6">
        <p className="px-3 mb-2 text-[11px] font-semibold text-sidebar-dark-fg uppercase tracking-widest">Filtros</p>
        <button
          onClick={() => onStatusFilter(null)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
            statusFilter === null ? "bg-sidebar-dark-hover text-sidebar-dark-bright" : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
          }`}
        >
          <span>Todos</span>
          <span className="font-mono text-[11px] opacity-60">{totalLeads}</span>
        </button>
        {statusOrder.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilter(status)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[13px] transition-colors ${
              statusFilter === status ? "bg-sidebar-dark-hover text-sidebar-dark-bright" : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${statusDotColor[status]}`} />
              {STATUS_CONFIG[status].label}
            </span>
            <span className="font-mono text-[11px] opacity-60">{statusCounts[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 border-t border-sidebar-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-sidebar-dark-active flex items-center justify-center text-[11px] font-semibold text-sidebar-dark-bright">
            U
          </div>
          <div>
            <p className="text-xs text-sidebar-dark-bright leading-tight">Usuario</p>
            <p className="text-[11px] text-sidebar-dark-fg leading-tight">Sheets conectado</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
        active
          ? "bg-sidebar-dark-active text-sidebar-dark-bright shadow-sm"
          : "text-sidebar-dark-fg hover:bg-sidebar-dark-hover hover:text-sidebar-dark-bright"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
