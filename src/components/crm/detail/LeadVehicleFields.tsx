import { Car, MapPin, Shield, Tag, TrendingUp, FileText, Calendar, DollarSign, CreditCard, Hash } from "lucide-react";
import type { Lead, CrmConfig } from "@/types/crm";
import { YEAR_OPTIONS, getFieldLabel } from "@/types/crm";
import { CollapsibleSection, DropdownDetailRow, EditableDetailRow, DetailRow } from "./DetailShared";

interface LeadVehicleFieldsProps {
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
  formatMonto: (m: number) => string;
  commission: number;
  calculatedCommission: number;
  cuotaCalc: number | undefined;
}

export function LeadVehicleFields({
  lead, config, onUpdateLead, open, onToggle,
  editingField, editFieldValue, setEditingField, setEditFieldValue, handleFieldEdit,
  formatMonto, commission, calculatedCommission, cuotaCalc
}: LeadVehicleFieldsProps) {

  const addActivity = (type: any, text: string, meta?: any) => {
    return {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      type, text, author: "Usuario", createdAt: new Date().toLocaleString("es-CO"), meta
    };
  };

  return (
    <CollapsibleSection title="CONTACTO Y VEHÍCULO" icon={<Car size={13} />} open={open} onToggle={onToggle}>
      <div className="space-y-2.5">
        <EditableDetailRow icon={<MapPin size={12} />} label="Ciudad circulación" value={lead.lugar} fieldKey="lugar" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        <EditableDetailRow icon={<Car size={12} />} label={getFieldLabel(config, "placa", "Placa")} value={lead.placa || "—"} fieldKey="placa" mono editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        
        {/* Dropdowns */}
        <DropdownDetailRow icon={<Shield size={12} />} label={getFieldLabel(config, "insurance", "Aseguradora")} value={lead.insurance || "—"} options={config.insuranceCompanies.map(c => c.name)} onChange={(v) => { const acts = [addActivity("field_edit", `${getFieldLabel(config, "insurance", "Aseguradora")}: "${lead.insurance}" → "${v}"`, { field: "insurance", oldValue: lead.insurance, newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, insurance: v, activities: acts }); }} />
        <DropdownDetailRow icon={<Tag size={12} />} label="Tipo de póliza" value={lead.tipPoliza || lead.tipoSeguro || "—"} options={config.policyTypes.map(p => p.name)} onChange={(v) => { const acts = [addActivity("field_edit", `Tipo póliza: "${lead.tipPoliza || lead.tipoSeguro || '—'}" → "${v}"`, { field: "tipPoliza", oldValue: lead.tipPoliza || lead.tipoSeguro || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipPoliza: v, tipoSeguro: v, activities: acts }); }} />
        <DropdownDetailRow icon={<TrendingUp size={12} />} label="Origen" value={lead.origenLead || "—"} options={config.leadOrigins.map(o => o.name)} onChange={(v) => { const acts = [addActivity("field_edit", `Origen: "${lead.origenLead || '—'}" → "${v}"`, { field: "origenLead", oldValue: lead.origenLead || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, origenLead: v, activities: acts }); }} />
        <DropdownDetailRow icon={<FileText size={12} />} label="Tipo servicio" value={lead.tipoServicio || "—"} options={config.serviceTypes} onChange={(v) => { const acts = [addActivity("field_edit", `Tipo servicio: "${lead.tipoServicio || '—'}" → "${v}"`, { field: "tipoServicio", oldValue: lead.tipoServicio || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipoServicio: v, activities: acts }); }} />
        
        <EditableDetailRow icon={<Car size={12} />} label="Marca" value={lead.marca || "—"} fieldKey="marca" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        <DropdownDetailRow icon={<Calendar size={12} />} label="Modelo" value={lead.modelo || "—"} options={YEAR_OPTIONS} onChange={(v) => { const acts = [addActivity("field_edit", `Modelo: "${lead.modelo || '—'}" → "${v}"`, { field: "modelo", oldValue: lead.modelo || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, modelo: v, activities: acts }); }} />
        <EditableDetailRow icon={<Car size={12} />} label="Ref. vehículo" value={lead.referenciaVehiculo || "—"} fieldKey="referenciaVehiculo" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={handleFieldEdit} onCancelEdit={() => setEditingField(null)} />
        
        <DetailRow icon={<DollarSign size={12} />} label="Valor asegurado" value={formatMonto(lead.monto)} mono />
        <EditableDetailRow icon={<DollarSign size={12} />} label="Valor prima" value={lead.valorPrima ? formatMonto(lead.valorPrima) : "—"} fieldKey="valorPrima" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v === "—" ? "" : String(lead.valorPrima || "")); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => { const val = Number(nv); const acts = [addActivity("field_edit", `Valor prima: "${old}" → "${formatMonto(val)}"`, { field: k, oldValue: old, newValue: formatMonto(val) }), ...(lead.activities || [])]; onUpdateLead({ ...lead, valorPrima: val, activities: acts }); setEditingField(null); }} onCancelEdit={() => setEditingField(null)} />
        
        {calculatedCommission > 0 && (
          <DetailRow icon={<TrendingUp size={12} />} label={`Comisión (${commission}%)`} value={formatMonto(calculatedCommission)} mono />
        )}
        
        <DropdownDetailRow icon={<CreditCard size={12} />} label="Tipo pago" value={lead.tipoPago || "—"} options={["Contado", "Financiado"]} onChange={(v) => { const acts = [addActivity("field_edit", `Tipo pago: "${lead.tipoPago || '—'}" → "${v}"`, { field: "tipoPago", oldValue: lead.tipoPago || "—", newValue: v }), ...(lead.activities || [])]; onUpdateLead({ ...lead, tipoPago: v, numeroCuotas: v === "Contado" ? undefined : lead.numeroCuotas, activities: acts }); }} />
        {lead.tipoPago === "Financiado" && (
          <>
            <EditableDetailRow icon={<Hash size={12} />} label="Nº cuotas" value={lead.numeroCuotas?.toString() || "—"} fieldKey="numeroCuotas" editingField={editingField} onStartEdit={(k, v) => { setEditingField(k); setEditFieldValue(v === "—" ? "" : v); }} editFieldValue={editFieldValue} onEditFieldChange={setEditFieldValue} onSaveEdit={(k, l, old, nv) => { const val = Number(nv); const acts = [addActivity("field_edit", `Cuotas: "${old}" → "${val}"`, { field: k, oldValue: old, newValue: String(val) }), ...(lead.activities || [])]; onUpdateLead({ ...lead, numeroCuotas: val, activities: acts }); setEditingField(null); }} onCancelEdit={() => setEditingField(null)} />
            {cuotaCalc !== undefined && (
              <DetailRow icon={<DollarSign size={12} />} label="Valor cuota" value={formatMonto(cuotaCalc)} mono />
            )}
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
