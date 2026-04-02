import { Search, Bell, MessageSquare } from "lucide-react";

interface CrmHeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleChat?: () => void;
  showChatButton?: boolean;
}

export function CrmHeader({ title, subtitle, searchQuery, onSearchChange, onToggleChat, showChatButton }: CrmHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56 pl-9 pr-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground"
          />
        </div>
        {showChatButton && (
          <button onClick={onToggleChat} className="relative p-2 rounded-lg hover:bg-secondary transition-colors" title="Chat interno">
            <MessageSquare size={16} className="text-muted-foreground" />
          </button>
        )}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell size={16} className="text-muted-foreground" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
          U
        </div>
      </div>
    </header>
  );
}
