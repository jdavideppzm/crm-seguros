import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Lead, PipelineStatus, CrmConfig } from "@/types/crm";
import { ALL_STATUSES, USERS, getStatusLabel, YEAR_OPTIONS } from "@/types/crm";

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreateLead: (lead: Lead) => void;
  config: CrmConfig;
}

export function CreateLeadModal({ open, onClose, onCreateLead, config }: CreateLeadModalProps) {
  const [form, setForm] = useState<Partial<Lead>>({ state: "nuevo", tipoSeguro: "todo riesgo", tipoIdentificacion: config.idTypes[0]?.code || "CC" });

  if (!open) return null;

  const handleCreate = () => {
    if (!form.propietario?.trim()) return;
    const newLead: Lead = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "numeric" }),
      placa: form.placa || "",
      propietario: form.propietario.trim(),
      insurance: form.insurance || "",
      email: form.email || "",
      phone: form.phone || "",
      reference: form.reference || "",
      state: (form.state || "nuevo") as PipelineStatus,
      followUp: "1",
      remark: form.remark || "",
      lugar: form.lugar || "",
      tipoSeguro: form.tipoSeguro || "",
      monto: form.monto || 0,
      assignedTo: form.assignedTo,
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion,
      nombres: form.nombres,
      apellidos: form.apellidos,
      sexo: form.sexo,
      fechaNacimiento: form.fechaNacimiento,
      ciudad: form.ciudad,
      departamento: form.departamento,
      marca: form.marca,
      modelo: form.modelo,
      tipoServicio: form.tipoServicio,
      valorPrima: form.valorPrima,
      empresaNombre: form.empresaNombre,
      representanteLegal: form.representanteLegal,
      cedulaRepresentante: form.cedulaRepresentante,
      activities: [{
        id: Date.now().toString(),
        type: "note",
        text: "Lead creado manualmente",
        author: "Usuario",
        createdAt: new Date().toLocaleString("es-CO"),
      }],
    };
    onCreateLead(newLead);
    setForm({ state: "nuevo", tipoSeguro: "todo riesgo", tipoIdentificacion: config.idTypes[0]?.code || "CC" });
    onClose();
  };

  const isNit = form.tipoIdentificacion === "NIT";

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-[560px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Nuevo Lead</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X size={16} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Tipo Identificación */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo identificación">
              <select value={form.tipoIdentificacion || ""} onChange={e => update("tipoIdentificacion", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                {config.idTypes.map(t => <option key={t.id} value={t.code}>{t.code} - {t.label}</option>)}
              </select>
            </FormField>
            <FormField label="Nº Identificación">
              <input value={form.numeroIdentificacion || ""} onChange={e => update("numeroIdentificacion", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" />
            </FormField>
          </div>

          {isNit ? (
            <>
              <FormField label="Nombre de la empresa *">
                <input value={form.empresaNombre || ""} onChange={e => { update("empresaNombre", e.target.value); update("propietario", e.target.value); }} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Representante legal"><input value={form.representanteLegal || ""} onChange={e => update("representanteLegal", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
                <FormField label="Cédula representante"><input value={form.cedulaRepresentante || ""} onChange={e => update("cedulaRepresentante", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Fecha nac. representante"><input type="date" value={form.fechaNacimiento || ""} onChange={e => update("fechaNacimiento", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
                <FormField label="Lugar expedición cédula"><input value={form.ciudad || ""} onChange={e => update("ciudad", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
              </div>
            </>
          ) : (
            <>
              <FormField label="Nombre completo *">
                <input value={form.propietario || ""} onChange={e => update("propietario", e.target.value)} placeholder="Nombre del cliente" className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Sexo">
                  <select value={form.sexo || ""} onChange={e => update("sexo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                    <option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
                  </select>
                </FormField>
                <FormField label="Fecha nacimiento"><input type="date" value={form.fechaNacimiento || ""} onChange={e => update("fechaNacimiento", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Teléfono"><input value={form.phone || ""} onChange={e => update("phone", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
            <FormField label="Email"><input value={form.email || ""} onChange={e => update("email", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ciudad"><input value={form.lugar || ""} onChange={e => update("lugar", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
            <FormField label="Placa"><input value={form.placa || ""} onChange={e => update("placa", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono uppercase" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Marca"><input value={form.marca || ""} onChange={e => update("marca", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
            <FormField label="Modelo">
              <select value={form.modelo || ""} onChange={e => update("modelo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                <option value="">Año</option>{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Aseguradora"><input value={form.insurance || ""} onChange={e => update("insurance", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
            <FormField label="Tipo seguro"><input value={form.tipoSeguro || ""} onChange={e => update("tipoSeguro", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor asegurado"><input type="number" value={form.monto || ""} onChange={e => update("monto", Number(e.target.value))} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>
            <FormField label="Valor prima"><input type="number" value={form.valorPrima || ""} onChange={e => update("valorPrima", Number(e.target.value))} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Estado">
              <select value={form.state || "nuevo"} onChange={e => update("state", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s, config.statusLabels)}</option>)}
              </select>
            </FormField>
            <FormField label="Asignado">
              <select value={form.assignedTo || ""} onChange={e => update("assignedTo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                <option value="">Sin asignar</option>{USERS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FormField>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleCreate} disabled={!form.propietario?.trim()} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">Crear Lead</button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">{label}</label>
      {children}
    </div>
  );
}
