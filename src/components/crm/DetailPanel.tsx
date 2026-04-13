import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, Mail, MessageSquare, Save, Activity as ActivityIcon, Bell, Clock, User, Shield, CreditCard, ScanLine, StickyNote, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Lead, PipelineStatus, Note, Activity, CrmConfig, ContactEntry } from "@/types/crm";
import { getStatusLabel, getInsuranceCommission } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";
import { DocumentsView } from "./DocumentsView";
import { ActivityItem } from "./ActivityItem";
import { OpportunitiesSection } from "./OpportunitiesSection";
import { TasksSection } from "./TasksSection";
import { EmissionChecklist } from "./EmissionChecklist";
import { ActionButton, CollapsibleSection } from "./detail/DetailShared";
import { LeadClientFields } from "./detail/LeadClientFields";
import { LeadVehicleFields } from "./detail/LeadVehicleFields";
import { DocumentScanner } from "./detail/DocumentScanner";
import { PermissionGuard } from "./PermissionGuard";
import { getWhatsAppLink } from "@/utils/crm";

const transition = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onCreateLeadFromOpportunity?: (parentLead: Lead, opportunity: any) => void;
  config: CrmConfig;
  expanded?: boolean;
}

export function DetailPanel({ lead, onClose, onUpdateLead, onCreateLeadFromOpportunity, config, expanded }: DetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [editState, setEditState] = useState<PipelineStatus | null>(null);
  const [editAssigned, setEditAssigned] = useState("");
  const [editRemark, setEditRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [clientFieldsOpen, setClientFieldsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "calls" | "docs" | "scanner">("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [activityType, setActivityType] = useState<"note" | "call" | "email" | "whatsapp">("note");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");

  const handleOpen = () => {
    if (lead) {
      setEditState(lead.state);
      setEditAssigned(lead.assignedTo || "");
      setEditRemark(lead.remark);
      setNewNote("");
      setSelectedPhone(lead.phone);
      setSelectedEmail(lead.email);
    }
  };

  const addActivity = (type: Activity["type"], text: string, meta?: Activity["meta"], scheduled?: string): Activity => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    type, text, author: "Usuario", createdAt: new Date().toLocaleString("es-CO"),
    ...(scheduled ? { scheduledAt: scheduled, leadId: lead?.id, leadName: lead?.propietario } : {}),
    meta,
  });

  const handleSave = () => {
    if (!lead || editState === null) return;
    setSaving(true);
    const newActivities: Activity[] = [...(lead.activities || [])];
    const scheduledStr = scheduledDate ? `${scheduledDate.split("-").reverse().join("/")}${scheduledTime ? ` ${scheduledTime}` : ""}` : undefined;

    if (editState !== lead.state) {
      const statusText = editRemark.trim() && editRemark !== lead.remark ? `Estado cambiado · "${editRemark.trim()}"` : `Estado cambiado`;
      newActivities.unshift(addActivity("status_change", statusText, {
        fromStatus: getStatusLabel(lead.state, config.statusLabels, config.pipelineStages),
        toStatus: getStatusLabel(editState, config.statusLabels, config.pipelineStages),
      }));
    }

    if (newNote.trim()) {
      newActivities.unshift(addActivity(activityType, newNote.trim(), undefined, scheduledStr));
    }

    const notes: Note[] = [...(lead.notes || []), ...(newNote.trim() ? [{ id: Date.now().toString(), text: newNote.trim(), author: "Usuario", createdAt: new Date().toLocaleString("es-CO") }] : [])];

    setTimeout(() => {
      onUpdateLead({ ...lead, state: editState, assignedTo: editAssigned, remark: editRemark, notes, activities: newActivities });
      setSaving(false); setNewNote(""); setScheduledDate(""); setScheduledTime(""); setActivityType("note");
    }, 400);
  };

  const handleFieldEdit = (fieldKey: string, fieldLabel: string, oldValue: string, newValue: string) => {
    if (!lead || newValue === oldValue) { setEditingField(null); return; }
    const newActivities: Activity[] = [addActivity("field_edit", `${fieldLabel}: "${oldValue || '—'}" → "${newValue}"`, { field: fieldKey, oldValue: oldValue || "—", newValue }), ...(lead.activities || [])];
    onUpdateLead({ ...lead, [fieldKey]: newValue, activities: newActivities });
    setEditingField(null);
  };

  const handlePaymentStatusChange = (statusLabel: string) => {
    if (!lead) return;
    const newActivities: Activity[] = [addActivity("field_edit", `Estado de pago: "${lead.paymentStatus || '—'}" → "${statusLabel}"`, { field: "paymentStatus", oldValue: lead.paymentStatus || "—", newValue: statusLabel }), ...(lead.activities || [])];
    onUpdateLead({ ...lead, paymentStatus: statusLabel, activities: newActivities });
  };

  const formatMonto = (m: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const [showSystemOnly, setShowSystemOnly] = useState(false);

  const filteredActivities = (lead?.activities || []).filter((a) => {
    if (showSystemOnly) return ["status_change", "field_edit", "automation", "doc_selected"].includes(a.type);
    if (activeTab === "all") return true;
    if (activeTab === "notes") return a.type === "note";
    if (activeTab === "calls") return ["call", "whatsapp", "email"].includes(a.type);
    return true;
  });

  // Grouping logic
  const groupActivities = (acts: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {};
    const today = new Date().toLocaleDateString("es-CO");
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("es-CO");

    acts.forEach(a => {
      const datePart = a.createdAt.split(", ")[0];
      let label = datePart;
      if (datePart === today) label = "Hoy";
      else if (datePart === yesterday) label = "Ayer";
      
      if (!groups[label]) groups[label] = [];
      groups[label].push(a);
    });
    return groups;
  };

  const activityGroups = groupActivities(filteredActivities);

  const allPhones: ContactEntry[] = lead ? [
    { value: lead.phone, label: "Principal" },
    ...(lead.phones || []),
  ].filter(e => e.value) : [];
  const allEmails: ContactEntry[] = lead ? [
    { value: lead.email, label: "Principal" },
    ...(lead.emails || []),
  ].filter(e => e.value) : [];
  
  const cuotaCalc = lead?.tipoPago === "Financiado" && lead.valorPrima && lead.numeroCuotas ? lead.valorPrima / lead.numeroCuotas : undefined;
  const activeUsers = config.users.filter(u => u.active);
  const commission = lead ? getInsuranceCommission(config, lead.insurance) : 0;
  const calculatedCommission = lead?.valorPrima && commission ? (lead.valorPrima * commission / 100) : 0;
  const isNit = lead?.tipoIdentificacion === "NIT";

  return (
    <AnimatePresence>
      {lead && (
        <motion.div key="detail" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={transition} onAnimationComplete={() => handleOpen()}
          className={`${expanded ? "flex-1" : "w-[850px]"} shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden`}>

          {/* Top Header */}
          <div className="sticky top-0 z-30 border-b border-border/50 bg-card/60 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-3">
              <button 
                onClick={onClose} 
                className="group flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all duration-300"
              >
                <div className="p-1.5 rounded-full bg-muted/50 group-hover:bg-primary/20 group-hover:text-primary transition-all duration-300 group-hover:scale-110">
                  <X size={13} strokeWidth={3} />
                </div>
                <span>Cerrar Panel</span>
              </button>
              <div className="flex items-center gap-4">
                {lead.valorPrima ? (
                  <div className="flex flex-col items-end group">
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter transition-colors group-hover:text-primary/70">Prima Total</span>
                    <span className="text-xs font-mono font-black text-foreground group-hover:text-primary transition-colors">{formatMonto(lead.valorPrima)}</span>
                  </div>
                ) : null}
                {calculatedCommission > 0 && (
                  <div className="flex flex-col items-end pl-4 border-l border-border/50 group">
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter transition-colors group-hover:text-emerald-600/70">Comisión ({commission}%)</span>
                    <span className="text-xs font-mono font-black text-emerald-600 group-hover:scale-105 transition-transform">{formatMonto(calculatedCommission)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-6 relative overflow-hidden bg-gradient-to-b from-transparent to-muted/5">
              {/* Decorative gradient background elements */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-pulse" />
              <div className="absolute -left-16 bottom-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />

              <div className="flex items-start gap-5 relative z-10 pt-2">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/40 flex items-center justify-center text-xl font-black text-white border border-primary/20 shadow-xl shadow-primary/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                    {lead.propietario.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  {lead.score !== undefined && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border-4 border-background flex items-center justify-center shadow-lg">
                       <span className={`text-[8px] font-black ${lead.score > 80 ? "text-orange-500" : lead.score > 50 ? "text-primary" : "text-slate-500"}`}>
                         {lead.score}%
                       </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  {isNit && lead.empresaNombre ? (
                    <>
                      <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight mb-1">{lead.empresaNombre}</h2>
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2 leading-none opacity-80 uppercase tracking-wide">
                        <User size={12} className="text-primary" strokeWidth={2.5} /> Rep. Legal: <span className="text-foreground">{lead.representanteLegal || lead.propietario}</span>
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight drop-shadow-sm">{lead.propietario}</h2>
                      {lead.isRenewal && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 text-[9px] font-black uppercase tracking-[0.2em] shadow-sm animate-pulse">
                          Renovación
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <StatusBadge status={lead.state} labelOverrides={config.statusLabels} pipelineStages={config.pipelineStages} />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground/80 flex items-center gap-2 bg-muted/50 backdrop-blur-sm px-3 py-1 rounded-xl border border-border/50 shadow-sm transition-all hover:bg-muted">
                        <Shield size={13} className="text-primary" strokeWidth={2.5} /> {lead.insurance || "Sin aseguradora"}
                      </span>
                      {lead.insurance && config.paymentStatuses.length > 0 && (
                        <div className="flex items-center gap-2 pl-3 border-l border-border/50">
                          {config.paymentStatuses.map(ps => (
                            <button key={ps.id} onClick={() => handlePaymentStatusChange(ps.label)} title={ps.label}
                              className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-125 hover:shadow-lg ${lead.paymentStatus === ps.label ? "border-foreground shadow-md ring-2 ring-background ring-offset-1 scale-110" : "border-transparent opacity-40 hover:opacity-100"}`}
                              style={{ backgroundColor: ps.color }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {(lead.paymentStatus || lead.assignedTo) && (
                    <div className="flex items-center gap-6 mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] opacity-80">
                      {lead.paymentStatus && (
                        <span className="flex items-center gap-2 group transition-colors hover:text-foreground">
                          <CreditCard size={12} className="opacity-70 group-hover:scale-110 transition-transform" strokeWidth={2.5} /> {lead.paymentStatus}
                        </span>
                      )}
                      {lead.assignedTo && (
                        <span className="flex items-center gap-2 group transition-colors hover:text-foreground">
                          <User size={12} className="text-primary/70 group-hover:scale-110 transition-transform" strokeWidth={2.5} /> {lead.assignedTo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <ActionButton icon={<ActivityIcon size={13} />} label="Nota" onClick={() => document.getElementById("note-input")?.focus()} />
                <div className="relative group">
                  <ActionButton icon={<Mail size={13} />} label="Email" onClick={() => {
                    const email = selectedEmail || lead.email;
                    if (email) window.open(`mailto:${email}`, "_blank");
                  }} />
                  {allEmails.length > 1 && (
                    <select value={selectedEmail} onChange={e => setSelectedEmail(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-xs">
                      {allEmails.map((em, i) => <option key={i} value={em.value}>{em.label ? `${em.label}: ${em.value}` : em.value}</option>)}
                    </select>
                  )}
                </div>
                {allPhones.length > 0 && (
                  <div className="relative">
                    <ActionButton icon={<MessageSquare size={13} />} label={selectedPhone || lead.phone} onClick={() => {
                      const link = getWhatsAppLink({ ...lead, phone: selectedPhone || lead.phone });
                      if (link) window.open(link, "_blank");
                    }} />
                    {allPhones.length > 1 && (
                      <select value={selectedPhone} onChange={e => setSelectedPhone(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-xs">
                        {allPhones.map((ph, i) => <option key={i} value={ph.value}>{ph.label ? `${ph.label}: ${ph.value}` : ph.value}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Details */}
            <div className="w-[350px] shrink-0 border-r border-border overflow-y-auto">
              
              <LeadVehicleFields 
                lead={lead} config={config} onUpdateLead={onUpdateLead} open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)}
                editingField={editingField} editFieldValue={editFieldValue}
                setEditingField={setEditingField} setEditFieldValue={setEditFieldValue} handleFieldEdit={handleFieldEdit}
                formatMonto={formatMonto} commission={commission} calculatedCommission={calculatedCommission} cuotaCalc={cuotaCalc}
              />

              <LeadClientFields 
                lead={lead} config={config} onUpdateLead={onUpdateLead} open={clientFieldsOpen} onToggle={() => setClientFieldsOpen(!clientFieldsOpen)}
                editingField={editingField} editFieldValue={editFieldValue}
                setEditingField={setEditingField} setEditFieldValue={setEditFieldValue} handleFieldEdit={handleFieldEdit}
                allPhones={allPhones} allEmails={allEmails}
              />

              <CollapsibleSection title="GESTIÓN" icon={<ActivityIcon size={13} />} open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Estado</label>
                    <select value={editState || ""} onChange={(e) => setEditState(e.target.value as PipelineStatus)} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring">
                      {config.pipelineStages.sort((a, b) => a.order - b.order).map((s) => (
                        <option key={s.key} value={s.key}>{s.label}{s.isFinal ? ` (${s.finalType})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Asignado</label>
                    <select value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Sin asignar</option>
                      {activeUsers.map((u) => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Vencimiento Póliza</label>
                    <input 
                      type="date" 
                      value={lead.expirationDate ? lead.expirationDate.split("/").reverse().join("-") : ""} 
                      onChange={(e) => {
                        const val = e.target.value ? e.target.value.split("-").reverse().join("/") : "";
                        onUpdateLead({ ...lead, expirationDate: val });
                      }}
                      className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Observación</label>
                    <textarea value={editRemark} onChange={(e) => setEditRemark(e.target.value)} rows={2} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                  </div>
                  <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {saving ? <span className="inline-block w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save size={12} />}
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </CollapsibleSection>

              {onCreateLeadFromOpportunity && (
                <OpportunitiesSection lead={lead} onUpdateLead={onUpdateLead} onCreateLeadFromOpportunity={onCreateLeadFromOpportunity} />
              )}
              
              <TasksSection lead={lead} onUpdateLead={onUpdateLead} users={config.users} />

              {config.pipelineStages.some(s => (s.key === lead.state && s.order >= 4) || (s.key === lead.state && s.isFinal)) && (
                <EmissionChecklist lead={lead} checklistItems={config.emissionChecklist} onUpdateLead={onUpdateLead} />
              )}
            </div>

            {/* RIGHT: Activity Timeline */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="border-b border-border px-6 pt-3 flex items-center justify-between bg-muted/5 relative">
                  <div className="flex items-center gap-6 relative">
                    {(["all", "notes", "calls", "docs", "scanner"] as const).map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          className={`group relative pb-3 text-xs font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center gap-2 ${
                            isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground"
                          }`}>
                          <span className={`${isActive ? "scale-110" : "opacity-40 group-hover:opacity-100 group-hover:scale-110"} transition-all duration-300`}>
                            {tab === "all" ? <ActivityIcon size={13} strokeWidth={2.5} /> : 
                             tab === "notes" ? <StickyNote size={13} strokeWidth={2.5} /> : 
                             tab === "calls" ? <Phone size={13} strokeWidth={2.5} /> : 
                             tab === "docs" ? <FileText size={13} strokeWidth={2.5} /> : 
                             <ScanLine size={13} strokeWidth={2.5} />}
                          </span>
                          {tab === "all" ? "Todo" : tab === "notes" ? "Notas" : tab === "calls" ? "Actividad" : tab === "docs" ? "Docs" : "IA Scan"}
                          
                          {isActive && (
                            <motion.div 
                              layoutId="activeTabUnderline"
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    onClick={() => setShowSystemOnly(!showSystemOnly)}
                    className={`text-[9px] px-3 py-1 rounded-full border-2 font-black uppercase tracking-widest transition-all duration-300 ${
                      showSystemOnly 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                        : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                    }`}
                  >
                    Solo Sistema
                  </button>
                </div>

                {activeTab === "scanner" ? (
                  <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    <PermissionGuard action="scan_docs" showLocked lockMessage="No tienes permisos para usar el escáner de IA">
                      <DocumentScanner lead={lead} onUpdateLead={onUpdateLead} />
                    </PermissionGuard>
                  </div>
                ) : activeTab === "docs" ? (
                  <DocumentsView lead={lead} onUpdateLead={onUpdateLead} />
                ) : (
                  <>
                    <div className="px-6 py-5 border-b border-border/50 bg-gradient-to-b from-muted/20 to-transparent space-y-4">
                      <div className="flex gap-3 items-stretch">
                        <div className="relative group overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all hover:bg-muted/30 w-36">
                          <select 
                            value={activityType} 
                            onChange={(e) => setActivityType(e.target.value as any)} 
                            className="w-full h-full text-[11px] font-black uppercase tracking-widest py-2.5 pl-3 pr-8 bg-transparent appearance-none cursor-pointer focus:outline-none"
                          >
                            <option value="note">📝 Nota</option>
                            <option value="call">📞 Llamada</option>
                            <option value="email">✉️ Email</option>
                            <option value="whatsapp">💬 WhatsApp</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                        
                        <div className="flex-1 relative group">
                          <input 
                            id="note-input" 
                            type="text" 
                            placeholder="Escribe un comentario..." 
                            value={newNote} 
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && newNote.trim() && handleSave()}
                            className="w-full h-full text-xs font-medium py-2.5 px-4 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/40 shadow-sm transition-all" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4 pl-1">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-2 group cursor-pointer">
                            <Clock size={14} className="group-hover:text-primary transition-colors" strokeWidth={2.5} />
                            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1 shadow-xs transition-all hover:border-primary/30">
                              <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="text-[10px] font-black uppercase bg-transparent outline-none w-20" />
                              <div className="w-px h-3 bg-border" />
                              <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="text-[10px] font-black uppercase bg-transparent outline-none w-14" />
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={handleSave} 
                          disabled={!newNote.trim() || saving} 
                          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all duration-300 transform active:scale-95 ${
                            scheduledDate 
                              ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700" 
                              : "bg-primary text-white shadow-primary/30 hover:bg-primary/90"
                          } disabled:opacity-30 disabled:scale-100`}
                        >
                          {saving ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            scheduledDate ? "Programar" : "Enviar"
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground">
                      {filteredActivities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3"><MessageSquare size={16} className="text-muted-foreground" /></div>
                          <p className="text-xs text-muted-foreground">Sin registros.</p>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Timeline Line */}
                          <div className="absolute left-[17px] top-6 bottom-6 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
                          
                          <div className="space-y-6">
                            {Object.entries(activityGroups).map(([date, acts]) => (
                              <div key={date} className="relative">
                                <div className="sticky top-0 z-20 mb-4 flex justify-center">
                                  <span className="px-3 py-0.5 rounded-full bg-background border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                                    {date}
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {acts.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} onUpdate={(updated) => {
                                      if (!lead) return;
                                      const newActivities = (lead.activities || []).map((a) => a.id === updated.id ? updated : a);
                                      onUpdateLead({ ...lead, activities: newActivities });
                                    }} />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
