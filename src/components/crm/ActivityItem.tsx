import { useState } from "react";
import {
  StickyNote, PhoneCall, Mail, Activity as ActivityIcon,
  ArrowRight, Pencil, MessageCircle, Check, X, ChevronDown, ChevronRight,
  MessageSquare, FileText, Zap, User, Clock, Sparkles
} from "lucide-react";
import type { Activity, ActivityComment } from "@/types/crm";
import { USERS } from "@/types/crm";

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; bgColor: string; borderColor: string; label: string }> = {
  note: { icon: StickyNote, color: "text-blue-500 dark:text-blue-400", bgColor: "bg-blue-50/10 dark:bg-blue-500/10", borderColor: "border-blue-200/20 dark:border-blue-500/20", label: "Nota" },
  call: { icon: PhoneCall, color: "text-emerald-500 dark:text-emerald-400", bgColor: "bg-emerald-50/10 dark:bg-emerald-500/10", borderColor: "border-emerald-200/20 dark:border-emerald-500/20", label: "Llamada" },
  email: { icon: Mail, color: "text-amber-500 dark:text-amber-400", bgColor: "bg-amber-50/10 dark:bg-amber-500/10", borderColor: "border-amber-200/20 dark:border-amber-500/20", label: "Email" },
  whatsapp: { icon: MessageSquare, color: "text-green-500 dark:text-green-400", bgColor: "bg-green-50/10 dark:bg-green-500/10", borderColor: "border-green-200/20 dark:border-green-500/20", label: "WhatsApp" },
  status_change: { icon: ActivityIcon, color: "text-purple-500 dark:text-purple-400", bgColor: "bg-purple-50/10 dark:bg-purple-500/10", borderColor: "border-purple-200/20 dark:border-purple-500/20", label: "Estado" },
  field_edit: { icon: Pencil, color: "text-indigo-500 dark:text-indigo-400", bgColor: "bg-indigo-50/10 dark:bg-indigo-500/10", borderColor: "border-indigo-200/20 dark:border-indigo-500/20", label: "Edición" },
  doc_selected: { icon: FileText, color: "text-primary dark:text-primary", bgColor: "bg-primary/5 dark:bg-primary/10", borderColor: "border-primary/20 dark:border-primary/30", label: "Cotización" },
  doc_summary: { icon: FileText, color: "text-violet-500 dark:text-violet-400", bgColor: "bg-violet-50/10 dark:bg-violet-500/10", borderColor: "border-violet-200/20 dark:border-violet-500/20", label: "Cotización Recibida" },
  automation: { icon: Zap, color: "text-orange-500 dark:text-orange-400", bgColor: "bg-orange-50/10 dark:bg-orange-500/10", borderColor: "border-orange-200/20 dark:border-orange-500/20", label: "Auto" },
  scan_summary: { icon: Sparkles, color: "text-violet-500 dark:text-violet-400", bgColor: "bg-violet-50/10 dark:bg-violet-500/10", borderColor: "border-violet-200/20 dark:border-violet-500/20", label: "IA Scan" },
};

// Helper for "time ago" or readable date
const formatActivityDate = (dateStr: string) => {
  try {
    const [datePart, timePart] = dateStr.split(", ");
    return { date: datePart, time: timePart };
  } catch {
    return { date: dateStr, time: "" };
  }
};

interface ActivityItemProps {
  activity: Activity;
  onUpdate: (updated: Activity) => void;
}

