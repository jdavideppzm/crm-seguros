import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, User, Eye, EyeOff, AlertCircle, CheckCircle2, Mail, Fingerprint, Activity, X, Target, DollarSign, Package, Edit2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CrmConfig, CrmUser } from "@/types/crm";

interface UserManagementProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

interface ManagedUser {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  active: boolean;
  role: string;
  monthlyGoal: number;
  monthlySalesCountGoal: number;
}

export function UserManagement({ config, updateConfig }: UserManagementProps) {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [createForm, setCreateForm] = useState({ 
    email: "", 
    password: "", 
    display_name: "", 
    role: "vendedor", 
    monthlyGoal: 50000000,
    monthlySalesCountGoal: 10
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");

      if (profiles) {
        const merged = profiles.map(p => {
          const role = roles?.find(r => r.user_id === p.user_id)?.role || "vendedor";
          const configUser = config.users.find(u => u.email === p.email || u.id === p.user_id);
          
          return {
            id: p.id,
            user_id: p.user_id,
            display_name: p.display_name,
            email: p.email,
            active: p.active,
            role: role,
            monthlyGoal: configUser?.monthlyGoal || 50000000,
            monthlySalesCountGoal: configUser?.monthlySalesCountGoal || 10
          };
        });
        setUsers(merged);
        syncProfilesWithConfig(merged);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error al cargar usuarios del sistema");
    }
    setLoading(false);
  };

  const syncProfilesWithConfig = (profiles: ManagedUser[]) => {
    const existingEmails = config.users.map(u => u.email);
    const newUsers: CrmUser[] = [...config.users];
    let changed = false;

    profiles.forEach(p => {
      if (!existingEmails.includes(p.email)) {
        newUsers.push({
          id: p.user_id,
          name: p.display_name,
          email: p.email,
          role: p.role as any,
          active: p.active,
          monthlyGoal: p.monthlyGoal,
          monthlySalesCountGoal: p.monthlySalesCountGoal
        });
        changed = true;
      }
    });

    if (changed) {
      updateConfig({ users: newUsers });
    }
  };

  useEffect(() => { fetchUsers(); }, [config.users.length]);

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.display_name) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    setCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: createForm,
      });

      if (error || data?.error) {
        toast.error(error?.message || data?.error || "Error al crear usuario");
      } else {
        toast.success(`Cuenta de acceso creada para ${createForm.display_name}`);
        
        const newUser: CrmUser = {
          id: data?.user?.id || Date.now().toString(),
          name: createForm.display_name,
          email: createForm.email,
          role: createForm.role as any,
          active: true,
          monthlyGoal: createForm.monthlyGoal,
          monthlySalesCountGoal: createForm.monthlySalesCountGoal
        };
        updateConfig({ users: [...config.users, newUser] });

        setCreateForm({ email: "", password: "", display_name: "", role: "vendedor", monthlyGoal: 50000000, monthlySalesCountGoal: 10 });
        setShowCreate(false);
        await fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Error inesperado al crear cuenta");
    }
    setCreating(false);
  };

  const handleUpdateGoals = (userId: string, updates: Partial<ManagedUser>) => {
    const updatedUsers = config.users.map(u => {
      const profile = users.find(p => p.user_id === userId);
      if (u.id === userId || (profile && u.email === profile.email)) {
        return { ...u, ...updates };
      }
      return u;
    });
    
    updateConfig({ users: updatedUsers });
    setUsers(users.map(u => u.user_id === userId ? { ...u, ...updates } : u));
  };

  const handleUpdateDisplayName = async (userId: string) => {
    if (!tempName.trim()) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: tempName.trim() })
        .eq("user_id", userId);

      if (error) throw error;

      const updatedUsers = config.users.map(u => u.id === userId ? { ...u, name: tempName.trim() } : u);
      updateConfig({ users: updatedUsers });
      
      setUsers(users.map(u => u.user_id === userId ? { ...u, display_name: tempName.trim() } : u));
      setEditingId(null);
      toast.success("Nombre actualizado correctamente");
    } catch (error) {
      console.error("Error updating display name:", error);
      toast.error("Error al actualizar el nombre");
    }
  };

  const handleToggleActive = async (profile: ManagedUser) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active: !profile.active })
        .eq("user_id", profile.user_id);
      
      if (error) throw error;
      
      const updatedUsers = config.users.map(u => u.email === profile.email ? { ...u, active: !profile.active } : u);
      updateConfig({ users: updatedUsers });
      
      toast.success(`Usuario ${profile.display_name} ${!profile.active ? "activado" : "desactivado"}`);
      await fetchUsers();
    } catch (error) {
      toast.error("Error al cambiar estado del usuario");
    }
  };

  const handleToggleRole = async (profile: ManagedUser) => {
    const newRole = profile.role === "admin" ? "vendedor" : "admin";
    try {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ 
          user_id: profile.user_id, 
          role: newRole 
        }, { onConflict: "user_id" });
      
      if (error) throw error;
      
      const updatedUsers = config.users.map(u => u.email === profile.email ? { ...u, role: newRole as any } : u);
      updateConfig({ users: updatedUsers });
      
      toast.success(`Rol de ${profile.display_name} cambiado a ${newRole.toUpperCase()}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Error al cambiar el rol del usuario");
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-4">
        <Shield size={48} className="mx-auto text-destructive opacity-40" />
        <div className="space-y-1">
           <h3 className="text-sm font-bold text-foreground">Acceso Restringido</h3>
           <p className="text-xs text-muted-foreground">Solo administradores del sistema pueden gestionar credenciales de acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Fingerprint size={20} />
           </div>
           <div>
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Cuentas y Metas</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{users.length} perfiles con objetivos comerciales</p>
           </div>
        </div>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Crear Acceso
          </button>
        )}
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl border border-primary/30 bg-primary/5 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl shadow-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Shield className="text-primary" size={16} />
               <p className="text-xs font-black text-primary uppercase tracking-widest">Registrar nueva credencial</p>
            </div>
            <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary/60"><X size={16} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Nombre para mostrar</label>
              <input
                value={createForm.display_name}
                onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })}
                placeholder="Nombre completo"
                className="w-full text-sm font-medium py-3 px-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email (Usuario)</label>
              <input
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="email@agencia.com"
                className="w-full text-sm font-medium py-3 px-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Contraseña de acceso</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-sm font-medium py-3 px-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Rol Administrativo</label>
              <select
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full text-sm font-bold py-3 px-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
              >
                <option value="vendedor">Vendedor (Básico)</option>
                <option value="admin">Administrador (Total)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 text-primary">Meta Comercial (Dinero)</label>
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  type="number"
                  value={createForm.monthlyGoal}
                  onChange={e => setCreateForm({ ...createForm, monthlyGoal: Number(e.target.value) })}
                  className="w-full text-sm font-black py-3 pl-10 pr-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1 text-violet-500">Meta en Unidades (Ventas)</label>
              <div className="relative">
                <Package size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-500" />
                <input
                  type="number"
                  value={createForm.monthlySalesCountGoal}
                  onChange={e => setCreateForm({ ...createForm, monthlySalesCountGoal: Number(e.target.value) })}
                  className="w-full text-sm font-black py-3 pl-10 pr-4 bg-background border border-border rounded-xl outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreateUser}
              disabled={creating || !createForm.email || !createForm.password || !createForm.display_name}
              className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {creating ? "Procesando Registro..." : "Habilitar Acceso con Metas"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center animate-in fade-in">
           <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizando perfiles...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {users.map(u => (
            <div key={u.id} className="group p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-border bg-card hover:bg-muted/10 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`shrink-0 relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-sm sm:text-base font-black shadow-inner transition-transform group-hover:rotate-3 group-hover:scale-110 duration-500 ${
                    u.role === "admin" ? "bg-primary text-primary-foreground" : "bg-muted-foreground/10 text-muted-foreground"
                  }`}>
                    {u.display_name.charAt(0).toUpperCase()}
                    {u.active && <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500 border-2 border-background animate-pulse" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingId === u.user_id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateDisplayName(u.user_id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="text-xs sm:text-sm font-black bg-background border border-primary/40 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-primary/20 w-full"
                        />
                        <button 
                          onClick={() => handleUpdateDisplayName(u.user_id)}
                          className="p-1 px-2 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-transform"
                        >
                          <Check size={12} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="p-1 px-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted-foreground/10 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/name cursor-pointer" onClick={() => { setEditingId(u.user_id); setTempName(u.display_name); }}>
                        <p className="text-sm sm:text-base font-black text-foreground group-hover/name:text-primary transition-colors tracking-tight truncate">
                          {u.display_name}
                        </p>
                        <Edit2 size={10} className="shrink-0 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                      </div>
                    )}
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-1.5 mt-0.5 truncate">
                       <Mail size={10} className="shrink-0 opacity-50" /> {u.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleRole(u)}
                    className={`text-[8px] sm:text-[9px] font-black px-2 sm:px-2.5 py-1 rounded-lg uppercase tracking-widest leading-none transition-all active:scale-90 ${
                      u.role === "admin" 
                        ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30" 
                        : "bg-muted text-muted-foreground border border-border/50 hover:bg-muted-foreground/10"
                    }`}
                    title="Click para cambiar rol"
                  >
                    {u.role}
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`text-[8px] sm:text-[9px] font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full uppercase tracking-widest transition-all leading-none active:scale-95 ${
                      u.active 
                        ? "bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20" 
                        : "bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20"
                    }`}
                  >
                    {u.active ? "Activo" : "Inactivo"}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                 <div className="bg-primary/5 p-3.5 sm:p-4 rounded-3xl border border-primary/10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                       <div className="flex items-center gap-2">
                          <DollarSign size={13} className="text-primary" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Meta de Volumen</span>
                       </div>
                    </div>
                    <div className="relative group/goal">
                       <input 
                         type="number" 
                         value={u.monthlyGoal} 
                         onChange={(e) => handleUpdateGoals(u.user_id, { monthlyGoal: Number(e.target.value) })}
                         className="w-full bg-background/50 border border-border/60 rounded-xl px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-black text-foreground outline-none focus:border-primary transition-all group-hover/goal:bg-background"
                       />
                       <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold text-muted-foreground/60">{formatCurrency(u.monthlyGoal)}</p>
                    </div>
                 </div>

                 <div className="bg-violet-500/5 p-3.5 sm:p-4 rounded-3xl border border-violet-500/10">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                       <div className="flex items-center gap-2">
                          <Package size={13} className="text-violet-500" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Meta de Unidades</span>
                       </div>
                    </div>
                    <div className="relative group/unit">
                       <input 
                         type="number" 
                         value={u.monthlySalesCountGoal} 
                         onChange={(e) => handleUpdateGoals(u.user_id, { monthlySalesCountGoal: Number(e.target.value) })}
                         className="w-full bg-background/50 border border-border/60 rounded-xl px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-black text-foreground outline-none focus:border-violet-500 transition-all group-hover/unit:bg-background"
                       />
                       <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold text-muted-foreground/60">Objetivo: {u.monthlySalesCountGoal} ventas</p>
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
