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
  // New structured fields
  origenLead?: string;
  tipPoliza?: string;
  aseguradoraId?: string;
  comisionCalculada?: number;
  // Tasks & Checklist
  tasks?: LeadTask[];
  emissionChecklist?: Record<string, boolean>;
}

// === Lead Tasks ===
export interface LeadTask {
  id: string;
  name: string;
  priority: "alta" | "media" | "baja";
  date: string;
  time: string;
  assignedTo: string;
  completed: boolean;
  createdAt: string;
}

// === Smart Views ===
export interface SmartView {
  id: string;
  name: string;
  icon: string;
  filterType: "status" | "assigned" | "field";
  filterValue: string;
  filterField?: string;
}

// === Chat Messages ===
export interface ChatMessage {
  id: string;
  from: string;
  to?: string;
  text: string;
  leadId?: string;
  leadName?: string;
  createdAt: string;
}

// === CRM Alerts ===
export interface CrmAlert {
  id: string;
  type: "overdue" | "automation" | "manual" | "task";
  message: string;
  leadId?: string;
  leadName?: string;
  createdBy?: string;
  createdAt: string;
  dismissed: boolean;
}

// === Emission Checklist ===
export interface EmissionCheckItem {
  id: string;
  label: string;
}

export const DEFAULT_EMISSION_CHECKLIST: EmissionCheckItem[] = [
  { id: "ec1", label: "Cotización seleccionada" },
  { id: "ec2", label: "Inspección realizada" },
  { id: "ec3", label: "Forma de pago definida" },
  { id: "ec4", label: "Tomador adicional verificado" },
  { id: "ec5", label: "Segundo asegurado verificado" },
  { id: "ec6", label: "Beneficiario oneroso registrado" },
  { id: "ec7", label: "Documentos completos" },
];

export const DEFAULT_SMART_VIEWS: SmartView[] = [
  { id: "sv1", name: "Hacer contacto inicial", icon: "🔥", filterType: "status", filterValue: "nuevo" },
  { id: "sv2", name: "Recolectar documentos", icon: "📄", filterType: "status", filterValue: "contactado" },
  { id: "sv3", name: "Confirmar inspección", icon: "🔍", filterType: "status", filterValue: "cotizacion" },
  { id: "sv4", name: "Lograr avance", icon: "🎯", filterType: "status", filterValue: "seguimiento" },
  { id: "sv5", name: "En emisión", icon: "📦", filterType: "status", filterValue: "emitido" },
  { id: "sv6", name: "Gestionar a futuro", icon: "🚀", filterType: "status", filterValue: "ganado" },
];

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

export type ActivityType = "note" | "call" | "email" | "status_change" | "field_edit" | "whatsapp" | "doc_selected" | "doc_summary" | "automation";

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

// === Pipeline ===

export interface PipelineStageConfig {
  id: string;
  key: string;
  label: string;
  color: string;
  isFinal?: boolean;
  finalType?: "ganado" | "perdido";
  order: number;
}

export const DEFAULT_PIPELINE_STAGES: PipelineStageConfig[] = [
  { id: "s1", key: "nuevo", label: "Nuevo", color: "#3B82F6", order: 0 },
  { id: "s2", key: "contactado", label: "Contactado", color: "#8B5CF6", order: 1 },
  { id: "s3", key: "cotizacion", label: "Cotización", color: "#F59E0B", order: 2 },
  { id: "s4", key: "seguimiento", label: "Seguimiento", color: "#06B6D4", order: 3 },
  { id: "s5", key: "emitido", label: "Emitido", color: "#10B981", order: 4 },
  { id: "s6", key: "ganado", label: "Ganado", color: "#22C55E", isFinal: true, finalType: "ganado", order: 5 },
  { id: "s7", key: "perdido", label: "Perdido", color: "#EF4444", isFinal: true, finalType: "perdido", order: 6 },
];

