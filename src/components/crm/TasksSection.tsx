import { useState } from "react";
import {
  CheckCircle2, Circle, Clock, User, Plus, X, ChevronDown, ChevronUp,
  AlertTriangle, Pencil, Bell, Calendar,
} from "lucide-react";
import type { Lead, LeadTask, CrmUser } from "@/types/crm";

interface TasksSectionProps {
  lead: Lead;
  onUpdateLead: (lead: Lead) => void;
  users: CrmUser[];
}

const PRIORITY_CONFIG = {
  alta: { label: "Alta", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
  media: { label: "Media", color: "text-amber-500", bg: "bg-amber-50", icon: Clock },
  baja: { label: "Baja", color: "text-muted-foreground", bg: "bg-muted", icon: Circle },
};

export function TasksSection({ lead, onUpdateLead, users }: TasksSectionProps) {
  const [adding, setAdding] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [form, setForm] = useState({ name: "", priority: "media" as "alta" | "media" | "baja", date: "", time: "", assignedTo: "" });

  const tasks = lead.tasks || [];
  const pendingCount = tasks.filter(t => !t.completed).length;

  const handleAdd = () => {
    if (!form.name.trim()) return;
    const task: LeadTask = {
      id: Date.now().toString(),
      name: form.name.trim(),
      priority: form.priority,
      date: form.date,
      time: form.time,
      assignedTo: form.assignedTo || lead.assignedTo || "",
      completed: false,
      createdAt: new Date().toLocaleString("es-CO"),
    };
    onUpdateLead({ ...lead, tasks: [...tasks, task] });
    setForm({ name: "", priority: "media", date: "", time: "", assignedTo: "" });
    setAdding(false);
  };

  const toggleComplete = (taskId: string) => {
    onUpdateLead({
      ...lead,
      tasks: tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t),
    });
  };

  const deleteTask = (taskId: string) => {
    onUpdateLead({ ...lead, tasks: tasks.filter(t => t.id !== taskId) });
  };

  return (
    <div className="border-b border-border">
      <button onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors">
        <span className="flex items-center gap-2">
          {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          <CheckCircle2 size={13} />
          TAREAS
          {pendingCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </span>
        <button onClick={(e) => { e.stopPropagation(); setAdding(true); }} className="p-0.5 rounded hover:bg-muted"><Plus size={12} /></button>
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          {tasks.length === 0 && !adding && (
            <p className="text-[11px] text-muted-foreground text-center py-3">Sin tareas asignadas</p>
          )}

          {tasks.map((task) => {
            const pConfig = PRIORITY_CONFIG[task.priority];
            const PIcon = pConfig.icon;
            const isToday = task.date === new Date().toISOString().split("T")[0];
            return (
              <div key={task.id} className={`rounded-lg border p-2.5 transition-all ${task.completed ? "border-border/50 bg-muted/20 opacity-60" : "border-border bg-card"}`}>
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleComplete(task.id)} className="mt-0.5 shrink-0">
                    {task.completed ? (
                      <CheckCircle2 size={16} className="text-primary" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${pConfig.bg} ${pConfig.color}`}>
                        <PIcon size={8} /> {pConfig.label}
                      </span>
                      {task.date && (
                        <span className={`flex items-center gap-0.5 text-[9px] ${isToday ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                          <Calendar size={8} /> {isToday ? "Hoy" : task.date}{task.time ? ` ${task.time}` : ""}
                        </span>
                      )}
                      {task.assignedTo && (
                        <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                          <User size={8} /> {task.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="p-0.5 rounded hover:bg-destructive/10 shrink-0">
                    <X size={10} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            );
          })}

          {adding && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la tarea"
                className="w-full text-xs py-1.5 px-2 bg-background border border-border rounded-md" autoFocus />
              <div className="flex gap-2">
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as any })} className="text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
                <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md">
                  <option value="">Asignar a...</option>
                  {users.filter(u => u.active).map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="flex-1 text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-24 text-xs py-1.5 px-2 bg-background border border-border rounded-md" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={!form.name.trim()} className="flex-1 text-xs py-1.5 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-40">Crear tarea</button>
                <button onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs rounded-md border border-border text-muted-foreground">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
