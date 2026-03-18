import { BarChart3, Filter, LayoutGrid, Users } from "lucide-react";
import type { PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";

interface CrmSidebarProps {
  activeView: "pipeline" | "reports";
  onViewChange: (view: "pipeline" | "reports") => void;
  statusFilter: PipelineStatus | null;
  onStatusFilter: (status: PipelineStatus | null) => void;
  statusCounts: Record<PipelineStatus, number>;
  totalLeads: number;
}

const statusOrder: PipelineStatus[] = [
  "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

export function CrmSidebar({ activeView, onViewChange, statusFilter, onStatusFilter, statusCounts, totalLeads }: CrmSidebarProps) {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card h-screen flex flex-col">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-border">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">SheetFlow CRM</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{totalLeads} leads activos</p>
      </div>

      {/* Navigation */}
      <nav className="px-2 py-3 space-y-0.5">
        <button
          onClick={() => onViewChange("pipeline")}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            activeView === "pipeline" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <LayoutGrid size={15} />
          Pipeline
        </button>
        <button
          onClick={() => onViewChange("reports")}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
            activeView === "reports" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BarChart3 size={15} />
          Reportes
        </button>
      </nav>

      {/* Status Filters */}
      <div className="px-2 py-3 border-t border-border">
        <div className="flex items-center gap-1.5 px-3 mb-2">
          <Filter size={12} className="text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estados</span>
        </div>
        <button
          onClick={() => onStatusFilter(null)}
          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
            statusFilter === null ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>Todos</span>
          <span className="font-mono text-xs">{totalLeads}</span>
        </button>
        {statusOrder.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilter(status)}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors ${
              statusFilter === status ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{STATUS_CONFIG[status].label}</span>
            <span className="font-mono text-xs">{statusCounts[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Users size={12} className="text-primary" />
          </div>
          <span className="text-xs text-muted-foreground">Google Sheets Sync</span>
        </div>
      </div>
    </aside>
  );
}
