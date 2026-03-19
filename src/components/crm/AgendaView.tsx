import { useState, useMemo } from "react";
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, Bell,
  StickyNote, PhoneCall, Mail, Activity as ActivityIcon,
  AlertCircle, CheckCircle2, User,
} from "lucide-react";
import type { Lead, Activity } from "@/types/crm";

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string; bg: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota", bg: "bg-status-seguimiento/10" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada", bg: "bg-status-lograr/10" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email", bg: "bg-status-bienvenida/10" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio", bg: "bg-status-emitir/10" },
};

interface ScheduledActivity extends Activity {
  leadId: string;
  leadName: string;
}

interface AgendaViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function parseScheduledDate(scheduledAt: string): Date | null {
  try {
    const [datePart] = scheduledAt.split(" ");
    const parts = datePart.split("/");
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    const d = new Date(scheduledAt);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function AgendaView({ leads, onSelectLead }: AgendaViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Collect all scheduled activities across all leads
  const scheduledActivities = useMemo(() => {
    const items: ScheduledActivity[] = [];
    leads.forEach((lead) => {
      (lead.activities || []).forEach((act) => {
        if (act.scheduledAt) {
          items.push({
            ...act,
            leadId: lead.id,
            leadName: lead.propietario,
          });
        }
      });
    });
    return items.sort((a, b) => {
      const da = parseScheduledDate(a.scheduledAt!);
      const db = parseScheduledDate(b.scheduledAt!);
      if (!da || !db) return 0;
      return da.getTime() - db.getTime();
    });
  }, [leads]);

  // Group by date key
  const activitiesByDate = useMemo(() => {
    const map: Record<string, ScheduledActivity[]> = {};
    scheduledActivities.forEach((act) => {
      const d = parseScheduledDate(act.scheduledAt!);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(act);
    });
    return map;
  }, [scheduledActivities]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  // Upcoming activities (next 7 days)
  const upcomingActivities = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const weekLater = new Date(now);
    weekLater.setDate(weekLater.getDate() + 7);
    return scheduledActivities.filter((act) => {
      const d = parseScheduledDate(act.scheduledAt!);
      if (!d) return false;
      return d >= now && d <= weekLater;
    });
  }, [scheduledActivities]);

  // Overdue activities
  const overdueActivities = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return scheduledActivities.filter((act) => {
      const d = parseScheduledDate(act.scheduledAt!);
      if (!d) return false;
      return d < now;
    });
  }, [scheduledActivities]);

  const selectedDateActivities = selectedDate ? (activitiesByDate[selectedDate] || []) : [];

  const handleSelectLead = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (lead) onSelectLead(lead);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Calendar + Stats */}
      <div className="w-[380px] shrink-0 border-r border-border overflow-y-auto bg-card">
        {/* Alerts Banner */}
        {(overdueActivities.length > 0 || upcomingActivities.length > 0) && (
          <div className="px-4 pt-4 space-y-2">
            {overdueActivities.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={14} className="text-destructive shrink-0" />
                <span className="text-xs font-medium text-destructive">
                  {overdueActivities.length} actividad{overdueActivities.length > 1 ? "es" : ""} vencida{overdueActivities.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {upcomingActivities.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Bell size={14} className="text-primary shrink-0" />
                <span className="text-xs font-medium text-primary">
                  {upcomingActivities.length} actividad{upcomingActivities.length > 1 ? "es" : ""} próxima{upcomingActivities.length > 1 ? "s" : ""} (7 días)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mini Calendar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <h3 className="text-sm font-semibold text-foreground">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1.5 uppercase">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${currentYear}-${currentMonth}-${day}`;
              const hasActivities = !!activitiesByDate[dateKey];
              const count = activitiesByDate[dateKey]?.length || 0;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDate === dateKey;

              // Check if has overdue
              const dateObj = new Date(currentYear, currentMonth, day);
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const isOverdue = hasActivities && dateObj < now;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isToday
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {day}
                  {hasActivities && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-primary-foreground" : isOverdue ? "bg-destructive" : "bg-primary"
                      }`} />
                      {count > 1 && (
                        <span className={`text-[8px] font-bold ${
                          isSelected ? "text-primary-foreground" : "text-muted-foreground"
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 pb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-muted/50 border border-border p-3 text-center">
            <p className="text-lg font-bold text-foreground">{scheduledActivities.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total</p>
          </div>
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3 text-center">
            <p className="text-lg font-bold text-destructive">{overdueActivities.length}</p>
            <p className="text-[10px] text-destructive font-medium">Vencidas</p>
          </div>
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center">
            <p className="text-lg font-bold text-primary">{upcomingActivities.length}</p>
            <p className="text-[10px] text-primary font-medium">Próximas</p>
          </div>
        </div>
      </div>

      {/* Right: Activity List */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {selectedDate
              ? (() => {
                  const [y, m, d] = selectedDate.split("-").map(Number);
                  return `${d} de ${MONTH_NAMES[m]} ${y}`;
                })()
              : "Todas las actividades programadas"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {selectedDate
              ? `${selectedDateActivities.length} actividad${selectedDateActivities.length !== 1 ? "es" : ""}`
              : `${scheduledActivities.length} actividad${scheduledActivities.length !== 1 ? "es" : ""} programada${scheduledActivities.length !== 1 ? "s" : ""}`}
          </p>

          <div className="space-y-2">
            {(selectedDate ? selectedDateActivities : scheduledActivities).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <CalendarDays size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Sin actividades programadas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Programa una actividad con fecha desde el panel de un lead.
                </p>
              </div>
            ) : (
              (selectedDate ? selectedDateActivities : scheduledActivities).map((act) => {
                const config = activityTypeConfig[act.type] || activityTypeConfig.note;
                const Icon = config.icon;
                const d = parseScheduledDate(act.scheduledAt!);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const isOverdue = d ? d < now : false;
                const isToday = d ? d.toDateString() === now.toDateString() : false;

                return (
                  <button
                    key={act.id}
                    onClick={() => handleSelectLead(act.leadId)}
                    className="w-full text-left p-3 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                        <Icon size={14} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{act.text}</span>
                          {isOverdue && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive uppercase">
                              Vencida
                            </span>
                          )}
                          {isToday && !isOverdue && (
                            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase">
                              Hoy
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <User size={10} />
                            {act.leadName}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock size={10} />
                            {act.scheduledAt}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Creado por {act.author} · {act.createdAt}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
