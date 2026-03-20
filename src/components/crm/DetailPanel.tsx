import { AnimatePresence, motion } from "framer-motion";
import {
  X, Phone, Mail, MessageSquare, Save, StickyNote, PhoneCall,
  Activity as ActivityIcon, ChevronDown, ChevronRight, MapPin, FileText,
  Clock, User, Car, Shield, DollarSign, Calendar, Hash, ArrowRight,
  CreditCard, Users, UserCircle, Building2, CalendarDays, Bell,
  Pencil, Check, Palette,
} from "lucide-react";
import { useState } from "react";
import type { Lead, PipelineStatus, Note, Activity } from "@/types/crm";
import { STATUS_CONFIG, USERS } from "@/types/crm";
import { StatusBadge } from "./StatusBadge";
import { DocumentsView } from "./DocumentsView";
import { ActivityItem } from "./ActivityItem";
import { OpportunitiesSection } from "./OpportunitiesSection";

const transition = { type: "spring" as const, duration: 0.4, bounce: 0 };

interface DetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (lead: Lead) => void;
  onCreateLeadFromOpportunity?: (parentLead: Lead, opportunity: any) => void;
}

const allStatuses: PipelineStatus[] = [
  "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email" },
  whatsapp: { icon: MessageSquare, color: "text-status-lograr", label: "WhatsApp" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio de estado" },
  field_edit: { icon: Pencil, color: "text-status-recolectar", label: "Edición" },
  doc_selected: { icon: FileText, color: "text-primary", label: "Cotización seleccionada" },
};

