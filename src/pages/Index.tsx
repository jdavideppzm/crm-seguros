import { useState, useMemo } from "react";
import type { Lead, PipelineStatus } from "@/types/crm";
import { SEED_LEADS } from "@/data/seedData";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { LeadTable } from "@/components/crm/LeadTable";
import { DetailPanel } from "@/components/crm/DetailPanel";
import { ReportsView } from "@/components/crm/ReportsView";

export default function Index() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [activeView, setActiveView] = useState<"pipeline" | "reports">("pipeline");
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CrmSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        statusCounts={statusCounts}
        totalLeads={leads.length}
      />
      {activeView === "pipeline" ? (
        <>
          <LeadTable
            leads={filteredLeads}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
      ) : (
        <ReportsView leads={leads} />
      )}
    </div>
  );
}
