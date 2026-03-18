import type { Lead, PipelineStatus } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  locationFilter: string;
  onLocationFilterChange: (l: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (a: string) => void;
}

export function LeadTable({
  leads,
  onSelectLead,
  selectedLeadId,
  locationFilter,
  onLocationFilterChange,
  assignedFilter,
  onAssignedFilterChange,
}: LeadTableProps) {
  const allLeadsForFilters = leads;
  const locations = [...new Set(allLeadsForFilters.map((l) => l.lugar).filter(Boolean))].sort();
  const assigned = [...new Set(allLeadsForFilters.map((l) => l.assignedTo).filter(Boolean))].sort();

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Sub-filters */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-card">
        <select
          value={locationFilter}
          onChange={(e) => onLocationFilterChange(e.target.value)}
          className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground"
        >
          <option value="">Todas las ciudades</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => onAssignedFilterChange(e.target.value)}
          className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground"
        >
          <option value="">Todos los asignados</option>
          {assigned.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{leads.length} registros</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/80 backdrop-blur-sm">
              <th className="text-left font-medium text-muted-foreground px-6 py-2.5 w-[220px]">Propietario</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[100px]">Ciudad</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[90px]">Tipo</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[120px]">Aseguradora</th>
              <th className="text-right font-medium text-muted-foreground px-3 py-2.5 w-[120px]">Monto</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[110px]">Estado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[90px]">Asignado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Observación</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`border-b border-border/60 cursor-pointer transition-colors duration-100 ${
                  selectedLeadId === lead.id ? "bg-primary/[0.04]" : "hover:bg-muted/60"
                }`}
              >
                <td className="px-6 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                      {lead.propietario.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate text-[13px]">{lead.propietario}</p>
                      {lead.placa && <p className="text-[11px] text-muted-foreground font-mono">{lead.placa}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">{lead.lugar}</td>
                <td className="px-3 py-2.5 text-muted-foreground capitalize text-xs">{lead.tipoSeguro}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{lead.insurance}</td>
                <td className="px-3 py-2.5 text-right font-mono text-foreground font-medium">{formatMonto(lead.monto)}</td>
                <td className="px-3 py-2.5"><StatusBadge status={lead.state} /></td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs">{lead.assignedTo || "—"}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs truncate max-w-[160px]">{lead.remark || "—"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground">
                  No se encontraron leads con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
