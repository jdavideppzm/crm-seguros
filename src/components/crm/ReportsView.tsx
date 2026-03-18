import type { Lead, PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

interface ReportsViewProps {
  leads: Lead[];
}

export function ReportsView({ leads }: ReportsViewProps) {
  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const aggregate = (key: (l: Lead) => string) =>
    Object.entries(
      leads.reduce<Record<string, { count: number; total: number }>>((acc, l) => {
        const k = key(l) || "N/A";
        if (!acc[k]) acc[k] = { count: 0, total: 0 };
        acc[k].count++;
        acc[k].total += l.monto;
        return acc;
      }, {})
    ).sort((a, b) => b[1].total - a[1].total);

  const totalMonto = leads.reduce((s, l) => s + l.monto, 0);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Leads" value={leads.length.toString()} />
        <SummaryCard label="Cartera Total" value={formatMonto(totalMonto)} />
        <SummaryCard label="Ticket Promedio" value={formatMonto(leads.length ? totalMonto / leads.length : 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard title="Por Estado">
          {aggregate((l) => l.state).map(([status, data]) => (
            <div key={status} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <StatusBadge status={status as PipelineStatus} />
                <span className="text-xs text-muted-foreground">{data.count}</span>
              </div>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        <ReportCard title="Por Responsable">
          {aggregate((l) => l.assignedTo || "Sin asignar").map(([name, data]) => (
            <div key={name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                  {name.charAt(0)}
                </div>
                <span className="text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{data.count}</span>
              </div>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        <ReportCard title="Por Ciudad">
          {aggregate((l) => l.lugar).map(([city, data]) => (
            <div key={city} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{city} <span className="text-xs text-muted-foreground">({data.count})</span></span>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        <ReportCard title="Por Tipo de Seguro">
          {aggregate((l) => l.tipoSeguro).map(([tipo, data]) => (
            <div key={tipo} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground capitalize">{tipo} <span className="text-xs text-muted-foreground">({data.count})</span></span>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}
