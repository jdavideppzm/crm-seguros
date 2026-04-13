import React, { useState, useRef } from "react";
import { THEME_PRESETS, CrmConfig } from "@/types/crm";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Image as ImageIcon, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { JedaelLogo } from "@/components/auth/JedaelLogo";

interface CustomizationSectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

export function CustomizationSection({ config, updateConfig }: CustomizationSectionProps) {
  const layout = config.layoutConfig;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande", { description: "Máximo 2MB permitido." });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'branding' bucket
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      updateConfig({ logoUrl: publicUrl });
      toast.success("Logo actualizado correctamente");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Error al subir el logo", { 
        description: "Asegúrate de que el bucket 'branding' exista y sea público en Supabase." 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Personalización" description="Ajusta el diseño, colores y comportamiento de tu plataforma." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigCard title="Identidad del CRM" description="Personaliza el nombre y el logo de tu plataforma.">
          <div className="space-y-6">
            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Nombre del CRM</label>
              <input
                value={(config.companyInfo as any)?.crmLabel || config.companyInfo?.name || ""}
                onChange={e => updateConfig({ companyInfo: { ...config.companyInfo, crmLabel: e.target.value } as any })}
                placeholder="Ej: Seguros Express CRM"
                className="w-full text-sm font-medium py-3 px-4 bg-muted/20 border border-border rounded-2xl outline-none transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-3 font-sans">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Logo de la Plataforma</label>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[24px] bg-muted/10 border border-dashed border-border/60">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-xl">
                    <JedaelLogo src={config.logoUrl} className="w-16 h-16" />
                  </div>
                  {config.logoUrl && (
                    <button 
                      onClick={() => updateConfig({ logoUrl: "" })}
                      className="absolute -top-2 -right-2 p-1.5 rounded-full bg-destructive text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading ? "Subiendo..." : "Subir Logo"}
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleLogoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Sube una imagen cuadrada (PNG o JPG). Máximo 2MB.<br/>
                    Este logo aparecerá en el Sidebar y el Login.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">URL de Logo Alternativo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center text-muted-foreground/50">
                  <ImageIcon size={14} />
                </div>
                <input
                  value={config.logoUrl || ""}
                  onChange={e => updateConfig({ logoUrl: e.target.value })}
                  placeholder="https://tu-sitio.com/logo.png"
                  className="w-full text-[12px] font-medium py-3 pl-10 pr-4 bg-muted/20 border border-border rounded-2xl outline-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-[9px] text-muted-foreground/60 ml-2 italic">Si prefieres usar un link directo en lugar de subir un archivo.</p>
            </div>
          </div>
        </ConfigCard>

        <ConfigCard title="Experiencia de Usuario" description="Configura el comportamiento inicial al entrar al sistema.">
          <div className="space-y-1.5 font-sans">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Vista de inicio al entrar</label>
            <select
              value={(config as any).homeView || "dashboard"}
              onChange={e => updateConfig({ homeView: e.target.value } as any)}
              className="w-full text-sm font-semibold py-3 px-4 bg-muted/20 border border-border rounded-2xl outline-none transition-all appearance-none cursor-pointer hover:bg-muted/30"
            >
              <option value="dashboard">Dashboard</option>
              <option value="pipeline">Pipeline Maestro</option>
              <option value="kanban">Vista Kanban</option>
              <option value="reports">Análisis Avanzado</option>
            </select>
          </div>
        </ConfigCard>
      </div>

      <ConfigCard title="Temas del Sistema" description="Cambia la paleta de colores global con un solo clic.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {THEME_PRESETS.map((theme) => {
            const isActive = config.themePreset === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateConfig({ themePreset: theme.id })}
                className={`p-3 rounded-2xl border text-left transition-all ${isActive ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border hover:border-primary/40 hover:bg-muted/30"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                   <p className="text-[10px] font-bold text-foreground uppercase truncate">{theme.name}</p>
                </div>
                <div className="flex gap-1">
                   <div className="flex-1 h-1.5 rounded-full bg-muted" />
                   <div className="flex-1 h-1.5 rounded-full bg-muted opacity-50" />
                </div>
              </button>
            );
          })}
        </div>
      </ConfigCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConfigCard title="Diseño y Estilo" description="Configura bordes, efectos visuales y color de acento.">
          <div className="space-y-4 pt-2">
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Bordes de Tarjetas</label>
                <div className="flex p-1 bg-muted rounded-xl gap-1">
                   {(["rounded", "flat", "bordered"] as const).map(s => (
                     <button key={s} onClick={() => updateConfig({ layoutConfig: { ...layout, cardStyle: s } })}
                       className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${layout.cardStyle === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                       {s.charAt(0).toUpperCase() + s.slice(1)}
                     </button>
                   ))}
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Redondez ({layout.borderRadius}px)</label>
                <input type="range" min="0" max="24" value={layout.borderRadius} onChange={e => updateConfig({ layoutConfig: { ...layout, borderRadius: parseInt(e.target.value) } })} className="w-full accent-primary" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Color de Acento Principal</label>
               <div className="flex items-center gap-3">
                 <input
                   type="color"
                   defaultValue="#2563eb"
                   onChange={e => {
                     const hex = e.target.value;
                     const r = parseInt(hex.slice(1,3),16);
                     const g = parseInt(hex.slice(3,5),16);
                     const b = parseInt(hex.slice(5,7),16);
                     document.documentElement.style.setProperty('--primary', `${Math.round(r/255*360)} ${Math.round(g/255*100)}% ${Math.round(b/255*100)}%`);
                   }}
                   className="w-10 h-10 rounded-xl border border-border cursor-pointer"
                 />
                 <p className="text-[10px] text-muted-foreground">Cambia el color de acento. Se aplica en tiempo real.</p>
               </div>
             </div>
          </div>
        </ConfigCard>

        <ConfigCard title="Densidad Visual" description="Ajusta el espaciado general y visibilidad de componentes.">
           <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Espaciado</label>
                <div className="flex p-1 bg-muted rounded-xl gap-1">
                   {(["compact", "normal", "comfortable"] as const).map(d => (
                     <button key={d} onClick={() => updateConfig({ layoutConfig: { ...layout, density: d } })}
                       className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${layout.density === d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                       {{compact:"Compacto",normal:"Normal",comfortable:"Amplio"}[d]}
                     </button>
                   ))}
                </div>
              </div>
           </div>
        </ConfigCard>
      </div>
    </div>
  );
}
