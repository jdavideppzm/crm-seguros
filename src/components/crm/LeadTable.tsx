import { useState } from "react";
import { MessageCircle, Download, UserPlus, Trash2, LayoutGrid, CheckSquare, X, ChevronRight, Shield, ArrowUp, ArrowDown, ExternalLink, MoreVertical, Eye, Plus, FolderPlus, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, CrmConfig, SmartView } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";
import { getWhatsAppLink } from "@/utils/crm";
import { exportLeadsToCSV, exportLeadsToExcel, exportLeadsToPDF } from "@/utils/exportUtils";
import { getFieldLabel } from "@/types/crm";
import { PermissionGuard } from "./PermissionGuard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLeadId: string | null;
  locationFilter: string;
  onLocationFilterChange: (l: string) => void;
  assignedFilter: string;
  onAssignedFilterChange: (a: string) => void;
  statusLabels?: Record<string, string>;
  onRedistributeLeads?: (leadIds: string[], user: string) => void;
  onBulkUpdateLeads?: (leadIds: string[], updates: Partial<Lead>) => void;
  onBulkDeleteLeads?: (leadIds: string[]) => void;
  onCreateSmartView?: (view: SmartView) => void;
  config?: CrmConfig;
  compact?: boolean;
}

export function LeadTable({
  leads, onSelectLead, selectedLeadId,
  locationFilter, onLocationFilterChange,
  assignedFilter, onAssignedFilterChange,
  statusLabels = {}, onRedistributeLeads, onBulkUpdateLeads, onBulkDeleteLeads,
  onCreateSmartView, config, compact,
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showSmartMenu, setShowSmartMenu] = useState(false);
  const [isCreatingSmartView, setIsCreatingSmartView] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const locations = [...new Set(leads.map((l) => l.lugar).filter(Boolean))].sort();
  const assigned = [...new Set(leads.map((l) => l.assignedTo).filter(Boolean))].sort();
  const activeUsers = config?.users.filter(u => u.active) || [];

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === leads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(leads.map(l => l.id)));
  };

  const handleBulkStatusChange = (status: string) => {
    if (onBulkUpdateLeads && selectedIds.size > 0) {
      onBulkUpdateLeads(Array.from(selectedIds), { state: status });
      setSelectedIds(new Set());
      setShowStatusMenu(false);
    }
  };

  const handleBulkAssign = (user: string) => {
    if (onBulkUpdateLeads && selectedIds.size > 0) {
      onBulkUpdateLeads(Array.from(selectedIds), { assignedTo: user });
      setSelectedIds(new Set());
      setShowAssignMenu(false);
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDeleteLeads && selectedIds.size > 0) {
      onBulkDeleteLeads(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowDeleteDialog(false);
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const selectedLeads = leads.filter(l => selectedIds.has(l.id));
    if (!selectedLeads.length) return;

    if (format === "csv") exportLeadsToCSV(selectedLeads, "leads_seleccionados.csv");
    else if (format === "excel") exportLeadsToExcel(selectedLeads, "leads_seleccionados.xlsx");
    else if (format === "pdf") exportLeadsToPDF(selectedLeads, config?.companyInfo?.name);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      <div className="flex items-center gap-2 px-6 py-2 border-b border-border bg-card">
        <select value={locationFilter} onChange={(e) => onLocationFilterChange(e.target.value)} className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground font-medium">
          <option value="">Todas las ciudades</option>
          {locations.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={assignedFilter} onChange={(e) => onAssignedFilterChange(e.target.value)} className="text-xs py-1.5 px-2.5 bg-secondary border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/20 text-muted-foreground font-medium">
          <option value="">Todos los asignados</option>
          {assigned.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <span className="ml-auto text-xs font-semibold text-muted-foreground mr-3">{leads.length} registros</span>
        <PermissionGuard action="export_data" showLocked lockMessage="Solo administradores">
          <button 
            onClick={() => exportLeadsToCSV(leads, "leads_filtrados.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-foreground text-[10px] font-bold border border-border hover:bg-muted transition-all active:scale-95 uppercase tracking-wider shadow-sm"
            title="Exportar a Excel"
          >
            <Download size={12} /> Exportar
          </button>
        </PermissionGuard>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px] border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/80 backdrop-blur-md">
              {!compact && (
                <th className="w-12 px-4 py-3.5 border-b border-border/50">
                  <input type="checkbox" checked={selectedIds.size === leads.length && leads.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-border/60 text-primary focus:ring-primary/20 transition-all" />
                </th>
              )}
              <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[220px] uppercase tracking-widest text-[9px] border-b border-border/50">Propietario / {config ? getFieldLabel(config, "placa", "Placa") : "Placa"}</th>
              {!compact && <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[100px] uppercase tracking-widest text-[9px] border-b border-border/50">Ciudad</th>}
              {!compact && <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[90px] uppercase tracking-widest text-[9px] border-b border-border/50">Tipo</th>}
              {!compact && <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[120px] uppercase tracking-widest text-[9px] border-b border-border/50">{config ? getFieldLabel(config, "insurance", "Aseguradora") : "Aseguradora"}</th>}
              <th className="text-right font-black text-muted-foreground/60 px-3 py-3.5 w-[120px] uppercase tracking-widest text-[9px] border-b border-border/50">Val. Asegurado</th>
              <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[130px] uppercase tracking-widest text-[9px] border-b border-border/50">Estado</th>
              {!compact && <th className="text-left font-black text-muted-foreground/60 px-3 py-3.5 w-[100px] uppercase tracking-widest text-[9px] border-b border-border/50">Asignado</th>}
              <th className="text-center font-black text-muted-foreground/60 px-3 py-3.5 w-[70px] uppercase tracking-widest text-[9px] border-b border-border/50">Link</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, idx) => (
              <motion.tr 
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.4 }}
                className={`group border-b border-border/20 cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  selectedLeadId === lead.id ? "bg-primary/[0.08] shadow-inner" : selectedIds.has(lead.id) ? "bg-primary/[0.04]" : "hover:bg-muted/40"
                }`}>
                {!compact && (
                  <td className="px-5 py-3 relative" onClick={(e) => e.stopPropagation()}>
                    {selectedLeadId === lead.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/80" />
                    )}
                    <input type="checkbox" checked={selectedIds.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="w-4 h-4 rounded-md border-border/60 text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                  </td>
                )}
                <td className="px-3 py-3" onClick={() => onSelectLead(lead)}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[13px] font-black text-primary shrink-0 transition-all group-hover:scale-110 shadow-sm border border-primary/10 group-hover:shadow-primary/10">
                      {lead.propietario.charAt(0)}
                    </div>
                    <div className="min-w-0 flex flex-col pt-0.5">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <p className="font-black text-foreground truncate text-[13.5px] leading-tight tracking-tight">{lead.propietario}</p>
                        {lead.score !== undefined && lead.score > 80 && (
                          <div className="flex items-center gap-1 group/score relative">
                             <span className="text-[10px] animate-pulse">🔥</span>
                             <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover/score:opacity-100 transition-opacity whitespace-nowrap z-50">SCORE: {lead.score}%</div>
                          </div>
                        )}
                        {lead.isRenewal && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[8px] font-black uppercase tracking-widest shadow-sm">Renovación</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {lead.placa && <p className="text-[9px] text-muted-foreground font-black tracking-widest bg-muted px-1.5 py-0.5 rounded uppercase">{lead.placa}</p>}
                        {lead.assignedTo && <p className="text-[9px] text-muted-foreground font-bold italic truncate opacity-60">· {lead.assignedTo.split(' ')[0]}</p>}
                      </div>
                    </div>
                  </div>
                </td>
                {!compact && <td className="px-3 py-3 text-muted-foreground font-bold text-[11px] uppercase tracking-wider" onClick={() => onSelectLead(lead)}>{lead.lugar}</td>}
                {!compact && <td className="px-3 py-3" onClick={() => onSelectLead(lead)}>
                  <span className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-black text-muted-foreground/80 border border-border/40 uppercase tracking-tighter">
                    {lead.tipPoliza || lead.tipoSeguro || "S.I."}
                  </span>
                </td>}
                {!compact && <td className="px-3 py-3 text-foreground font-bold text-[11px] flex items-center gap-2" onClick={() => onSelectLead(lead)}>
                  <Shield size={12} className="text-primary/60 shrink-0" />
                  <span className="truncate">{lead.insurance}</span>
                </td>}
                <td className="px-3 py-3 text-right font-mono text-foreground font-black text-[13px] tracking-tighter" onClick={() => onSelectLead(lead)}>
                  {formatMonto(lead.monto)}
                </td>
                <td className="px-3 py-3" onClick={() => onSelectLead(lead)}>
                  <div className="flex items-center justify-center -ml-1">
                    <StatusBadge status={lead.state} labelOverrides={statusLabels} pipelineStages={config?.pipelineStages} />
                  </div>
                </td>
                {!compact && (
                  <td className="px-3 py-3 text-muted-foreground" onClick={() => onSelectLead(lead)}>
                    <div className="flex -space-x-2">
                       <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[9px] font-black text-primary" title={lead.assignedTo}>
                         {lead.assignedTo ? lead.assignedTo.charAt(0) : "?"}
                       </div>
                    </div>
                  </td>
                )}
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <div className="flex bg-background/80 backdrop-blur-md border border-border/60 rounded-xl p-1 shadow-xl">
                      {getWhatsAppLink(lead) && (
                        <a 
                          href={getWhatsAppLink(lead)!} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle size={14} strokeWidth={2.5} />
                        </a>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
                        title="Ver Detalles"
                      >
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); /* TODO: quick menu */ }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-all active:scale-90"
                      >
                        <MoreVertical size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={compact ? 4 : 9} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-40">
                    <CheckSquare size={48} className="text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">No se encontraron registros activos.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FLOATING ACTION TOOLBAR */}
      {selectedIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl flex items-center gap-1 p-1.5 backdrop-blur-md">
            <div className="px-4 py-2 border-r border-border mr-1">
              <span className="text-xs font-bold text-foreground">{selectedIds.size}</span>
              <span className="text-[10px] text-muted-foreground ml-1 uppercase font-bold tracking-wider">Leads</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => { setShowStatusMenu(!showStatusMenu); setShowAssignMenu(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showStatusMenu ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>
                <LayoutGrid size={14} /> Cambiar Estado
              </button>
              {showStatusMenu && (
                <div className="absolute bottom-full mb-3 left-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[180px] p-1.5 space-y-1 animate-in zoom-in-95 origin-bottom-left">
                  {[...(config?.pipelineStages || [])].sort((a, b) => a.order - b.order).map(stage => (
                    <button key={stage.key} onClick={() => handleBulkStatusChange(stage.key)} className="w-full text-left text-[11px] font-bold px-3 py-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-between group">
                      {stage.label} <ChevronRight size={10} className="opacity-0 group-hover:opacity-40" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => { setShowSmartMenu(!showSmartMenu); setShowStatusMenu(false); setShowAssignMenu(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${showSmartMenu ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>
                <Eye size={14} /> Smart Views
              </button>
              {showSmartMenu && (
                <div className="absolute bottom-full mb-3 left-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[200px] p-1.5 space-y-1 animate-in zoom-in-95 origin-bottom-left">
                  {config?.smartViews.map(sv => (
                    <button 
                      key={sv.id} 
                      onClick={() => {
                        if (onBulkUpdateLeads) {
                          const updates: Partial<Lead> = {};
                          if (sv.filterType === "status") updates.state = sv.filterValue as any;
                          else if (sv.filterType === "assigned") updates.assignedTo = sv.filterValue;
                          else if (sv.filterType === "field" && sv.filterField) (updates as any)[sv.filterField] = sv.filterValue;
                          
                          onBulkUpdateLeads(Array.from(selectedIds), updates);
                          setSelectedIds(new Set());
                          setShowSmartMenu(false);
                        }
                      }}
                      className="w-full text-left text-[11px] font-bold px-3 py-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2 group"
                    >
                      <span>{sv.icon}</span>
                      <span className="flex-1 truncate">{sv.name}</span>
                      <ChevronRight size={10} className="opacity-0 group-hover:opacity-40" />
                    </button>
                  ))}
                  <div className="h-px bg-border/50 my-1" />
                  {!isCreatingSmartView ? (
                    <button 
                      onClick={() => setIsCreatingSmartView(true)}
                      className="w-full text-left text-[11px] font-black px-3 py-2 text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus size={12} strokeWidth={3} /> Nueva Smart View
                    </button>
                  ) : (
                    <div className="p-2 space-y-2 animate-in slide-in-from-top-1">
                      <input 
                        value={newViewName}
                        onChange={(e) => setNewViewName(e.target.value)}
                        placeholder="Nombre de la vista..."
                        className="w-full text-[10px] py-1.5 px-2 bg-muted border border-border rounded-md outline-none focus:ring-1 focus:ring-primary/40"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button 
                          onClick={() => {
                            if (newViewName.trim() && onCreateSmartView && onBulkUpdateLeads) {
                              const category = newViewName.trim().toLowerCase().replace(/\s/g, "_");
                              const newView: SmartView = {
                                id: Date.now().toString(),
                                name: newViewName.trim(),
                                icon: "📂",
                                filterType: "field",
                                filterField: "smartCategory",
                                filterValue: category
                              };
                              onCreateSmartView(newView);
                              onBulkUpdateLeads(Array.from(selectedIds), { smartCategory: category });
                              
                              setNewViewName("");
                              setIsCreatingSmartView(false);
                              setShowSmartMenu(false);
                              setSelectedIds(new Set());
                            }
                          }}
                          className="flex-1 text-[10px] py-1 rounded bg-primary text-white font-bold"
                        >
                          Crear y Mover
                        </button>
                        <button onClick={() => setIsCreatingSmartView(false)} className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground"><X size={12} /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <PermissionGuard action="export_data" showLocked lockMessage="Sin permiso de exportar">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted text-xs font-bold transition-all text-foreground">
                    <Download size={14} /> Exportar
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="text-xs font-bold py-2 cursor-pointer" onClick={() => handleExport("csv")}>
                    📄 Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs font-bold py-2 cursor-pointer" onClick={() => handleExport("excel")}>
                    📊 Exportar Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs font-bold py-2 cursor-pointer" onClick={() => handleExport("pdf")}>
                    📕 Exportar PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>

            <PermissionGuard action="delete_leads" showLocked lockMessage="Sin permiso de eliminar">
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-destructive hover:text-destructive-foreground text-destructive text-xs font-bold transition-all">
                <Trash2 size={14} /> Eliminar
              </button>
            </PermissionGuard>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent className="max-w-[360px] rounded-3xl p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">¿Confirmar Eliminación?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium">
                    Estás a punto de eliminar <strong>{selectedIds.size}</strong> registros de forma permanente. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 mt-4">
                  <AlertDialogCancel className="rounded-xl border-border text-xs font-bold">Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold border-none shadow-lg shadow-destructive/20">
                    Eliminar Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="w-px h-6 bg-border mx-1" />

            <button onClick={() => setSelectedIds(new Set())} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all" title="Desestimar">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
