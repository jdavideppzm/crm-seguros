import { useMemo } from "react";
import { User, Calendar } from "lucide-react";
import type { Lead, PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";

interface KanbanViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const columns: PipelineStatus[] = [
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

const amountColor: Record<PipelineStatus, string> = {
  emitir: "text-status-emitir",
  agendar: "text-status-agendar",
  devolucion: "text-status-devolucion",
  seguimiento: "text-status-seguimiento",
  recolectar: "text-status-recolectar",
  lograr: "text-status-lograr",
  bloqueo: "text-status-bloqueo",
  bienvenida: "text-status-bienvenida",
};

export function KanbanView({ leads, onSelectLead }: KanbanViewProps) {
  const grouped = useMemo(() => {
    const map: Record<PipelineStatus, Lead[]> = {} as any;
    columns.forEach((c) => (map[c] = []));
    leads.forEach((l) => {
      if (map[l.state]) map[l.state].push(l);
    });
    return map;
  }, [leads]);

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const colTotal = (status: PipelineStatus) =>
    grouped[status].reduce((s, l) => s + l.monto, 0);

  return (
    <div className="flex-1 overflow-x-auto p-4">
      <div className="flex gap-3 h-full min-w-max">
        {columns.map((status) => (
          <div key={status} className="w-[260px] flex flex-col bg-secondary/50 rounded-xl">
            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColor[status]}`} />
                <span className="text-sm font-semibold text-foreground">{STATUS_CONFIG[status].label}</span>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{grouped[status].length}</span>
              </div>
            </div>
            <p className="px-4 pb-2 text-xs text-muted-foreground">
              Total: {formatMonto(colTotal(status))}
            </p>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto kanban-scroll px-2 pb-2 space-y-2">
              {grouped[status].map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="bg-card rounded-lg border border-border p-3.5 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {lead.propietario.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate leading-tight">{lead.propietario}</p>
                      <p className="text-[11px] text-muted-foreground">{lead.insurance}</p>
                    </div>
                  </div>

                  <p className={`font-mono text-sm font-semibold ${amountColor[status]} mb-2`}>
                    {formatMonto(lead.monto)}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {lead.assignedTo && (
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {lead.assignedTo.split(" ")[0].toLowerCase()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {lead.fecha}
                    </span>
                  </div>
                </div>
              ))}
              {grouped[status].length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">Sin leads</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
