import type { PipelineStatus } from "@/types/crm";
import { STATUS_CONFIG } from "@/types/crm";

const statusStyles: Record<PipelineStatus, string> = {
  emitir: "bg-status-emitir/10 text-status-emitir border-status-emitir/20",
  agendar: "bg-status-agendar/10 text-status-agendar border-status-agendar/20",
  devolucion: "bg-status-devolucion/10 text-status-devolucion border-status-devolucion/20",
  seguimiento: "bg-status-seguimiento/10 text-status-seguimiento border-status-seguimiento/20",
  recolectar: "bg-status-recolectar/10 text-status-recolectar border-status-recolectar/20",
  lograr: "bg-status-lograr/10 text-status-lograr border-status-lograr/20",
  bloqueo: "bg-status-bloqueo/10 text-status-bloqueo border-status-bloqueo/20",
  bienvenida: "bg-status-bienvenida/10 text-status-bienvenida border-status-bienvenida/20",
};

export function StatusBadge({ status }: { status: PipelineStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${statusStyles[status]}`}>
      {STATUS_CONFIG[status].label}
    </span>
  );
}