export function ActivityItem({ activity, onUpdate }: ActivityItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(activity.text);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentAuthor, setCommentAuthor] = useState(USERS[0]);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const config = activityTypeConfig[activity.type] || activityTypeConfig.note;
  const Icon = config.icon;
  const comments = activity.comments || [];
  const { time } = formatActivityDate(activity.createdAt);

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onUpdate({ ...activity, text: editText.trim(), editedAt: new Date().toLocaleString("es-CO"), editedBy: "Usuario" });
    setEditing(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: ActivityComment = { id: Date.now().toString(), text: commentText.trim(), author: commentAuthor, createdAt: new Date().toLocaleString("es-CO") };
    onUpdate({ ...activity, comments: [...comments, newComment] });
    setCommentText(""); setShowCommentInput(false); setCommentsOpen(true);
  };

  const isEditable = !["status_change", "field_edit", "doc_selected", "doc_summary", "automation"].includes(activity.type);
  const isDocSummary = activity.type === "doc_summary";

  return (
    <div className="relative flex gap-4 py-3 group">
      {/* Icon and Timeline Line */}
      <div className="relative flex flex-col items-center shrink-0">
        <div className={`z-10 w-9 h-9 rounded-xl ${config.bgColor} border border-border shadow-sm flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={16} className={config.color} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Header info */}
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.15em] ${config.bgColor} ${config.color} border ${config.borderColor} shadow-sm`}>
                {config.label}
              </span>
              <span className="text-[11px] font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                {activity.author === "Sistema" ? (
                  <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Zap size={10} className="text-orange-500 dark:text-orange-400" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={10} className="text-primary dark:text-primary" strokeWidth={3} />
                  </div>
                )}
                {activity.author}
              </span>
              {time && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold uppercase tracking-tighter opacity-70">
                  <Clock size={10} strokeWidth={3} />
                  {time}
                </span>
              )}
            </div>

            {/* Content Area */}
            <div className={`rounded-2xl border border-border/60 p-3.5 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5 ${
              activity.type === 'note' ? 'bg-muted/40 backdrop-blur-sm' : 
              activity.author === 'Sistema' ? 'bg-muted/20 border-dashed' : 'bg-transparent'
            }`}>
              {editing && isEditable ? (
                <div className="space-y-3">
                  <textarea 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    className="w-full text-xs font-medium py-3 px-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none shadow-inner" 
                    autoFocus 
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(false); setEditText(activity.text); }} className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted rounded-lg transition-colors">Cancelar</button>
                    <button onClick={handleSaveEdit} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Guardar</button>
                  </div>
                </div>
              ) : activity.type === "status_change" && activity.meta ? (
                <div className="py-1">
                  <div className="flex items-center gap-3 flex-wrap mb-2.5">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-muted text-muted-foreground/80 border border-border uppercase tracking-widest">{activity.meta.fromStatus}</span>
                    <div className="p-1 rounded-full bg-primary/10">
                      <ArrowRight size={12} className="text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 uppercase tracking-widest">{activity.meta.toStatus}</span>
                  </div>
                  {activity.text && activity.text !== "Estado cambiado" && (
                    <p className="text-[11px] font-medium text-foreground/70 italic border-l-2 border-primary/30 pl-4 mt-3 leading-relaxed">{activity.text.replace("Estado cambiado · ", "")}</p>
                  )}
                </div>
              ) : activity.type === "field_edit" && activity.meta ? (
                <div className="space-y-2 py-1">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">{activity.meta.field}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[11px] font-medium text-muted-foreground/70 italic truncate max-w-[120px] px-2 py-0.5 bg-muted/50 rounded-md border border-border/50">{activity.meta.oldValue}</span>
                    <ArrowRight size={12} className="text-muted-foreground/40" strokeWidth={3} />
                    <span className="text-[11px] font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 tracking-tight">{activity.meta.newValue}</span>
                  </div>
                </div>
              ) : isDocSummary ? (
                <QuoteSummaryCard text={activity.text} />
              ) : activity.type === "scan_summary" ? (
                <ScanSummaryCard text={activity.text} />
              ) : (
                <p className="text-[13px] font-medium text-foreground leading-relaxed tracking-tight">{activity.text}</p>
              )}
            </div>

            {activity.editedAt && (
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-tighter mt-2 ml-1 flex items-center gap-1.5 italic">
                <Pencil size={9} strokeWidth={3} /> Editado por {activity.editedBy} el {activity.editedAt}
              </p>
            )}
          </div>

          {/* Activity Actions */}
          <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
             {activity.scheduledAt && (
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm border ${activity.completed ? "bg-green-50 text-green-700 border-green-200" : "bg-primary text-primary-foreground border-primary/20 animate-pulse"}`}>
                {activity.completed ? "✅ HECHO" : `📅 ${activity.scheduledAt}`}
              </span>
            )}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background border border-border rounded-lg p-0.5 shadow-sm">
              {isEditable && (
                <button onClick={() => { setEditing(true); setEditText(activity.text); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Editar"><Pencil size={12} /></button>
              )}
              <button onClick={() => setShowCommentInput(!showCommentInput)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Comentar"><MessageCircle size={12} /></button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <button onClick={() => setCommentsOpen(!commentsOpen)} className="flex items-center gap-1.5 mt-2 ml-1 text-[11px] font-semibold text-primary hover:bg-primary/5 px-2 py-0.5 rounded-full transition-colors w-fit">
            {commentsOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {comments.length} comentario{comments.length > 1 ? "s" : ""}
          </button>
        )}

        {commentsOpen && comments.length > 0 && (
          <div className="mt-2 ml-3 pl-3 border-l-2 border-primary/20 space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="relative">
                <div className="absolute -left-[14px] top-2 w-2 h-2 rounded-full bg-primary/20 shadow-sm border border-background" />
                <p className="text-[11px] text-foreground leading-normal">{c.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground font-bold">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground opacity-60 font-medium italic">{c.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Input */}
        {showCommentInput && (
          <div className="mt-3 ml-1 p-3 bg-muted/30 border border-border rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nuevo comentario</span>
              <select value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} className="text-[10px] py-1 px-2 bg-background border border-border rounded-md font-medium">
                {USERS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment()} placeholder="Escribe algo aquí..." className="flex-1 text-xs py-2 px-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
              <button onClick={handleAddComment} disabled={!commentText.trim()} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 disabled:opacity-40 hover:translate-y-[-1px] active:translate-y-[0px] transition-all">Enviar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Parses the structured cotización text and renders it as a premium card */
function QuoteSummaryCard({ text }: { text: string }) {
  const lines = text.split("\n");
  const title = lines[0] || "";
  const rest = lines.slice(2); // skip separator line

  // Group lines by emoji section headers
  const sections: { header: string; items: string[] }[] = [];
  let current: { header: string; items: string[] } | null = null;

  rest.forEach(line => {
    if (!line.trim()) return;
    const isHeader = /^[👤🚗💰🛡📄🏢🕐]/.test(line);
    if (isHeader) {
      if (current) sections.push(current);
      current = { header: line, items: [] };
    } else if (current) {
      current.items.push(line);
    } else {
      sections.push({ header: line, items: [] });
    }
  });
  if (current) sections.push(current);

  return (
    <div className="rounded-xl overflow-hidden border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-white shadow-sm dark:from-violet-950/20 dark:to-card dark:border-violet-800/30">
      {/* Title bar */}
      <div className="px-3 py-2 bg-violet-500/10 border-b border-violet-200/40 dark:border-violet-800/30">
        <p className="text-[11px] font-black text-violet-700 dark:text-violet-400 uppercase tracking-wider">
          {title.replace(/^📥\s*/, "")}
        </p>
      </div>
      {/* Body sections */}
      <div className="p-3 space-y-2.5">
        {sections.map((sec, i) => (
          <div key={i}>
            <p className="text-[11px] font-black text-foreground/80 mb-0.5">{sec.header}</p>
            {sec.items.length > 0 && (
              <div className="ml-2 space-y-0.5 border-l-2 border-violet-200/60 dark:border-violet-800/30 pl-2">
                {sec.items.map((item, j) => (
                  <p key={j} className="text-[11px] text-muted-foreground leading-snug">{item.trim()}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Parses the structured IA scan text and renders it as a premium card */
function ScanSummaryCard({ text }: { text: string }) {
  const lines = text.split("\n");
  const title = lines[0] || "Escaneo de IA";
  const fields = lines.slice(1).filter(line => line.includes(":")).map(line => {
    const [label, value] = line.split(":").map(s => s.trim());
    return { label, value };
  });

  return (
    <div className="rounded-xl overflow-hidden border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-white shadow-sm dark:from-emerald-900/20 dark:to-card dark:border-emerald-800/30">
      {/* Title bar */}
      <div className="px-3 py-2 bg-emerald-500/10 border-b border-emerald-200/40 dark:border-emerald-800/30 flex justify-between items-center">
        <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={11} className="text-emerald-500" />
          {title.replace(/^✨\s*/, "")}
        </p>
        <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
          IA Verificada
        </span>
      </div>
      {/* Body fields */}
      <div className="p-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {fields.map((field, i) => (
          <div key={i} className="min-w-0">
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-70 tracking-widest leading-none mb-1">{field.label}</p>
            <p className="text-[11px] font-black text-foreground truncate">{field.value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
