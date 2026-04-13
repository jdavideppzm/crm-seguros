import { useState, useMemo } from "react";
import { Users, Search, ChevronRight, Shield, Calendar, Phone, Mail, FolderOpen, ArrowUpRight, Filter, MoreVertical, CreditCard } from "lucide-react";
import type { Lead, CrmConfig } from "@/types/crm";
import { formatMonto } from "@/utils/crm";
import { motion, AnimatePresence } from "framer-motion";

interface ClientDirectoryProps {
  leads: Lead[];
  config: CrmConfig;
  onSelectLead: (lead: Lead) => void;
}

interface ClientGroup {
  id: string;
  name: string;
  identification: string;
  type: string;
  email: string;
  phone: string;
  leads: Lead[];
  totalPremium: number;
  totalSum: number;
}

export function ClientDirectory({ leads, config, onSelectLead }: ClientDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const clients = useMemo(() => {
    const groups: Record<string, ClientGroup> = {};
    
    leads.forEach(lead => {
      const id = lead.numeroIdentificacion || lead.propietario;
      if (!groups[id]) {
        groups[id] = {
          id,
          name: lead.propietario,
          identification: lead.numeroIdentificacion || "S.I.",
          type: lead.tipoIdentificacion || "CC",
          email: lead.email,
          phone: lead.phone,
          leads: [],
          totalPremium: 0,
          totalSum: 0
        };
      }
      groups[id].leads.push(lead);
      groups[id].totalPremium += (lead.valorPrima || 0);
      groups[id].totalSum += (lead.monto || 0);
    });

    return Object.values(groups).filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.identification.includes(searchQuery)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [leads, searchQuery]);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId), 
  [clients, selectedClientId]);

  return (
    <div className="flex-1 h-full overflow-hidden flex bg-background/50 backdrop-blur-3xl animate-in fade-in duration-700">
      {/* Sidebar List */}
      <div className="w-[400px] border-r border-border/40 flex flex-col bg-card/30 backdrop-blur-md">
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase flex items-center gap-3">
              <Users size={24} className="text-primary" /> Directorio
            </h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">Base de Clientes Unificada</p>
          </div>

          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input 
              placeholder="Buscar por nombre o ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 border border-border/40 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1 custom-scrollbar">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className={`w-full group text-left p-4 rounded-3xl transition-all relative overflow-hidden ${
                selectedClientId === client.id 
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]" 
                  : "hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 shadow-inner ${
                  selectedClientId === client.id ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-[13px] leading-tight truncate uppercase tracking-tight">{client.name}</p>
                  <p className={`text-[10px] font-bold mt-1 opacity-60 tracking-wider ${
                    selectedClientId === client.id ? "text-primary-foreground" : "text-muted-foreground"
                  }`}>
                    {client.type} {client.identification}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                     selectedClientId === client.id ? "bg-white/20" : "bg-primary/5 text-primary border border-primary/10"
                   }`}>
                     {client.leads.length} {client.leads.length === 1 ? 'PÓLIZA' : 'PÓLIZAS'}
                   </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <motion.div 
              key={selectedClientId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 lg:p-12 space-y-12"
            >
              {/* Client Profile Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-card/40 p-8 rounded-[40px] border border-border/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-primary/30">
                    {selectedClient.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">{selectedClient.name}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                       <span className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/40">
                         <Shield size={12} className="text-primary" /> {selectedClient.type} {selectedClient.identification}
                       </span>
                       <span className="opacity-40">•</span>
                       <span className="flex items-center gap-2"><Phone size={12} /> {selectedClient.phone || "Sin Teléfono"}</span>
                       <span className="opacity-40">•</span>
                       <span className="flex items-center gap-2"><Mail size={12} /> {selectedClient.email || "Sin Email"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                   <div className="text-right px-6 py-4 rounded-3xl bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Carga Prestacional</p>
                      <p className="text-2xl font-black text-foreground tracking-tighter">{formatMonto(selectedClient.totalPremium)}</p>
                   </div>
                   <button className="p-4 rounded-3xl bg-foreground text-background hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
                      <ArrowUpRight size={20} strokeWidth={3} />
                   </button>
                </div>
              </div>

              {/* Policies List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                   <h3 className="text-[13px] font-black text-foreground uppercase tracking-[0.25em] flex items-center gap-3">
                      <FolderOpen size={16} className="text-primary" /> Historial de Pólizas
                   </h3>
                   <div className="flex items-center gap-2">
                      <button className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground transition-all">
                        <Filter size={14} />
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedClient.leads.map(lead => (
                    <button
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="group text-left p-6 rounded-[32px] bg-card/40 border border-border/40 hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Shield size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                             ACTIVA
                           </span>
                           <MoreVertical size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-1">{lead.insurance || "Aseguradora"}</p>
                          <h4 className="text-xl font-black text-foreground tracking-tight leading-tight uppercase group-hover:text-primary transition-colors">
                            {lead.tipoSeguro || lead.tipPoliza || "Todo Riesgo Autos"}
                          </h4>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-border/20">
                           <div className="flex-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Monto de Venta</p>
                              <p className="text-[15px] font-black text-foreground">{formatMonto(lead.valorPrima)}</p>
                           </div>
                           <div className="flex-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Vencimiento</p>
                              <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5 leading-none mt-0.5">
                                <Calendar size={12} className="opacity-40" /> {lead.expirationDate || lead.fecha}
                              </p>
                           </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
               <div className="w-32 h-32 rounded-full bg-muted/20 flex items-center justify-center mb-8 border border-border/40 animate-pulse">
                  <Users size={48} className="text-muted-foreground/30" />
               </div>
               <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter opacity-40">Selecciona un Cliente</h3>
               <p className="text-sm text-muted-foreground max-w-sm mt-4 font-medium opacity-60">
                 Explora la base de datos unificada para visualizar el historial completo de pólizas y estados financieros por cliente.
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
