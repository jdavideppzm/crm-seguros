import { AnimatePresence, motion } from "framer-motion";
import {
  X, Phone, Mail, MessageSquare, Save, StickyNote, PhoneCall,
  Activity as ActivityIcon, ChevronDown, ChevronRight, MapPin, FileText,
  Clock, User, Car, Shield, DollarSign, Calendar, Hash, ArrowRight,
} from "lucide-react";
import { useState } from "react";
import type { Lead, PipelineStatus, Note, Activity } from "@/types/crm";
import { STATUS_CONFIG, USERS } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";
import { DocumentsView } from "./DocumentsView";

const transition = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
}

const allStatuses: PipelineStatus[] = [
  "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio de estado" },
};

export function DetailPanel({ lead, onClose, onUpdateLead }: DetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [editState, setEditState] = useState<PipelineStatus | null>(null);
  const [editAssigned, setEditAssigned] = useState("");
  const [editRemark, setEditRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "calls" | "docs">("all");

  const handleOpen = () => {
    if (lead) {
      setEditState(lead.state);
      setEditAssigned(lead.assignedTo || "");
      setEditRemark(lead.remark);
      setNewNote("");
    }
  };

  const addActivity = (type: "note" | "call" | "status_change", text: string, meta?: Activity["meta"]): Activity => ({
    id: Date.now().toString(),
    type,
    text,
    author: "Usuario",
    createdAt: new Date().toLocaleString("es-CO"),
    meta,
  });

  const handleSave = () => {
    if (!lead || editState === null) return;
    setSaving(true);

    const newActivities: Activity[] = [...(lead.activities || [])];

    // Track status change
    if (editState !== lead.state) {
      newActivities.unshift(
        addActivity("status_change", `Estado cambiado`, {
          fromStatus: STATUS_CONFIG[lead.state].label,
          toStatus: STATUS_CONFIG[editState].label,
        })
      );
    }

    // Add note as activity
    if (newNote.trim()) {
      newActivities.unshift(addActivity("note", newNote.trim()));
    }

    const notes: Note[] = [
      ...(lead.notes || []),
      ...(newNote.trim()
        ? [{ id: Date.now().toString(), text: newNote.trim(), author: "Usuario", createdAt: new Date().toLocaleString("es-CO") }]
        : []),
    ];

    setTimeout(() => {
      onUpdateLead({ ...lead, state: editState, assignedTo: editAssigned, remark: editRemark, notes, activities: newActivities });
      setSaving(false);
      setNewNote("");
    }, 400);
  };

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const filteredActivities = (lead?.activities || []).filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "notes") return a.type === "note";
    if (activeTab === "calls") return a.type === "call" || a.type === "status_change";
    return true;
  });

  return (
    <AnimatePresence>
      {lead && (
        <motion.div
          key="detail"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={transition}
          onAnimationComplete={() => handleOpen()}
          className="w-[560px] shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="border-b border-border bg-card sticky top-0 z-10">
            {/* Close & Back */}
            <div className="flex items-center justify-between px-5 py-2.5">
              <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X size={14} />
                <span>Cerrar</span>
              </button>
            </div>

            {/* Lead Identity */}
            <div className="px-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {lead.propietario.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground leading-tight">{lead.propietario}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={lead.state} />
                      {lead.assignedTo && (
                        <span className="text-xs text-muted-foreground">· {lead.assignedTo}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <ActionButton icon={<StickyNote size={13} />} label="Nota" onClick={() => document.getElementById("note-input")?.focus()} />
                {lead.email && (
                  <ActionButton icon={<Mail size={13} />} label="Email" href={`mailto:${lead.email}`} />
                )}
                {lead.phone && (
                  <ActionButton
                    icon={<MessageSquare size={13} />}
                    label={lead.phone}
                    onClick={() => {
                      const phone = lead.phone.replace(/\D/g, "");
                      const waUrl = `https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}`;
                      window.open(waUrl, "_blank");
                      // Register activity
                      const newActivities: Activity[] = [
                        addActivity("call", `WhatsApp enviado a ${lead.phone}`),
                        ...(lead.activities || []),
                      ];
                      onUpdateLead({ ...lead, activities: newActivities });
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Two-column content */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Details */}
            <div className="w-[220px] shrink-0 border-r border-border overflow-y-auto">
              {/* ABOUT Section */}
              <CollapsibleSection title="DATOS" icon={<User size={13} />} open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)}>
                <div className="space-y-2.5">
                  <DetailRow icon={<MapPin size={12} />} label="Ciudad" value={lead.lugar} />
                  <DetailRow icon={<Car size={12} />} label="Placa" value={lead.placa || "—"} mono />
                  <DetailRow icon={<Shield size={12} />} label="Aseguradora" value={lead.insurance} />
                  <DetailRow icon={<FileText size={12} />} label="Tipo" value={lead.tipoSeguro} />
                  <DetailRow icon={<DollarSign size={12} />} label="Monto" value={formatMonto(lead.monto)} mono />
                  <DetailRow icon={<Calendar size={12} />} label="Fecha" value={lead.fecha} />
                  <DetailRow icon={<Clock size={12} />} label="Seguimiento" value={`Día ${lead.followUp}`} />
                  <DetailRow icon={<Hash size={12} />} label="Referencia" value={lead.reference || "—"} />
                </div>
              </CollapsibleSection>

              {/* EDITABLE Section */}
              <CollapsibleSection title="GESTIÓN" icon={<ActivityIcon size={13} />} open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Estado</label>
                    <select
                      value={editState || ""}
                      onChange={(e) => setEditState(e.target.value as PipelineStatus)}
                      className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Asignado</label>
                    <select
                      value={editAssigned}
                      onChange={(e) => setEditAssigned(e.target.value)}
                      className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Sin asignar</option>
                      {USERS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Observación</label>
                    <textarea
                      value={editRemark}
                      onChange={(e) => setEditRemark(e.target.value)}
                      rows={2}
                      className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="inline-block w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </CollapsibleSection>
            </div>

            {/* RIGHT: Activity Timeline */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Activity Tabs */}
              <div className="border-b border-border px-4 pt-3">
                <div className="flex items-center gap-4">
                  {(["all", "notes", "calls", "docs"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                        activeTab === tab
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "all" ? "Todo" : tab === "notes" ? "Notas" : tab === "calls" ? "Actividad" : "Docs"}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "docs" ? (
                <DocumentsView lead={lead} onUpdateLead={onUpdateLead} />
              ) : (
              <>
              {/* Note Input */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex gap-2">
                  <input
                    id="note-input"
                    type="text"
                    placeholder="Agregar nota o comentario..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && newNote.trim() && handleSave()}
                    className="flex-1 text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={handleSave}
                    disabled={!newNote.trim() || saving}
                    className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    Enviar
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {filteredActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                      <MessageSquare size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">Sin actividad registrada.</p>
                    <p className="text-[11px] text-muted-foreground mt-1">Agrega una nota para iniciar el historial.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />

                    <div className="space-y-1">
                      {filteredActivities.map((activity) => {
                        const config = activityTypeConfig[activity.type] || activityTypeConfig.note;
                        const Icon = config.icon;

                        return (
                          <div key={activity.id} className="relative flex gap-3 py-2.5">
                            {/* Timeline dot */}
                            <div className={`relative z-10 w-[22px] h-[22px] rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0`}>
                              <Icon size={10} className={config.color} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  {activity.type === "status_change" && activity.meta ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs text-muted-foreground">Estado:</span>
                                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                                        {activity.meta.fromStatus}
                                      </span>
                                      <ArrowRight size={10} className="text-muted-foreground" />
                                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-status-lograr/10 text-status-lograr">
                                        {activity.meta.toStatus}
                                      </span>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-foreground">{activity.text}</p>
                                  )}
                                  <p className="text-[11px] text-muted-foreground mt-0.5">{activity.author}</p>
                                </div>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{activity.createdAt}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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

/* Sub-components */

function ActionButton({ icon, label, onClick, href }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string }) {
  const cls = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors";
  if (href) {
    return <a href={href} className={cls}>{icon}{label}</a>;
  }
  return <button onClick={onClick} className={cls}>{icon}{label}</button>;
}

function CollapsibleSection({ title, icon, open, onToggle, children }: {
  title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {icon}
        {title}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-xs text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
