import type { PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG, getStatusLabel } from "@/types/crm";

const statusStyles: Record<PipelineStatus, string> = {
  nuevo: "bg-status-nuevo/10 text-status-nuevo border-status-nuevo/20",
  emitir: "bg-status-emitir/10 text-status-emitir border-status-emitir/20",
  agendar: "bg-status-agendar/10 text-status-agendar border-status-agendar/20",
  devolucion: "bg-status-devolucion/10 text-status-devolucion border-status-devolucion/20",
  seguimiento: "bg-status-seguimiento/10 text-status-seguimiento border-status-seguimiento/20",
  recolectar: "bg-status-recolectar/10 text-status-recolectar border-status-recolectar/20",
  lograr: "bg-status-lograr/10 text-status-lograr border-status-lograr/20",
  bloqueo: "bg-status-bloqueo/10 text-status-bloqueo border-status-bloqueo/20",
  bienvenida: "bg-status-bienvenida/10 text-status-bienvenida border-status-bienvenida/20",
};

const dotColor: Record<PipelineStatus, string> = {
  nuevo: "bg-status-nuevo",
  emitir: "bg-status-emitir",
  agendar: "bg-status-agendar",
  devolucion: "bg-status-devolucion",
  seguimiento: "bg-status-seguimiento",
  recolectar: "bg-status-recolectar",
  lograr: "bg-status-lograr",
  bloqueo: "bg-status-bloqueo",
  bienvenida: "bg-status-bienvenida",
};

interface StatusBadgeProps {
  status: PipelineStatus;
  labelOverrides?: Record<string, string>;
}

export function StatusBadge({ status, labelOverrides = {} }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${statusStyles[status] || statusStyles.nuevo}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || dotColor.nuevo}`} />
      {getStatusLabel(status, labelOverrides)}
    </span>
  );
}
