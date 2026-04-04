import { useState } from "react";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", display_name: "", setup_key: "" });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("setup-admin", {
        body: form,
      });

      if (error) {
        setResult({ type: "error", message: error.message });
      } else if (data?.error) {
        setResult({ type: "error", message: data.error });
      } else {
        setResult({ type: "success", message: "¡Administrador creado! Redirigiendo al login..." });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      setResult({ type: "error", message: err.message });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(222,47%,8%)] via-[hsl(222,47%,11%)] to-[hsl(222,47%,14%)]">
      <div className="w-full max-w-md px-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Shield size={28} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Configuración Inicial</h1>
            <p className="text-sm text-muted-foreground mt-1">Crea el primer administrador del CRM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Clave de configuración</label>
              <input type="password" value={form.setup_key} onChange={e => setForm({ ...form, setup_key: e.target.value })}
                placeholder="Clave proporcionada" required
                className="w-full py-2.5 px-3 bg-muted/50 border border-border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Nombre completo</label>
              <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
                placeholder="Tu nombre" required
                className="w-full py-2.5 px-3 bg-muted/50 border border-border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@empresa.com" required
                className="w-full py-2.5 px-3 bg-muted/50 border border-border rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Mínimo 6 caracteres" required minLength={6}
                className="w-full py-2.5 px-3 bg-muted/50 border border-border rounded-xl text-sm" />
            </div>

            {result && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${
                result.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}>
                {result.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm">{result.message}</span>
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting ? "Creando..." : "Crear Administrador"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
