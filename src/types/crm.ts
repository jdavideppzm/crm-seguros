export type PipelineStatus = string;

export interface Lead {
  id: string;
  fecha: string;
  placa: string;
  propietario: string;
  insurance: string;
  email: string;
  phone: string;
  reference: string;
  state: PipelineStatus;
  followUp: string;
  remark: string;
  lugar: string;
  tipoSeguro: string;
  monto: number;
  assignedTo?: string;
  notes?: Note[];
  activities?: Activity[];
  clientType?: ClientType;
  documents?: LeadDocument[];
  opportunities?: Opportunity[];
  selectedCotizacion?: string;
  // Client fields
  tipoIdentificacion?: string;
  numeroIdentificacion?: string;
  nombres?: string;
  apellidos?: string;
  sexo?: string;
  fechaNacimiento?: string;
  ciudad?: string;
  departamento?: string;
  referenciaVehiculo?: string;
  clase?: string;
  fasecolda?: string;
  colorVehiculo?: string;
  // New fields
  marca?: string;
  modelo?: string;
  tipoServicio?: string;
  valorPrima?: number;
  tipoPago?: string;
  numeroCuotas?: number;
  valorCuota?: number;
  paymentStatus?: string;
  phones?: ContactEntry[];
  emails?: ContactEntry[];
  // NIT fields
  empresaNombre?: string;
  representanteLegal?: string;
  cedulaRepresentante?: string;
  fechaNacimientoRL?: string;
  lugarExpedicionRL?: string;
  // Parent lead link
  parentLeadId?: string;
  opportunityType?: OpportunityType;
}

export interface ContactEntry {
  value: string;
  label?: string;
}

export interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export type ActivityType = "note" | "call" | "email" | "status_change" | "field_edit" | "whatsapp" | "doc_selected" | "doc_summary";

export interface ActivityComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  author: string;
  createdAt: string;
  scheduledAt?: string;
  editedAt?: string;
  editedBy?: string;
  comments?: ActivityComment[];
  leadId?: string;
  leadName?: string;
  completed?: boolean;
  meta?: {
    fromStatus?: string;
    toStatus?: string;
    duration?: string;
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface PipelineStageConfig {
  id: string;
  key: string;
  label: string;
  color: string;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: "s1", key: "nuevo", label: "Nuevo", color: "#3B82F6" },
  { id: "s2", key: "agendar", label: "Agendar", color: "#8B5CF6" },
  { id: "s3", key: "seguimiento", label: "Seguimiento", color: "#F59E0B" },
  { id: "s4", key: "recolectar", label: "Recolectar", color: "#06B6D4" },
  { id: "s5", key: "emitir", label: "Emitir", color: "#10B981" },
  { id: "s6", key: "lograr", label: "Lograr", color: "#22C55E" },
  { id: "s7", key: "bienvenida", label: "Bienvenida", color: "#EC4899" },
  { id: "s8", key: "bloqueo", label: "Bloqueo", color: "#EF4444" },
  { id: "s9", key: "devolucion", label: "Devolución", color: "#F97316" },
];

// Legacy compat
export const STATUS_CONFIG: Record<string, { label: string; cssVar: string }> = {
  nuevo: { label: "Nuevo", cssVar: "--status-nuevo" },
  emitir: { label: "Emitir", cssVar: "--status-emitir" },
  agendar: { label: "Agendar", cssVar: "--status-agendar" },
  devolucion: { label: "Devolución", cssVar: "--status-devolucion" },
  seguimiento: { label: "Seguimiento", cssVar: "--status-seguimiento" },
  recolectar: { label: "Recolectar", cssVar: "--status-recolectar" },
  lograr: { label: "Lograr", cssVar: "--status-lograr" },
  bloqueo: { label: "Bloqueo", cssVar: "--status-bloqueo" },
  bienvenida: { label: "Bienvenida", cssVar: "--status-bienvenida" },
};

export const ALL_STATUSES: PipelineStatus[] = [
  "nuevo", "agendar", "seguimiento", "recolectar", "emitir", "lograr", "bienvenida", "bloqueo", "devolucion",
];

export const USERS = ["Carlos M.", "Ana R.", "Pedro L.", "María G."];

export type ClientType = "natural" | "juridica" | "cero_km";

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  natural: "Persona Natural",
  juridica: "Persona Jurídica",
  cero_km: "Cero Kilómetros",
};

