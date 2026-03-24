import { useState } from "react";
import { X } from "lucide-react";
import type { Lead, PipelineStatus, CrmConfig } from "@/types/crm";
import { YEAR_OPTIONS } from "@/types/crm";

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
  onCreateLead: (lead: Lead) => void;
  config: CrmConfig;
}

export function CreateLeadModal({ open, onClose, onCreateLead, config }: CreateLeadModalProps) {
  const [form, setForm] = useState<Partial<Lead>>({ state: config.pipelineStages[0]?.key || "nuevo", tipoSeguro: "todo riesgo", tipoIdentificacion: config.idTypes[0]?.code || "CC" });

  if (!open) return null;

  const enabledFields = config.leadFormFields.filter(f => f.enabled);
  const isFieldEnabled = (key: string) => enabledFields.some(f => f.key === key);
  const isNit = form.tipoIdentificacion === "NIT";
  const activeUsers = config.users.filter(u => u.active);

  const handleCreate = () => {
    const requiredFields = config.leadFormFields.filter(f => f.enabled && f.required);
    for (const rf of requiredFields) {
      const val = (form as any)[rf.key];
      if (!val || (typeof val === "string" && !val.trim())) return;
    }
    if (!form.propietario?.trim() && !form.empresaNombre?.trim()) return;

    // Calculate commission
    const company = config.insuranceCompanies.find(c => c.name === form.insurance);
    const comision = company && form.valorPrima ? (form.valorPrima * company.commission / 100) : undefined;

    const newLead: Lead = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "numeric" }),
      placa: form.placa || "",
      propietario: isNit ? (form.empresaNombre || "") : (form.propietario || "").trim(),
      insurance: form.insurance || "",
      email: form.email || "",
      phone: form.phone || "",
      reference: form.reference || "",
      state: (form.state || config.pipelineStages[0]?.key || "nuevo") as PipelineStatus,
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
      colorVehiculo: form.colorVehiculo,
      empresaNombre: form.empresaNombre,
      representanteLegal: form.representanteLegal,
      cedulaRepresentante: form.cedulaRepresentante,
      origenLead: form.origenLead,
      tipPoliza: form.tipPoliza,
      comisionCalculada: comision,
      activities: [{
        id: Date.now().toString(),
        type: "note",
        text: "Lead creado manualmente",
        author: "Usuario",
        createdAt: new Date().toLocaleString("es-CO"),
      }],
    };
    onCreateLead(newLead);
    setForm({ state: config.pipelineStages[0]?.key || "nuevo", tipoSeguro: "todo riesgo", tipoIdentificacion: config.idTypes[0]?.code || "CC" });
    onClose();
  };

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const renderField = (key: string) => {
    switch (key) {
      case "propietario":
        if (isNit) {
          return (
            <>
              <FormField label="Nombre de la empresa *">
                <input value={form.empresaNombre || ""} onChange={e => { update("empresaNombre", e.target.value); update("propietario", e.target.value); }} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Representante legal"><input value={form.representanteLegal || ""} onChange={e => update("representanteLegal", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>
                <FormField label="Cédula representante"><input value={form.cedulaRepresentante || ""} onChange={e => update("cedulaRepresentante", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>
              </div>
            </>
          );
        }
        return (
          <FormField label="Nombre completo *">
            <input value={form.propietario || ""} onChange={e => update("propietario", e.target.value)} placeholder="Nombre del cliente" className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" />
          </FormField>
        );
      case "tipoIdentificacion":
        return (
          <FormField label="Tipo identificación">
            <select value={form.tipoIdentificacion || ""} onChange={e => update("tipoIdentificacion", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              {config.idTypes.map(t => <option key={t.id} value={t.code}>{t.code} - {t.label}</option>)}
            </select>
          </FormField>
        );
      case "insurance":
        return (
          <FormField label="Aseguradora">
            <select value={form.insurance || ""} onChange={e => update("insurance", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option>
              {config.insuranceCompanies.map(c => <option key={c.id} value={c.name}>{c.name} ({c.commission}%)</option>)}
            </select>
          </FormField>
        );
      case "origenLead":
        return (
          <FormField label="Origen del lead">
            <select value={form.origenLead || ""} onChange={e => update("origenLead", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option>
              {config.leadOrigins.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
            </select>
          </FormField>
        );
      case "tipPoliza":
        return (
          <FormField label="Tipo de póliza">
            <select value={form.tipPoliza || ""} onChange={e => update("tipPoliza", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option>
              {config.policyTypes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </FormField>
        );
      case "numeroIdentificacion":
        return <FormField label="Nº Identificación"><input value={form.numeroIdentificacion || ""} onChange={e => update("numeroIdentificacion", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>;
      case "phone":
        return <FormField label="Teléfono"><input value={form.phone || ""} onChange={e => update("phone", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "email":
        return <FormField label="Email"><input value={form.email || ""} onChange={e => update("email", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "placa":
        return <FormField label="Placa"><input value={form.placa || ""} onChange={e => update("placa", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono uppercase" /></FormField>;
      case "lugar":
        return <FormField label="Ciudad"><input value={form.lugar || ""} onChange={e => update("lugar", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "marca":
        return <FormField label="Marca"><input value={form.marca || ""} onChange={e => update("marca", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "modelo":
        return (
          <FormField label="Modelo">
            <select value={form.modelo || ""} onChange={e => update("modelo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Año</option>{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </FormField>
        );
      case "tipoSeguro":
        return (
          <FormField label="Tipo seguro">
            <select value={form.tipoSeguro || ""} onChange={e => update("tipoSeguro", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option>
              {config.policyTypes.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </FormField>
        );
      case "monto":
        return <FormField label="Valor asegurado"><input type="number" value={form.monto || ""} onChange={e => update("monto", Number(e.target.value))} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>;
      case "valorPrima":
        return <FormField label="Valor prima"><input type="number" value={form.valorPrima || ""} onChange={e => update("valorPrima", Number(e.target.value))} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg font-mono" /></FormField>;
      case "sexo":
        return (
          <FormField label="Sexo">
            <select value={form.sexo || ""} onChange={e => update("sexo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option>
            </select>
          </FormField>
        );
      case "fechaNacimiento":
        return <FormField label="Fecha nacimiento"><input type="date" value={form.fechaNacimiento || ""} onChange={e => update("fechaNacimiento", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "colorVehiculo":
        return <FormField label="Color vehículo"><input value={form.colorVehiculo || ""} onChange={e => update("colorVehiculo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg" /></FormField>;
      case "tipoServicio":
        return (
          <FormField label="Tipo servicio">
            <select value={form.tipoServicio || ""} onChange={e => update("tipoServicio", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Seleccionar</option>{config.serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        );
      case "assignedTo":
        return (
          <FormField label="Asignado">
            <select value={form.assignedTo || ""} onChange={e => update("assignedTo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
              <option value="">Sin asignar</option>{activeUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
            </select>
          </FormField>
        );
      default:
        return null;
    }
  };

  const gridFields = enabledFields.filter(f => f.key !== "propietario");
  const pairs: string[][] = [];
  for (let i = 0; i < gridFields.length; i += 2) {
    pairs.push(gridFields.slice(i, i + 2).map(f => f.key));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-xl w-[560px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Nuevo Lead</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X size={16} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {(isFieldEnabled("tipoIdentificacion") || isFieldEnabled("numeroIdentificacion")) && (
            <div className="grid grid-cols-2 gap-3">
              {isFieldEnabled("tipoIdentificacion") && renderField("tipoIdentificacion")}
              {isFieldEnabled("numeroIdentificacion") && renderField("numeroIdentificacion")}
            </div>
          )}

          {isFieldEnabled("propietario") && renderField("propietario")}

          {pairs.filter(p => !["tipoIdentificacion", "numeroIdentificacion"].includes(p[0])).map((pair, i) => (
            <div key={i} className={pair.length === 2 ? "grid grid-cols-2 gap-3" : ""}>
              {pair.map(key => (
                <div key={key}>{renderField(key)}</div>
              ))}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Estado">
              <select value={form.state || config.pipelineStages[0]?.key} onChange={e => update("state", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                {config.pipelineStages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </FormField>
            {!isFieldEnabled("assignedTo") && (
              <FormField label="Asignado">
                <select value={form.assignedTo || ""} onChange={e => update("assignedTo", e.target.value)} className="w-full text-xs py-2 px-2.5 bg-muted/50 border border-border rounded-lg">
                  <option value="">Sin asignar</option>{activeUsers.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </FormField>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleCreate} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40 transition-colors">Crear Lead</button>
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
