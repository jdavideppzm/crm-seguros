import type { Lead, CrmConfig, PipelineStageConfig } from "@/types/crm";
import { getStatusLabel } from "@/types/crm";
import type { CustomReportSection, PaymentStatusConfig } from "@/types/crm";

interface ReportsViewProps {
  leads: Lead[];
  config: CrmConfig;
  customSections?: CustomReportSection[];
  paymentStatuses?: PaymentStatusConfig[];
  statusLabels?: Record<string, string>;
}

export function ReportsView({ leads, config, customSections = [], paymentStatuses = [], statusLabels = {} }: ReportsViewProps) {
  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const aggregate = (key: (l: Lead) => string) =>
    Object.entries(
      leads.reduce<Record<string, { count: number; total: number; prima: number }>>((acc, l) => {
        const k = key(l) || "N/A";
        if (!acc[k]) acc[k] = { count: 0, total: 0, prima: 0 };
        acc[k].count++;
        acc[k].total += l.monto;
        acc[k].prima += l.valorPrima || 0;
        return acc;
      }, {})
    ).sort((a, b) => b[1].total - a[1].total);

  const totalMonto = leads.reduce((s, l) => s + l.monto, 0);
  const totalPrima = leads.reduce((s, l) => s + (l.valorPrima || 0), 0);
  const wonStages = config.pipelineStages.filter(s => s.finalType === "ganado").map(s => s.key);
  const lostStages = config.pipelineStages.filter(s => s.finalType === "perdido").map(s => s.key);
  const wonCount = leads.filter(l => wonStages.includes(l.state)).length;
  const lostCount = leads.filter(l => lostStages.includes(l.state)).length;
  const closeRate = leads.length ? Math.round((wonCount / leads.length) * 100) : 0;

  // Commission calculation
  const totalComision = leads.reduce((s, l) => {
    const company = config.insuranceCompanies.find(c => c.name === l.insurance);
    return s + ((l.valorPrima || 0) * (company?.commission || 0) / 100);
  }, 0);

  const getGroupByFn = (groupBy: string): (l: Lead) => string => {
    switch (groupBy) {
      case "state": return (l) => getStatusLabel(l.state, statusLabels, config.pipelineStages);
      case "assignedTo": return (l) => l.assignedTo || "Sin asignar";
      case "lugar": return (l) => l.lugar;
      case "tipoSeguro": return (l) => l.tipoSeguro;
      case "insurance": return (l) => l.insurance;
      case "paymentStatus": return (l) => l.paymentStatus || "Sin estado";
      default: return (l) => l.state;
    }
  };

  const visibleCustom = customSections.filter((s) => s.visible);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <SummaryCard label="Total Leads" value={leads.length.toString()} />
        <SummaryCard label="Cartera Total" value={formatMonto(totalMonto)} />
        <SummaryCard label="Prima Total" value={formatMonto(totalPrima)} />
        <SummaryCard label="Comisión Est." value={formatMonto(totalComision)} accent />
        <SummaryCard label="Tasa Cierre" value={`${closeRate}%`} />
        <SummaryCard label="Ganados / Perdidos" value={`${wonCount} / ${lostCount}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By Stage */}
        <ReportCard title="Por Estado del Pipeline">
          {aggregate((l) => getStatusLabel(l.state, statusLabels, config.pipelineStages)).map(([status, data]) => {
            const stage = config.pipelineStages.find(s => s.label === status || s.key === status);
            return (
              <div key={status} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  {stage && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />}
                  <span className="text-sm text-foreground">{status}</span>
                  <span className="text-xs text-muted-foreground">{data.count}</span>
                </div>
                <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
              </div>
            );
          })}
        </ReportCard>

        {/* By Insurer */}
        <ReportCard title="Ventas por Aseguradora">
          {aggregate((l) => l.insurance).map(([name, data]) => {
            const company = config.insuranceCompanies.find(c => c.name === name);
            return (
              <div key={name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground">({data.count})</span>
                  {company && <span className="text-[10px] font-mono text-primary">{company.commission}%</span>}
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
                  {data.prima > 0 && <p className="text-[10px] text-muted-foreground font-mono">Prima: {formatMonto(data.prima)}</p>}
                </div>
              </div>
            );
          })}
        </ReportCard>

        {/* By Seller */}
        <ReportCard title="Ventas por Vendedor">
          {aggregate((l) => l.assignedTo || "Sin asignar").map(([name, data]) => (
            <div key={name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">{name.charAt(0)}</div>
                <span className="text-sm text-foreground">{name}</span>
                <span className="text-xs text-muted-foreground">{data.count}</span>
              </div>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        {/* Payment Status */}
        {paymentStatuses.length > 0 && (
          <ReportCard title="Estado de Pagos">
            {aggregate((l) => l.paymentStatus || "Sin estado").map(([status, data]) => {
              const ps = paymentStatuses.find(p => p.label === status);
              return (
                <div key={status} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {ps && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ps.color }} />}
                    <span className="text-sm text-foreground">{status} <span className="text-xs text-muted-foreground">({data.count})</span></span>
                  </div>
                  <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
                </div>
              );
            })}
          </ReportCard>
        )}

        {/* By Origin */}
        <ReportCard title="Por Origen del Lead">
          {aggregate((l) => l.origenLead || "Sin origen").map(([origin, data]) => (
            <div key={origin} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{origin} <span className="text-xs text-muted-foreground">({data.count})</span></span>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        {/* By Policy Type */}
        <ReportCard title="Por Tipo de Póliza">
          {aggregate((l) => l.tipPoliza || l.tipoSeguro || "Sin tipo").map(([tipo, data]) => (
            <div key={tipo} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground capitalize">{tipo} <span className="text-xs text-muted-foreground">({data.count})</span></span>
              <span className="font-mono text-sm font-medium text-foreground">{formatMonto(data.total)}</span>
            </div>
          ))}
        </ReportCard>

        {/* Custom sections */}
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
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} /></div>
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

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border rounded-xl p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${accent ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}>
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
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