export interface LeadDocument {
  id: string;
  label: string;
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  aseguradora?: string;
}

export const REQUIRED_DOCS: Record<ClientType, string[]> = {
  juridica: [
    "Foto de la cédula Representante Legal",
    "Foto de la tarjeta de propiedad",
    "Cámara de Comercio no mayor a 30 días",
    "RUT",
    "Declaración de Renta",
    "Carta de composición accionaria",
    "Formulario Sarlaft firmado y huellado",
  ],
  natural: [
    "Foto de la cédula",
    "Foto de la tarjeta de propiedad",
    "Formulario Sarlaft",
  ],
  cero_km: [
    "Foto de la cédula por ambos lados",
    "Foto del SOAT o la tarjeta de propiedad",
    "Factura proforma o factura final",
    "Formulario Sarlaft",
  ],
};

export const COTIZACION_LABELS = [
  "Cotización Aseguradora 1",
  "Cotización Aseguradora 2",
  "Cotización Aseguradora 3",
  "Cotización Aseguradora 4",
  "Cotización Aseguradora 5",
];

export const INSPECCION_LABEL = "Resultado de inspección";

export type OpportunityType = "vehiculo" | "vida" | "educacion" | "hogar" | "salud" | "empresarial" | "otro";

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  vehiculo: "Vehículo",
  vida: "Vida",
  educacion: "Educación",
  hogar: "Hogar",
  salud: "Salud",
  empresarial: "Empresarial",
  otro: "Otro",
};

export const OPPORTUNITY_TYPE_FIELDS: Record<OpportunityType, { key: string; label: string; placeholder: string }[]> = {
  vehiculo: [
    { key: "placa", label: "Placa", placeholder: "ABC123" },
    { key: "referencia", label: "Referencia vehículo", placeholder: "Mazda 3 2024" },
    { key: "modelo", label: "Modelo/Año", placeholder: "2024" },
    { key: "color", label: "Color", placeholder: "Blanco" },
  ],
  vida: [
    { key: "beneficiarios", label: "Beneficiarios", placeholder: "Nombre de beneficiarios" },
    { key: "sumaAsegurada", label: "Suma asegurada", placeholder: "100.000.000" },
    { key: "planVida", label: "Plan", placeholder: "Plan vida integral" },
  ],
  educacion: [
    { key: "institucion", label: "Institución", placeholder: "Universidad Nacional" },
    { key: "valorMatricula", label: "Valor matrícula", placeholder: "5.000.000" },
    { key: "programa", label: "Programa", placeholder: "Ingeniería de sistemas" },
  ],
  hogar: [
    { key: "direccion", label: "Dirección inmueble", placeholder: "Calle 45 #12-34" },
    { key: "valorInmueble", label: "Valor inmueble", placeholder: "300.000.000" },
    { key: "tipoInmueble", label: "Tipo inmueble", placeholder: "Apartamento / Casa" },
  ],
  salud: [
    { key: "eps", label: "EPS actual", placeholder: "Sura EPS" },
    { key: "planSalud", label: "Plan salud", placeholder: "Plan complementario" },
    { key: "cobertura", label: "Cobertura", placeholder: "Nacional" },
  ],
  empresarial: [
    { key: "razonSocial", label: "Razón social", placeholder: "Empresa SAS" },
    { key: "nit", label: "NIT", placeholder: "900.123.456-7" },
    { key: "tipoRiesgo", label: "Tipo de riesgo", placeholder: "RC / Incendio / Transporte" },
    { key: "numEmpleados", label: "Nº empleados", placeholder: "50" },
  ],
  otro: [
    { key: "detalle", label: "Detalle", placeholder: "Descripción del seguro" },
  ],
};

export type OpportunityStatus = "nueva" | "en_progreso" | "ganada" | "perdida" | "reactivar";

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  nueva: "Nueva",
  en_progreso: "En progreso",
  ganada: "Ganada",
  perdida: "Perdida",
  reactivar: "Reactivar",
};

export interface Opportunity {
  id: string;
  type: OpportunityType;
  status: OpportunityStatus;
  description: string;
  placa?: string;
  url?: string;
  monto?: number;
  aseguradora?: string;
  createdAt: string;
  createdBy: string;
  typeFields?: Record<string, string>;
  linkedLeadId?: string;
}

// === CRM Config Types ===

export interface PaymentStatusConfig {
  id: string;
  key: string;
  label: string;
  color: string;
}

