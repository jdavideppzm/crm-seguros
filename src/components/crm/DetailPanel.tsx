import { AnimatePresence, motion } from "framer-motion";
import {
  X, Phone, Mail, MessageSquare, Save, StickyNote, PhoneCall,
  Activity as ActivityIcon, ChevronDown, ChevronRight, MapPin, FileText,
  Clock, User, Car, Shield, DollarSign, Calendar, Hash, ArrowRight,
  CreditCard, Users, UserCircle, Building2, CalendarDays, Bell,
  Pencil, Check, Palette, Plus, Briefcase,
} from "lucide-react";
import { useState } from "react";
import type { Lead, PipelineStatus, Note, Activity, CrmConfig, ContactEntry } from "@/types/crm";
import { STATUS_CONFIG, USERS, ALL_STATUSES, getStatusLabel, YEAR_OPTIONS } from "@/types/crm";
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
  config: CrmConfig;
}

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email" },
  whatsapp: { icon: MessageSquare, color: "text-status-lograr", label: "WhatsApp" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio de estado" },
  field_edit: { icon: Pencil, color: "text-status-recolectar", label: "Edición" },
  doc_selected: { icon: FileText, color: "text-primary", label: "Cotización seleccionada" },
  doc_summary: { icon: FileText, color: "text-status-bienvenida", label: "Resumen documento" },
};

