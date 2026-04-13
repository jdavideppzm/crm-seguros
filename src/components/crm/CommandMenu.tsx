import * as React from "react";
import { 
  Calculator, 
  Calendar, 
  CreditCard, 
  Settings, 
  Smile, 
  User,
  Search,
  LayoutDashboard,
  Trello,
  Table,
  PlusCircle,
  Hash,
  Shield
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Lead } from "@/types/crm";

interface CommandMenuProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onNavigate: (view: string) => void;
  onCreateLead: () => void;
}

export function CommandMenu({ leads, onSelectLead, onNavigate, onCreateLead }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escribe un comando o busca un lead..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        
        <CommandGroup heading="Vistas">
          <CommandItem onSelect={() => { onNavigate("dashboard"); setOpen(false); }}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("kanban"); setOpen(false); }}>
            <Trello className="mr-2 h-4 w-4" />
            <span>Vista Kanban</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("pipeline"); setOpen(false); }}>
            <Table className="mr-2 h-4 w-4" />
            <span>Vista Tabla</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("agenda"); setOpen(false); }}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Agenda</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Acciones">
          <CommandItem onSelect={() => { onCreateLead(); setOpen(false); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Crear Nuevo Lead</span>
          </CommandItem>
          <CommandItem onSelect={() => { onNavigate("settings"); setOpen(false); }}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración del Sistema</span>
          </CommandItem>
        </CommandGroup>

        {leads.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Leads recientes y resultados">
              {leads.slice(0, 8).map((lead) => (
                <CommandItem 
                  key={lead.id} 
                  onSelect={() => { onSelectLead(lead); setOpen(false); }}
                >
                  <User className="mr-2 h-4 w-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.propietario}</span>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      {lead.placa && <span className="flex items-center gap-0.5"><Hash size={10} />{lead.placa}</span>}
                      {lead.insurance && <span className="flex items-center gap-0.5"><Shield size={10} />{lead.insurance}</span>}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
