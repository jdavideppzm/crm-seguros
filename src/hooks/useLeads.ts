import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCrmStore } from "@/store/crmStore";
import { useAuth } from "@/contexts/AuthContext";
import type { Lead } from "@/types/crm";

export function useLeads() {
  const { session } = useAuth();
  const setLeads = useCrmStore((state) => state.setLeads);
  const setConfig = useCrmStore((state) => state.setConfig);
  const setAlerts = useCrmStore((state) => state.setAlerts);
  const setChatMessages = useCrmStore((state) => state.setChatMessages);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLeads([]);
      setLoading(false);
      return;
    }

    const fetchLeads = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("crm_leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Map database snake_case columns & JSON fields back to the Frontend's Lead TS Interface
        const mappedLeads: Lead[] = (data || []).map((row) => ({
          id: row.id,
          propietario: row.propietario,
          placa: row.placa || "",
          insurance: row.insurance || "",
          email: row.email || "",
          phone: row.phone || "",
          state: row.state,
          monto: row.monto || 0,
          valorPrima: row.valor_prima || 0,
          fecha: row.fecha || new Date(row.created_at || "").toLocaleString("es-CO"),
          assignedTo: row.assigned_to || undefined,
          lugar: row.lugar || "",
          reference: "",
          followUp: "",
          remark: "",
          tipoSeguro: "",
          
          // Parse JSON fallback
          activities: Array.isArray(row.activities) ? (row.activities as any) : [],
          notes: Array.isArray(row.notes) ? (row.notes as any) : [],
          phones: Array.isArray(row.phones) ? (row.phones as any) : [],
          emails: Array.isArray(row.emails) ? (row.emails as any) : [],
          
          score: row.score || 0,
          expirationDate: row.expiration_date || undefined,
          isRenewal: row.is_renewal || false,
          parentLeadId: row.parent_lead_id || undefined,
          opportunityType: row.opportunity_type as any,
          comisionCalculada: row.comision_calculada || 0,
          
          ...(typeof row.client_fields === 'object' && row.client_fields !== null ? row.client_fields : {})
        }));

        setLeads(mappedLeads);

        // 2. Fetch Config
        const { data: configData } = await supabase
          .from("crm_config")
          .select("config_data")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (configData?.config_data) {
          const loadedConfig = configData.config_data as any;
          
          // 2.1 Auto-cleanup ghost users from config if they don't exist in profiles
          const { data: profiles } = await supabase.from("profiles").select("email");
          if (profiles && loadedConfig.users) {
            const profileEmails = profiles.map(p => p.email);
            const filteredUsers = loadedConfig.users.filter((u: any) => profileEmails.includes(u.email));
            
            if (filteredUsers.length !== loadedConfig.users.length) {
              console.log("[useLeads] Auto-cleaning ghost users from config");
              loadedConfig.users = filteredUsers;
              // Silently update if we found ghosts
              setConfig(loadedConfig);
            } else {
              setConfig(loadedConfig);
            }
          } else {
            setConfig(loadedConfig);
          }
        }

        // 3. Fetch Alerts
        const { data: alertsData } = await supabase
          .from("crm_alerts")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        
        if (alertsData) {
          setAlerts(alertsData.map(a => ({
            id: a.id,
            type: a.type as any,
            message: a.message,
            leadId: a.lead_id || undefined,
            leadName: a.lead_name || undefined,
            createdBy: a.created_by || undefined,
            createdAt: new Date(a.created_at).toLocaleString("es-CO"),
            dismissed: a.dismissed
          })));
        }

        // 4. Fetch Chat Messages (Recent)
        const { data: chatData } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: true })
          .limit(100);
        
        if (chatData) {
          setChatMessages(chatData.map(m => ({
            id: m.id,
            from: m.from_user,
            to: m.to_user || undefined,
            text: m.text,
            leadId: m.lead_id || undefined,
            leadName: m.lead_name || undefined,
            createdAt: new Date(m.created_at).toLocaleString("es-CO")
          })));
        }
      } catch (err: any) {
        console.error("Error fetching leads:", err);
        setError(err.message);
        alert("Error rescatando datos de la BD: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [session, setLeads]);

  return { loading, error };
}
