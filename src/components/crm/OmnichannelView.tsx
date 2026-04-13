import { useState, useMemo } from "react";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  Clock, 
  User, 
  ArrowUpRight,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Settings,
  MoreVertical
} from "lucide-react";
import type { Lead, CrmConfig, Activity, ActivityType } from "@/types/crm";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface OmnichannelViewProps {
  leads: Lead[];
  config: CrmConfig;
}

export function OmnichannelView({ leads, config }: OmnichannelViewProps) {
  const [filter, setFilter] = useState<ActivityType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const allActivities = useMemo(() => {
    const list: (Activity & { leadName: string; leadId: string; phone: string; email: string })[] = [];
    leads.forEach(lead => {
      (lead.activities || []).forEach(act => {
        if (!act.createdAt) return;
        list.push({
          ...act,
          leadName: lead.propietario,
          leadId: lead.id,
          phone: lead.phone || "",
          email: lead.email || ""
        });
      });
    });

    return list.sort((a, b) => {
       const dateA = new Date(a.createdAt).getTime() || 0;
       const dateB = new Date(b.createdAt).getTime() || 0;
       return dateB - dateA;
    });
  }, [leads]);

  const filteredActivities = useMemo(() => {
    return allActivities.filter(act => {
      const matchesFilter = filter === "all" || act.type === filter;
      const matchesSearch = act.leadName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             act.text.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [allActivities, filter, searchQuery]);

  const leadsWithRecentActivity = useMemo(() => {
    const map = new Map<string, any>();
    allActivities.forEach(act => {
      if (!map.has(act.leadId)) {
        map.set(act.leadId, {
          id: act.leadId,
          name: act.leadName,
          lastActivity: act.text,
          time: act.createdAt,
          type: act.type
        });
      }
    });
    return Array.from(map.values()).slice(0, 15);
  }, [allActivities]);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="flex-1 h-full flex bg-background/50 backdrop-blur-3xl animate-in fade-in duration-700 overflow-hidden">
      
      {/* Sidebar de Chats/Contactos */}
      <div className="w-80 border-r border-border/40 flex flex-col bg-card/30 backdrop-blur-md">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Timeline</h2>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Globe size={18} />
            </div>
          </div>
          
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Buscar conversación..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 border border-border/40 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          {leadsWithRecentActivity.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedLeadId(item.id)}
              className={`w-full group text-left p-3 rounded-2xl transition-all ${
                selectedLeadId === item.id ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                  selectedLeadId === item.id ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-black text-[11px] truncate uppercase tracking-tight">{item.name}</p>
                    <p className="text-[8px] opacity-40 font-bold whitespace-nowrap">
                       {(() => {
                         try {
                           const d = new Date(item.time);
                           if (isNaN(d.getTime())) return "Fecha desconocida";
                           return formatDistanceToNow(d, { addSuffix: true, locale: es });
                         } catch (e) {
                           return "Fecha desconocida";
                         }
                       })()}
                    </p>
                  </div>
                  <p className={`text-[10px] truncate opacity-60 ${selectedLeadId === item.id ? "" : "text-muted-foreground"}`}>
                    {item.lastActivity}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área Central Timeline */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-border/40 bg-card/20 backdrop-blur-md px-6 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/20">
                 <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Todo" />
                 <FilterButton active={filter === "whatsapp"} onClick={() => setFilter("whatsapp")} icon={<Zap size={12} />} label="WhatsApp" color="text-emerald-500" />
                 <FilterButton active={filter === "email"} onClick={() => setFilter("email")} icon={<Mail size={12} />} label="Email" color="text-blue-500" />
                 <FilterButton active={filter === "note"} onClick={() => setFilter("note")} icon={<MessageSquare size={12} />} label="Interno" color="text-violet-500" />
              </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                <Settings size={18} />
              </button>
              <button className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                <MoreVertical size={18} />
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-dots">
          <AnimatePresence mode="popLayout">
            {filteredActivities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <MessageSquare size={48} className="mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Sin actividad encontrada</p>
              </div>
            ) : (
              filteredActivities.map((act) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col ${act.author === "Sistema" ? "items-center" : "items-start"}`}
                >
                  <div className={`max-w-[80%] p-5 rounded-[2rem] border backdrop-blur-xl shadow-xl space-y-3 relative group ${
                    act.type === "whatsapp" ? "bg-emerald-500/5 border-emerald-500/20" :
                    act.type === "email" ? "bg-blue-500/5 border-blue-500/20" :
                    act.type === "note" ? "bg-violet-500/5 border-violet-500/20" :
                    "bg-card/40 border-border/40"
                  }`}>
                    <div className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                             act.type === "whatsapp" ? "bg-emerald-500/10 text-emerald-600" :
                             act.type === "email" ? "bg-blue-500/10 text-blue-600" :
                             "bg-primary/10 text-primary"
                          }`}>
                             {act.type === "whatsapp" ? <Zap size={14} /> : act.type === "email" ? <Mail size={14} /> : <User size={14} />}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{act.author} → {act.leadName}</span>
                       </div>
                       <span className="text-[9px] font-bold opacity-40 uppercase">{new Date(act.createdAt).toLocaleString()}</span>
                    </div>

                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{act.text}</p>

                    <div className="flex items-center gap-3 pt-2">
                        {act.type === "whatsapp" && (
                          <button 
                            onClick={() => window.open(`https://wa.me/${act.phone.replace(/\D/g, '')}`, '_blank')}
                            className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                          >
                            Responder WhatsApp
                          </button>
                        )}
                        {act.type === "email" && (
                          <button 
                            onClick={() => window.open(`mailto:${act.email}`, '_blank')}
                            className="px-4 py-1.5 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
                          >
                            Responder Email
                          </button>
                        )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Action Bar */}
        <div className="p-6 bg-card/30 backdrop-blur-md border-t border-border/40">
           <div className="max-w-4xl mx-auto flex gap-4 items-center bg-background/50 p-2 rounded-3xl border border-border/40 shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 h-12 border-r border-border/20">
                 <Zap size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-wider">Bitácora</span>
              </div>
              <input 
                placeholder={selectedLeadId ? `Registrar interacción con ${selectedLead?.propietario}...` : "Selecciona un contacto para registrar actividad..."}
                disabled={!selectedLeadId}
                className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium px-2 disabled:opacity-30"
              />
              <button 
                disabled={!selectedLeadId}
                className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, icon, label, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
        active ? "bg-primary text-primary-foreground shadow-lg" : `text-muted-foreground hover:bg-muted ${color}`
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
