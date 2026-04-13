import { useState, useMemo } from "react";
import { 
  Calendar, 
  Search, 
  Shield, 
  Phone, 
  Mail, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  MoreVertical,
  Zap,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import type { Lead, CrmConfig } from "@/types/crm";
import { formatMonto } from "@/utils/crm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface RenewalsViewProps {
  leads: Lead[];
  config: CrmConfig;
  onSelectLead: (lead: Lead) => void;
  onCreateLead: (lead: Lead) => void;
}

export function RenewalsView({ leads, config, onSelectLead, onCreateLead }: RenewalsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const wonLeads = useMemo(() => {
    const wonStatus = config.pipelineStages.find(s => s.finalType === "ganado")?.key || "ganado";
    return leads.filter(l => l.state === wonStatus && l.expirationDate);
  }, [leads, config.pipelineStages]);

  const segmentedRenewals = useMemo(() => {
    const now = Date.now();
    const criticallySoon: Lead[] = [];
    const upcoming: Lead[] = [];
    const planned: Lead[] = [];

    wonLeads.forEach(l => {
      const diff = (new Date(l.expirationDate!).getTime() - now) / (1000 * 60 * 60 * 24);
      const matchesSearch = l.propietario.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             l.placa.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return;

      if (diff <= 15) criticallySoon.push(l);
      else if (diff <= 30) upcoming.push(l);
      else planned.push(l);
    });

    return { criticallySoon, upcoming, planned };
  }, [wonLeads, searchQuery]);

  const stats = useMemo(() => {
    const totalPotential = wonLeads.reduce((s, l) => s + (l.valorPrima || 0), 0);
    const criticalPotential = segmentedRenewals.criticallySoon.reduce((s, l) => s + (l.valorPrima || 0), 0);
    return {
      total: wonLeads.length,
      totalPotential,
      criticalCount: segmentedRenewals.criticallySoon.length,
      criticalPotential
    };
  }, [wonLeads, segmentedRenewals]);

  const handleInitiateRenewal = (lead: Lead) => {
    // Logic to create a "renewal" lead
    const newLead: Lead = {
      ...lead,
      id: "renewal_" + Date.now(),
      state: config.pipelineStages[0].key, // Start at the beginning
      fecha: new Date().toLocaleDateString("es-CO"),
      isRenewal: true,
      parentLeadId: lead.id,
      notes: [{ id: "n1", text: `Renovación iniciada desde póliza con placa ${lead.placa}. Vence el ${lead.expirationDate}.`, date: new Date().toLocaleString() }],
      activities: [],
      monto: lead.monto,
      valorPrima: lead.valorPrima,
    };
    
    onCreateLead(newLead);
    toast.success(`Proceso de renovación iniciado para ${lead.propietario}. Se ha creado un nuevo Lead en el pipeline.`);
  };

  const handleWhatsApp = (lead: Lead) => {
    const message = `Hola ${lead.propietario}, te escribo de Jedael Seguros. Te recordamos que tu póliza para el vehículo con placa ${lead.placa} vence el próximo ${lead.expirationDate}. ¿Te gustaría que te enviemos la cotización para la renovación?`;
    window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-background/50 backdrop-blur-3xl animate-in fade-in duration-700 p-6 lg:p-10 space-y-10 custom-scrollbar">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <RefreshCw size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Centro de Renovaciones</h1>
          </div>
          <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">
            Gestión proactiva de vencimientos y retención de clientes. Anticipa el cierre de la próxima vigencia.
          </p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input 
            placeholder="Buscar por placa o cliente..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/40 border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium backdrop-blur-md"
          />
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RenewalKPI 
          icon={<Clock size={20} />} 
          label="Pendientes Mes" 
          value={stats.total.toString()} 
          subValue={formatMonto(stats.totalPotential)}
          color="primary" 
        />
        <RenewalKPI 
          icon={<AlertTriangle size={20} />} 
          label="Críticos (15d)" 
          value={stats.criticalCount.toString()} 
          subValue={formatMonto(stats.criticalPotential)}
          color="amber" 
        />
        <RenewalKPI 
          icon={<Zap size={20} />} 
          label="Tasa de Retención" 
          value="85%" 
          subValue="Meta: 90%"
          color="emerald" 
        />
        <RenewalKPI 
          icon={<Shield size={20} />} 
          label="Pólizas Activas" 
          value={leads.filter(l => l.state === "ganado").length.toString()} 
          subValue="Cartera Total"
          color="cyan" 
        />
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        <RenewalSection 
          title="Vencimientos Críticos (Próximos 15 días)" 
          count={segmentedRenewals.criticallySoon.length}
          leads={segmentedRenewals.criticallySoon}
          onInitiate={handleInitiateRenewal}
          onWhatsApp={handleWhatsApp}
          onSelect={onSelectLead}
          badgeColor="bg-red-500/10 text-red-600 border-red-500/20"
          isCritical
        />

        <RenewalSection 
          title="Próximas Renovaciones (16 a 30 días)" 
          count={segmentedRenewals.upcoming.length}
          leads={segmentedRenewals.upcoming}
          onInitiate={handleInitiateRenewal}
          onWhatsApp={handleWhatsApp}
          onSelect={onSelectLead}
          badgeColor="bg-amber-500/10 text-amber-600 border-amber-500/20"
        />

        <RenewalSection 
          title="Planificación de Cartera (31+ días)" 
          count={segmentedRenewals.planned.length}
          leads={segmentedRenewals.planned}
          onInitiate={handleInitiateRenewal}
          onWhatsApp={handleWhatsApp}
          onSelect={onSelectLead}
          badgeColor="bg-blue-500/10 text-blue-600 border-blue-500/20"
        />
      </div>
    </div>
  );
}

