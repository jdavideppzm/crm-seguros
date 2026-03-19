export type PipelineStatus =
  | "emitir"
  | "agendar"
  | "devolucion"
  | "seguimiento"
  | "recolectar"
  | "lograr"
  | "bloqueo"
  | "bienvenida";

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
}

export interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export type ActivityType = "note" | "call" | "email" | "status_change";

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
  editedAt?: string;
  editedBy?: string;
  comments?: ActivityComment[];
  meta?: {
    fromStatus?: string;
    toStatus?: string;
    duration?: string;
  };
}

export const STATUS_CONFIG: Record<PipelineStatus, { label: string; cssVar: string }> = {
  emitir: { label: "Emitir", cssVar: "--status-emitir" },
  agendar: { label: "Agendar", cssVar: "--status-agendar" },
  devolucion: { label: "Devolución", cssVar: "--status-devolucion" },
  seguimiento: { label: "Seguimiento", cssVar: "--status-seguimiento" },
  recolectar: { label: "Recolectar", cssVar: "--status-recolectar" },
  lograr: { label: "Lograr", cssVar: "--status-lograr" },
  bloqueo: { label: "Bloqueo", cssVar: "--status-bloqueo" },
  bienvenida: { label: "Bienvenida", cssVar: "--status-bienvenida" },
};

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
  ],
  cero_km: [
    "Foto de la cédula por ambos lados",
    "Foto del SOAT o la tarjeta de propiedad",
    "Factura proforma o factura final",
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
}
