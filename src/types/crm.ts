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
}

export interface Note {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export type ActivityType = "note" | "call" | "email" | "status_change";

export interface Activity {
  id: string;
  type: ActivityType;
  text: string;
  author: string;
  createdAt: string;
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
