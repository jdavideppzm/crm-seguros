import { useMemo } from "react";
import { User, Calendar, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";
import type { Lead, PipelineStatus, PipelineStageConfig } from "@/types/crm";
import { DEFAULT_PIPELINE_STAGES } from "@/types/crm";

interface KanbanViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  statusLabels?: Record<string, string>;
  pipelineStages?: PipelineStageConfig[];
}

export function KanbanView({ leads, onSelectLead, statusLabels = {}, pipelineStages }: KanbanViewProps) {
  const stages = pipelineStages || DEFAULT_PIPELINE_STAGES;

  const grouped = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    stages.forEach((s) => (map[s.key] = []));
    leads.forEach((l) => {
      if (map[l.state]) map[l.state].push(l);
      else {
        // Lead has a state not in current stages, put in first column
        if (stages.length > 0) map[stages[0].key].push(l);
      }
    });
    return map;
  }, [leads, stages]);

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const colTotal = (key: string) => (grouped[key] || []).reduce((s, l) => s + l.monto, 0);

  const totalValue = leads.reduce((s, l) => s + l.monto, 0);
  const avgTicket = leads.length ? totalValue / leads.length : 0;
  const wonLeads = leads.filter(l => l.state === "lograr" || l.state === "bienvenida");
  const conversionRate = leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <div className="grid grid-cols-4 gap-3">
          <KpiCard icon={<DollarSign size={16} />} label="Cartera Total" value={formatMonto(totalValue)} color="text-primary" />
          <KpiCard icon={<Target size={16} />} label="Total Leads" value={leads.length.toString()} color="text-status-seguimiento" />
          <KpiCard icon={<TrendingUp size={16} />} label="Tasa Cierre" value={`${conversionRate}%`} color="text-status-lograr" />
          <KpiCard icon={<BarChart3 size={16} />} label="Ticket Promedio" value={formatMonto(avgTicket)} color="text-status-bienvenida" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-4 pt-2">
        <div className="flex gap-3 h-full min-w-max">
          {stages.map((stage) => (
            <div key={stage.key} className="w-[260px] flex flex-col bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                  <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{(grouped[stage.key] || []).length}</span>
                </div>
              </div>
              <p className="px-4 pb-2 text-xs text-muted-foreground">
                Total: {formatMonto(colTotal(stage.key))}
              </p>
              <div className="flex-1 overflow-y-auto kanban-scroll px-2 pb-2 space-y-2">
                {(grouped[stage.key] || []).map((lead) => (
                  <div key={lead.id} onClick={() => onSelectLead(lead)}
                    className="bg-card rounded-lg border border-border p-3.5 cursor-pointer hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {lead.propietario.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate leading-tight">{lead.propietario}</p>
                        <p className="text-[11px] text-muted-foreground">{lead.insurance}</p>
                      </div>
                    </div>
                    {lead.paymentStatus && (
                      <div className="mb-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: getPaymentColor(lead.paymentStatus) + "20", color: getPaymentColor(lead.paymentStatus) }}>
                          {lead.paymentStatus}
                        </span>
                      </div>
                    )}
                    <p className="font-mono text-sm font-semibold text-foreground mb-2" style={{ color: stage.color }}>
                      {formatMonto(lead.monto)}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {lead.assignedTo && <span className="flex items-center gap-1"><User size={11} />{lead.assignedTo.split(" ")[0].toLowerCase()}</span>}
                      <span className="flex items-center gap-1"><Calendar size={11} />{lead.fecha}</span>
                    </div>
                  </div>
                ))}
                {(grouped[stage.key] || []).length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">Sin leads</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-1">
        <span className={color}>{icon}</span>
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

function getPaymentColor(status: string): string {
  const colors: Record<string, string> = {
    "Vendida": "#9CA3AF", "Pagado": "#22C55E", "En proceso": "#EAB308", "No pagado": "#EF4444",
  };
  return colors[status] || "#9CA3AF";
}
