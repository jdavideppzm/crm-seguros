import { useState, useMemo } from "react";
import { Bell, Clock, User, AlertTriangle, Check, Trash2, Shield, Zap, Info, ChevronRight, LayoutGrid, Calendar } from "lucide-react";
import type { Lead, CrmAlert } from "@/types/crm";
import { motion, AnimatePresence } from "framer-motion";

interface AlertsViewProps {
  alerts: CrmAlert[];
  leads: Lead[];
  onSelectLead: (lead) => void;
  onDismissAlert: (alertId: string) => void;
  onClearAll: () => void;
}

export function AlertsView({ alerts, leads, onSelectLead, onDismissAlert, onClearAll }: AlertsViewProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredAlerts = useMemo(() => {
    return filter === "unread" ? alerts.filter(a => !a.dismissed) : alerts;
  }, [alerts, filter]);

  const unreadCount = alerts.filter(a => !a.dismissed).length;

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-background/50 backdrop-blur-3xl p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8 h-full">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Bell size={24} />
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Centro de Alertas</h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
              Monitoreo en tiempo real de automatizaciones de seguros, renovaciones próximas y gestión administrativa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-muted/30 p-1.5 rounded-2xl border border-border/40 backdrop-blur-md self-start md:self-auto">
            <button 
              onClick={() => setFilter("all")} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === "all" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Historial Completo
            </button>
            <button 
              onClick={() => setFilter("unread")} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                filter === "unread" ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pendientes 
              {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
            <div className="w-px h-6 bg-border/40 mx-1 hidden sm:block" />
            <button 
              onClick={onClearAll} 
              className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all flex items-center gap-2"
            >
              <Trash2 size={12} /> Limpiar Todo
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
           <StatCard icon={<Shield size={18} />} label="Automáticas" value={alerts.filter(a => a.type === "automation").length} color="blue" />
           <StatCard icon={<Calendar size={18} />} label="Renovaciones" value={leads.filter(l => l.isRenewal).length} color="amber" />
           <StatCard icon={<AlertTriangle size={18} />} label="Críticas" value={alerts.filter(a => a.type === "overdue").length} color="red" />
           <StatCard icon={<Check size={18} />} label="Gestiones hoy" value={alerts.filter(a => a.dismissed).length} color="emerald" />
        </div>

        {/* Content Section: Alternating Alert Feed and Renewal Control */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8">
          
          {/* General Alerts Feed */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-10">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Zap size={10} /> Flujo de Actividad
            </h3>
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredAlerts.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center bg-card/20 rounded-[32px] border border-dashed border-border/40"
                >
                  <Bell size={32} className="text-muted-foreground/20 mb-4" />
                  <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Sin alertas nuevas</p>
                </motion.div>
              ) : (
                filteredAlerts.map((alert) => (
                  <AlertItem 
                    key={alert.id} 
                    alert={alert} 
                    lead={leads.find(l => l.id === alert.leadId)}
                    onSelect={onSelectLead}
                    onDismiss={onDismissAlert}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Renewal Control Center (Right Sidebar Style) */}
          <div className="w-full lg:w-[360px] flex flex-col gap-4">
             <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[32px] p-6 shadow-2xl overflow-hidden relative">
               <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
               <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Calendar size={14} className="text-amber-500" /> Próximos Vencimientos
               </h3>
               
               <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                 {leads.filter(l => l.expirationDate && !l.isRenewal).map(lead => {
                   const [day, month, year] = lead.expirationDate!.split("/").map(Number);
                   const exp = new Date(year, month - 1, day);
                   const daysLeft = Math.ceil((exp.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                   
                   if (daysLeft > 60 || daysLeft < 0) return null;

                   return (
                     <div key={lead.id} className="p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-all group/ren cursor-pointer" onClick={() => onSelectLead(lead)}>
                       <div className="flex justify-between items-start mb-1">
                         <p className="text-[11px] font-black text-foreground truncate max-w-[140px] uppercase tracking-tighter">{lead.propietario}</p>
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${daysLeft < 15 ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"}`}>
                           {daysLeft} días
                         </span>
                       </div>
                       <div className="flex items-center justify-between">
                         <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">{lead.placa} • {lead.insurance}</p>
                         <ChevronRight size={10} className="opacity-0 group-hover/ren:opacity-100 transition-all translate-x-1 group-hover/ren:translate-x-0" />
                       </div>
                     </div>
                   );
                 })}
                 {leads.filter(l => l.expirationDate).length === 0 && (
                   <p className="text-[10px] text-center text-muted-foreground py-10 italic">No hay pólizas registradas con fecha de vencimiento</p>
                 )}
               </div>
             </div>
             
             <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[32px] p-6 shadow-xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Tip de Venta</p>
                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                  Las renovaciones tienen una tasa de cierre <span className="text-foreground font-black">4x mayor</span> que los leads nuevos. Contacta a tus clientes 20 días antes.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: number; color: "blue" | "red" | "emerald" | "amber" }) {
  const colors = {
    blue: "from-blue-500/10 to-blue-600/5 text-blue-500 border-blue-500/20 shadow-blue-500/5",
    red: "from-red-500/10 to-red-600/5 text-red-500 border-red-500/20 shadow-red-500/5",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-500 border-amber-500/20 shadow-amber-500/5",
  };

  return (
    <div className={`p-6 rounded-[24px] bg-gradient-to-br ${colors[color]} border shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/10">
          {icon}
        </div>
        <Zap size={14} className="opacity-20 group-hover:opacity-100 transition-opacity" />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function AlertItem({ alert, lead, onSelect, onDismiss }: { alert: CrmAlert; lead?: Lead; onSelect: (l: Lead) => void; onDismiss: (id: string) => void }) {
  const isAutomation = alert.type === "automation";
  const isCritical = alert.type === "overdue";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative rounded-[28px] p-1 border transition-all duration-300 ${
        alert.dismissed ? "opacity-50 grayscale" : "hover:border-primary/40 shadow-lg hover:shadow-primary/5"
      }`}
      style={{
        backgroundColor: "rgba(var(--card), 0.5)",
        borderColor: alert.dismissed ? "rgba(var(--border), 0.1)" : isCritical ? "rgba(239, 68, 68, 0.2)" : "rgba(var(--border), 0.3)"
      }}
    >
      <div className="flex items-center gap-4 p-4 lg:p-5">
        {/* Icon Badge */}
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden ${
          isCritical ? "bg-red-500/10 text-red-500" : isAutomation ? "bg-blue-500/10 text-blue-500" : "bg-primary/10 text-primary"
        }`}>
          {isCritical ? <AlertTriangle size={24} strokeWidth={2.5} /> : 
           isAutomation ? <Zap size={24} strokeWidth={2.5} className="animate-pulse" /> : 
           <Info size={24} strokeWidth={2.5} />}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h4 className="text-[14px] font-black text-foreground leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">
              {alert.message}
            </h4>
            {isAutomation && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                Auto-Trigger
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/70 font-bold uppercase tracking-wider">
            {lead && (
              <button 
                onClick={() => onSelect(lead)}
                className="flex items-center gap-2 hover:text-primary transition-colors hover:scale-105"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px]">
                  {lead.propietario.charAt(0)}
                </div>
                <span>{lead.propietario}</span>
              </button>
            )}
            <span className="flex items-center gap-1.5"><Clock size={12} className="opacity-40" /> {alert.createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          {lead && (
            <button 
              onClick={() => onSelect(lead)}
              className="p-3 rounded-xl bg-muted/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-border/40 hover:border-primary/40 group/btn"
              title="Gestionar Registro"
            >
              <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          )}
          {!alert.dismissed && (
            <button 
              onClick={() => onDismiss(alert.id)}
              className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-primary/20"
              title="Marcar como Completado"
            >
              <Check size={18} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
