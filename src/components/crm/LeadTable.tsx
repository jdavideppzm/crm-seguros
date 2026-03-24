import { useState } from "react";
import type { Lead, CrmConfig } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  locationFilter: string;
  onLocationFilterChange: (l: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (a: string) => void;
  statusLabels?: Record<string, string>;
  onRedistributeLeads?: (leadIds: string[], user: string) => void;
  config?: CrmConfig;
}

export function LeadTable({
  leads, onSelectLead, selectedLeadId,
  locationFilter, onLocationFilterChange,
  assignedFilter, onAssignedFilterChange,
  statusLabels = {}, onRedistributeLeads, config,
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRedistribute, setShowRedistribute] = useState(false);

  const locations = [...new Set(leads.map((l) => l.lugar).filter(Boolean))].sort();
  const assigned = [...new Set(leads.map((l) => l.assignedTo).filter(Boolean))].sort();
  const activeUsers = config?.users.filter(u => u.active) || [];

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === leads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(leads.map(l => l.id)));
  };

  const handleRedistribute = (user: string) => {
    if (onRedistributeLeads && selectedIds.size > 0) {
      onRedistributeLeads(Array.from(selectedIds), user);
      setSelectedIds(new Set());
      setShowRedistribute(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-card">
        <select value={locationFilter} onChange={(e) => onLocationFilterChange(e.target.value)} className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground">
          <option value="">Todas las ciudades</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={assignedFilter} onChange={(e) => onAssignedFilterChange(e.target.value)} className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground">
          <option value="">Todos los asignados</option>
          {assigned.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        {selectedIds.size > 0 && (
          <div className="relative ml-2">
            <button onClick={() => setShowRedistribute(!showRedistribute)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
              Distribuir ({selectedIds.size})
            </button>
            {showRedistribute && (
              <div className="absolute z-20 top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[160px]">
                {activeUsers.map(user => (
                  <button key={user.id} onClick={() => handleRedistribute(user.name)} className="w-full text-left text-xs px-3 py-2 hover:bg-muted transition-colors text-foreground">
                    {user.name} <span className="text-muted-foreground">({user.role})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <span className="ml-auto text-xs text-muted-foreground">{leads.length} registros</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary/80 backdrop-blur-sm">
              <th className="w-10 px-3 py-2.5">
                <input type="checkbox" checked={selectedIds.size === leads.length && leads.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded border-border" />
              </th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[220px]">Propietario</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[100px]">Ciudad</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[90px]">Tipo</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[120px]">Aseguradora</th>
              <th className="text-right font-medium text-muted-foreground px-3 py-2.5 w-[120px]">Val. Asegurado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[110px]">Estado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5 w-[90px]">Asignado</th>
              <th className="text-left font-medium text-muted-foreground px-3 py-2.5">Observación</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}
                className={`border-b border-border/60 cursor-pointer transition-colors duration-100 ${
                  selectedLeadId === lead.id ? "bg-primary/[0.04]" : selectedIds.has(lead.id) ? "bg-accent/50" : "hover:bg-muted/60"
                }`}>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-3.5 h-3.5 rounded border-border" />
                </td>
                <td className="px-3 py-2.5" onClick={() => onSelectLead(lead)}>
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
                <td className="px-3 py-2.5 text-muted-foreground" onClick={() => onSelectLead(lead)}>{lead.lugar}</td>
                <td className="px-3 py-2.5 text-muted-foreground capitalize text-xs" onClick={() => onSelectLead(lead)}>{lead.tipPoliza || lead.tipoSeguro}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs" onClick={() => onSelectLead(lead)}>{lead.insurance}</td>
                <td className="px-3 py-2.5 text-right font-mono text-foreground font-medium" onClick={() => onSelectLead(lead)}>{formatMonto(lead.monto)}</td>
                <td className="px-3 py-2.5" onClick={() => onSelectLead(lead)}><StatusBadge status={lead.state} labelOverrides={statusLabels} pipelineStages={config?.pipelineStages} /></td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs" onClick={() => onSelectLead(lead)}>{lead.assignedTo || "—"}</td>
                <td className="px-3 py-2.5 text-muted-foreground text-xs truncate max-w-[160px]" onClick={() => onSelectLead(lead)}>{lead.remark || "—"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center text-muted-foreground">
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
