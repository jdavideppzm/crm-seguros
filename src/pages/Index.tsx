import { useState, useMemo, useEffect, lazy, Suspense, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead, PipelineStatus, SmartView } from "@/types/crm";
import { useCrmStore } from "@/store/crmStore";
import { useAlertPopup } from "@/hooks/useAlertPopup";
import { useLeads } from "@/hooks/useLeads";

// Components - Regular Imports
import { CrmSidebar } from "@/components/crm/CrmSidebar";
import { CrmHeader } from "@/components/crm/CrmHeader";
import { CreateLeadModal } from "@/components/crm/CreateLeadModal";
import { AlertsView } from "@/components/crm/AlertsView";
import { ChatPanel } from "@/components/crm/ChatPanel";
import { AlertPopup } from "@/components/crm/AlertPopup";
import { CommandMenu } from "@/components/crm/CommandMenu";
import { DetailPanel } from "@/components/crm/DetailPanel";

// Components - Lazy Imports (to resolve conflicts and optimize)
const DashboardView = lazy(() => import("../components/crm/DashboardView").then(m => ({ default: m.DashboardView })));
const LeadTable = lazy(() => import("../components/crm/LeadTable").then(m => ({ default: m.LeadTable })));
const KanbanView = lazy(() => import("../components/crm/KanbanView").then(m => ({ default: m.KanbanView })));
const ClientDirectory = lazy(() => import("../components/crm/ClientDirectory").then(m => ({ default: m.ClientDirectory })));
const ReportsView = lazy(() => import("../components/crm/ReportsView").then(m => ({ default: m.ReportsView })));
const AgendaView = lazy(() => import("../components/crm/AgendaView").then(m => ({ default: m.AgendaView })));
const SettingsView = lazy(() => import("../components/crm/SettingsView").then(m => ({ default: m.SettingsView })));
const RenewalsView = lazy(() => import("../components/crm/RenewalsView").then(m => ({ default: m.RenewalsView })));
const OmnichannelView = lazy(() => import("../components/crm/OmnichannelView").then(m => ({ default: m.OmnichannelView })));
const CommissionView = lazy(() => import("../components/crm/CommissionView").then(m => ({ default: m.CommissionView })));

type ViewType = "pipeline" | "kanban" | "clients" | "reports" | "agenda" | "settings" | "alerts" | "dashboard" | "renewals" | "communications" | "commissions";

