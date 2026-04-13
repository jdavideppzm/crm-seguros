import { useEffect } from "react";
import { useCrmStore } from "../store/crmStore";

export function useAlertPopup() {
  const leads = useCrmStore(state => state.leads);
  const setPopupActivity = useCrmStore(state => state.setPopupActivity);

  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();
      const nowDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const nowHH = now.getHours().toString().padStart(2, "0");
      const nowMM = now.getMinutes().toString().padStart(2, "0");
      const nowTime = `${nowHH}:${nowMM}`;

      leads.forEach(lead => {
        // Check scheduled activities
        (lead.activities || []).forEach(act => {
          if (act.scheduledAt && !act.completed) {
            try {
              const [datePart, timePart] = act.scheduledAt.split(" ");
              const parts = datePart.split("/");
              if (parts.length === 3) {
                const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (timePart) {
                  const [h, m] = timePart.split(":");
                  d.setHours(parseInt(h), parseInt(m));
                }
                if (Math.abs(now.getTime() - d.getTime()) < 60000) {
                  setPopupActivity({ ...act, leadId: lead.id, leadName: lead.propietario });
                }
              }
            } catch {}
          }
        });

        // Check tasks with date/time
        (lead.tasks || []).forEach(task => {
          if (!task.completed && task.date) {
            const isToday = task.date === nowDate;
            const isDue = !task.time || task.time === nowTime || (isToday && task.time <= nowTime);
            if (isToday && isDue) {
              // Convert task to activity-like popup
              const priorityLabel = task.priority === "alta" ? "🔴 Alta" : task.priority === "media" ? "🟡 Media" : "🟢 Baja";
              setPopupActivity({
                id: task.id,
                type: "note",
                text: `📋 Tarea: ${task.name} (${priorityLabel})`,
                author: task.assignedTo || "Sistema",
                createdAt: task.createdAt,
                scheduledAt: `${task.date}${task.time ? ` ${task.time}` : ""}`,
                leadId: lead.id,
                leadName: lead.propietario,
              });
            }
          }
        });
      });
    };

    checkAlerts(); // Run immediately on mount
    const interval = setInterval(checkAlerts, 30000);
    return () => clearInterval(interval);
  }, [leads, setPopupActivity]);
}
