import { useState, useMemo } from "react";
import { Bell, Clock, User, AlertTriangle, Check, X, Eye, Trash2 } from "lucide-react";
import type { Lead, CrmAlert } from "@/types/crm";

interface AlertsViewProps {
  alerts: CrmAlert[];
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onDismissAlert: (alertId: string) => void;
  onClearAll: () => void;
}

export function AlertsView({ alerts, leads, onSelectLead, onDismissAlert, onClearAll }: AlertsViewProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredAlerts = filter === "unread" ? alerts.filter(a => !a.dismissed) : alerts;
  const unreadCount = alerts.filter(a => !a.dismissed).length;

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell size={20} className="text-primary" /> Alertas
            </h2>
            <p className="text-sm text-muted-foreground">{unreadCount} sin leer de {alerts.length} total</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs font-medium ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Todas</button>
              <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 text-xs font-medium ${filter === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Sin leer ({unreadCount})</button>
            </div>
            {alerts.length > 0 && (
              <button onClick={onClearAll} className="text-xs text-destructive hover:text-destructive/80 px-2 py-1">Limpiar todo</button>
            )}
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Sin alertas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => {
              const lead = leads.find(l => l.id === alert.leadId);
              return (
                <div key={alert.id} className={`rounded-xl border p-4 transition-all ${alert.dismissed ? "border-border bg-muted/30 opacity-60" : "border-primary/20 bg-card shadow-sm"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      alert.type === "overdue" ? "bg-destructive/10" : alert.type === "automation" ? "bg-amber-100" : "bg-primary/10"
                    }`}>
                      {alert.type === "overdue" ? <AlertTriangle size={16} className="text-destructive" /> :
                       alert.type === "automation" ? <Bell size={16} className="text-amber-600" /> :
                       <Bell size={16} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        {alert.leadName && <span className="flex items-center gap-1"><User size={10} />{alert.leadName}</span>}
                        <span className="flex items-center gap-1"><Clock size={10} />{alert.createdAt}</span>
                        {alert.createdBy && <span>por {alert.createdBy}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {lead && (
                        <button onClick={() => onSelectLead(lead)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary" title="Ver lead">
                          <Eye size={14} />
                        </button>
                      )}
                      {!alert.dismissed && (
                        <button onClick={() => onDismissAlert(alert.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground" title="Marcar como leída">
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
