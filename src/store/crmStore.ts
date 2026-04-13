import { create } from "zustand";
import type { Lead, CrmConfig, CrmAlert, ChatMessage, Activity, Opportunity, OpportunityType } from "@/types/crm";
import { DEFAULT_CRM_CONFIG, OPPORTUNITY_TYPE_LABELS, calculateLeadScore } from "@/types/crm";
import { supabase } from "@/integrations/supabase/client";

interface CrmState {
  leads: Lead[];
  config: CrmConfig;
  alerts: CrmAlert[];
  chatMessages: ChatMessage[];
  popupActivity: (Activity & { leadId: string; leadName: string }) | null;
  
  setConfig: (config: CrmConfig) => void;
  setAlerts: (alerts: CrmAlert[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setPopupActivity: (activity: (Activity & { leadId: string; leadName: string }) | null) => void;
  setLeads: (leads: Lead[]) => void;
  syncConfig: () => void;
  addActivityLog: (action: string, details: string) => void;
  applyDesignConfig: (config: CrmConfig) => void;

  updateLead: (updated: Lead) => void;
  reorderLead: (leadId: string, sourceDroppable: string, destDroppable: string, sourceIndex: number, destIndex: number) => void;
  createLead: (lead: Lead) => void;
  createLeadFromOpportunity: (parentLead: Lead, opportunity: Opportunity) => void;
  markActivityDone: (leadId: string, activityId: string, note: string) => void;
  rescheduleActivity: (leadId: string, activityId: string, newDate: string, comment: string) => void;
  redistributeLeads: (leadIds: string[], user: string) => void;
  bulkUpdateLeads: (leadIds: string[], updates: Partial<Lead>) => void;
  bulkDeleteLeads: (leadIds: string[]) => void;
  sendChat: (msg: Omit<ChatMessage, "id" | "createdAt">) => void;
  dismissAlert: (alertId: string) => void;
  clearAlerts: () => void;
  restoreBackup: (leads: Lead[], config: CrmConfig, alerts: CrmAlert[], chatMessages: ChatMessage[]) => Promise<void>;
  autoRenewLeads: () => void;
  executeAutomations: (lead: Lead, triggerType: "status_change" | "days_inactive" | "lead_created", meta?: { fromStatus?: string; toStatus?: string; daysInactive?: number }) => void;
  evaluateInactivityRules: () => void;
}

export const useCrmStore = create<CrmState>((set, get) => ({
  leads: [],
  config: DEFAULT_CRM_CONFIG,
  alerts: [],
  chatMessages: [],
  popupActivity: null,

  setConfig: (config) => {
    set({ config });
    get().applyDesignConfig(config);
    // Debounced sync would be better, but direct for now
    get().syncConfig();
  },
  setAlerts: (alerts) => set({ alerts }),
  setChatMessages: (chatMessages) => set({ chatMessages }),
  setPopupActivity: (popupActivity) => set({ popupActivity }),
  setLeads: (leads) => set({ leads }),

  syncConfig: async () => {
    const { config } = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("crm_config").upsert({
      user_id: user.id,
      config_data: config as any,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  },

  addActivityLog: (action, details) => {
    const { activityLogs } = get().config;
    const newEntry = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      userId: "u1", // Fallback to current user
      userName: "Admin", 
      action,
      details,
      createdAt: new Date().toLocaleString("es-CO"),
    };
    const updatedLogs = [newEntry, ...(activityLogs || [])].slice(0, 50);
    get().setConfig({ ...get().config, activityLogs: updatedLogs });
  },

  applyDesignConfig: (config) => {
    if (!config || !config.layoutConfig) return;
    
    const root = document.documentElement;
    const { layoutConfig } = config;
    
    // Radius
    if (layoutConfig.borderRadius !== undefined) {
      root.style.setProperty("--radius", `${layoutConfig.borderRadius}px`);
    }
    
    // Shadow
    const shadows = {
      none: "none",
      soft: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      medium: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      deep: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
    };
    if (layoutConfig.shadowIntensity) {
      root.style.setProperty("--card-shadow", shadows[layoutConfig.shadowIntensity] || shadows.soft);
    }
    
    // Glass
    if (layoutConfig.glassIntensity !== undefined) {
      root.style.setProperty("--glass-blur", `${layoutConfig.glassIntensity / 2}px`);
    }
    
    // Font
    const fonts = {
      "Inter": "'Inter', system-ui, sans-serif",
      "Plus Jakarta Sans": "'Plus Jakarta Sans', system-ui, sans-serif",
      "Roboto": "'Roboto', system-ui, sans-serif",
      "Mono": "'JetBrains Mono', monospace"
    };
    if (layoutConfig.fontFamily) {
      root.style.setProperty("--font-family", fonts[layoutConfig.fontFamily] || fonts["Plus Jakarta Sans"]);
    }

    // Primary
    if (layoutConfig.primaryCustomColor) {
      root.style.setProperty("--primary", layoutConfig.primaryCustomColor);
    }
  },

  updateLead: (updated: Lead) => {
    const { leads, config } = get();
    const oldLead = leads.find(l => l.id === updated.id);
    let finalLead = { ...updated, score: calculateLeadScore(updated) };
    const newActivities: Activity[] = [];
    const newAlerts: CrmAlert[] = [];

    // Automation Engine
    if (oldLead && oldLead.state !== updated.state) {
      config.automationRules.filter(r => r.enabled).forEach(rule => {
        if (rule.trigger.type === "status_change" && rule.trigger.toStatus === updated.state) {
          if (rule.action.type === "create_activity") {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dateStr = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;
            newActivities.push({
              id: Date.now().toString() + "_auto" + Math.random().toString(36).slice(2, 4),
              type: "automation",
              text: `⚡ ${rule.action.activityText || rule.name}`,
              author: "Sistema",
              createdAt: new Date().toLocaleString("es-CO"),
              scheduledAt: dateStr,
              leadId: finalLead.id,
              leadName: finalLead.propietario,
            });
          }
          if (rule.action.type === "change_status" && rule.action.targetStatus) {
            finalLead = { ...finalLead, state: rule.action.targetStatus };
          }
          if (rule.action.type === "send_alert" && rule.action.alertMessage) {
            newAlerts.push({
              id: Date.now().toString() + "_alert",
              type: "automation",
              message: rule.action.alertMessage,
              leadId: finalLead.id,
              leadName: finalLead.propietario,
              createdBy: "Sistema",
              createdAt: new Date().toLocaleString("es-CO"),
              dismissed: false,
            });
          }
        }
      });
      finalLead = { ...finalLead, activities: [...newActivities, ...(finalLead.activities || [])] };
    }

    set(state => ({
      leads: state.leads.map(l => (l.id === finalLead.id ? finalLead : l)),
      alerts: newAlerts.length > 0 ? [...newAlerts, ...state.alerts] : state.alerts
    }));

    if (oldLead && oldLead.state !== updated.state) {
      get().addActivityLog("Cambio de Estado", `${finalLead.propietario}: ${oldLead.state} → ${updated.state}`);
      get().executeAutomations(finalLead, "status_change", { fromStatus: oldLead.state, toStatus: updated.state });
    }

    // Async Update to Supabase Server
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("crm_leads").update({
        propietario: finalLead.propietario,
        placa: finalLead.placa,
        insurance: finalLead.insurance,
        email: finalLead.email,
        phone: finalLead.phone,
        state: finalLead.state,
        monto: finalLead.monto,
        valor_prima: finalLead.valorPrima,
        fecha: finalLead.fecha,
        assigned_to: finalLead.assignedTo,
        lugar: finalLead.lugar,
        activities: finalLead.activities as any,
        notes: finalLead.notes as any,
        phones: finalLead.phones as any,
        emails: finalLead.emails as any,
        client_fields: { 
          tipoIdentificacion: finalLead.tipoIdentificacion, 
          numeroIdentificacion: finalLead.numeroIdentificacion,
          nombres: finalLead.nombres, apellidos: finalLead.apellidos,
          sexo: finalLead.sexo, fechaNacimiento: finalLead.fechaNacimiento,
          ciudad: finalLead.ciudad, departamento: finalLead.departamento,
          colorVehiculo: finalLead.colorVehiculo, tipoServicio: finalLead.tipoServicio,
          marca: finalLead.marca, modelo: finalLead.modelo
        } as any,
        updated_at: new Date().toISOString(),
        score: finalLead.score,
        expiration_date: finalLead.expirationDate,
        is_renewal: finalLead.isRenewal
      }).eq('id', finalLead.id).then(({ error }) => {
        if (error) {
           console.error("Error al actualizar lead remoto:", error);
           alert("Error al guardar en la nube (Update): " + error.message);
        }
      });
    });
  },

  reorderLead: (leadId, sourceDroppable, destDroppable, sourceIndex, destIndex) => {
    set((state) => {
      const leads = [...state.leads];
      // Filtrar el array basándonos solo en los elementos a mostrar en el kanban.
      const sourceLeads = leads.filter(l => l.state === sourceDroppable);
      const destLeads = sourceDroppable === destDroppable ? sourceLeads : leads.filter(l => l.state === destDroppable);
      
      const leadToMove = leads.find(l => l.id === leadId);
      if (!leadToMove) return state;

      // Optimización simple: Cambiar el estado y forzar un repintado ordenándolos visualmente.
      if (sourceDroppable !== destDroppable) {
         leadToMove.state = destDroppable;
      }
      
      // Mover el item quitándolo del antiguo índice principal y re-insertándolo antes del destino.
      const currentIndex = leads.indexOf(leadToMove);
      leads.splice(currentIndex, 1);
      
      // Encontrar el lead justo en el destIndex (donde se soltó la tarjeta) dentro de la columna de destino
      const targetLeadAtDest = destLeads[destIndex];
      let newGlobalIndex = leads.length;
      if (targetLeadAtDest) {
         newGlobalIndex = leads.indexOf(targetLeadAtDest);
         if (newGlobalIndex === -1) newGlobalIndex = leads.length; // Fallback
      }

      leads.splice(newGlobalIndex, 0, leadToMove);

      return { leads };
    });

    if (sourceDroppable !== destDroppable) {
      // Disparar las automatizaciones del update si cambió de estado llamando updateLead en background
      const leads = get().leads;
      const moved = leads.find(l => l.id === leadId);
      if (moved) {
        get().updateLead(moved);
      }
    }
  },

  createLead: (lead) => {
    // Generate true UUID for db consistency
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const id = isUUID.test(lead.id) ? lead.id : (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
    const newLead = { ...lead, id, score: calculateLeadScore(lead) };
    
    set(state => ({ leads: [newLead, ...state.leads] }));
    get().addActivityLog("Nuevo Registro", `Lead creado: ${newLead.propietario} (${newLead.placa})`);
    get().executeAutomations(newLead, "lead_created");
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("crm_leads").insert({
        id: newLead.id,
        user_id: user.id,
        propietario: newLead.propietario || "Sin nombre",
        placa: newLead.placa,
        insurance: newLead.insurance,
        email: newLead.email,
        phone: newLead.phone,
        state: newLead.state || "nuevo",
        monto: newLead.monto || 0,
        valor_prima: newLead.valorPrima || 0,
        fecha: newLead.fecha || new Date().toLocaleString("es-CO"),
        assigned_to: newLead.assignedTo,
        lugar: newLead.lugar,
        activities: newLead.activities as any,
        notes: newLead.notes as any,
        score: newLead.score,
        expiration_date: newLead.expirationDate,
        is_renewal: newLead.isRenewal,
        client_fields: {
          tipoIdentificacion: newLead.tipoIdentificacion, 
          numeroIdentificacion: newLead.numeroIdentificacion,
        } as any
      }).then(({ error }) => {
        if (error) {
           console.error("Error al insertar lead remoto:", error);
           alert("Error al crear. Supabase dice: " + error.message);
        }
      });
    });

    get().executeAutomations(newLead, "lead_created");
  },
  
  createLeadFromOpportunity: (parentLead, opportunity) => {
    const { config } = get();
    const newLead: Lead = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      fecha: new Date().toLocaleDateString("es-CO", { day: "numeric", month: "numeric" }),
      placa: opportunity.typeFields?.placa || opportunity.placa || "",
      propietario: parentLead.propietario,
      insurance: opportunity.aseguradora || parentLead.insurance,
      email: parentLead.email, phone: parentLead.phone,
      reference: `Opp: ${OPPORTUNITY_TYPE_LABELS[opportunity.type]} - ${opportunity.description}`,
      state: config.pipelineStages[0]?.key || "nuevo", followUp: "1",
      remark: `Oportunidad ${OPPORTUNITY_TYPE_LABELS[opportunity.type]} vinculada a ${parentLead.placa || parentLead.propietario}`,
      lugar: parentLead.lugar, tipoSeguro: opportunity.type === "vehiculo" ? parentLead.tipoSeguro : opportunity.type,
      monto: opportunity.monto || 0, assignedTo: parentLead.assignedTo,
      parentLeadId: parentLead.id, opportunityType: opportunity.type as OpportunityType,
      tipoIdentificacion: parentLead.tipoIdentificacion, numeroIdentificacion: parentLead.numeroIdentificacion,
      nombres: parentLead.nombres, apellidos: parentLead.apellidos, sexo: parentLead.sexo,
      fechaNacimiento: parentLead.fechaNacimiento, ciudad: parentLead.ciudad, departamento: parentLead.departamento,
      colorVehiculo: parentLead.colorVehiculo,
      activities: [{ id: Date.now().toString(), type: "note", text: `Lead creado desde oportunidad de ${OPPORTUNITY_TYPE_LABELS[opportunity.type]}`, author: "Sistema", createdAt: new Date().toLocaleString("es-CO") }],
    };
    get().addActivityLog("Oportunidad", `Nueva oportunidad para ${parentLead.propietario}: ${opportunity.type}`);
    get().createLead(newLead);
  },

  markActivityDone: (leadId, activityId, note) => {
    set(state => ({
      leads: state.leads.map(l => {
        if (l.id !== leadId) return l;
        const targetAct = (l.activities || []).find(a => a.id === activityId);
        const activities = (l.activities || []).map(a => a.id === activityId ? { ...a, completed: true } : a);
        const completionActivity: Activity = {
          id: Date.now().toString(), type: "note",
          text: `✅ Actividad completada: "${targetAct?.text || ""}"${note ? ` — ${note}` : ""}`,
          author: "Usuario", createdAt: new Date().toLocaleString("es-CO"),
        };
        const updatedLead = { ...l, activities: [completionActivity, ...activities] };
        get().updateLead(updatedLead); // Dispatch the main update so it goes to Supabase too
        return updatedLead;
      })
    }));
  },

  rescheduleActivity: (leadId, activityId, newDate, comment) => {
    set(state => ({
      leads: state.leads.map(l => {
        if (l.id !== leadId) return l;
        const oldAct = (l.activities || []).find(a => a.id === activityId);
        const activities = (l.activities || []).map(a => a.id === activityId ? { ...a, scheduledAt: newDate } : a);
        const rescheduleActivity: Activity = {
          id: Date.now().toString(), type: "note",
          text: `🔄 Reprogramada: "${oldAct?.text || ""}" de ${oldAct?.scheduledAt || "?"} a ${newDate}${comment ? ` — ${comment}` : ""}`,
          author: "Usuario", createdAt: new Date().toLocaleString("es-CO"),
        };
        const updatedLead = { ...l, activities: [rescheduleActivity, ...activities] };
        get().updateLead(updatedLead);
        return updatedLead;
      })
    }));
  },

  redistributeLeads: (leadIds, user) => {
    set(state => ({
      leads: state.leads.map(l => {
        if(leadIds.includes(l.id)) {
          const updated = { ...l, assignedTo: user };
          supabase.from("crm_leads").update({ assigned_to: user }).eq("id", l.id).then();
          return updated;
        }
        return l;
      })
    }));
  },

  bulkUpdateLeads: (leadIds, updates) => {
    set(state => ({
      leads: state.leads.map(l => leadIds.includes(l.id) ? { ...l, ...updates } : l)
    }));

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      // Convert camelCase updates to snake_case for DB
      const dbUpdates: any = {};
      if (updates.state) dbUpdates.state = updates.state;
      if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo;
      if (updates.paymentStatus) dbUpdates.paymentStatus = updates.paymentStatus;
      if (updates.smartCategory) dbUpdates.smart_category = updates.smartCategory;
      
      supabase.from("crm_leads").update(dbUpdates).in("id", leadIds).then(({ error }) => {
        if (error) console.error("Error en bulkUpdateLeads:", error);
      });
    });
  },

  bulkDeleteLeads: (leadIds) => {
    const deletedCount = leadIds.length;
    set(state => ({
      leads: state.leads.filter(l => !leadIds.includes(l.id))
    }));
    get().addActivityLog("Borrado Masivo", `${deletedCount} registros eliminados.`);

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from("crm_leads").delete().in("id", leadIds).then(({ error }) => {
        if (error) console.error("Error en bulkDeleteLeads:", error);
      });
    });
  },

  sendChat: async (msg) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from("chat_messages").insert({
      from_user: msg.from,
      to_user: msg.to || null,
      text: msg.text,
      lead_id: msg.leadId,
      lead_name: msg.leadName,
    }).select().single();

    if (!error && data) {
      const newMsg: ChatMessage = { 
        ...msg, 
        id: data.id, 
        createdAt: new Date(data.created_at).toLocaleString("es-CO") 
      };
      
      set(state => {
        const updates: Partial<CrmState> = { chatMessages: [...state.chatMessages, newMsg] };
        if (msg.to) {
          // If message is for someone, we also create a remote alert
          supabase.from("crm_alerts").insert({
            user_id: user.id, // This should normally be the recipient's ID, but for this demo we'll use current
            type: "manual",
            message: `${msg.from} te envió un mensaje${msg.leadName ? ` sobre ${msg.leadName}` : ""}`,
            lead_id: msg.leadId,
            lead_name: msg.leadName,
            created_by: msg.from,
            dismissed: false
          }).then();
        }
        return updates;
      });
    }
  },

  dismissAlert: async (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === alertId ? { ...a, dismissed: true } : a)
    }));
    await supabase.from("crm_alerts").update({ dismissed: true }).eq("id", alertId);
  },

  clearAlerts: () => set({ alerts: [] }),

  restoreBackup: async (leads, config, alerts, chatMessages) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Debes estar autenticado para restaurar un respaldo.");
      return;
    }

    // 1. Update local state
    set({ leads, config, alerts, chatMessages });
    get().applyDesignConfig(config);

    // 2. Sync with Supabase (Destructive Wipe & Insert)
    const { error: deleteError } = await supabase
      .from("crm_leads")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error al limpiar base de datos antes de restaurar:", deleteError);
      throw new Error("No se pudo limpiar la base de datos previa.");
    }

    // Insert new leads
    const leadsToInsert = leads.map(l => ({
      id: l.id,
      user_id: user.id,
      propietario: l.propietario,
      placa: l.placa,
      insurance: l.insurance,
      email: l.email,
      phone: l.phone,
      state: l.state,
      monto: l.monto,
      valor_prima: l.valorPrima,
      fecha: l.fecha,
      assigned_to: l.assignedTo,
      lugar: l.lugar,
      activities: l.activities as any,
      notes: l.notes as any,
      phones: l.phones as any,
      emails: l.emails as any,
      client_fields: {
        tipoIdentificacion: l.tipoIdentificacion,
        numeroIdentificacion: l.numeroIdentificacion,
        nombres: l.nombres,
        apellidos: l.apellidos,
        sexo: l.sexo,
        fechaNacimiento: l.fechaNacimiento,
        ciudad: l.ciudad,
        departamento: l.departamento,
        colorVehiculo: l.colorVehiculo,
        tipoServicio: l.tipoServicio,
        marca: l.marca,
        modelo: l.modelo
      } as any
    }));

    // Split into chunks if there are many leads (Supabase/Postgrest limits)
    const chunkSize = 100;
    for (let i = 0; i < leadsToInsert.length; i += chunkSize) {
      const chunk = leadsToInsert.slice(i, i + chunkSize);
      const { error: insertError } = await supabase.from("crm_leads").insert(chunk);
      if (insertError) {
        console.error("Error al insertar lote durante restauración:", insertError);
        throw new Error(`Error al insertar lote ${i / chunkSize + 1}.`);
      }
    }
  },

  autoRenewLeads: () => {
    const { leads, updateLead } = get();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    leads.forEach(lead => {
      if (!lead.expirationDate) return;
      
      const [day, month, year] = lead.expirationDate.split("/").map(Number);
      const expDate = new Date(year, month - 1, day);
      
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If policy expires within 30 days and it wasn't already marked as renewal or moved
      if (diffDays <= 30 && diffDays > 0 && !lead.isRenewal) {
        updateLead({
          ...lead,
          state: "seguimiento",
          isRenewal: true,
          activities: [
            {
              id: Date.now().toString() + "_renewal",
              type: "automation",
              text: `🔄 AUTO-RENOVACIÓN: Póliza vence en ${diffDays} días (${lead.expirationDate}).`,
              author: "Sistema",
              createdAt: new Date().toLocaleString("es-CO"),
            },
            ...(lead.activities || [])
          ]
        });
      }
    });
  },

  executeAutomations: (lead, triggerType, meta) => {
    const { config, updateLead, setAlerts, alerts } = get();
    const rules = config.automationRules.filter(r => r.enabled && r.trigger.type === triggerType);

    rules.forEach(rule => {
      // Trigger level filtering
      if (triggerType === "status_change") {
        if (rule.trigger.toStatus && rule.trigger.toStatus !== meta?.toStatus) return;
        if (rule.trigger.fromStatus && rule.trigger.fromStatus !== meta?.fromStatus) return;
      }

      // Action execution
      const action = rule.action;
      console.log(`[Automation] Running rule: ${rule.name} for lead: ${lead.propietario}`);

      if (action.type === "create_activity") {
        const newActivity: Activity = {
          id: Date.now().toString() + "_auto_" + rule.id,
          type: (action.activityType as any) || "automation",
          text: action.activityText || "Actividad automática",
          author: "Sistema",
          createdAt: new Date().toLocaleString("es-CO"),
        };
        updateLead({ ...lead, activities: [newActivity, ...(lead.activities || [])] });
      } else if (action.type === "change_status" && action.targetStatus) {
        if (lead.state !== action.targetStatus) {
          updateLead({ ...lead, state: action.targetStatus as any });
        }
      } else if (action.type === "send_alert") {
        const newAlert: CrmAlert = {
          id: Date.now().toString() + "_alert_" + rule.id,
          type: "automation",
          message: action.alertMessage || `Alerta: ${rule.name}`,
          leadId: lead.id,
          leadName: lead.propietario,
          createdAt: new Date().toLocaleString("es-CO"),
          dismissed: false,
        };
        setAlerts([newAlert, ...alerts]);
      }
    });
  },

  evaluateInactivityRules: () => {
    const { leads, config, executeAutomations } = get();
    const now = new Date();
    
    leads.forEach(lead => {
      // Find the last activity date or lead creation date
      const lastAct = lead.activities?.[0]?.createdAt || lead.fecha;
      if (!lastAct) return;

      try {
        // Parse "DD/MM/YYYY, HH:MM:SS"
        const [datePart] = lastAct.split(", ");
        const [day, month, year] = datePart.split("/").map(Number);
        const lastDate = new Date(year, month - 1, day);
        
        const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0) {
          executeAutomations(lead, "days_inactive", { daysInactive: diffDays });
        }
      } catch (e) {
        console.error("Error evaluating inactivity for lead:", lead.id, e);
      }
    });
  }
}));