export function DetailPanel({ lead, onClose, onUpdateLead, onCreateLeadFromOpportunity }: DetailPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [editState, setEditState] = useState<PipelineStatus | null>(null);
  const [editAssigned, setEditAssigned] = useState("");
  const [editRemark, setEditRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(true);
  const [clientFieldsOpen, setClientFieldsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "notes" | "calls" | "docs">("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [activityType, setActivityType] = useState<"note" | "call" | "email" | "whatsapp">("note");

  // Editable contact fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");

  const handleOpen = () => {
    if (lead) {
      setEditState(lead.state);
      setEditAssigned(lead.assignedTo || "");
      setEditRemark(lead.remark);
      setNewNote("");
    }
  };

  const addActivity = (type: Activity["type"], text: string, meta?: Activity["meta"], scheduled?: string): Activity => ({
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    type,
    text,
    author: "Usuario",
    createdAt: new Date().toLocaleString("es-CO"),
    ...(scheduled ? { scheduledAt: scheduled, leadId: lead?.id, leadName: lead?.propietario } : {}),
    meta,
  });

  const handleSave = () => {
    if (!lead || editState === null) return;
    setSaving(true);

    const newActivities: Activity[] = [...(lead.activities || [])];

    // Build scheduled string
    const scheduledStr = scheduledDate
      ? `${scheduledDate.split("-").reverse().join("/")}${scheduledTime ? ` ${scheduledTime}` : ""}`
      : undefined;

    // Track status change with remark as comment
    if (editState !== lead.state) {
      const statusText = editRemark.trim() && editRemark !== lead.remark
        ? `Estado cambiado · "${editRemark.trim()}"`
        : `Estado cambiado`;
      newActivities.unshift(
        addActivity("status_change", statusText, {
          fromStatus: STATUS_CONFIG[lead.state].label,
          toStatus: STATUS_CONFIG[editState].label,
        })
      );
    }

    // Add note as activity (no scheduling required)
    if (newNote.trim()) {
      newActivities.unshift(addActivity(activityType, newNote.trim(), undefined, scheduledStr));
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
      setScheduledDate("");
      setScheduledTime("");
      setActivityType("note");
    }, 400);
  };

  const handleFieldEdit = (fieldKey: string, fieldLabel: string, oldValue: string, newValue: string) => {
    if (!lead || newValue === oldValue) {
      setEditingField(null);
      return;
    }
    const newActivities: Activity[] = [
      addActivity("field_edit", `${fieldLabel}: "${oldValue || '—'}" → "${newValue}"`, {
        field: fieldKey,
        oldValue: oldValue || "—",
        newValue,
      }),
      ...(lead.activities || []),
    ];
    const updated = { ...lead, [fieldKey]: newValue, activities: newActivities };
    onUpdateLead(updated);
    setEditingField(null);
  };

  const formatMonto = (m: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const filteredActivities = (lead?.activities || []).filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "notes") return a.type === "note";
    if (activeTab === "calls") return a.type === "call" || a.type === "status_change" || a.type === "field_edit" || a.type === "whatsapp" || a.type === "doc_selected";
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
          className="w-[640px] shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="border-b border-border bg-card sticky top-0 z-10">
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={lead.state} />
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Shield size={10} />
                        {lead.insurance}
                      </span>
                    </div>
                    {lead.assignedTo && (
                      <span className="text-[11px] text-muted-foreground">Asignado: {lead.assignedTo}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <ActionButton icon={<StickyNote size={13} />} label="Nota" onClick={() => document.getElementById("note-input")?.focus()} />
                <ActionButton
                  icon={<Mail size={13} />}
                  label="Email"
                  onClick={() => {
                    const email = lead.email || prompt("Ingresa el email del cliente:");
                    if (!email) return;
                    if (!lead.email) onUpdateLead({ ...lead, email });
                    window.open(`mailto:${email}`, "_blank");
                    const newActivities: Activity[] = [
                      addActivity("email", `Correo enviado a ${email}`),
                      ...(lead.activities || []),
                    ];
                    onUpdateLead({ ...lead, email: email || lead.email, activities: newActivities });
                  }}
                />
                {lead.phone && (
                  <ActionButton
                    icon={<MessageSquare size={13} />}
                    label={lead.phone}
                    onClick={() => {
                      const phone = lead.phone.replace(/\D/g, "");
                      const waUrl = `https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}`;
                      window.open(waUrl, "_blank");
                      const newActivities: Activity[] = [
                        addActivity("whatsapp", `WhatsApp enviado a ${lead.phone}`),
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
            <div className="w-[260px] shrink-0 border-r border-border overflow-y-auto">
              {/* CONTACTO Section */}
              <CollapsibleSection title="CONTACTO" icon={<Car size={13} />} open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)}>
                <div className="space-y-2.5">
                  <EditableDetailRow icon={<MapPin size={12} />} label="Ciudad circulación" value={lead.lugar} fieldKey="lugar" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Car size={12} />} label="Placa" value={lead.placa || "—"} fieldKey="placa" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Shield size={12} />} label="Aseguradora" value={lead.insurance} fieldKey="insurance" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<FileText size={12} />} label="Tipo" value={lead.tipoSeguro} fieldKey="tipoSeguro" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <DetailRow icon={<DollarSign size={12} />} label="Monto" value={formatMonto(lead.monto)} mono />
                  <DetailRow icon={<Calendar size={12} />} label="Fecha creación" value={lead.fecha} />
                  <EditableDetailRow icon={<Car size={12} />} label="Ref. vehículo" value={lead.referenciaVehiculo || "—"} fieldKey="referenciaVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                </div>
              </CollapsibleSection>

              {/* CAMPOS CLIENTE Section */}
              <CollapsibleSection title="CAMPOS CLIENTE" icon={<Users size={13} />} open={clientFieldsOpen} onToggle={() => setClientFieldsOpen(!clientFieldsOpen)}>
                <div className="space-y-2.5">
                  <EditableDetailRow icon={<Mail size={12} />} label="Email" value={lead.email || "—"} fieldKey="email" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<CreditCard size={12} />} label="Tipo identificación" value={lead.tipoIdentificacion || "—"} fieldKey="tipoIdentificacion" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Hash size={12} />} label="Nº identificación" value={lead.numeroIdentificacion || "—"} fieldKey="numeroIdentificacion" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<User size={12} />} label="Nombres" value={lead.nombres || lead.propietario.split(" ").slice(0, -1).join(" ") || "—"} fieldKey="nombres" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<User size={12} />} label="Apellidos" value={lead.apellidos || lead.propietario.split(" ").slice(-1).join(" ") || "—"} fieldKey="apellidos" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<UserCircle size={12} />} label="Sexo" value={lead.sexo || "—"} fieldKey="sexo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Calendar size={12} />} label="Fecha nacimiento" value={lead.fechaNacimiento || "—"} fieldKey="fechaNacimiento" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<MapPin size={12} />} label="Ciudad" value={lead.ciudad || "—"} fieldKey="ciudad" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Building2 size={12} />} label="Departamento" value={lead.departamento || "—"} fieldKey="departamento" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Phone size={12} />} label="Teléfono" value={lead.phone || "—"} fieldKey="phone" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Car size={12} />} label="Clase" value={lead.clase || "—"} fieldKey="clase" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Palette size={12} />} label="Color vehículo" value={lead.colorVehiculo || "—"} fieldKey="colorVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Hash size={12} />} label="Fasecolda ID" value={lead.fasecolda || "—"} fieldKey="fasecolda" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Hash size={12} />} label="Referencia" value={lead.reference || "—"} fieldKey="reference" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => handleFieldEdit(k, l, old, nv)} onCancelEdit={() => setEditingField(null)} />
                  <DetailRow icon={<Clock size={12} />} label="Seguimiento" value={`Día ${lead.followUp}`} />
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

              {/* OPPORTUNITIES Section */}
              <OpportunitiesSection lead={lead} onUpdateLead={onUpdateLead} onCreateLeadFromOpportunity={onCreateLeadFromOpportunity} />
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
              {/* Activity Input */}
              <div className="px-4 py-3 border-b border-border space-y-2">
                <div className="flex gap-2">
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="text-xs py-2 px-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="note">📝 Nota</option>
                    <option value="call">📞 Llamada</option>
                    <option value="email">✉️ Email</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                  </select>
                  <input
                    id="note-input"
                    type="text"
                    placeholder="Descripción de la actividad..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && newNote.trim() && handleSave()}
                    className="flex-1 text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 flex-1">
                    <CalendarDays size={12} className="text-muted-foreground shrink-0" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring flex-1"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring w-24"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={!newNote.trim() || saving}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    {scheduledDate ? "Programar" : "Enviar"}
                  </button>
                </div>
                {scheduledDate && (
                  <p className="text-[10px] text-primary flex items-center gap-1">
                    <Bell size={10} />
                    Se agregará a la Agenda
                  </p>
                )}
                {!scheduledDate && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    💡 Sin fecha = nota rápida (no aparece en Agenda)
                  </p>
                )}
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
                    <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
                    <div className="space-y-1">
                      {filteredActivities.map((activity) => (
                        <ActivityItem
                          key={activity.id}
                          activity={activity}
                          onUpdate={(updated) => {
                            if (!lead) return;
                            const newActivities = (lead.activities || []).map((a) =>
                              a.id === updated.id ? updated : a
                            );
                            onUpdateLead({ ...lead, activities: newActivities });
                          }}
                        />
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

function EditableDetailRow({
  icon, label, value, fieldKey, mono, editingField,
  onStartEdit, editFieldValue, onEditFieldChange, onSaveEdit, onCancelEdit,
}: {
  icon: React.ReactNode; label: string; value: string; fieldKey: string; mono?: boolean;
  editingField: string | null;
  onStartEdit: (key: string, currentValue: string) => void;
  editFieldValue: string;
  onEditFieldChange: (v: string) => void;
  onSaveEdit: (key: string, label: string, oldValue: string, newValue: string) => void;
  onCancelEdit: () => void;
}) {
  const isEditing = editingField === fieldKey;

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-center gap-1">
            <input
              value={editFieldValue}
              onChange={(e) => onEditFieldChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit(fieldKey, label, value, editFieldValue);
                if (e.key === "Escape") onCancelEdit();
              }}
              className="flex-1 text-xs py-1 px-1.5 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
              autoFocus
            />
            <button onClick={() => onSaveEdit(fieldKey, label, value, editFieldValue)} className="p-0.5 text-primary hover:text-primary/80">
              <Check size={11} />
            </button>
            <button onClick={onCancelEdit} className="p-0.5 text-muted-foreground hover:text-foreground">
              <X size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 group cursor-pointer" onClick={() => onStartEdit(fieldKey, value === "—" ? "" : value)}>
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className={`text-xs text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
          <Pencil size={9} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </div>
  );
}
