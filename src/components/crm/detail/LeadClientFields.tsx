import { Users, CreditCard, Hash, Building2, User, UserCircle, Calendar, MapPin, Phone, Plus, Check, X, Palette, Car } from "lucide-react";
import { useState } from "react";
import type { Lead, CrmConfig, ContactEntry, Activity } from "@/types/crm";
import { CollapsibleSection, DropdownDetailRow, EditableDetailRow } from "./DetailShared";
import { getFieldLabel } from "@/types/crm";

interface LeadClientFieldsProps {
  lead: Lead;
  config: CrmConfig;
  onUpdateLead: (lead: Lead) => void;
  open: boolean;
  onToggle: () => void;
  editingField: string | null;
  editFieldValue: string;
  setEditingField: (v: string | null) => void;
  setEditFieldValue: (v: string) => void;
  handleFieldEdit: (k: string, label: string, ov: string, nv: string) => void;
  allPhones: ContactEntry[];
  allEmails: ContactEntry[];
}

export function LeadClientFields({
  lead, config, onUpdateLead, open, onToggle,
  editingField, editFieldValue, setEditingField, setEditFieldValue, handleFieldEdit,
  allPhones, allEmails
}: LeadClientFieldsProps) {
  const isNit = lead.tipoIdentificacion === "NIT";

  const [addingPhone, setAddingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPhoneLabel, setNewPhoneLabel] = useState("");
  
  const [addingEmail, setAddingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newEmailLabel, setNewEmailLabel] = useState("");

  const handleAddPhone = () => {
    if (!newPhone.trim()) return;
    const entry: ContactEntry = { value: newPhone.trim(), label: newPhoneLabel.trim() || undefined };
    onUpdateLead({ ...lead, phones: [...(lead.phones || []), entry] });
    setNewPhone(""); setNewPhoneLabel(""); setAddingPhone(false);
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;
    const entry: ContactEntry = { value: newEmail.trim(), label: newEmailLabel.trim() || undefined };
    onUpdateLead({ ...lead, emails: [...(lead.emails || []), entry] });
    setNewEmail(""); setNewEmailLabel(""); setAddingEmail(false);
  };

  return (
    <CollapsibleSection title="CAMPOS CLIENTE" icon={<Users size={13} />} open={open} onToggle={onToggle}>
      <div className="space-y-2.5">
        <DropdownDetailRow icon={<CreditCard size={12} />} label="Tipo identificación" value={lead.tipoIdentificacion || "—"} options={config.idTypes.map(t => `${t.code} - ${t.label}`)} onChange={(v) => { const code = v.split(" - ")[0]; onUpdateLead({ ...lead, tipoIdentificacion: code }); }} />
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

        {/* Phones */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone size={10} />Teléfono(s)</span>
            <button onClick={() => setAddingPhone(true)} className="text-primary hover:text-primary/80"><Plus size={10} /></button>
          </div>
          {allPhones.map((ph, i) => (
            <div key={i} className="flex items-center gap-1.5 ml-4 py-0.5">
              <p className="text-xs text-foreground">{ph.value}</p>
              {ph.label && <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{ph.label}</span>}
            </div>
          ))}
          {addingPhone && (
            <div className="flex items-center gap-2 mt-2 ml-4 p-2 bg-muted/30 rounded-lg border border-border/40 animate-in fade-in slide-in-from-top-1">
              <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="Nº Teléfono" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
              <input value={newPhoneLabel} onChange={e => setNewPhoneLabel(e.target.value)} placeholder="Etiqueta" className="w-24 text-xs py-1.5 px-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex items-center gap-1 border-l pl-2 border-border/50">
                <button onClick={handleAddPhone} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors"><Check size={14} strokeWidth={3} /></button>
                <button onClick={() => setAddingPhone(false)} className="p-1 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors"><X size={14} strokeWidth={3} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Emails */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone size={10} />Email(s)</span>
            <button onClick={() => setAddingEmail(true)} className="text-primary hover:text-primary/80"><Plus size={10} /></button>
          </div>
          {allEmails.map((em, i) => (
            <div key={i} className="flex items-center gap-1.5 ml-4 py-0.5">
              <p className="text-xs text-foreground truncate">{em.value}</p>
              {em.label && <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{em.label}</span>}
            </div>
          ))}
          {addingEmail && (
            <div className="flex items-center gap-2 mt-2 ml-4 p-2 bg-muted/30 rounded-lg border border-border/40 animate-in fade-in slide-in-from-top-1">
              <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Correo electrónico" className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
              <input value={newEmailLabel} onChange={e => setNewEmailLabel(e.target.value)} placeholder="Etiqueta" className="w-24 text-xs py-1.5 px-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex items-center gap-1 border-l pl-2 border-border/50">
                <button onClick={handleAddEmail} className="p-1 rounded-md hover:bg-emerald-500/10 text-emerald-500 transition-colors"><Check size={14} strokeWidth={3} /></button>
                <button onClick={() => setAddingEmail(false)} className="p-1 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors"><X size={14} strokeWidth={3} /></button>
              </div>
            </div>
          )}
        </div>

        <EditableDetailRow icon={<Car size={12} />} label={getFieldLabel(config, "clase", "Clase")} value={lead.clase || "—"} fieldKey="clase" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        <EditableDetailRow icon={<Palette size={12} />} label={getFieldLabel(config, "colorVehiculo", "Color vehículo")} value={lead.colorVehiculo || "—"} fieldKey="colorVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        <EditableDetailRow icon={<Hash size={12} />} label={getFieldLabel(config, "fasecolda", "Fasecolda ID")} value={lead.fasecolda || "—"} fieldKey="fasecolda" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
      </div>
    </CollapsibleSection>
  );
}