function RenewalSection({ title, count, leads, onInitiate, onWhatsApp, onSelect, badgeColor, isCritical }: any) {
  if (leads.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
           <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">{title}</h3>
           <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badgeColor}`}>{count}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.map((lead: Lead) => (
          <motion.div 
            key={lead.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group p-6 rounded-[32px] bg-card/40 border border-border/40 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden backdrop-blur-xl ${isCritical ? 'border-l-4 border-l-red-500' : ''}`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Shield size={20} strokeWidth={2.5} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Cence en</p>
                <p className={`text-sm font-black flex items-center gap-1.5 justify-end ${isCritical ? 'text-red-500' : 'text-foreground'}`}>
                   <Calendar size={14} /> {lead.expirationDate}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{lead.placa} • {lead.insurance}</p>
                <h4 className="text-xl font-black text-foreground tracking-tight leading-tight uppercase group-hover:text-primary transition-colors truncate">
                  {lead.propietario}
                </h4>
                <p className="text-[11px] font-bold text-muted-foreground mt-1 truncate">{lead.tipoSeguro || "Todo Riesgo Autos"}</p>
              </div>

              <div className="pt-4 border-t border-border/20 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => onInitiate(lead)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <RefreshCw size={12} /> Renovar
                </button>
                <button 
                  onClick={() => onWhatsApp(lead)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                >
                  <MessageSquare size={12} /> WhatsApp
                </button>
              </div>

              <button 
                onClick={() => onSelect(lead)}
                className="w-full py-2 text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.2em] transition-colors"
              >
                Ver Historial Completo
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RenewalKPI({ icon, label, value, subValue, color }: any) {
  const colorMap: any = {
    primary: "from-blue-500/10 text-blue-500 border-blue-500/20",
    amber: "from-amber-500/10 text-amber-500 border-amber-500/20",
    emerald: "from-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cyan: "from-cyan-500/10 text-cyan-500 border-cyan-500/20",
  };
  
  return (
    <div className={`p-6 rounded-[32px] bg-gradient-to-br ${colorMap[color]} border bg-card/40 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-all duration-300 hover:scale-105`}>
      <div className="p-3 w-fit rounded-2xl bg-white/10">{icon}</div>
      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end justify-between">
           <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{value}</p>
           <p className="text-[10px] font-bold text-muted-foreground mb-1">{subValue}</p>
        </div>
      </div>
    </div>
  );
}
