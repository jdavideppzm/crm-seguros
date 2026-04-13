import { useState, useMemo } from "react";
import {
  CalendarDays, Clock, ChevronLeft, ChevronRight, Bell,
  StickyNote, PhoneCall, Mail, Activity as ActivityIcon,
  AlertCircle, CheckCircle2, User, ChevronDown, MessageSquare,
  Check, RotateCcw, Filter, Calendar as CalendarIcon, List as ListIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Lead, Activity } from "@/types/crm";

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string; bg: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota", bg: "bg-status-seguimiento/10" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada", bg: "bg-status-lograr/10" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email", bg: "bg-status-bienvenida/10" },
  whatsapp: { icon: MessageSquare, color: "text-status-lograr", label: "WhatsApp", bg: "bg-status-lograr/10" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio", bg: "bg-status-emitir/10" },
};

interface ScheduledActivity extends Activity {
  leadId: string;
  leadName: string;
}

interface AgendaViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onMarkDone?: (leadId: string, activityId: string, note: string) => void;
  onReschedule?: (leadId: string, activityId: string, newDate: string, comment: string) => void;
}

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

type AgendaFilter = "all" | "overdue" | "today" | "upcoming";

function parseScheduledDate(scheduledAt: string): Date | null {
  try {
    const [datePart] = scheduledAt.split(" ");
    const parts = datePart.split("/");
    if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const d = new Date(scheduledAt);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

export function AgendaView({ leads, onSelectLead, onMarkDone, onReschedule }: AgendaViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<AgendaFilter>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"done" | "reschedule" | null>(null);
  const [doneNote, setDoneNote] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleComment, setRescheduleComment] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const scheduledActivities = useMemo(() => {
    const items: ScheduledActivity[] = [];
    leads.forEach((lead) => {
      (lead.activities || []).forEach((act) => {
        if (act.scheduledAt && !act.completed) {
          items.push({ ...act, leadId: lead.id, leadName: lead.propietario });
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

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } else setCurrentMonth(currentMonth - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } else setCurrentMonth(currentMonth + 1); };

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const weekLater = new Date(now);
  weekLater.setDate(weekLater.getDate() + 7);

  const upcomingActivities = useMemo(() => {
    return scheduledActivities.filter((act) => { const d = parseScheduledDate(act.scheduledAt!); return d && d >= now && d <= weekLater; });
  }, [scheduledActivities]);

  const overdueActivities = useMemo(() => {
    return scheduledActivities.filter((act) => { const d = parseScheduledDate(act.scheduledAt!); return d && d < now; });
  }, [scheduledActivities]);

  const todayActivities = useMemo(() => {
    const todayStr = now.toDateString();
    return scheduledActivities.filter((act) => { const d = parseScheduledDate(act.scheduledAt!); return d && d.toDateString() === todayStr; });
  }, [scheduledActivities]);

  const selectedDateActivities = selectedDate ? (activitiesByDate[selectedDate] || []) : [];

  // Apply filter
  const displayActivities = useMemo(() => {
    if (selectedDate) return selectedDateActivities;
    switch (activeFilter) {
      case "overdue": return overdueActivities;
      case "today": return todayActivities;
      case "upcoming": return upcomingActivities;
      default: return scheduledActivities;
    }
  }, [selectedDate, activeFilter, selectedDateActivities, overdueActivities, todayActivities, upcomingActivities, scheduledActivities]);

  const handleMarkDone = (act: ScheduledActivity) => {
    if (onMarkDone) {
      onMarkDone(act.leadId, act.id, doneNote.trim());
      setActionId(null); setActionType(null); setDoneNote("");
    }
  };

  const handleReschedule = (act: ScheduledActivity) => {
    if (onReschedule && rescheduleDate) {
      const dateStr = `${rescheduleDate.split("-").reverse().join("/")}${rescheduleTime ? ` ${rescheduleTime}` : ""}`;
      onReschedule(act.leadId, act.id, dateStr, rescheduleComment.trim());
      setActionId(null); setActionType(null); setRescheduleDate(""); setRescheduleTime(""); setRescheduleComment("");
    }
  };

  const filterTabs: { key: AgendaFilter; label: string; count: number; color: string }[] = [
    { key: "all", label: "Todas", count: scheduledActivities.length, color: "bg-muted text-foreground" },
    { key: "overdue", label: "Vencidas", count: overdueActivities.length, color: "bg-destructive/10 text-destructive" },
    { key: "today", label: "Hoy", count: todayActivities.length, color: "bg-primary/10 text-primary" },
    { key: "upcoming", label: "Próximas", count: upcomingActivities.length, color: "bg-accent text-accent-foreground" },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-[380px] shrink-0 border-r border-border overflow-y-auto bg-card">
        {(overdueActivities.length > 0 || upcomingActivities.length > 0) && (
          <div className="px-5 pt-5 space-y-3">
            {overdueActivities.length > 0 && (
              <button
                onClick={() => { setActiveFilter("overdue"); setSelectedDate(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${activeFilter === "overdue" ? "bg-destructive/10 border-destructive/40 shadow-lg shadow-destructive/10" : "bg-destructive/5 border-destructive/10 hover:bg-destructive/10"}`}
              >
                <AlertCircle size={16} className="text-destructive shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest text-destructive">{overdueActivities.length} Vencida{overdueActivities.length > 1 ? "s" : ""}</span>
              </button>
            )}
            {upcomingActivities.length > 0 && (
              <button
                onClick={() => { setActiveFilter("upcoming"); setSelectedDate(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 ${activeFilter === "upcoming" ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10" : "bg-primary/5 border-primary/10 hover:bg-primary/10"}`}
              >
                <Bell size={16} className="text-primary shrink-0" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">{upcomingActivities.length} Próxima{upcomingActivities.length > 1 ? "s" : ""}</span>
              </button>
            )}
          </div>
        )}

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronLeft size={16} className="text-muted-foreground" /></button>
            <h3 className="text-sm font-semibold text-foreground">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronRight size={16} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {DAY_NAMES.map((d) => (<div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1.5 uppercase">{d}</div>))}
            {Array.from({ length: firstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = `${currentYear}-${currentMonth}-${day}`;
              const hasActs = !!activitiesByDate[dateKey];
              const count = activitiesByDate[dateKey]?.length || 0;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected = selectedDate === dateKey;
              const dateObj = new Date(currentYear, currentMonth, day);
              const nowDate = new Date(); nowDate.setHours(0, 0, 0, 0);
              const isOverdue = hasActs && dateObj < nowDate;
              return (
                <button key={day} onClick={() => { setSelectedDate(isSelected ? null : dateKey); if (!isSelected) setActiveFilter("all"); }}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : isToday ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted text-foreground"}`}>
                  {day}
                  {hasActs && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : isOverdue ? "bg-destructive" : "bg-primary"}`} />
                      {count > 1 && <span className={`text-[8px] font-bold ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}>{count}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-5 pt-2 border-t border-border/50">
          <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-3">Resumen de actividades</p>
          <div className="space-y-2">
            <StatRow
              icon={<CalendarDays size={14} />}
              label="Total programadas"
              value={scheduledActivities.length}
              colorClass="text-primary bg-primary/10"
              onClick={() => { setActiveFilter("all"); setSelectedDate(null); }}
              active={activeFilter === "all" && !selectedDate}
            />
            <StatRow
              icon={<AlertCircle size={14} />}
              label="Vencidas"
              value={overdueActivities.length}
              colorClass="text-destructive bg-destructive/10"
              onClick={() => { setActiveFilter("overdue"); setSelectedDate(null); }}
              active={activeFilter === "overdue"}
            />
            <StatRow
              icon={<Bell size={14} />}
              label="Próximas 7 días"
              value={upcomingActivities.length}
              colorClass="text-status-seguimiento bg-status-seguimiento/10"
              onClick={() => { setActiveFilter("upcoming"); setSelectedDate(null); }}
              active={activeFilter === "upcoming"}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                {selectedDate 
                  ? (() => { const [y, m, d] = selectedDate.split("-").map(Number); return `${d} de ${MONTH_NAMES[m]} ${y}`; })() 
                  : activeFilter === "overdue" ? "Actividades vencidas"
                  : activeFilter === "today" ? "Actividades de hoy"
                  : activeFilter === "upcoming" ? "Próximas actividades (7 días)"
                  : "Todas las actividades programadas"}
              </h3>
              <p className="text-xs text-muted-foreground">{displayActivities.length} actividad{displayActivities.length !== 1 ? "es" : ""}</p>
            </div>
            
            <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ListIcon size={14} />
              </button>
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <CalendarIcon size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-7 gap-px bg-border border border-border rounded-xl overflow-hidden shadow-sm">
                {DAY_NAMES.map(d => (
                  <div key={d} className="bg-muted/30 py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-grid-${i}`} className="bg-card/30 min-h-[100px]" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = `${currentYear}-${currentMonth}-${day}`;
                  const dayActs = activitiesByDate[dateKey] || [];
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                  const isSelected = selectedDate === dateKey;
                  
                  return (
                    <div 
                      key={day} 
                      onClick={() => { setSelectedDate(isSelected ? null : dateKey); if (!isSelected) setActiveFilter("all"); setViewMode("list"); }}
                      className={`bg-card min-h-[100px] p-2 transition-all cursor-pointer hover:bg-primary/5 group ${isToday ? "ring-inset ring-1 ring-primary/30" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                          {day}
                        </span>
                        {dayActs.length > 0 && <span className="text-[9px] font-bold text-primary/70">{dayActs.length} {dayActs.length === 1 ? 'act' : 'acts'}</span>}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {dayActs.slice(0, 3).map(act => (
                          <div key={act.id} className="text-[9px] truncate px-1 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 font-medium">
                            {act.text}
                          </div>
                        ))}
                        {dayActs.length > 3 && (
                          <div className="text-[8px] text-center text-muted-foreground pt-0.5 font-medium">
                            + {dayActs.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : displayActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3"><CalendarDays size={20} className="text-muted-foreground" /></div>
                <p className="text-sm text-muted-foreground font-medium">
                  {activeFilter === "overdue" ? "No hay actividades vencidas 🎉" : "Sin actividades programadas"}
                </p>
              </div>
            ) : (
              displayActivities.map((act) => {
                const config = activityTypeConfig[act.type] || activityTypeConfig.note;
                const Icon = config.icon;
                const d = parseScheduledDate(act.scheduledAt!);
                const nowCheck = new Date(); nowCheck.setHours(0, 0, 0, 0);
                const isOverdue = d ? d < nowCheck : false;
                const isToday = d ? d.toDateString() === nowCheck.toDateString() : false;
                const isActioning = actionId === act.id;

                return (
                  <div key={act.id} className="w-full text-left p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => { const lead = leads.find(l => l.id === act.leadId); if (lead) onSelectLead(lead); }}>
                      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}><Icon size={14} className={config.color} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{act.text}</span>
                          {isOverdue && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive uppercase">Vencida</span>}
                          {isToday && !isOverdue && <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase">Hoy</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><User size={10} />{act.leadName}</span>
                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={10} />{act.scheduledAt}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}>{config.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/50">
                      <button
                        onClick={() => { setActionId(isActioning && actionType === "done" ? null : act.id); setActionType("done"); setDoneNote(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-lograr/10 text-status-lograr text-[11px] font-medium hover:bg-status-lograr/20 transition-colors"
                      >
                        <Check size={12} /> Realizado
                      </button>
                      <button
                        onClick={() => { setActionId(isActioning && actionType === "reschedule" ? null : act.id); setActionType("reschedule"); setRescheduleDate(""); setRescheduleTime(""); setRescheduleComment(""); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-status-seguimiento/10 text-status-seguimiento text-[11px] font-medium hover:bg-status-seguimiento/20 transition-colors"
                      >
                        <RotateCcw size={12} /> Reprogramar
                      </button>
                    </div>

                    {/* Done Form */}
                    {isActioning && actionType === "done" && (
                      <div className="mt-2 space-y-2 bg-status-lograr/5 rounded-lg p-2.5 border border-status-lograr/20">
                        <p className="text-[11px] font-medium text-foreground">Nota de cierre:</p>
                        <input
                          value={doneNote}
                          onChange={(e) => setDoneNote(e.target.value)}
                          placeholder="Resultado de la actividad..."
                          className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                          autoFocus
                        />
                        <button
                          onClick={() => handleMarkDone(act)}
                          className="w-full text-xs py-1.5 rounded-md bg-status-lograr text-white font-medium hover:bg-status-lograr/90 transition-colors"
                        >
                          ✓ Confirmar realizado
                        </button>
                      </div>
                    )}

                    {/* Reschedule Form */}
                    {isActioning && actionType === "reschedule" && (
                      <div className="mt-2 space-y-2 bg-status-seguimiento/5 rounded-lg p-2.5 border border-status-seguimiento/20">
                        <p className="text-[11px] font-medium text-foreground">Nueva fecha y hora:</p>
                        <div className="flex gap-2">
                          <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
                          <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="w-24 text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
                        </div>
                        <input
                          value={rescheduleComment}
                          onChange={(e) => setRescheduleComment(e.target.value)}
                          placeholder="Motivo de reprogramación..."
                          className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md"
                        />
                        <button
                          onClick={() => handleReschedule(act)}
                          disabled={!rescheduleDate}
                          className="w-full text-xs py-1.5 rounded-md bg-status-seguimiento text-white font-medium hover:bg-status-seguimiento/90 disabled:opacity-40 transition-colors"
                        >
                          🔄 Reprogramar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, colorClass, onClick, active }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colorClass: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
        active
          ? 'bg-muted border border-border shadow-sm'
          : onClick
            ? 'hover:bg-muted/60 cursor-pointer'
            : ''
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 leading-none mb-0.5">{label}</p>
        <p className="text-lg font-black text-foreground leading-none tabular-nums">{value}</p>
      </div>
      {value > 0 && onClick && (
        <div className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${colorClass} opacity-70`}>
          ver
        </div>
      )}
    </Tag>
  );
}
