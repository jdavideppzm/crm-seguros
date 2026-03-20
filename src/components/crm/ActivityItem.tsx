import { useState } from "react";
import {
  StickyNote, PhoneCall, Mail, Activity as ActivityIcon,
  ArrowRight, Pencil, MessageCircle, Check, X, ChevronDown, ChevronRight,
  MessageSquare, FileText,
} from "lucide-react";
import type { Activity, ActivityComment } from "@/types/crm";
import { USERS } from "@/types/crm";

const activityTypeConfig: Record<string, { icon: typeof StickyNote; color: string; label: string }> = {
  note: { icon: StickyNote, color: "text-status-seguimiento", label: "Nota" },
  call: { icon: PhoneCall, color: "text-status-lograr", label: "Llamada" },
  email: { icon: Mail, color: "text-status-bienvenida", label: "Email" },
  whatsapp: { icon: MessageSquare, color: "text-status-lograr", label: "WhatsApp" },
  status_change: { icon: ActivityIcon, color: "text-status-emitir", label: "Cambio de estado" },
  field_edit: { icon: Pencil, color: "text-status-recolectar", label: "Edición" },
  doc_selected: { icon: FileText, color: "text-primary", label: "Cotización" },
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

  const handleSaveEdit = () => {
    if (!editText.trim()) return;
    onUpdate({
      ...activity,
      text: editText.trim(),
      editedAt: new Date().toLocaleString("es-CO"),
      editedBy: "Usuario",
    });
    setEditing(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: ActivityComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: commentAuthor,
      createdAt: new Date().toLocaleString("es-CO"),
    };
    onUpdate({
      ...activity,
      comments: [...comments, newComment],
    });
    setCommentText("");
    setShowCommentInput(false);
    setCommentsOpen(true);
  };

  const isEditable = !["status_change", "field_edit", "doc_selected"].includes(activity.type);

  return (
    <div className="relative flex gap-3 py-2.5 group">
      {/* Timeline dot */}
      <div className="relative z-10 w-[22px] h-[22px] rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
        <Icon size={10} className={config.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {editing && isEditable ? (
              <div className="flex items-center gap-1.5">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                  className="flex-1 text-xs py-1 px-2 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <button onClick={handleSaveEdit} className="p-1 text-primary hover:text-primary/80"><Check size={12} /></button>
                <button onClick={() => { setEditing(false); setEditText(activity.text); }} className="p-1 text-muted-foreground hover:text-foreground"><X size={12} /></button>
              </div>
            ) : activity.type === "status_change" && activity.meta ? (
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">Estado:</span>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                    {activity.meta.fromStatus}
                  </span>
                  <ArrowRight size={10} className="text-muted-foreground" />
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-status-lograr/10 text-status-lograr">
                    {activity.meta.toStatus}
                  </span>
                </div>
                {/* Show comment from status change */}
                {activity.text && activity.text !== "Estado cambiado" && (
                  <p className="text-[11px] text-foreground/70 mt-0.5 italic">
                    {activity.text.replace("Estado cambiado · ", "")}
                  </p>
                )}
              </div>
            ) : activity.type === "field_edit" && activity.meta ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">{activity.meta.field}:</span>
                <span className="text-[11px] line-through text-muted-foreground">{activity.meta.oldValue}</span>
                <ArrowRight size={10} className="text-muted-foreground" />
                <span className="text-[11px] font-medium text-foreground">{activity.meta.newValue}</span>
              </div>
            ) : (
              <p className="text-xs text-foreground">{activity.text}</p>
            )}

            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${config.color} bg-muted/50`}>
                {config.label}
              </span>
              <p className="text-[11px] text-muted-foreground font-medium">{activity.author}</p>
              {activity.editedAt && (
                <span className="text-[10px] text-muted-foreground italic">
                  (editado{activity.editedBy ? ` por ${activity.editedBy}` : ""})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {activity.scheduledAt && (
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                📅 {activity.scheduledAt}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{activity.createdAt}</span>
            <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
              {isEditable && (
                <button
                  onClick={() => { setEditing(true); setEditText(activity.text); }}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Editar"
                >
                  <Pencil size={11} />
                </button>
              )}
              <button
                onClick={() => setShowCommentInput(!showCommentInput)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Comentar"
              >
                <MessageCircle size={11} />
              </button>
            </div>
          </div>
        </div>

        {/* Comments toggle */}
        {comments.length > 0 && (
          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1 mt-1.5 text-[11px] text-primary hover:text-primary/80 transition-colors"
          >
            {commentsOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            {comments.length} comentario{comments.length > 1 ? "s" : ""}
          </button>
        )}

        {commentsOpen && comments.length > 0 && (
          <div className="mt-1.5 ml-2 pl-2.5 border-l-2 border-border space-y-1.5">
            {comments.map((c) => (
              <div key={c.id}>
                <p className="text-[11px] text-foreground">{c.text}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground">{c.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCommentInput && (
          <div className="mt-2 space-y-1.5">
            <div className="flex gap-1.5">
              <select
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="text-[11px] py-1 px-1.5 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {USERS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Agregar comentario..."
                className="flex-1 text-[11px] py-1.5 px-2 bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="px-2 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