// Legacy compat
export const STATUS_CONFIG: Record<string, { label: string; cssVar: string }> = {
  nuevo: { label: "Nuevo", cssVar: "--status-nuevo" },
  contactado: { label: "Contactado", cssVar: "--status-agendar" },
  cotizacion: { label: "Cotización", cssVar: "--status-seguimiento" },
  seguimiento: { label: "Seguimiento", cssVar: "--status-recolectar" },
  emitido: { label: "Emitido", cssVar: "--status-emitir" },
  ganado: { label: "Ganado", cssVar: "--status-lograr" },
  perdido: { label: "Perdido", cssVar: "--status-bloqueo" },
};

export const ALL_STATUSES: PipelineStatus[] = [
  "nuevo", "contactado", "cotizacion", "seguimiento", "emitido", "ganado", "perdido",
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

// === Aseguradoras ===

export interface InsuranceCompany {
  id: string;
  name: string;
  commission: number;
  contact?: string;
  notes?: string;
  webUrl?: string;
  accessEmail?: string;
  accessUser?: string;
  accessPassword?: string;
  directContact?: string;
}

export const DEFAULT_INSURANCE_COMPANIES: InsuranceCompany[] = [
  { id: "ins1", name: "AXA COLPATRIA", commission: 15, contact: "contacto@axa.com" },
  { id: "ins2", name: "MAPFRE", commission: 12, contact: "" },
  { id: "ins3", name: "SEGUROS BOLIVAR", commission: 14, contact: "" },
  { id: "ins4", name: "ALLIANZ", commission: 13, contact: "" },
  { id: "ins5", name: "EQUIDAD", commission: 10, contact: "" },
  { id: "ins6", name: "SURA", commission: 16, contact: "" },
];

// === Tipos de Póliza ===

export interface PolicyType {
  id: string;
  name: string;
}

export const DEFAULT_POLICY_TYPES: PolicyType[] = [
  { id: "pt1", name: "Todo riesgo" },
  { id: "pt2", name: "Parcial" },
  { id: "pt3", name: "SOAT" },
  { id: "pt4", name: "Responsabilidad civil" },
];

// === Origen de Leads ===

export interface LeadOrigin {
  id: string;
  name: string;
}

export const DEFAULT_LEAD_ORIGINS: LeadOrigin[] = [
  { id: "lo1", name: "Referido" },
  { id: "lo2", name: "Redes sociales" },
  { id: "lo3", name: "Página web" },
  { id: "lo4", name: "Llamada entrante" },
  { id: "lo5", name: "Base de datos" },
];

// === Automatizaciones ===

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AutomationTrigger;
  action: AutomationAction;
}

export interface AutomationTrigger {
  type: "status_change" | "days_inactive" | "lead_created";
  fromStatus?: string;
  toStatus?: string;
  daysInactive?: number;
}