export const DEFAULT_PAYMENT_STATUSES: PaymentStatusConfig[] = [
  { id: "ps1", key: "vendida", label: "Vendida", color: "#9CA3AF" },
  { id: "ps2", key: "pagado", label: "Pagado", color: "#22C55E" },
  { id: "ps3", key: "en_proceso", label: "En proceso", color: "#EAB308" },
  { id: "ps4", key: "no_pagado", label: "No pagado", color: "#EF4444" },
];

export interface IdTypeConfig {
  id: string;
  code: string;
  label: string;
}

export const DEFAULT_ID_TYPES: IdTypeConfig[] = [
  { id: "id1", code: "CC", label: "Cédula de Ciudadanía" },
  { id: "id2", code: "NIT", label: "NIT" },
  { id: "id3", code: "CE", label: "Cédula de Extranjería" },
  { id: "id4", code: "P", label: "Pasaporte" },
  { id: "id5", code: "TI", label: "Tarjeta de Identidad" },
  { id: "id6", code: "RC", label: "Registro Civil" },
];

export const DEFAULT_SERVICE_TYPES = ["Particular", "Público"];

export interface CustomReportSection {
  id: string;
  title: string;
  type: "bar" | "pie" | "table" | "metric";
  groupBy: string;
  visible: boolean;
}

export interface LeadFormFieldConfig {
  key: string;
  label: string;
  enabled: boolean;
  required: boolean;
}

export const DEFAULT_LEAD_FORM_FIELDS: LeadFormFieldConfig[] = [
  { key: "propietario", label: "Nombre completo", enabled: true, required: true },
  { key: "tipoIdentificacion", label: "Tipo identificación", enabled: true, required: false },
  { key: "numeroIdentificacion", label: "Nº identificación", enabled: true, required: false },
  { key: "phone", label: "Teléfono", enabled: true, required: false },
  { key: "email", label: "Email", enabled: true, required: false },
  { key: "placa", label: "Placa", enabled: true, required: false },
  { key: "lugar", label: "Ciudad", enabled: true, required: false },
  { key: "insurance", label: "Aseguradora", enabled: true, required: false },
  { key: "marca", label: "Marca", enabled: true, required: false },
  { key: "modelo", label: "Modelo", enabled: true, required: false },
  { key: "tipoSeguro", label: "Tipo seguro", enabled: true, required: false },
  { key: "monto", label: "Valor asegurado", enabled: true, required: false },
  { key: "valorPrima", label: "Valor prima", enabled: true, required: false },
  { key: "sexo", label: "Sexo", enabled: false, required: false },
  { key: "fechaNacimiento", label: "Fecha nacimiento", enabled: false, required: false },
  { key: "colorVehiculo", label: "Color vehículo", enabled: false, required: false },
  { key: "tipoServicio", label: "Tipo servicio", enabled: false, required: false },
  { key: "assignedTo", label: "Asignado a", enabled: true, required: false },
];

export interface CrmConfig {
  paymentStatuses: PaymentStatusConfig[];
  idTypes: IdTypeConfig[];
  serviceTypes: string[];
  statusLabels: Record<string, string>;
  customReportSections: CustomReportSection[];
  visibleViews: Record<string, boolean>;
  leadFormFields: LeadFormFieldConfig[];
  pipelineStages: PipelineStageConfig[];
}

export const DEFAULT_CRM_CONFIG: CrmConfig = {
  paymentStatuses: DEFAULT_PAYMENT_STATUSES,
  idTypes: DEFAULT_ID_TYPES,
  serviceTypes: DEFAULT_SERVICE_TYPES,
  statusLabels: {},
  customReportSections: [],
  visibleViews: { pipeline: true, kanban: true, reports: true, agenda: true },
  leadFormFields: DEFAULT_LEAD_FORM_FIELDS,
  pipelineStages: DEFAULT_PIPELINE_STAGES,
};

export const YEAR_OPTIONS = Array.from({ length: 40 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());

export function getStatusLabel(status: PipelineStatus, overrides: Record<string, string> = {}, stages?: PipelineStageConfig[]): string {
  if (overrides[status]) return overrides[status];
  if (stages) {
    const stage = stages.find(s => s.key === status);
    if (stage) return stage.label;
  }
  return STATUS_CONFIG[status]?.label || status;
}

export function getStageKeys(config: CrmConfig): string[] {
  return config.pipelineStages.map(s => s.key);
}
