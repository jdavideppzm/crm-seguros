import { Search, UserPlus } from "lucide-react";
import type { Lead, PipelineStatus } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

interface LeadTableProps {
  leads: Lead[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  locationFilter: string;
  onLocationFilterChange: (l: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (a: string) => void;
}

export function LeadTable({
  leads,
  searchQuery,
  onSearchChange,
  onSelectLead,
  selectedLeadId,
  locationFilter,
  onLocationFilterChange,
  assignedFilter,
  onAssignedFilterChange,
}: LeadTableProps) {
  const locations = [...new Set(leads.map((l) => l.lugar).filter(Boolean))].sort();
  const assigned = [...new Set(leads.map((l) => l.assignedTo).filter(Boolean))].sort();

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar propietario, placa..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={locationFilter}
          onChange={(e) => onLocationFilterChange(e.target.value)}
          className="text-sm py-1.5 px-2 bg-muted/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
        >
          <option value="">Todas las ciudades</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => onAssignedFilterChange(e.target.value)}
          className="text-sm py-1.5 px-2 bg-muted/50 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
        >
          <option value="">Todos los asignados</option>
          {assigned.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/70 border-b border-border">
              <th className="text-left font-medium text-muted-foreground px-4 py-2 w-[200px]">Propietario</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2 w-[100px]">Ciudad</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2 w-[100px]">Seguro</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2 w-[120px]">Aseguradora</th>
              <th className="text-right font-medium text-muted-foreground px-3 py-2 w-[110px]">Monto</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2 w-[100px]">Estado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2 w-[100px]">Asignado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2">Observación</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelectLead(lead)}
                className={`border-b border-border cursor-pointer transition-colors duration-150 ${
                  selectedLeadId === lead.id ? "bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                <td className="px-4 py-2 font-medium text-foreground truncate max-w-[200px]">
                  <div className="truncate">{lead.propietario}</div>
                  {lead.placa && <div className="text-xs text-muted-foreground font-mono">{lead.placa}</div>}
                </td>
                <td className="px-3 py-2 text-muted-foreground truncate">{lead.lugar}</td>
                <td className="px-3 py-2 text-muted-foreground truncate capitalize">{lead.tipoSeguro}</td>
                <td className="px-3 py-2 text-muted-foreground truncate text-xs">{lead.insurance}</td>
                <td className="px-3 py-2 text-right font-mono text-foreground">{formatMonto(lead.monto)}</td>
                <td className="px-3 py-2"><StatusBadge status={lead.state} /></td>
                <td className="px-3 py-2 text-muted-foreground text-xs">{lead.assignedTo || "—"}</td>
                <td className="px-3 py-2 text-muted-foreground text-xs truncate max-w-[160px]">{lead.remark || "—"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
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