export function DetailPanel({ lead, onClose, onUpdateLead, onCreateLeadFromOpportunity, config }: DetailPanelProps) {
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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editFieldValue, setEditFieldValue] = useState("");
  const [addingPhone, setAddingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
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
        fromStatus: getStatusLabel(lead.state, config.statusLabels),
        toStatus: getStatusLabel(editState, config.statusLabels),
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

  const handleAddPhone = () => {
    if (!lead || !newPhone.trim()) return;
    const phones = [...(lead.phones || []), newPhone.trim()];
    onUpdateLead({ ...lead, phones });
    setNewPhone(""); setAddingPhone(false);
  };

  const handleAddEmail = () => {
    if (!lead || !newEmail.trim()) return;
    const emails = [...(lead.emails || []), newEmail.trim()];
    onUpdateLead({ ...lead, emails });
    setNewEmail(""); setAddingEmail(false);
  };

  const formatMonto = (m: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(m);

  const filteredActivities = (lead?.activities || []).filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "notes") return a.type === "note";
    if (activeTab === "calls") return a.type === "call" || a.type === "status_change" || a.type === "field_edit" || a.type === "whatsapp" || a.type === "doc_selected" || a.type === "doc_summary";
    return true;
  });

  const isNit = lead?.tipoIdentificacion === "NIT";
  const allPhones = lead ? [lead.phone, ...(lead.phones || [])].filter(Boolean) : [];
  const allEmails = lead ? [lead.email, ...(lead.emails || [])].filter(Boolean) : [];
  const cuotaCalc = lead?.tipoPago === "financiado" && lead.valorPrima && lead.numeroCuotas ? lead.valorPrima / lead.numeroCuotas : undefined;

  return (
    <AnimatePresence>
      {lead && (
        <motion.div key="detail" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={transition} onAnimationComplete={() => handleOpen()}
          className="w-[700px] shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden">

          {/* Top Header */}
          <div className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between px-5 py-2.5">
              <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"><X size={14} /><span>Cerrar</span></button>
              {lead.valorPrima ? <span className="text-xs font-mono font-bold text-primary">Prima: {formatMonto(lead.valorPrima)}</span> : null}
            </div>

            <div className="px-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {lead.propietario.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    {isNit && lead.empresaNombre ? (
                      <>
                        <h2 className="text-base font-semibold text-foreground leading-tight">{lead.empresaNombre}</h2>
                        <p className="text-[11px] text-muted-foreground">Rep. Legal: {lead.representanteLegal || lead.propietario}</p>
                      </>
                    ) : (
                      <h2 className="text-base font-semibold text-foreground leading-tight">{lead.propietario}</h2>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <StatusBadge status={lead.state} labelOverrides={config.statusLabels} />
                      {/* Insurance + Semáforo */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"><Shield size={10} />{lead.insurance}</span>
                        {lead.insurance && config.paymentStatuses.length > 0 && (
                          <div className="flex items-center gap-0.5 ml-1">
                            {config.paymentStatuses.map(ps => (
                              <button key={ps.id} onClick={() => handlePaymentStatusChange(ps.label)} title={ps.label}
                                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${lead.paymentStatus === ps.label ? "border-foreground scale-125 shadow-sm" : "border-transparent opacity-40 hover:opacity-70"}`}
                                style={{ backgroundColor: ps.color }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {lead.paymentStatus && (
                      <span className="text-[10px] font-semibold mt-0.5 inline-block px-1.5 py-0.5 rounded" style={{ backgroundColor: config.paymentStatuses.find(p => p.label === lead.paymentStatus)?.color + "20", color: config.paymentStatuses.find(p => p.label === lead.paymentStatus)?.color }}>
                        {lead.paymentStatus}
                      </span>
                    )}
                    {lead.assignedTo && <span className="text-[11px] text-muted-foreground block">Asignado: {lead.assignedTo}</span>}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <ActionButton icon={<StickyNote size={13} />} label="Nota" onClick={() => document.getElementById("note-input")?.focus()} />
                <div className="relative group">
                  <ActionButton icon={<Mail size={13} />} label="Email" onClick={() => {
                    const email = selectedEmail || lead.email;
                    if (email) window.open(`mailto:${email}`, "_blank");
                  }} />
                  {allEmails.length > 1 && (
                    <select value={selectedEmail} onChange={e => setSelectedEmail(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-xs">
                      {allEmails.map((em, i) => <option key={i} value={em}>{em}</option>)}
                    </select>
                  )}
                </div>
                {allPhones.length > 0 && (
                  <div className="relative">
                    <ActionButton icon={<MessageSquare size={13} />} label={selectedPhone || lead.phone} onClick={() => {
                      const phone = (selectedPhone || lead.phone).replace(/\D/g, "");
                      window.open(`https://wa.me/${phone.startsWith("57") ? phone : "57" + phone}`, "_blank");
                    }} />
                    {allPhones.length > 1 && (
                      <select value={selectedPhone} onChange={e => setSelectedPhone(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer text-xs">
                        {allPhones.map((ph, i) => <option key={i} value={ph}>{ph}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-column content */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Details */}
            <div className="w-[280px] shrink-0 border-r border-border overflow-y-auto">
              <CollapsibleSection title="CONTACTO" icon={<Car size={13} />} open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)}>
                <div className="space-y-2.5">
                  <EditableDetailRow icon={<MapPin size={12} />} label="Ciudad circulación" value={lead.lugar} fieldKey="lugar" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Car size={12} />} label="Placa" value={lead.placa || "—"} fieldKey="placa" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Shield size={12} />} label="Aseguradora" value={lead.insurance} fieldKey="insurance" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  {/* Tipo de servicio - dropdown */}
                  <DropdownDetailRow icon={<FileText size={12} />} label="Tipo servicio" value={lead.tipoServicio || "—"} options={config.serviceTypes} onChange={(v) => { const acts = [addActivity("field_edit", `Tipo servicio: "${lead.tipoServicio || '—'}" → "${v}"`, { field: "tipoServicio", oldValue: lead.tipoServicio || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipoServicio: v, activities: acts }); }} />
                  <EditableDetailRow icon={<Car size={12} />} label="Marca" value={lead.marca || "—"} fieldKey="marca" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  {/* Modelo - year dropdown */}
                  <DropdownDetailRow icon={<Calendar size={12} />} label="Modelo" value={lead.modelo || "—"} options={YEAR_OPTIONS} onChange={(v) => { const acts = [addActivity("field_edit", `Modelo: "${lead.modelo || '—'}" → "${v}"`, { field: "modelo", oldValue: lead.modelo || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, modelo: v, activities: acts }); }} />
                  <EditableDetailRow icon={<Car size={12} />} label="Ref. vehículo" value={lead.referenciaVehiculo || "—"} fieldKey="referenciaVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <DetailRow icon={<DollarSign size={12} />} label="Valor asegurado" value={formatMonto(lead.monto)} mono />
                  <EditableDetailRow icon={<DollarSign size={12} />} label="Valor prima" value={lead.valorPrima ? formatMonto(lead.valorPrima) : "—"} fieldKey="valorPrima" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v === "—" ? "" : String(lead.valorPrima || "")); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => { if (!lead) return; const val = Number(nv); const acts = [addActivity("field_edit", `Valor prima: "${old}" → "${formatMonto(val)}"`, { field: k, oldValue: old, newValue: formatMonto(val) }), ...(lead.activities || [])]; onUpdateLead({ ...lead, valorPrima: val, activities: acts }); setEditingField(null); }} onCancelEdit={() => setEditingField(null)} />
                  {/* Tipo de pago */}
                  <DropdownDetailRow icon={<CreditCard size={12} />} label="Tipo pago" value={lead.tipoPago || "—"} options={["Contado", "Financiado"]} onChange={(v) => { const acts = [addActivity("field_edit", `Tipo pago: "${lead.tipoPago || '—'}" → "${v}"`, { field: "tipoPago", oldValue: lead.tipoPago || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipoPago: v, numeroCuotas: v === "Contado" ? undefined : lead.numeroCuotas, activities: acts }); }} />
                  {lead.tipoPago === "Financiado" && (
                    <>
                      <EditableDetailRow icon={<Hash size={12} />} label="Nº cuotas" value={lead.numeroCuotas?.toString() || "—"} fieldKey="numeroCuotas" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v === "—" ? "" : v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => { if (!lead) return; const val = Number(nv); const acts = [addActivity("field_edit", `Cuotas: "${old}" → "${val}"`, { field: k, oldValue: old, newValue: String(val) }), ...(lead.activities || [])]; onUpdateLead({ ...lead, numeroCuotas: val, activities: acts }); setEditingField(null); }} onCancelEdit={() => setEditingField(null)} />
                      {cuotaCalc !== undefined && (
                        <DetailRow icon={<DollarSign size={12} />} label="Valor cuota" value={formatMonto(cuotaCalc)} mono />
                      )}
                    </>
                  )}
                </div>
              </CollapsibleSection>

              {/* CAMPOS CLIENTE */}
              <CollapsibleSection title="CAMPOS CLIENTE" icon={<Users size={13} />} open={clientFieldsOpen} onToggle={() => setClientFieldsOpen(!clientFieldsOpen)}>
                <div className="space-y-2.5">
                  {/* Tipo identificación dropdown */}
                  <DropdownDetailRow icon={<CreditCard size={12} />} label="Tipo identificación" value={lead.tipoIdentificacion || "—"} options={config.idTypes.map(t => `${t.code} - ${t.label}`)} onChange={(v) => { const code = v.split(" - ")[0]; const acts = [addActivity("field_edit", `Tipo ID: "${lead.tipoIdentificacion || '—'}" → "${code}"`, { field: "tipoIdentificacion", oldValue: lead.tipoIdentificacion || "—", newValue: code }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipoIdentificacion: code, activities: acts }); }} />
                  <EditableDetailRow icon={<Hash size={12} />} label="Nº identificación" value={lead.numeroIdentificacion || "—"} fieldKey="numeroIdentificacion" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />

                  {isNit ? (
                    <>
                      <EditableDetailRow icon={<Building2 size={12} />} label="Empresa" value={lead.empresaNombre || "—"} fieldKey="empresaNombre" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<User size={12} />} label="Rep. legal" value={lead.representanteLegal || "—"} fieldKey="representanteLegal" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<Hash size={12} />} label="Cédula rep." value={lead.cedulaRepresentante || "—"} fieldKey="cedulaRepresentante" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<Calendar size={12} />} label="Fecha nac. rep." value={lead.fechaNacimientoRL || lead.fechaNacimiento || "—"} fieldKey="fechaNacimientoRL" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<MapPin size={12} />} label="Lugar exp. cédula" value={lead.lugarExpedicionRL || "—"} fieldKey="lugarExpedicionRL" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                    </>
                  ) : (
                    <>
                      <EditableDetailRow icon={<User size={12} />} label="Nombres" value={lead.nombres || lead.propietario.split(" ").slice(0, -1).join(" ") || "—"} fieldKey="nombres" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<User size={12} />} label="Apellidos" value={lead.apellidos || lead.propietario.split(" ").slice(-1).join(" ") || "—"} fieldKey="apellidos" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<UserCircle size={12} />} label="Sexo" value={lead.sexo || "—"} fieldKey="sexo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                      <EditableDetailRow icon={<Calendar size={12} />} label="Fecha nacimiento" value={lead.fechaNacimiento || "—"} fieldKey="fechaNacimiento" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                    </>
                  )}

                  <EditableDetailRow icon={<MapPin size={12} />} label="Ciudad" value={lead.ciudad || "—"} fieldKey="ciudad" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Building2 size={12} />} label="Departamento" value={lead.departamento || "—"} fieldKey="departamento" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />

                  {/* Phone with add more */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone size={10} />Teléfono(s)</span>
                      <button onClick={() => setAddingPhone(true)} className="text-primary hover:text-primary/80"><Plus size={10} /></button>
                    </div>
                    {allPhones.map((ph, i) => (
                      <p key={i} className="text-xs text-foreground ml-4">{ph}</p>
                    ))}
                    {addingPhone && (
                      <div className="flex items-center gap-1 mt-1 ml-4">
                        <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Nuevo teléfono" className="flex-1 text-xs py-1 px-1.5 bg-muted/50 border border-border rounded" autoFocus />
                        <button onClick={handleAddPhone} className="text-primary"><Check size={11} /></button>
                        <button onClick={() => setAddingPhone(false)} className="text-muted-foreground"><X size={11} /></button>
                      </div>
                    )}
                  </div>

                  {/* Email with add more */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail size={10} />Email(s)</span>
                      <button onClick={() => setAddingEmail(true)} className="text-primary hover:text-primary/80"><Plus size={10} /></button>
                    </div>
                    {allEmails.map((em, i) => (
                      <p key={i} className="text-xs text-foreground ml-4 truncate">{em}</p>
                    ))}
                    {addingEmail && (
                      <div className="flex items-center gap-1 mt-1 ml-4">
                        <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Nuevo email" className="flex-1 text-xs py-1 px-1.5 bg-muted/50 border border-border rounded" autoFocus />
                        <button onClick={handleAddEmail} className="text-primary"><Check size={11} /></button>
                        <button onClick={() => setAddingEmail(false)} className="text-muted-foreground"><X size={11} /></button>
                      </div>
                    )}
                  </div>

                  <EditableDetailRow icon={<Car size={12} />} label="Clase" value={lead.clase || "—"} fieldKey="clase" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Palette size={12} />} label="Color vehículo" value={lead.colorVehiculo || "—"} fieldKey="colorVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                  <EditableDetailRow icon={<Hash size={12} />} label="Fasecolda ID" value={lead.fasecolda || "—"} fieldKey="fasecolda" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
                </div>
              </CollapsibleSection>

              {/* GESTIÓN */}
              <CollapsibleSection title="GESTIÓN" icon={<ActivityIcon size={13} />} open={detailsOpen} onToggle={() => setDetailsOpen(!detailsOpen)}>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Estado</label>
                    <select value={editState || ""} onChange={(e) => setEditState(e.target.value as PipelineStatus)} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring">
                      {ALL_STATUSES.map((s) => <option key={s} value={s}>{getStatusLabel(s, config.statusLabels)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Asignado</label>
                    <select value={editAssigned} onChange={(e) => setEditAssigned(e.target.value)} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="">Sin asignar</option>
                      {USERS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
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

              <OpportunitiesSection lead={lead} onUpdateLead={onUpdateLead} onCreateLeadFromOpportunity={onCreateLeadFromOpportunity} />
            </div>

            {/* RIGHT: Activity Timeline */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b border-border px-4 pt-3">
                <div className="flex items-center gap-4">
                  {(["all", "notes", "calls", "docs"] as const).map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {tab === "all" ? "Todo" : tab === "notes" ? "Notas" : tab === "calls" ? "Actividad" : "Docs"}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "docs" ? (
                <DocumentsView lead={lead} onUpdateLead={onUpdateLead} />
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-border space-y-2">
                    <div className="flex gap-2">
                      <select value={activityType} onChange={(e) => setActivityType(e.target.value as any)} className="text-xs py-2 px-2 bg-muted/50 border border-border rounded-lg">
                        <option value="note">📝 Nota</option><option value="call">📞 Llamada</option><option value="email">✉️ Email</option><option value="whatsapp">💬 WhatsApp</option>
                      </select>
                      <input id="note-input" type="text" placeholder="Descripción de la actividad..." value={newNote} onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && newNote.trim() && handleSave()}
                        className="flex-1 text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        <CalendarDays size={12} className="text-muted-foreground shrink-0" />
                        <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md flex-1" />
                        <input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md w-24" />
                      </div>
                      <button onClick={handleSave} disabled={!newNote.trim() || saving} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-40">
                        {scheduledDate ? "Programar" : "Enviar"}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {scheduledDate ? <><Bell size={10} className="text-primary" /> Se agregará a la Agenda</> : <>💡 Sin fecha = nota rápida (no aparece en Agenda)</>}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {filteredActivities.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3"><MessageSquare size={16} className="text-muted-foreground" /></div>
                        <p className="text-xs text-muted-foreground">Sin actividad registrada.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
                        <div className="space-y-1">
                          {filteredActivities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} onUpdate={(updated) => {
                              if (!lead) return;
                              const newActivities = (lead.activities || []).map((a) => a.id === updated.id ? updated : a);
                              onUpdateLead({ ...lead, activities: newActivities });
                            }} />
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
function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">{icon}{label}</button>;
}

function CollapsibleSection({ title, icon, open, onToggle, children }: { title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-border">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}{icon}{title}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{label}</p><p className={`text-xs text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p></div>
    </div>
  );
}

function DropdownDetailRow({ icon, label, value, options, onChange }: { icon: React.ReactNode; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full text-xs py-0.5 px-1 bg-transparent border-0 text-foreground cursor-pointer hover:bg-muted/50 rounded -ml-1">
          <option value="—">—</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function EditableDetailRow({ icon, label, value, fieldKey, mono, editingField, onStartEdit, editFieldValue, onEditFieldChange, onSaveEdit, onCancelEdit }: {
  icon: React.ReactNode; label: string; value: string; fieldKey: string; mono?: boolean;
  editingField: string | null; onStartEdit: (key: string, currentValue: string) => void;
  editFieldValue: string; onEditFieldChange: (v: string) => void;
  onSaveEdit: (key: string, label: string, oldValue: string, newValue: string) => void; onCancelEdit: () => void;
}) {
  const isEditing = editingField === fieldKey;
  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-center gap-1">
            <input value={editFieldValue} onChange={(e) => onEditFieldChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(fieldKey, label, value, editFieldValue); if (e.key === "Escape") onCancelEdit(); }}
              className="flex-1 text-xs py-1 px-1.5 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
            <button onClick={() => onSaveEdit(fieldKey, label, value, editFieldValue)} className="p-0.5 text-primary"><Check size={11} /></button>
            <button onClick={onCancelEdit} className="p-0.5 text-muted-foreground"><X size={11} /></button>
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
