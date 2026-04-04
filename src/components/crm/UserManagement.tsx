import { useState, useEffect } from "react";
import { Plus, Trash2, Shield, User, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ManagedUser {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  active: boolean;
  role: string;
}

export function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", display_name: "", role: "vendedor" });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles) {
      const merged = profiles.map(p => ({
        id: p.id,
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email,
        active: p.active,
        role: roles?.find(r => r.user_id === p.user_id)?.role || "vendedor",
      }));
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.display_name) return;
    setCreating(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: createForm,
      });

      if (error) {
        setFeedback({ type: "error", message: error.message || "Error al crear usuario" });
      } else if (data?.error) {
        setFeedback({ type: "error", message: data.error });
      } else {
        setFeedback({ type: "success", message: `Usuario ${createForm.display_name} creado exitosamente` });
        setCreateForm({ email: "", password: "", display_name: "", role: "vendedor" });
        setShowCreate(false);
        await fetchUsers();
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Error inesperado" });
    }
    setCreating(false);
  };

  const handleToggleActive = async (profile: ManagedUser) => {
    await supabase
      .from("profiles")
      .update({ active: !profile.active })
      .eq("user_id", profile.user_id);
    await fetchUsers();
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Shield size={32} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">Solo los administradores pueden gestionar usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
          feedback.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="ml-auto text-xs opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Usuarios del sistema</h3>
          <p className="text-xs text-muted-foreground">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> Crear usuario
        </button>
      </div>

      {/* Create User Form */}
      {showCreate && (
        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Nuevo usuario</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Nombre completo *</label>
              <input
                value={createForm.display_name}
                onChange={e => setCreateForm({ ...createForm, display_name: e.target.value })}
                placeholder="Juan Pérez"
                className="w-full text-sm py-2.5 px-3 bg-background border border-border rounded-lg text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Email *</label>
              <input
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="juan@empresa.com"
                className="w-full text-sm py-2.5 px-3 bg-background border border-border rounded-lg text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={createForm.password}
                  onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full text-sm py-2.5 px-3 pr-10 bg-background border border-border rounded-lg text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">Rol</label>
              <select
                value={createForm.role}
                onChange={e => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full text-sm py-2.5 px-3 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateUser}
              disabled={creating || !createForm.email || !createForm.password || !createForm.display_name}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">Cargando usuarios...</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between py-3 px-4 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {u.display_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.display_name}</p>
                  <p className="text-[11px] text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                  u.role === "admin" 
                    ? "bg-primary/10 text-primary" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {u.role === "admin" ? "Admin" : "Vendedor"}
                </span>
                <button
                  onClick={() => handleToggleActive(u)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    u.active 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {u.active ? "Activo" : "Inactivo"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
