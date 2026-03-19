import { useState, useMemo } from "react";
import type { Lead, PipelineStatus } from "@/types/crm";
import { SEED_LEADS } from "@/data/seedData";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { CrmHeader } from "@/components/crm/CrmHeader";
import { LeadTable } from "@/components/crm/LeadTable";
import { DetailPanel } from "@/components/crm/DetailPanel";
import { ReportsView } from "@/components/crm/ReportsView";
import { KanbanView } from "@/components/crm/KanbanView";
import { AgendaView } from "@/components/crm/AgendaView";

export default function Index() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [activeView, setActiveView] = useState<"pipeline" | "kanban" | "reports" | "agenda">("pipeline");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const statusCounts = useMemo(() => {
    return leads.reduce<Record<PipelineStatus, number>>((acc, l) => {
      acc[l.state] = (acc[l.state] || 0) + 1;
      return acc;
    }, {} as Record<PipelineStatus, number>);
  }, [leads]);

  const scheduledCount = useMemo(() => {
    let count = 0;
    leads.forEach((l) => {
      (l.activities || []).forEach((a) => {
        if (a.scheduledAt) count++;
      });
    });
    return count;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter && l.state !== statusFilter) return false;
      if (locationFilter && l.lugar.trim().toLowerCase() !== locationFilter.trim().toLowerCase()) return false;
      if (assignedFilter && l.assignedTo !== assignedFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          l.propietario.toLowerCase().includes(q) ||
          l.placa.toLowerCase().includes(q) ||
          l.insurance.toLowerCase().includes(q) ||
          l.reference.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, statusFilter, searchQuery, locationFilter, assignedFilter]);

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const viewTitles: Record<string, string> = {
    pipeline: "Pipeline de Ventas",
    kanban: "Pipeline de Ventas",
    reports: "Reportes",
    agenda: "Agenda",
  };

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const totalMonto = filteredLeads.reduce((s, l) => s + l.monto, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CrmSidebar
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v as any); setSelectedLead(null); }}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        statusCounts={statusCounts}
        totalLeads={leads.length}
        scheduledCount={scheduledCount}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CrmHeader
          title={viewTitles[activeView]}
          subtitle={activeView !== "reports" && activeView !== "agenda" ? `${filteredLeads.length} leads · ${formatMonto(totalMonto)}` : activeView === "agenda" ? `${scheduledCount} actividades programadas` : undefined}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="flex-1 flex overflow-hidden">
          {activeView === "pipeline" && (
            <>
              <LeadTable
                leads={filteredLeads}
                onSelectLead={setSelectedLead}
                selectedLeadId={selectedLead?.id || null}
                locationFilter={locationFilter}
                onLocationFilterChange={setLocationFilter}
                assignedFilter={assignedFilter}
                onAssignedFilterChange={setAssignedFilter}
              />
              <DetailPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateLead={handleUpdateLead}
              />
            </>
          )}
          {activeView === "kanban" && (
            <>
              <KanbanView leads={filteredLeads} onSelectLead={setSelectedLead} />
              <DetailPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateLead={handleUpdateLead}
              />
            </>
          )}
          {activeView === "agenda" && (
            <>
              <AgendaView leads={leads} onSelectLead={setSelectedLead} />
              <DetailPanel
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdateLead={handleUpdateLead}
              />
            </>
          )}
          {activeView === "reports" && <ReportsView leads={filteredLeads} />}
        </div>
      </div>
    </div>
  );
}
