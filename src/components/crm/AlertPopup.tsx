import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Eye, Clock, User } from "lucide-react";
import type { Activity, Lead } from "@/types/crm";

interface AlertPopupProps {
  activity: (Activity & { leadId: string; leadName: string }) | null;
  onViewLead: (leadId: string) => void;
  onDismiss: () => void;
}

export function AlertPopup({ activity, onViewLead, onDismiss }: AlertPopupProps) {
  if (!activity) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-4 right-4 z-50 w-[360px] bg-card border border-primary/30 rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Bell size={14} /> Recordatorio
          </span>
          <button onClick={onDismiss} className="p-0.5 rounded hover:bg-primary/20">
            <X size={12} className="text-primary" />
          </button>
        </div>
        <div className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{activity.text}</h4>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><User size={10} />{activity.leadName}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{activity.scheduledAt}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onViewLead(activity.leadId)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90">
              <Eye size={12} /> Ver lead
            </button>
            <button onClick={onDismiss}
              className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted">
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
