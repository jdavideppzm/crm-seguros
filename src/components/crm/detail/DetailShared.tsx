import { ChevronDown, ChevronRight, Pencil, Check, X } from "lucide-react";

export function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">{icon}{label}</button>;
}

export function CollapsibleSection({ title, icon, open, onToggle, children }: { title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-border">
      <button onClick={onToggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors">
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}{icon}{title}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

export function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0"><p className="text-[10px] text-muted-foreground">{label}</p><p className={`text-xs text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p></div>
    </div>
  );
}

export function DropdownDetailRow({ icon, label, value, options, onChange }: { icon: React.ReactNode; label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full text-xs py-0.5 px-1 bg-transparent border-0 text-foreground cursor-pointer hover:bg-muted/50 rounded -ml-1">
          <option value="—">—</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

export function EditableDetailRow({ icon, label, value, fieldKey, mono, editingField, onStartEdit, editFieldValue, onEditFieldChange, onSaveEdit, onCancelEdit }: {
  icon: React.ReactNode; label: string; value: string; fieldKey: string; mono?: boolean;
  editingField: string | null; onStartEdit: (key: string, currentValue: string) => void;
  editFieldValue: string; onEditFieldChange: (v: string) => void;
  onSaveEdit: (key: string, label: string, oldValue: string, newValue: string) => void; onCancelEdit: () => void;
}) {
  const isEditing = editingField === fieldKey;
  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
          <div className="flex items-center gap-1">
            <input value={editFieldValue} onChange={(e) => onEditFieldChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSaveEdit(fieldKey, label, value, editFieldValue); if (e.key === "Escape") onCancelEdit(); }}
              className="flex-1 text-xs py-1 px-1.5 bg-muted/50 border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring" autoFocus />
            <button onClick={() => onSaveEdit(fieldKey, label, value, editFieldValue)} className="p-0.5 text-primary"><Check size={11} /></button>
            <button onClick={onCancelEdit} className="p-0.5 text-muted-foreground"><X size={11} /></button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 group cursor-pointer" onClick={() => onStartEdit(fieldKey, value === "—" ? "" : value)}>
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className={`text-xs text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
          <Pencil size={9} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    </div>
  );
}
