import type { PipelineStatus, PipelineStageConfig } from "@/types/crm";
import { STATUS_CONFIG, getStatusLabel, DEFAULT_PIPELINE_STAGES } from "@/types/crm";

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
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border"
      style={{
        backgroundColor: color + "18",
        color: color,
        borderColor: color + "30",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