export default function Index() {
  const { displayName, isAdmin } = useAuth();
  
  // Local UI State
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | null>(null);
  
  // Sincronización Remota
  const { loading: loadingLeads } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const hasRanInitialChecks = useRef(false);
  const [activeSmartViewId, setActiveSmartViewId] = useState<string | null>(null);

  // Consolidated Store State
  const { 
    leads, config, alerts, chatMessages, popupActivity,
    updateLead, reorderLead, createLead, createLeadFromOpportunity,
    markActivityDone, rescheduleActivity, redistributeLeads, bulkUpdateLeads,
    bulkDeleteLeads, sendChat, dismissAlert, clearAlerts,
    autoRenewLeads, evaluateInactivityRules, setConfig, setPopupActivity
  } = useCrmStore();

  // Hooks
  useAlertPopup();

  useEffect(() => {
    if (!loadingLeads && (leads?.length || 0) > 0 && !hasRanInitialChecks.current) {
      hasRanInitialChecks.current = true;
      autoRenewLeads();
      evaluateInactivityRules();
    }
  }, [loadingLeads]);

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

  const alertCount = useMemo(() => alerts.filter(a => !a.dismissed).length, [alerts]);

  const activeSmartView = config.smartViews?.find(sv => sv.id === activeSmartViewId);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Smart View filter — applied first
      if (activeSmartView) {
        if (activeSmartView.filterType === "status") {
          if (l.state !== activeSmartView.filterValue) return false;
        } else if (activeSmartView.filterType === "assigned") {
          if (l.assignedTo !== activeSmartView.filterValue) return false;
        } else if (activeSmartView.filterType === "field") {
          const field = activeSmartView.filterField;
          const val = activeSmartView.filterValue;
          if (field === "expirationDate" && val === "incoming") {
            if (!l.expirationDate) return false;
            const exp = new Date(l.expirationDate);
            const now = new Date();
            const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (diff < 0 || diff > 30) return false;
          } else if (field === "smartCategory") {
            if (l.smartCategory !== activeSmartView.id && l.smartCategory !== activeSmartView.name) return false;
          } else if (field) {
            if ((l as any)[field] !== val) return false;
          }
        }
      }
      if (statusFilter && l.state !== statusFilter) return false;
      if (locationFilter && l.lugar.trim().toLowerCase() !== locationFilter.trim().toLowerCase()) return false;
      if (assignedFilter && l.assignedTo !== assignedFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return l.propietario.toLowerCase().includes(q) || l.placa.toLowerCase().includes(q) || l.insurance.toLowerCase().includes(q) || l.reference.toLowerCase().includes(q);
      }
      return true;
    });
  }, [leads, statusFilter, searchQuery, locationFilter, assignedFilter, activeSmartView]);

  const handleUpdateLeadWithSelection = (updated: Lead) => {
    updateLead(updated);
    if (selectedLead?.id === updated.id) {
       setSelectedLead(updated);
    }
  };

  const viewTitles: Record<string, string> = { 
    dashboard: "Dashboard", 
    pipeline: "Pipeline de Ventas", 
    kanban: "Pipeline de Ventas", 
    clients: "Directorio de Clientes",
    reports: "Reportes", 
    agenda: "Agenda", 
    settings: "Configuración", 
    alerts: "Alertas",
    renewals: "Centro de Renovaciones",
    communications: "Comunicaciones Omnicanal",
    commissions: "Conciliación de Comisiones"
  };

  const formatMonto = (m: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);
  const totalMonto = filteredLeads.reduce((s, l) => s + l.monto, 0);

  const showSplitView = selectedLead && (activeView === "pipeline" || activeView === "kanban" || activeView === "agenda");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CrmSidebar
        activeView={activeView}
        onViewChange={(v) => { setActiveView(v as ViewType); setSelectedLead(null); setActiveSmartViewId(null); }}
        statusFilter={statusFilter} onStatusFilter={(s) => { setStatusFilter(s); setActiveSmartViewId(null); }}
        statusCounts={statusCounts} totalLeads={leads.length}
        scheduledCount={scheduledCount} visibleViews={config.visibleViews}
        statusLabels={config.statusLabels} onCreateLead={() => setShowCreateLead(true)}
        pipelineStages={config.pipelineStages}
        alertCount={alertCount}
        smartViews={config.smartViews}
        activeSmartViewId={activeSmartViewId}
        onSelectSmartView={(id) => { setActiveSmartViewId(id); setStatusFilter(null); if (activeView !== "pipeline") setActiveView("pipeline"); }}
        onUpdateSmartViews={(views) => setConfig({ ...config, smartViews: views })}
        companyInfo={config.companyInfo}
        leads={leads}
        logoUrl={config.logoUrl}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <CrmHeader
          title={activeSmartView ? activeSmartView.name : viewTitles[activeView]}
          subtitle={activeView === "settings" ? undefined : activeView !== "reports" && activeView !== "agenda" && activeView !== "alerts" ? `${filteredLeads.length} leads · ${formatMonto(totalMonto)}` : activeView === "agenda" ? `${scheduledCount} actividades programadas` : undefined}
          searchQuery={searchQuery} onSearchChange={setSearchQuery}
          onToggleChat={() => setShowChat(!showChat)}
          onViewAlerts={() => setActiveView("alerts")}
          showChatButton
        />
        <div className="flex-1 flex overflow-hidden relative">
          {loadingLeads && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Sincronizando Base de Datos...</p>
            </div>
          )}
          
          <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            {activeView === "dashboard" && <DashboardView leads={leads} config={config} />}
            {activeView === "clients" && <ClientDirectory leads={leads} config={config} onSelectLead={(lead) => { setSelectedLead(lead); setActiveView("pipeline"); }} />}
            {activeView === "pipeline" && (
              <>
                <div className={`${showSplitView ? "w-[30%] min-w-[280px]" : "flex-1"} flex flex-col min-w-0 transition-all`}>
                  <LeadTable leads={filteredLeads} onSelectLead={setSelectedLead} selectedLeadId={selectedLead?.id || null}
                    locationFilter={locationFilter} onLocationFilterChange={setLocationFilter}
                    assignedFilter={assignedFilter} onAssignedFilterChange={setAssignedFilter}
                    statusLabels={config.statusLabels} onRedistributeLeads={redistributeLeads}
                    onBulkUpdateLeads={bulkUpdateLeads} onBulkDeleteLeads={bulkDeleteLeads}
                    onCreateSmartView={(newView) => setConfig({ ...config, smartViews: [...(config.smartViews || []), newView] })}
                    config={config} compact={!!showSplitView} />
                </div>
                {showSplitView && (
                  <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLeadWithSelection}
                    onCreateLeadFromOpportunity={createLeadFromOpportunity} config={config} expanded />
                )}
              </>
            )}
            {activeView === "kanban" && (
              <>
                <KanbanView leads={filteredLeads} onSelectLead={setSelectedLead} statusLabels={config.statusLabels} pipelineStages={config.pipelineStages} config={config} onUpdateLead={handleUpdateLeadWithSelection} onReorderLead={reorderLead} />
                {showSplitView && (
                  <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLeadWithSelection}
                    onCreateLeadFromOpportunity={createLeadFromOpportunity} config={config} />
                )}
              </>
            )}
            {activeView === "agenda" && (
              <>
                <AgendaView leads={leads} onSelectLead={setSelectedLead} onMarkDone={markActivityDone} onReschedule={rescheduleActivity} />
                {showSplitView && (
                  <DetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onUpdateLead={handleUpdateLeadWithSelection}
                    onCreateLeadFromOpportunity={createLeadFromOpportunity} config={config} />
                )}
              </>
            )}
            {activeView === "reports" && (
              <ReportsView leads={filteredLeads} config={config} customSections={config.customReportSections} paymentStatuses={config.paymentStatuses} statusLabels={config.statusLabels} />
            )}
            {activeView === "alerts" && (
              <AlertsView alerts={alerts} leads={leads} onSelectLead={(lead) => { setSelectedLead(lead); setActiveView("pipeline"); }} onDismissAlert={dismissAlert} onClearAll={clearAlerts} />
            )}
            {activeView === "communications" && <OmnichannelView leads={leads} config={config} />}
            {activeView === "commissions" && <CommissionView leads={leads} config={config} onUpdateLead={updateLead} />}
            {activeView === "settings" && <SettingsView config={config} onUpdateConfig={setConfig} />}
            {activeView === "renewals" && <RenewalsView leads={leads} config={config} onSelectLead={setSelectedLead} onCreateLead={createLead} />}
          </Suspense>

          {showChat && (activeView === "pipeline" || activeView === "kanban") && (
            <ChatPanel messages={chatMessages} currentUser={displayName || "Usuario"} users={config.users}
              leadId={selectedLead?.id} leadName={selectedLead?.propietario}
              onSendMessage={sendChat} onClose={() => setShowChat(false)} />
          )}
        </div>
      </div>
      
      <CreateLeadModal open={showCreateLead} onClose={() => setShowCreateLead(false)} onCreateLead={createLead} config={config} />

      <AlertPopup
        activity={popupActivity}
        onViewLead={(leadId) => {
          const lead = leads.find(l => l.id === leadId);
          if (lead) { setSelectedLead(lead); setActiveView("pipeline"); }
          setPopupActivity(null);
        }}
        onDismiss={() => setPopupActivity(null)}
      />
      
      <CommandMenu 
        leads={leads} 
        onSelectLead={(l) => { setSelectedLead(l); setActiveView("pipeline"); }} 
        onNavigate={(v) => setActiveView(v as any)} 
        onCreateLead={() => setShowCreateLead(true)} 
      />
    </div>
  );
}
