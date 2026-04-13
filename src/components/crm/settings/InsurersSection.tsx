import React, { useState } from "react";
import { Search, Pencil, Trash2, Mail, Upload } from "lucide-react";
import { toast } from "sonner";
import { SectionHeader, ConfigCard, ToggleSwitch } from "./SettingsShared";
import { CrmConfig, InsuranceCompany } from "@/types/crm";

interface InsurersSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
  setConfirmDelete: (v: { id: string; title: string; onConfirm: () => void } | null) => void;
}

export function InsurersSection({ config, updateConfig, setConfirmDelete }: InsurersSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = config.insuranceCompanies.filter(ins => ins.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <SectionHeader title="Aseguradoras" description="Catálogo de aseguradoras con comisiones, logos y datos de contacto." />
      <ConfigCard title="Catálogo de aseguradoras" description="Filtra y gestiona las compañías activas en tu CRM." onAdd={() => setAdding(true)}>
        
        <div className="relative mb-4 group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar aseguradora..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-background transition-all"
          />
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
          {filtered.map((ins) => {
            const isEditing = editingId === ins.id;
            return (
              <div key={ins.id} className={`rounded-2xl border transition-all ${ins.active === false ? "opacity-50 grayscale border-border/50 bg-muted/10 shrink-0 scale-[0.98]" : "border-border bg-muted/30 hover:shadow-md hover:bg-muted/50"}`}>
                {isEditing ? (
                  <div className="p-3">
                    <InsuranceEditForm insurer={ins}
                      onSave={(updated) => { updateConfig({ insuranceCompanies: config.insuranceCompanies.map(i => i.id === ins.id ? updated : i) }); setEditingId(null); }}
                      onCancel={() => setEditingId(null)} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-1.5 shadow-sm">
                         {ins.logoUrl ? (
                           <img src={ins.logoUrl} alt={ins.name} className="w-full h-full object-contain" onError={(e) => { (e.target as any).src = "https://via.placeholder.com/100?text=" + ins.name.charAt(0); }} />
                         ) : (
                           <span className="text-sm font-black text-primary">{ins.name.charAt(0)}</span>
                         )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-bold text-foreground">{ins.name}</p>
                           {ins.active === false && <span className="text-[8px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Inactiva</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black">{ins.commission}% com.</span>
                          {ins.contact && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                               <Mail size={10} /> {ins.contact}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleSwitch checked={ins.active !== false} onChange={() => updateConfig({ insuranceCompanies: config.insuranceCompanies.map(i => i.id === ins.id ? { ...i, active: !i.active } : i) })} />
                      <div className="w-px h-8 bg-border mx-1" />
                      <button onClick={() => setEditingId(ins.id)} className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"><Pencil size={14} /></button>
                      <button 
                        onClick={() => setConfirmDelete({
                           id: ins.id, 
                           title: `¿Eliminar a ${ins.name}?`, 
                           onConfirm: () => updateConfig({ insuranceCompanies: config.insuranceCompanies.filter(i => i.id !== ins.id) })
                        })} 
                        className="p-2 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {adding && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 shadow-xl animate-in zoom-in-95 mt-4">
              <h4 className="text-xs font-bold text-primary mb-3 uppercase tracking-widest">Nueva Aseguradora</h4>
              <InsuranceEditForm
                insurer={{ id: "", name: "", commission: 0, contact: "", notes: "", active: true }}
                onSave={(ins) => { updateConfig({ insuranceCompanies: [...config.insuranceCompanies, { ...ins, id: Date.now().toString() }] }); setAdding(false); }}
                onCancel={() => setAdding(false)} isNew />
            </div>
          )}
        </div>
      </ConfigCard>
    </div>
  );
}

function InsuranceEditForm({ insurer, onSave, onCancel, isNew }: { insurer: InsuranceCompany; onSave: (ins: InsuranceCompany) => void; onCancel: () => void; isNew?: boolean }) {
  const [form, setForm] = useState(insurer);
  const [fetchingLogo, setFetchingLogo] = useState(false);

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm({ ...form, logoUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const fetchClearbitLogo = async () => {
    if (!form.name.trim()) return;
    setFetchingLogo(true);
    const domain = form.webUrl?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
      || form.name.toLowerCase().replace(/\s+/g, '') + '.com';
    const url = `https://logo.clearbit.com/${domain}`;
    const img = new Image();
    img.onload = () => { setForm({ ...form, logoUrl: url }); setFetchingLogo(false); };
    img.onerror = () => { toast.error('No se encontró logo automáticamente.'); setFetchingLogo(false); };
    img.src = url;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nombre</label>
           <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" autoFocus />
        </div>
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Comisión %</label>
           <input type="number" value={form.commission} onChange={e => setForm({ ...form, commission: Number(e.target.value) })} placeholder="%" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none font-mono font-bold" />
        </div>
      </div>

      <div className="space-y-1">
         <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email de contacto comercial</label>
         <input value={form.contact || ""} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="contacto@ejemplo.com" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Logotipo</label>
        <div className="flex items-center gap-3">
          {form.logoUrl && (
            <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
              <img src={form.logoUrl} alt="logo" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border cursor-pointer hover:bg-muted/80 text-xs font-medium transition-all">
                <Upload size={12} /> Subir archivo
                <input type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
              </label>
              <button
                type="button"
                onClick={fetchClearbitLogo}
                disabled={fetchingLogo || !form.name.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-40"
              >
                {fetchingLogo ? '⏳' : '🔍'} Buscar logo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Portal Web</label>
           <input value={form.webUrl || ""} onChange={e => setForm({ ...form, webUrl: e.target.value })} placeholder="www..." className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" />
        </div>
        <div className="space-y-1">
           <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Clave de Acceso</label>
           <input value={form.accessPassword || ""} onChange={e => setForm({ ...form, accessPassword: e.target.value })} placeholder="••••••••" type="password" className="w-full text-xs py-2 px-3 bg-background border border-border rounded-xl focus:ring-primary/40 outline-none" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => { if (form.name.trim()) onSave(form); }} disabled={!form.name.trim()} className="flex-1 text-xs py-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-40">{isNew ? "Crear Compañía" : "Guardar Cambios"}</button>
        <button onClick={onCancel} className="px-4 py-2 text-xs rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-all">Cancelar</button>
      </div>
    </div>
  );
}
