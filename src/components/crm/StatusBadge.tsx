import type { PipelineStatus, PipelineStageConfig } from "@/types/crm";
import { STATUS_CONFIG, DEFAULT_PIPELINE_STAGES } from "@/types/crm";

interface StatusBadgeProps {
  status: PipelineStatus;
  labelOverrides?: Record<string, string>;
  pipelineStages?: PipelineStageConfig[];
}

export function StatusBadge({ status, labelOverrides = {}, pipelineStages }: StatusBadgeProps) {
  const stages = pipelineStages || DEFAULT_PIPELINE_STAGES;
  const stage = stages.find(s => s.key === status);
  const color = stage?.color || "#6B7280";
  const label = labelOverrides[status] || stage?.label || STATUS_CONFIG[status]?.label || status;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all hover:brightness-110"
      style={{
        backgroundColor: color + "12",
        color: color,
        borderColor: color + "25",
        boxShadow: `0 2px 10px -4px ${color}40`,
      }}
    >
      <div className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }}></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: color }}></span>
      </div>
      {label}
    </span>
  );
}
