import type { Lead, PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";
import type { CustomReportSection } from "./SettingsView";

interface ReportsViewProps {
  leads: Lead[];
  customSections?: CustomReportSection[];
}

export function ReportsView({ leads, customSections = [] }: ReportsViewProps) {
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

  const getGroupByFn = (groupBy: string): (l: Lead) => string => {
    switch (groupBy) {
      case "state": return (l) => l.state;
      case "assignedTo": return (l) => l.assignedTo || "Sin asignar";
      case "lugar": return (l) => l.lugar;
      case "tipoSeguro": return (l) => l.tipoSeguro;
      case "insurance": return (l) => l.insurance;
      default: return (l) => l.state;
    }
  };

  const visibleCustom = customSections.filter((s) => s.visible);

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

        {/* Custom Sections */}
        {visibleCustom.map((section) => {
          const data = aggregate(getGroupByFn(section.groupBy));
          return (
            <ReportCard key={section.id} title={section.title}>
              {section.type === "metric" ? (
                <div className="py-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{data.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">categorías · {formatMonto(data.reduce((s, [, d]) => s + d.total, 0))}</p>
                </div>
              ) : section.type === "pie" ? (
                <div className="space-y-1.5">
                  {data.map(([label, d]) => {
                    const pct = totalMonto > 0 ? Math.round((d.total / totalMonto) * 100) : 0;
                    return (
                      <div key={label} className="flex items-center gap-2 py-1">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-foreground flex-1">{label}</span>
                        <span className="text-[11px] font-mono text-muted-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                data.map(([label, d]) => (
                  <div key={label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{label} <span className="text-xs text-muted-foreground">({d.count})</span></span>
                    <span className="font-mono text-sm font-medium text-foreground">{formatMonto(d.total)}</span>
                  </div>
                ))
              )}
            </ReportCard>
          );
        })}
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
