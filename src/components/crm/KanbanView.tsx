import { useMemo } from "react";
import { User, Calendar, TrendingUp, DollarSign, Target, BarChart3, GripVertical, MessageCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, PipelineStageConfig, CrmConfig, PipelineStatus } from "@/types/crm";
import { DEFAULT_PIPELINE_STAGES } from "@/types/crm";
import { getWhatsAppLink } from "@/utils/crm";

interface KanbanViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  statusLabels?: Record<string, string>;
  pipelineStages?: PipelineStageConfig[];
  config?: CrmConfig;
  onUpdateLead?: (lead: Lead) => void;
  onReorderLead?: (leadId: string, source: string, dest: string, sourceIdx: number, destIdx: number) => void;
}

export function KanbanView({ leads, onSelectLead, statusLabels = {}, pipelineStages, config, onUpdateLead, onReorderLead }: KanbanViewProps) {
  const stages = (pipelineStages || DEFAULT_PIPELINE_STAGES).sort((a, b) => a.order - b.order);

  const grouped = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    stages.forEach((s) => (map[s.key] = []));
    leads.forEach((l) => {
      if (map[l.state]) map[l.state].push(l);
      else if (stages.length > 0) map[stages[0].key].push(l);
    });
    return map;
  }, [leads, stages]);

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const colTotal = (key: string) => (grouped[key] || []).reduce((s, l) => s + l.monto, 0);

  const totalValue = leads.reduce((s, l) => s + l.monto, 0);
  const avgTicket = leads.length ? totalValue / leads.length : 0;
  const wonStages = stages.filter(s => s.finalType === "ganado").map(s => s.key);
  const wonLeads = leads.filter(l => wonStages.includes(l.state));
  const conversionRate = leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0;
  
  const totalComision = config ? leads.reduce((s, l) => {
    const company = config.insuranceCompanies.find(c => c.name === l.insurance);
    return s + ((l.valorPrima || 0) * (company?.commission || 0) / 100);
  }, 0) : 0;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || (!onUpdateLead && !onReorderLead)) return;
    const { source, destination, draggableId } = result;
    
    // Si no cambió ni índice ni columna, ignorar.
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    if (onReorderLead) {
       onReorderLead(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
    } else {
       // Fallback
       const leadToMove = leads.find(l => l.id === draggableId);
       if (leadToMove && onUpdateLead && leadToMove.state !== destination.droppableId) {
         onUpdateLead({ ...leadToMove, state: destination.droppableId as PipelineStatus });
       }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="px-5 pt-5 pb-3">
        <div className="grid grid-cols-4 gap-4">
          <KpiCard icon={<DollarSign size={18} />} label="Cartera Total" value={formatMonto(totalValue)} color="text-primary" />
          <KpiCard icon={<Target size={18} />} label="Total Leads" value={leads.length.toString()} color="text-amber-500" />
          <KpiCard icon={<TrendingUp size={18} />} label="Tasa Cierre" value={`${conversionRate}%`} color="text-emerald-500" />
          <KpiCard icon={<BarChart3 size={18} />} label={totalComision > 0 ? "Comisión Est." : "Ticket Promedio"} value={formatMonto(totalComision > 0 ? totalComision : avgTicket)} color="text-cyan-500" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-5 pt-3">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4">
            {stages.map((stage) => (
              <div key={stage.key} className={`w-[280px] flex flex-col rounded-2xl border border-border/40 ${stage.isFinal ? "bg-muted/80" : "bg-card/40 backdrop-blur-sm"}`}>
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold text-foreground tracking-tight">{stage.label}</span>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/80 rounded-md px-1.5 py-0.5">{(grouped[stage.key] || []).length}</span>
                  </div>
                  {stage.isFinal && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${stage.finalType === "ganado" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>
                      {stage.finalType === "ganado" ? "✓" : "✕"}
                    </span>
                  )}
                </div>
                <p className="px-4 py-2 text-xs font-mono text-muted-foreground bg-muted/10">
                  Total: <span className="font-medium text-foreground">{formatMonto(colTotal(stage.key))}</span>
                </p>
                
                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto kanban-scroll px-3 pb-3 space-y-3 pt-3 transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 rounded-b-2xl" : ""}`}
                    >
                      {(grouped[stage.key] || []).map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={(e) => {
                                if (e.defaultPrevented) return;
                                onSelectLead(lead);
                              }}
                              className={`bg-card/90 rounded-xl border p-4 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden ${
                                snapshot.isDragging ? "shadow-2xl border-primary/50 ring-1 ring-primary/20 bg-card/95 backdrop-blur-xl rotate-2 scale-105" : "border-border/60 hover:border-primary/40"
                              }`}
                            >
                              {/* Background Blur for Glass Effect */}
                              <div className="absolute inset-0 bg-background/50 backdrop-blur-[var(--glass-blur)] -z-10" />

                              <div className="flex items-start gap-3 mb-3">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <GripVertical size={14} />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0 ring-4 ring-background shadow-sm">
                                  {lead.propietario.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1 pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-foreground truncate leading-tight flex-1">{lead.propietario}</p>
                                    {lead.score && lead.score > 80 && <span className="text-[10px] animate-pulse">🔥</span>}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
                                    <span className="w-2 h-2 rounded-full bg-primary/40"></span> 
                                    {lead.placa || (lead.insurance || "Sin datos")}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-3 ml-7">
                                {lead.paymentStatus && (
                                  <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border shadow-sm" style={{ backgroundColor: getPaymentColor(lead.paymentStatus, config) + "20", color: getPaymentColor(lead.paymentStatus, config), borderColor: getPaymentColor(lead.paymentStatus, config) + "40" }}>
                                    {lead.paymentStatus}
                                  </span>
                                )}
                                {lead.isRenewal && (
                                  <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm animate-pulse">
                                    🔄 Renovación
                                  </span>
                                )}
                              </div>

                              <div className="ml-7 flex items-center justify-between">
                                <p className="font-mono text-sm font-black text-foreground" style={{ color: stage.color }}>
                                  {formatMonto(lead.monto)}
                                </p>
                                {getWhatsAppLink(lead) && (
                                  <a 
                                    href={getWhatsAppLink(lead)!} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/30 hover:scale-110 transition-all shadow-sm border border-emerald-500/20"
                                    title="Enviar WhatsApp"
                                  >
                                    <MessageCircle size={14} />
                                  </a>
                                )}
                              </div>

                              <div className="mt-3.5 ml-7 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  {lead.assignedTo && <span className="flex items-center gap-1.5"><User size={12} className="text-primary/60" />{lead.assignedTo.split(" ")[0]}</span>}
                                  <span className="flex items-center gap-1.5"><Calendar size={12} className="text-muted-foreground/50" />{lead.fecha.split(" ")[0]}</span>
                                </div>
                                {lead.score !== undefined && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/50 border border-border/50 font-mono">
                                    <span className="text-[8px] opacity-60">SCORE:</span> {lead.score}%
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {(grouped[stage.key] || []).length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-24 flex items-center justify-center text-[11px] font-medium text-muted-foreground/50 border-2 border-dashed border-border/40 rounded-xl">Sin leads</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md hover:bg-card/60 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.03] group-hover:opacity-10 transition-opacity ${color.replace('text-', 'bg-')}`} />
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className={`p-1.5 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm ${color}`}>{icon}</div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight ml-1">{value}</p>
    </div>
  );
}

function getPaymentColor(status: string, config?: CrmConfig): string {
  if (config) {
    const ps = config.paymentStatuses.find(p => p.label === status);
    if (ps) return ps.color;
  }
  const colors: Record<string, string> = {
    "Vendida": "#9CA3AF", "Pagado": "#10B981", "En proceso": "#F59E0B", "No pagado": "#EF4444",
  };
  return colors[status] || "#9CA3AF";
}