export interface AutomationAction {
  type: "create_activity" | "change_status" | "send_alert";
  activityText?: string;
  activityType?: string;
  targetStatus?: string;
  alertMessage?: string;
}

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "auto1", name: "Nuevo lead → Contacto inmediato", enabled: true,
    trigger: { type: "lead_created" },
    action: { type: "create_activity", activityText: "Contactar cliente nuevo lo antes posible", activityType: "call" },
  },
  {
    id: "auto2", name: "Nuevo lead → Asignación automática", enabled: false,
    trigger: { type: "lead_created" },
    action: { type: "create_activity", activityText: "Lead asignado automáticamente", activityType: "note" },
  },
  {
    id: "auto3", name: "Contactado → Crear seguimiento", enabled: true,
    trigger: { type: "status_change", toStatus: "contactado" },
    action: { type: "create_activity", activityText: "Hacer seguimiento al cliente", activityType: "call" },
  },
  {
    id: "auto4", name: "Cotización → Enviar propuesta", enabled: true,
    trigger: { type: "status_change", toStatus: "cotizacion" },
    action: { type: "create_activity", activityText: "Enviar cotización al cliente", activityType: "note" },
  },
  {
    id: "auto5", name: "Seguimiento → Llamada", enabled: true,
    trigger: { type: "status_change", toStatus: "seguimiento" },
    action: { type: "create_activity", activityText: "Llamar cliente para cierre", activityType: "call" },
  },
  {
    id: "auto6", name: "Inactividad 3 días", enabled: true,
    trigger: { type: "days_inactive", daysInactive: 3 },
    action: { type: "create_activity", activityText: "Retomar cliente inactivo", activityType: "call" },
  },
  {
    id: "auto7", name: "Inactividad 5 días → Alerta", enabled: true,
    trigger: { type: "days_inactive", daysInactive: 5 },
    action: { type: "send_alert", alertMessage: "Lead sin gestión hace 5 días" },
  },
  {
    id: "auto8", name: "Emitido → Venta ganada", enabled: true,
    trigger: { type: "status_change", toStatus: "emitido" },
    action: { type: "change_status", targetStatus: "ganado" },
  },
  {
    id: "auto9", name: "Ganado → Postventa", enabled: true,
    trigger: { type: "status_change", toStatus: "ganado" },
    action: { type: "create_activity", activityText: "Solicitar referidos al cliente", activityType: "note" },
  },
  {
    id: "auto10", name: "Ganado → Renovación", enabled: true,
    trigger: { type: "status_change", toStatus: "ganado" },
    action: { type: "create_activity", activityText: "Contactar cliente para renovación de póliza", activityType: "call" },
  },
  {
    id: "auto11", name: "Perdido → Reintento", enabled: true,
    trigger: { type: "status_change", toStatus: "perdido" },
    action: { type: "create_activity", activityText: "Recontactar cliente perdido", activityType: "call" },
  },
  {
    id: "auto12", name: "Lead asignado → Acción", enabled: true,
    trigger: { type: "lead_created" },
    action: { type: "create_activity", activityText: "Contactar lead asignado", activityType: "call" },
  },
  {
    id: "auto13", name: "Todo riesgo → Prioridad alta", enabled: false,
    trigger: { type: "status_change", toStatus: "nuevo" },
    action: { type: "create_activity", activityText: "Cliente prioritario - póliza todo riesgo", activityType: "note" },
  },
];

// === Usuarios y Roles ===

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "vendedor";
  active: boolean;
}

export const DEFAULT_CRM_USERS: CrmUser[] = [
  { id: "u1", name: "Carlos M.", email: "carlos@crm.com", role: "admin", active: true },
  { id: "u2", name: "Ana R.", email: "ana@crm.com", role: "vendedor", active: true },
  { id: "u3", name: "Pedro L.", email: "pedro@crm.com", role: "vendedor", active: true },
  { id: "u4", name: "María G.", email: "maria@crm.com", role: "vendedor", active: true },
];

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
  { key: "origenLead", label: "Origen del lead", enabled: true, required: false },
  { key: "tipPoliza", label: "Tipo de póliza", enabled: true, required: false },
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

// === Datos de la Empresa ===

export interface CompanyInfo {
  name: string;
  nit: string;
  address: string;
  phone: string;
  logoUrl?: string;
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: "",
  nit: "",
  address: "",
  phone: "",
};

// === User Permissions ===

export interface UserPermissions {
  sections: Record<string, boolean>;
  actions: Record<string, boolean>;
}

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  sections: {
    pipeline: true, kanban: true, agenda: true, reports: true, settings: false,
  },
  actions: {
    create_leads: true, edit_leads: true, delete_leads: true,
    export_data: false, manage_users: false, manage_automations: false,
  },
};

export const ADMIN_PERMISSIONS: UserPermissions = {
  sections: {
    pipeline: true, kanban: true, agenda: true, reports: true, settings: true,
  },
  actions: {
    create_leads: true, edit_leads: true, delete_leads: true,
    export_data: true, manage_users: true, manage_automations: true,
  },
};

export const SECTION_LABELS: Record<string, string> = {
  pipeline: "Pipeline de ventas",
  kanban: "Vista Kanban",
  agenda: "Agenda",
  reports: "Reportes",
  settings: "Configuración",
};

export const ACTION_LABELS: Record<string, string> = {
  create_leads: "Crear leads",
  edit_leads: "Editar leads",
  delete_leads: "Eliminar leads",
  export_data: "Exportar datos",
  manage_users: "Gestionar usuarios",
  manage_automations: "Gestionar automatizaciones",
};

// === Theme Presets ===

