import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, User, Clock } from "lucide-react";
import type { ChatMessage, CrmUser } from "@/types/crm";

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUser: string;
  users: CrmUser[];
  leadId?: string;
  leadName?: string;
  onSendMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, currentUser, users, leadId, leadName, onSendMessage, onClose }: ChatPanelProps) {
  const [text, setText] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filteredMessages = leadId
    ? messages.filter(m => m.leadId === leadId)
    : messages;

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage({
      from: currentUser,
      to: targetUser || undefined,
      text: text.trim(),
      leadId,
      leadName,
    });
    setText("");
  };

  return (
    <div className="w-[320px] shrink-0 border-l border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Chat interno</h3>
            {leadName && <p className="text-[10px] text-muted-foreground">Lead: {leadName}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={24} className="text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Sin mensajes{leadName ? ` para ${leadName}` : ""}</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isOwn = msg.from === currentUser;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {!isOwn && <p className="text-[10px] font-semibold mb-0.5 opacity-70">{msg.from}</p>}
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <div className="flex items-center gap-1.5 mt-1 opacity-60">
                    <Clock size={9} />
                    <span className="text-[9px]">{msg.createdAt}</span>
                    {msg.to && <span className="text-[9px]">→ {msg.to}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-border space-y-2">
        <select value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full text-xs py-1.5 px-2 bg-muted/50 border border-border rounded-md">
          <option value="">Todos</option>
          {users.filter(u => u.active && u.name !== currentUser).map(u => (
            <option key={u.id} value={u.name}>{u.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            className="flex-1 text-xs py-2 px-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button onClick={handleSend} disabled={!text.trim()} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
