import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JedaelLogo, JedaelText } from "@/components/auth/JedaelLogo";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary font-bold tracking-widest uppercase text-xs"
        >
          Iniciando Sistema...
        </motion.div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error } = await signIn(email.trim(), password);
    if (error) {
      setError("Verifica tus credenciales e intenta de nuevo.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070a] overflow-hidden relative font-sans">
      {/* VIBRANT FLUID BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -120, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/20 blur-[100px] rounded-full"
        />
        <motion.div
           animate={{
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[80px] rounded-full"
        />
      </div>

      <div className="w-full max-w-md px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-10 overflow-hidden group">
            {/* Subtle light sweep animation */}
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-20deg] pointer-events-none"
            />

            <div className="flex flex-col items-center mb-10 relative">
              <JedaelLogo className="w-24 h-24 mb-4 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
              <JedaelText />
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">CRM Intelligence Platform</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 ml-1 uppercase tracking-wider">Acceso Corporativo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 transition-colors group-focus-within:text-cyan-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@jedael.com"
                    required
                    className="w-full py-4 pl-12 pr-4 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seguridad</label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 transition-colors group-focus-within:text-purple-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full py-4 pl-12 pr-12 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                  >
                    <p className="text-[11px] text-red-400 font-medium text-center">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting || !email || !password}
                className="w-full relative group overflow-hidden py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all group-hover:scale-105" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_100%)] from-white/20" />
                
                <span className="relative flex items-center justify-center gap-2 text-sm font-black text-white uppercase tracking-widest">
                  {submitting ? (
                    <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>Autenticando...</motion.span>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      Acceder al Panel
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-white/10" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enterprise Security</span>
                <div className="h-px w-8 bg-white/10" />
              </div>
              <p className="text-[10px] text-slate-600 text-center">
                &copy; {new Date().getFullYear()} Jedael Seguros. Reservados todos los derechos.
              </p>
              {/* DEV BYPASS */}
              <button 
                type="button"
                onClick={() => {
                  // Hardcoded bypass for testing
                  localStorage.setItem("sb-trliedgmfttpoauwzznk-auth-token", JSON.stringify({
                    access_token: "mock",
                    token_type: "bearer",
                    expires_in: 3600,
                    refresh_token: "mock",
                    user: { id: "u1", email: "admin@jedael.com", role: "authenticated", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "" }
                  }));
                  window.location.reload();
                }}
                className="mt-4 text-[9px] text-slate-800 hover:text-slate-400 transition-colors uppercase tracking-widest font-black"
              >
                Dev Bypass Login
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
             <p className="text-[9px] text-slate-700 italic">Optimizando la gestión de seguros con inteligencia avanzada.</p>
          </div>
        </motion.div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #05070a;
        }
      `}} />
    </div>
  );
}
