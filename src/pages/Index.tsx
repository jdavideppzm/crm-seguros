import { useState, useMemo, useCallback } from "react";
import type { Lead, PipelineStatus, Opportunity, OpportunityType, Activity, CrmConfig } from "@/types/crm";
import { SEED_LEADS } from "@/data/seedData";
import { OPPORTUNITY_TYPE_LABELS, DEFAULT_CRM_CONFIG, getStatusLabel, getInsuranceCommission } from "@/types/crm";
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { CrmHeader } from "@/components/crm/CrmHeader";
import { LeadTable } from "@/components/crm/LeadTable";
import { DetailPanel } from "@/components/crm/DetailPanel";
import { ReportsView } from "@/components/crm/ReportsView";
import { KanbanView } from "@/components/crm/KanbanView";
import { AgendaView } from "@/components/crm/AgendaView";
import { SettingsView } from "@/components/crm/SettingsView";
import { CreateLeadModal } from "@/components/crm/CreateLeadModal";

type ViewType = "pipeline" | "kanban" | "reports" | "agenda" | "settings";

export default function Index() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [activeView, setActiveView] = useState<ViewType>("pipeline");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [config, setConfig] = useState<CrmConfig>(DEFAULT_CRM_CONFIG);
  const [showCreateLead, setShowCreateLead] = useState(false);

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
        if (a.scheduledAt && !a.completed) count++;
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
        return l.propietario.toLowerCase().includes(q) || l.placa.toLowerCase().includes(q) || l.insurance.toLowerCase().includes(q) || l.reference.toLowerCase().includes(q);
      }
      return true;
    });
  }, [leads, statusFilter, searchQuery, locationFilter, assignedFilter]);

  // === Automation Engine ===
  const runAutomations = useCallback((lead: Lead, oldState: string, newState: string) => {
    const newActivities: Activity[] = [];
    
    config.automationRules.filter(r => r.enabled).forEach(rule => {
      if (rule.trigger.type === "status_change") {
        if (rule.trigger.toStatus && rule.trigger.toStatus === newState) {
          if (rule.action.type === "create_activity") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
            newActivities.push({
              id: Date.now().toString() + "_auto" + Math.random().toString(36).slice(2, 4),
              type: "automation",
              text: `⚡ ${rule.action.activityText || rule.name}`,
              author: "Sistema",
              createdAt: new Date().toLocaleString("es-CO"),
              scheduledAt: dateStr,
              leadId: lead.id,
              leadName: lead.propietario,
            });
          }
          if (rule.action.type === "change_status" && rule.action.targetStatus) {
            lead = { ...lead, state: rule.action.targetStatus };
          }
        }
      }
    });

    return { lead, newActivities };
  }, [config.automationRules]);

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelectedLead(updated);
  };

  const handleCreateLeadFromOpportunity = (parentLead: Lead, opportunity: Opportunity) => {
    const newLead: Lead = {
      id: Date.now().toString() + "_opp",
      fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "numeric" }),
      placa: opportunity.typeFields?.placa || opportunity.placa || "",
      propietario: parentLead.propietario,
      insurance: opportunity.aseguradora || parentLead.insurance,
      email: parentLead.email, phone: parentLead.phone,
      reference: `Opp: ${OPPORTUNITY_TYPE_LABELS[opportunity.type]} - ${opportunity.description}`,
      state: config.pipelineStages[0]?.key || "nuevo", followUp: "1",
      remark: `Oportunidad ${OPPORTUNITY_TYPE_LABELS[opportunity.type]} vinculada a ${parentLead.placa || parentLead.propietario}`,
      lugar: parentLead.lugar, tipoSeguro: opportunity.type === "vehiculo" ? parentLead.tipoSeguro : opportunity.type,
      monto: opportunity.monto || 0, assignedTo: parentLead.assignedTo,
      parentLeadId: parentLead.id, opportunityType: opportunity.type as OpportunityType,
      tipoIdentificacion: parentLead.tipoIdentificacion, numeroIdentificacion: parentLead.numeroIdentificacion,
      nombres: parentLead.nombres, apellidos: parentLead.apellidos, sexo: parentLead.sexo,
      fechaNacimiento: parentLead.fechaNacimiento, ciudad: parentLead.ciudad, departamento: parentLead.departamento,
      colorVehiculo: parentLead.colorVehiculo,
      activities: [{ id: Date.now().toString(), type: "note", text: `Lead creado desde oportunidad de ${OPPORTUNITY_TYPE_LABELS[opportunity.type]}`, author: "Sistema", createdAt: new Date().toLocaleString("es-CO") }],
    };
    setLeads((prev) => [...prev, newLead]);
  };

  const handleMarkActivityDone = (leadId: string, activityId: string, note: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const targetAct = (l.activities || []).find(a => a.id === activityId);
      const activities = (l.activities || []).map(a => a.id === activityId ? { ...a, completed: true } : a);
      const completionActivity: Activity = {
        id: Date.now().toString(), type: "note",
        text: `✅ Actividad completada: "${targetAct?.text || ""}"${note ? ` — ${note}` : ""}`,
        author: "Usuario", createdAt: new Date().toLocaleString("es-CO"),
      };
      return { ...l, activities: [completionActivity, ...activities] };
    }));
  };

  const handleRescheduleActivity = (leadId: string, activityId: string, newDate: string, comment: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id !== leadId) return l;
      const oldAct = (l.activities || []).find(a => a.id === activityId);
      const activities = (l.activities || []).map(a => a.id === activityId ? { ...a, scheduledAt: newDate } : a);
      const rescheduleActivity: Activity = {
        id: Date.now().toString(), type: "note",
        text: `🔄 Reprogramada: "${oldAct?.text || ""}" de ${oldAct?.scheduledAt || "?"} a ${newDate}${comment ? ` — ${comment}` : ""}`,
        author: "Usuario", createdAt: new Date().toLocaleString("es-CO"),
      };
      return { ...l, activities: [rescheduleActivity, ...activities] };
    }));
  };

  const handleRedistributeLeads = (leadIds: string[], user: string) => {
    setLeads(prev => prev.map(l => leadIds.includes(l.id) ? { ...l, assignedTo: user } : l));
  };

  const handleCreateLead = (lead: Lead) => {
    setLeads(prev => [...prev, lead]);
  };

  const viewTitles: Record<string, string> = { pipeline: "Pipeline de Ventas", kanban: "Pipeline de Ventas", reports: "Reportes", agenda: "Agenda", settings: "Configuración" };

  const formatMonto = (m: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);
  const totalMonto = filteredLeads.reduce((s, l) => s + l.monto, 0);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CrmSidebar
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v as ViewType); setSelectedLead(null); }}
        statusFilter={statusFilter} onStatusFilter={setStatusFilter}
        statusCounts={statusCounts} totalLeads={leads.length}
        scheduledCount={scheduledCount} visibleViews={config.visibleViews}
        statusLabels={config.statusLabels} onCreateLead={() => setShowCreateLead(true)}
        pipelineStages={config.pipelineStages}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CrmHeader
          title={viewTitles[activeView]}
          subtitle={activeView === "settings" ? undefined : activeView !== "reports" && activeView !== "agenda" ? `${filteredLeads.length} leads · ${formatMonto(totalMonto)}` : activeView === "agenda" ? `${scheduledCount} actividades programadas` : undefined}
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
        />
        <div className="flex-1 flex overflow-hidden">
          {activeView === "pipeline" && (
            <>
              <LeadTable leads={filteredLeads} onSelectLead={setSelectedLead} selectedLeadId={selectedLead?.id || null}
                locationFilter={locationFilter} onLocationFilterChange={setLocationFilter}
                assignedFilter={assignedFilter} onAssignedFilterChange={setAssignedFilter}
                statusLabels={config.statusLabels} onRedistributeLeads={handleRedistributeLeads}
                config={config} />
              <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead}
                onCreateLeadFromOpportunity={handleCreateLeadFromOpportunity} config={config} />
            </>
          )}
          {activeView === "kanban" && (
            <>
              <KanbanView leads={filteredLeads} onSelectLead={setSelectedLead} statusLabels={config.statusLabels} pipelineStages={config.pipelineStages} config={config} />
              <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead}
                onCreateLeadFromOpportunity={handleCreateLeadFromOpportunity} config={config} />
            </>
          )}
          {activeView === "agenda" && (
            <>
              <AgendaView leads={leads} onSelectLead={setSelectedLead}
                onMarkDone={handleMarkActivityDone} onReschedule={handleRescheduleActivity} />
              <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLead}
                onCreateLeadFromOpportunity={handleCreateLeadFromOpportunity} config={config} />
            </>
          )}
          {activeView === "reports" && (
            <ReportsView leads={filteredLeads} config={config}
              customSections={config.customReportSections}
              paymentStatuses={config.paymentStatuses} statusLabels={config.statusLabels} />
          )}
          {activeView === "settings" && (
            <SettingsView config={config} onUpdateConfig={setConfig} />
          )}
        </div>
      </div>
      <CreateLeadModal open={showCreateLead} onClose={() => setShowCreateLead(false)} onCreateLead={handleCreateLead} config={config} />
    </div>
  );
}
