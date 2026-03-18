import type { Lead, PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

interface ReportsViewProps {
  leads: Lead[];
}

export function ReportsView({ leads }: ReportsViewProps) {
  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  // By status
  const byStatus = leads.reduce<Record<string, { count: number; total: number }>>((acc, l) => {
    if (!acc[l.state]) acc[l.state] = { count: 0, total: 0 };
    acc[l.state].count++;
    acc[l.state].total += l.monto;
    return acc;
  }, {});

  // By assigned
  const byAssigned = leads.reduce<Record<string, { count: number; total: number }>>((acc, l) => {
    const key = l.assignedTo || "Sin asignar";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count++;
    acc[key].total += l.monto;
    return acc;
  }, {});

  // By city
  const byCity = leads.reduce<Record<string, { count: number; total: number }>>((acc, l) => {
    const key = l.lugar || "N/A";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count++;
    acc[key].total += l.monto;
    return acc;
  }, {});

  // By insurance type
  const byTipo = leads.reduce<Record<string, { count: number; total: number }>>((acc, l) => {
    const key = l.tipoSeguro || "N/A";
    if (!acc[key]) acc[key] = { count: 0, total: 0 };
    acc[key].count++;
    acc[key].total += l.monto;
    return acc;
  }, {});

  const totalMonto = leads.reduce((s, l) => s + l.monto, 0);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Reportes</h2>
        <p className="text-sm text-muted-foreground">{leads.length} leads · Cartera total: {formatMonto(totalMonto)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard title="Por Estado">
          {Object.entries(byStatus)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([status, data]) => (
              <div key={status} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={status as PipelineStatus} />
                  <span className="text-xs text-muted-foreground">{data.count}</span>
                </div>
                <span className="font-mono text-sm text-foreground">{formatMonto(data.total)}</span>
              </div>
            ))}
        </ReportCard>

        <ReportCard title="Por Responsable">
          {Object.entries(byAssigned)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([name, data]) => (
              <div key={name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground">{data.count} leads</span>
                </div>
                <span className="font-mono text-sm text-foreground">{formatMonto(data.total)}</span>
              </div>
            ))}
        </ReportCard>

        <ReportCard title="Por Ciudad">
          {Object.entries(byCity)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([city, data]) => (
              <div key={city} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground">{city}</span>
                  <span className="text-xs text-muted-foreground">{data.count} leads</span>
                </div>
                <span className="font-mono text-sm text-foreground">{formatMonto(data.total)}</span>
              </div>
            ))}
        </ReportCard>

        <ReportCard title="Por Tipo de Seguro">
          {Object.entries(byTipo)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([tipo, data]) => (
              <div key={tipo} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground capitalize">{tipo}</span>
                  <span className="text-xs text-muted-foreground">{data.count} leads</span>
                </div>
                <span className="font-mono text-sm text-foreground">{formatMonto(data.total)}</span>
              </div>
            ))}
        </ReportCard>
      </div>
    </div>
  );
}

function ReportCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