export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  background: string;
  card: string;
  sidebarBg: string;
  accent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "default", name: "Azul Corporativo", primary: "221 83% 53%", background: "210 20% 98%", card: "0 0% 100%", sidebarBg: "222 47% 11%", accent: "220 14% 96%" },
  { id: "emerald", name: "Esmeralda", primary: "160 84% 39%", background: "160 20% 97%", card: "0 0% 100%", sidebarBg: "160 30% 10%", accent: "160 14% 95%" },
  { id: "violet", name: "Violeta", primary: "263 70% 50%", background: "260 20% 98%", card: "0 0% 100%", sidebarBg: "263 40% 12%", accent: "260 14% 96%" },
  { id: "amber", name: "Ámbar", primary: "38 92% 50%", background: "40 20% 97%", card: "0 0% 100%", sidebarBg: "30 30% 10%", accent: "40 14% 95%" },
  { id: "rose", name: "Rosa", primary: "347 77% 50%", background: "350 20% 98%", card: "0 0% 100%", sidebarBg: "347 40% 10%", accent: "350 14% 96%" },
  { id: "slate", name: "Pizarra Oscuro", primary: "215 20% 65%", background: "222 47% 8%", card: "222 47% 12%", sidebarBg: "222 47% 6%", accent: "222 20% 18%" },
  { id: "ocean", name: "Océano", primary: "199 89% 48%", background: "200 20% 97%", card: "0 0% 100%", sidebarBg: "200 40% 10%", accent: "200 14% 95%" },
  { id: "sunset", name: "Atardecer", primary: "20 90% 48%", background: "20 20% 97%", card: "0 0% 100%", sidebarBg: "15 35% 10%", accent: "20 14% 95%" },
];

// === Layout Presets ===

export type SidebarStyle = "dark" | "light" | "colored";
export type CardStyle = "rounded" | "flat" | "bordered";
export type DensityStyle = "compact" | "normal" | "comfortable";

export interface LayoutConfig {
  sidebarStyle: SidebarStyle;
  cardStyle: CardStyle;
  density: DensityStyle;
  showKpiCards: boolean;
  tableStriped: boolean;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  sidebarStyle: "dark",
  cardStyle: "rounded",
  density: "normal",
  showKpiCards: true,
  tableStriped: false,
};

export interface CrmConfig {
  paymentStatuses: PaymentStatusConfig[];
  idTypes: IdTypeConfig[];
  serviceTypes: string[];
  statusLabels: Record<string, string>;
  customReportSections: CustomReportSection[];
  visibleViews: Record<string, boolean>;
  leadFormFields: LeadFormFieldConfig[];
  pipelineStages: PipelineStageConfig[];
  insuranceCompanies: InsuranceCompany[];
  policyTypes: PolicyType[];
  leadOrigins: LeadOrigin[];
  automationRules: AutomationRule[];
  users: CrmUser[];
  companyInfo: CompanyInfo;
  userPermissions: Record<string, UserPermissions>;
  themePreset: string;
  layoutConfig: LayoutConfig;
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
  insuranceCompanies: DEFAULT_INSURANCE_COMPANIES,
  policyTypes: DEFAULT_POLICY_TYPES,
  leadOrigins: DEFAULT_LEAD_ORIGINS,
  automationRules: DEFAULT_AUTOMATION_RULES,
  users: DEFAULT_CRM_USERS,
  companyInfo: DEFAULT_COMPANY_INFO,
  userPermissions: {},
  themePreset: "default",
  layoutConfig: DEFAULT_LAYOUT_CONFIG,
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

export function getProcessStages(config: CrmConfig): PipelineStageConfig[] {
  return config.pipelineStages.filter(s => !s.isFinal).sort((a, b) => a.order - b.order);
}

export function getFinalStages(config: CrmConfig): PipelineStageConfig[] {
  return config.pipelineStages.filter(s => s.isFinal).sort((a, b) => a.order - b.order);
}

export function getInsuranceCommission(config: CrmConfig, insuranceName: string): number {
  const company = config.insuranceCompanies.find(c => c.name === insuranceName);
  return company?.commission || 0;
}
