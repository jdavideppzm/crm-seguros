import { useState, useRef, useEffect } from "react";
import { Search, Bell, MessageSquare, Check, X, Clock, Zap, AlertTriangle, ArrowRight, ShieldCheck, LogOut, Sun, Moon, User, ChevronDown } from "lucide-react";
import { useCrmStore } from "@/store/crmStore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";

interface CrmHeaderProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleChat?: () => void;
  showChatButton?: boolean;
  onViewAlerts?: () => void;
}

export function CrmHeader({ title, subtitle, searchQuery, onSearchChange, onToggleChat, showChatButton, onViewAlerts }: CrmHeaderProps) {
  const { alerts, dismissAlert, clearAlerts } = useCrmStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { displayName, signOut, isAdmin } = useAuth();

console.log("CRMH HEADER - isAdmin:", isAdmin);
console.log("CRMH HEADER - displayName:", displayName);
  
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const unreadAlerts = alerts.filter(a => !a.dismissed);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-background/50 backdrop-blur-3xl sticky top-0 z-50 shadow-[0_1px_15px_-5px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col pt-0.5">
        <h2 className="text-[17px] font-black text-foreground tracking-tight leading-none uppercase flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {title}
        </h2>
        {subtitle && <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em] mt-1.5 opacity-40 italic">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-all group-focus-within:text-primary group-focus-within:scale-110" />
          <input
            type="text"
            placeholder="Buscar registros e inteligencia..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 focus:w-80 pl-10 pr-4 py-2.5 text-[12px] bg-muted/20 border border-white/[0.08] rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all duration-500 placeholder:text-muted-foreground/40 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3 pr-4 border-r border-white/5">
          {showChatButton && (
            <button 
              onClick={onToggleChat} 
              className="relative p-2.5 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground border border-border/40 transition-all active:scale-95 group/chat" 
              title="Centro de Mensajes"
            >
              <MessageSquare size={18} strokeWidth={2.5} />
              {/* Pulsating activity indicator */}
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background shadow-[0_0_8px_rgba(var(--primary),0.5)] animate-bounce" />
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl border transition-all active:scale-95 ${
                showNotifications ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-muted/40 hover:bg-muted/60 text-muted-foreground border-border/40"
              }`}
            >
              <Bell size={18} strokeWidth={2.5} />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in duration-300">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
            {/* Same notification dropdown as before... */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-popover/95 backdrop-blur-2xl border border-border/60 rounded-[28px] shadow-2xl shadow-black/40 overflow-hidden"
                >
                  <div className="p-5 border-b border-border/40 flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">Alertas Recientes</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">{unreadAlerts.length} pendientes</p>
                    </div>
                    {unreadAlerts.length > 0 && (
                      <button onClick={clearAlerts} className="text-[9px] font-black uppercase text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg transition-colors">Limpiar</button>
                    )}
                  </div>
                  <div className="max-h-[360px] overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-40">Sin actividad pendiente</p>
                      </div>
                    ) : (
                      alerts.slice(0, 8).map((alert) => (
                        <div key={alert.id} className={`group w-full p-3 rounded-2xl flex items-start gap-3 transition-all ${alert.dismissed ? "opacity-50" : "bg-primary/5 hover:bg-primary/10"}`}>
                           <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${alert.type === "overdue" ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"}`}>
                             {alert.type === "overdue" ? <AlertTriangle size={15} /> : <Zap size={15} />}
                           </div>
                           <div className="flex-1 min-w-0 text-left">
                             <p className="text-[12px] font-black text-foreground leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">{alert.message}</p>
                             <div className="flex items-center gap-2 mt-1.5 opacity-60 text-[9px]">
                               <span className="font-black uppercase">{alert.leadName || "Sistema"}</span>
                               <span className="w-1 h-1 rounded-full bg-border" />
                               <span className="flex items-center gap-1"><Clock size={10} /> {alert.createdAt.split(',')[1]}</span>
                             </div>
                           </div>
                           {!alert.dismissed && (
                             <button onClick={() => dismissAlert(alert.id)} className="p-1.5 rounded-lg bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                               <Check size={14} strokeWidth={3} />
                             </button>
                           )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-border/40">
                    <button onClick={() => { setShowNotifications(false); onViewAlerts?.(); }} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all">
                      Centro de Alertas Completo <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-2 relative" ref={profileRef}>
           <button 
             onClick={() => setShowProfileMenu(!showProfileMenu)}
             className="flex items-center gap-3 group px-2 py-1.5 rounded-2xl hover:bg-white/5 transition-all"
           >
             <div className="flex flex-col items-end">
               <p className="text-[12px] font-black text-foreground leading-none uppercase tracking-tight">{displayName || "Usuario"}</p>
               <div className="mt-1 flex items-center gap-1">
                  <ShieldCheck size={8} className="text-emerald-500" />
                  <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.1em]">{isAdmin ? "Master Control" : "Asesor"}</span>
               </div>
             </div>
             
             <div className="relative">
               <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all" />
               <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-indigo-600 to-primary p-0.5 shadow-xl shadow-primary/20 transition-all border border-white/10 overflow-hidden">
                  <div className="w-full h-full rounded-[13px] bg-background flex items-center justify-center text-xs font-black text-primary">
                    {displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
               </div>
             </div>
             <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
           </button>

           <AnimatePresence>
             {showProfileMenu && (
               <motion.div
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                 className="absolute right-0 top-full mt-2 w-56 bg-popover/95 backdrop-blur-2xl border border-border/60 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden z-[60]"
               >
                 <div className="p-4 border-b border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Cuenta</p>
                    <p className="text-[13px] font-bold text-foreground truncate">{displayName}</p>
                    <p className="text-[11px] text-muted-foreground">{isAdmin ? "Administrador Full" : "Gestor Comercial"}</p>
                 </div>

                 <div className="p-2">
                    <button 
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-white/5 text-sm text-foreground transition-all group/item"
                    >
                      <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover/item:bg-orange-500 group-hover/item:text-white transition-all">
                        {resolvedTheme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold leading-none capitalize">Modo {resolvedTheme === "dark" ? "Claro" : "Oscuro"}</p>
                        <p className="text-[10px] text-muted-foreground">Cambiar apariencia</p>
                      </div>
                    </button>

                    <button 
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-red-500/10 text-sm text-foreground transition-all group/logout"
                    >
                      <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center group-hover/logout:bg-red-500 group-hover/logout:text-white transition-all">
                        <LogOut size={14} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold leading-none group-hover:text-red-500">Cerrar Sesión</p>
                        <p className="text-[10px] text-muted-foreground">Salir del sistema</p>
                      </div>
                    </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </header>

  );
}
