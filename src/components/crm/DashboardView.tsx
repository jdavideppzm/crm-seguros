import { useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { DollarSign, TrendingUp, Target, Shield, Users, Download, Trash2, Eye, Plus, Calendar, Zap, ArrowRight, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, CrmConfig } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";
import { exportLeadsToCSV } from "@/utils/crm";
import { useCrmStore } from "@/store/crmStore";
import { toast } from "sonner";
import * as Icons from "lucide-react";

interface DashboardViewProps {
  leads: Lead[];
  config: CrmConfig;
}

/**
 * Calculates business days (Mon-Fri) remaining in the current month
 */
function getRemainingWorkingDays(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  let count = 0;
  for (let d = now.getDate(); d <= lastDay; d++) {
    const day = new Date(year, month, d).getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count || 1; 
}

export function DashboardView({ leads, config }: DashboardViewProps) {
  const { isAdmin } = useAuth();
  const { alerts, setAlerts } = useCrmStore();
  
  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const calculateCommission = (lead: Lead) => {
    const company = config.insuranceCompanies.find(c => c.name === lead.insurance);
    return (lead.valorPrima || 0) * (company?.commission || 0) / 100;
  };

  const wonStages = config.pipelineStages.filter(s => s.finalType === "ganado").map(s => s.key);
  const wonLeads = leads.filter(l => wonStages.includes(l.state));
  const totalComisiones = wonLeads.reduce((s, l) => s + calculateCommission(l), 0);
  const totalPrimas = wonLeads.reduce((s, l) => s + (l.valorPrima || 0), 0);

  // Goal Calculations
  const teamTotalMoneyGoal = useMemo(() => {
    return config.users.filter(u => u.active).reduce((sum, u) => sum + (u.monthlyGoal || 0), 0) || 12000000;
  }, [config.users]);

  const teamTotalSalesGoal = useMemo(() => {
    return config.users.filter(u => u.active).reduce((sum, u) => sum + (u.monthlySalesCountGoal || 0), 0) || 50;
  }, [config.users]);

  // Performance Analysis
  const remainingWorkDays = useMemo(() => getRemainingWorkingDays(), []);
  const salesToGoal = Math.max(teamTotalSalesGoal - wonLeads.length, 0);
  const dailyTarget = salesToGoal / remainingWorkDays;
  const weeklyTarget = dailyTarget * 5;

  const todayStr = new Date().toLocaleDateString("es-CO", { day: '2-digit', month: '2-digit', year: 'numeric' });
  const wonToday = wonLeads.filter(l => {
     if (!l.fecha) return false;
     // Handle different date formats (DD/MM/YYYY or YYYY-MM-DD)
     const leadDate = l.fecha.split(" ")[0].replace(/-/g, '/');
     const parts = leadDate.split('/');
     const normalizedLeadDate = parts[0].length === 4 ? `${parts[2]}/${parts[1]}/${parts[0]}` : leadDate;
     return normalizedLeadDate === todayStr;
  });

  const paceCompliance = dailyTarget > 0 ? (wonToday.length / dailyTarget) * 100 : 100;
  const isPaceLow = paceCompliance < 50 && new Date().getHours() >= 14; // Proactive alert after 2:00 PM
  const paceStatus = paceCompliance >= 100 ? "excelente" : paceCompliance >= 50 ? "estable" : "bajo";

  // Trigger System Alert for Admin
  useEffect(() => {
    if (isAdmin && isPaceLow) {
      const alertId = `pace_alert_${todayStr}`;
      const alreadyHasAlert = alerts.some(a => a.id === alertId);
      
      if (!alreadyHasAlert) {
        const newAlert = {
          id: alertId,
          type: "performance" as any,
          message: `⚠️ RITMO BAJO: Se han cerrado ${wonToday.length} ventas hoy. La meta diaria es de ${dailyTarget.toFixed(1)}.`,
          createdBy: "Sistema",
          createdAt: new Date().toLocaleString("es-CO")
        };
        setAlerts([newAlert, ...alerts]);
        toast.warning("Alerta de Rendimiento: Ritmo comercial por debajo de la meta diaria.");
      }
    }
  }, [isAdmin, isPaceLow, wonToday.length, dailyTarget]);

  const funnelData = useMemo(() => {
    return config.pipelineStages.map(stage => {
      const count = leads.filter(l => l.state === stage.key).length;
      return { name: stage.label, value: count, color: stage.color, key: stage.key };
    });
  }, [leads, config.pipelineStages]);

  const agentLeaderboard = useMemo(() => {
    const activeUsers = config.users.filter(u => u.active);
    return activeUsers.map(user => {
      const userLeads = leads.filter(l => l.assignedTo === user.name);
      const wonLeadsUser = userLeads.filter(l => wonStages.includes(l.state));
      const totalCommission = wonLeadsUser.reduce((s, l) => s + calculateCommission(l), 0);
      const goalUnits = user.monthlySalesCountGoal || 10;
      
      return {
        name: user.name,
        commission: totalCommission,
        wonCount: wonLeadsUser.length,
        progressUnits: (wonLeadsUser.length / goalUnits) * 100
      };
    }).sort((a, b) => b.commission - a.commission);
  }, [leads, config.users, wonStages]);

  const comisionesPorFecha = useMemo(() => {
    const map: Record<string, number> = {};
    wonLeads.forEach(l => {
      let dateKey = "N/A";
      if (l.fecha) {
        const parts = l.fecha.split(" ")[0].split(/\/|-/);
        dateKey = parts.length === 3 ? `${parts[1]}/${parts[0]}` : "N/A";
      }
      if (!map[dateKey]) map[dateKey] = 0;
      map[dateKey] += calculateCommission(l);
    });
    return Object.entries(map).map(([name, comision]) => ({ name, comision })).sort((a, b) => a.name.localeCompare(b.name));
  }, [wonLeads, config]);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background/50 backdrop-blur-3xl animate-in fade-in duration-700 p-6 lg:p-10 space-y-10 custom-scrollbar">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <TrendingUp size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">BI Intelligence Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
            Visualización avanzada de métricas de rendimiento, embudos de venta y análisis de equipo en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-card/40 border border-border/40 backdrop-blur-md flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Feed</span>
          </div>
          {isAdmin && (
            <button 
              onClick={() => exportLeadsToCSV(leads, "bi_report.csv")}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest"
            >
              Exportar BI Data
            </button>
          )}
        </div>
      </div>

      {isAdmin && isPaceLow && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[2.5rem] bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-amber-500/5 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest">Alerta de Ritmo Comercial</h3>
              <p className="text-xs text-muted-foreground font-medium">El equipo está por debajo de la cuota diaria requerida para alcanzar el objetivo mensual.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Meta Hoy</p>
                <p className="text-lg font-black text-foreground">{dailyTarget.toFixed(1)}</p>
             </div>
             <div className="w-px h-8 bg-border/40" />
             <div className="text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Cerrado Hoy</p>
                <p className="text-lg font-black text-amber-500">{wonToday.length}</p>
             </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget icon={<DollarSign size={20} />} label="Ventas Mensuales" value={formatMonto(totalComisiones)} color="primary" trend={ { value: "+12.5%", positive: true } } />
        <KPIWidget icon={<Package size={20} />} label="Unidades Cerradas" value={wonLeads.length.toString()} color="cyan" trend={ { value: "+2 Unid", positive: true } } />
        <KPIWidget icon={<Target size={20} />} label="Eficiencia Cierre" value={`${leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0}%`} color="amber" trend={ { value: "Estable", positive: true } } />
        <KPIWidget icon={<Users size={20} />} label="Total Prospectos" value={leads.length.toString()} color="violet" trend={ { value: "Actualizado", positive: true } } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 rounded-[40px] bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Target className="text-primary" size={24} />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Meta Comercial</h3>
                 </div>
                 <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">COP</span>
              </div>
              <div className="space-y-4">
                 <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-foreground">{Math.round((totalComisiones / teamTotalMoneyGoal) * 100)}%</span>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-muted-foreground/60">Objetivo Global</p>
                       <p className="text-sm font-black text-primary">{formatMonto(teamTotalMoneyGoal)}</p>
                    </div>
                 </div>
                 <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((totalComisiones / teamTotalMoneyGoal) * 100, 100)}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-primary" />
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-card/30 backdrop-blur-2xl border border-border/40 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Zap className="text-amber-500" size={24} />
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Meta de Volumen</h3>
                 </div>
                 <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">VENTAS</span>
              </div>
              <div className="space-y-4">
                 <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-foreground">{Math.round((wonLeads.length / teamTotalSalesGoal) * 100)}%</span>
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase text-muted-foreground/60">Objetivo Mensual</p>
                       <p className="text-sm font-black text-amber-500">{teamTotalSalesGoal} UNIDADES</p>
                    </div>
                 </div>
                 <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((wonLeads.length / teamTotalSalesGoal) * 100, 100)}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-amber-500" />
                 </div>
              </div>
           </div>
        </div>

        <div className={`p-8 rounded-[40px] shadow-2xl relative overflow-hidden group transition-all duration-500 border ${
           paceStatus === "excelente" ? "bg-emerald-600 text-white border-emerald-400" :
           paceStatus === "estable" ? "bg-primary text-white border-primary/20" :
           "bg-card/30 backdrop-blur-xl border-amber-500/30 text-foreground"
        }`}>
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
              <Calendar size={120} />
           </div>
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">Plan de Acción Hoy</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${paceStatus === 'bajo' ? 'text-muted-foreground' : 'text-white/70'}`}>Días laborales restantes: {remainingWorkDays}</p>
                 </div>
                 <div className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                    paceStatus === 'excelente' ? 'bg-white/20 text-white' : 
                    paceStatus === 'estable' ? 'bg-white/20 text-white' : 
                    'bg-amber-500 text-white'
                 }`}>
                    {paceStatus === 'excelente' ? 'Pace: +100%' : paceStatus === 'estable' ? 'Pace: Estable' : 'Pace: Crítico'}
                 </div>
              </div>

              <div className="space-y-6">
                 <div className={`flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-md ${
                    paceStatus === 'bajo' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/10 border-white/10'
                 }`}>
                    <div className={`p-2.5 rounded-2xl ${paceStatus === 'bajo' ? 'bg-amber-500 text-white' : 'bg-white text-primary'}`}>
                       <Zap size={20} />
                    </div>
                    <div>
                       <p className={`text-[9px] font-black uppercase tracking-wider italic ${paceStatus === 'bajo' ? 'text-amber-600' : 'opacity-70 text-white'}`}>Cuota Diaria Requerida</p>
                       <p className="text-2xl font-black">{dailyTarget.toFixed(1)} <span className="text-xs font-bold opacity-60">cierres/día</span></p>
                    </div>
                 </div>

                 <div className={`flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-md ${
                    paceStatus === 'bajo' ? 'bg-muted/30 border-border/40' : 'bg-white/10 border-white/10'
                 }`}>
                    <div className={`p-2.5 rounded-2xl ${paceStatus === 'bajo' ? 'bg-foreground text-background' : 'bg-white text-primary'}`}>
                       <Users size={20} />
                    </div>
                    <div>
                       <p className={`text-[9px] font-black uppercase tracking-wider italic ${paceStatus === 'bajo' ? 'text-muted-foreground' : 'opacity-70 text-white'}`}>Cuota Semanal Equipo</p>
                       <p className="text-2xl font-black">{weeklyTarget.toFixed(1)} <span className="text-xs font-bold opacity-60">cierres/sem</span></p>
                    </div>
                 </div>
              </div>

              <div className="pt-2">
                 <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${paceStatus === 'bajo' ? 'text-muted-foreground' : 'text-white'}`}>Faltan {salesToGoal} ventas para la meta</span>
                    <span className={`text-[10px] font-bold opacity-60 ${paceStatus === 'bajo' ? 'text-muted-foreground' : 'text-white'}`}>Cerrado Hoy: {wonToday.length}</span>
                 </div>
                 <div className={`h-1.5 w-full rounded-full overflow-hidden ${paceStatus === 'bajo' ? 'bg-muted' : 'bg-black/10'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(paceCompliance, 100)}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${paceStatus === 'bajo' ? 'bg-amber-500' : 'bg-white'}`} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-card/40 backdrop-blur-xl border border-border/40 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Embudo de Conversión</h3>
              <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest opacity-60">Status Flow & Drop-off Rates</p>
            </div>
          </div>
          <div className="space-y-6 relative z-10">
            {funnelData.map((stage, idx) => {
              const maxLeads = Math.max(...funnelData.map(d => d.value)) || 1;
              const percentage = (stage.value / maxLeads) * 100;
              const dropPercent = idx > 0 ? (stage.value / (funnelData[idx-1].value || 1)) * 100 : 100;
              return (
                <div key={stage.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-foreground/80 uppercase tracking-tighter">{stage.name} ({stage.value})</span>
                    {idx > 0 && <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-lg">{Math.round(dropPercent)}% conv.</span>}
                  </div>
                  <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/20">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: stage.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card/40 backdrop-blur-xl border border-border/40 rounded-[40px] p-8 shadow-2xl">
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-8">Performance Equipo</h3>
          <div className="space-y-4">
            {agentLeaderboard.map((agent, idx) => (
              <div key={agent.name} className="p-5 rounded-3xl bg-muted/20 border border-border/40 space-y-3">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black bg-primary text-primary-foreground">{agent.name.charAt(0)}</div>
                   <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground uppercase truncate tracking-tight">{agent.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] font-bold text-primary italic uppercase">{formatMonto(agent.commission)}</span>
                         <span className="text-[10px] font-black text-muted-foreground opacity-40">/ {agent.wonCount} VENTAS</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-1">
                   <div className="flex justify-between text-[8px] font-black uppercase text-muted-foreground">
                      <span>Rendimiento vs Meta Unidades</span>
                      <span>{Math.round(agent.progressUnits)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(agent.progressUnits, 100)}%` }} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIWidget({ icon, label, value, color, trend }: { icon: any; label: string; value: string; color: string; trend: { value: string; positive: boolean } }) {
  const colorMap: any = {
    primary: "from-blue-500/10 to-transparent border-blue-500/20 text-blue-500",
    cyan: "from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-500",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 text-amber-500",
    violet: "from-violet-500/10 to-transparent border-violet-500/20 text-violet-500",
  };
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-8 rounded-[40px] bg-gradient-to-br ${colorMap[color]} border bg-card/40 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl bg-white/10 ${colorMap[color].split(' ').pop()}`}>{icon}</div>
      </div>
      <div className="mt-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70 mb-1">{label}</p>
        <p className="text-2xl font-black text-foreground tabular-nums tracking-tighter">{value}</p>
      </div>
    </motion.div>
  );
}
