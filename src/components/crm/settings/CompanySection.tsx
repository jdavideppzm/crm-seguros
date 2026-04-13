import React from "react";
import { Globe, Image as LucideImage, X, Upload } from "lucide-react";
import { SectionHeader, ConfigCard } from "./SettingsShared";
import { CrmConfig } from "@/types/crm";

interface CompanySectionProps {
  config: CrmConfig;
  updateConfig: (p: Partial<CrmConfig>) => void;
}

export function CompanySection({ config, updateConfig }: CompanySectionProps) {
  const info = config.companyInfo;

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      updateConfig({ companyInfo: { ...info, logoUrl: base64 } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Información Corporativa" description="Configura los datos legales y comerciales de tu agencia." />
      
      <ConfigCard title="Datos de la Empresa" description="Estos datos se usarán para facturación y comunicaciones oficiales.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Nombre Comercial</label>
            <input value={info.name} onChange={e => updateConfig({ companyInfo: { ...info, name: e.target.value } })} placeholder="Ej: Jedael Seguros" className="w-full text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">NIT / Identificación</label>
            <input value={info.nit} onChange={e => updateConfig({ companyInfo: { ...info, nit: e.target.value } })} placeholder="900..." className="w-full text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Dirección Física</label>
            <input value={info.address} onChange={e => updateConfig({ companyInfo: { ...info, address: e.target.value } })} placeholder="Calle..." className="w-full text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Teléfono de Soporte</label>
            <input value={info.phone} onChange={e => updateConfig({ companyInfo: { ...info, phone: e.target.value } })} placeholder="+57..." className="w-full text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Email Corporativo</label>
            <input value={info.email || ""} onChange={e => updateConfig({ companyInfo: { ...info, email: e.target.value } })} placeholder="hola@empresa.com" className="w-full text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Sitio Web Oficial</label>
            <div className="relative group">
              <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input value={info.website || ""} onChange={e => updateConfig({ companyInfo: { ...info, website: e.target.value } })} placeholder="www.empresa.com" className="w-full pl-11 text-sm font-medium py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all" />
            </div>
          </div>
        </div>
      </ConfigCard>

      <ConfigCard title="Identidad Visual" description="El logo se mostrará en encabezados, sidebar y reportes exportados.">
        <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-muted/50 to-muted border border-border flex items-center justify-center overflow-hidden shadow-inner group-hover:shadow-md transition-all duration-500">
              {info.logoUrl ? (
                <img src={info.logoUrl} alt="Logo" className="w-full h-full object-contain p-4 drop-shadow-sm" />
              ) : (
                <LucideImage size={32} className="text-muted-foreground opacity-20" />
              )}
            </div>
            {info.logoUrl && (
              <button
                onClick={() => updateConfig({ companyInfo: { ...info, logoUrl: "" } })}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X size={10} />
              </button>
            )}
          </div>
          <div className="flex-1 w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">Subir desde el ordenador</label>
              <label className="flex items-center gap-3 w-full py-3 px-4 bg-muted/20 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group">
                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Upload size={14} />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {info.logoUrl?.startsWith('data:') ? '✅ Imagen cargada — clic para cambiar' : 'Seleccionar PNG, JPG o SVG'}
                </span>
                <input type="file" accept="image/*" onChange={handleLogoFile} className="hidden" />
              </label>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase ml-1 tracking-widest">O pegar URL del logo</label>
              <input
                value={info.logoUrl?.startsWith('data:') ? '' : (info.logoUrl || '')}
                onChange={e => updateConfig({ companyInfo: { ...info, logoUrl: e.target.value } })}
                placeholder="https://su-dominio.com/logo.png"
                className="w-full text-xs font-mono py-2.5 px-4 bg-muted/20 border border-border rounded-2xl focus:ring-primary/40 focus:bg-background outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-[10px] text-primary font-bold italic">Tip:</span>
              <p className="text-[10px] text-muted-foreground">Usa imágenes con fondo transparente (PNG/SVG) para un mejor acabado en el sidebar y reportes.</p>
            </div>
          </div>
        </div>
      </ConfigCard>
    </div>
  );
}
