export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "15.0"
  }
  public: {
    Tables: {
      crm_leads: {
        Row: {
          id: string
          user_id: string
          propietario: string
          placa: string | null
          insurance: string | null
          email: string | null
          phone: string | null
          state: string
          monto: number | null
          valor_prima: number | null
          fecha: string | null
          assigned_to: string | null
          lugar: string | null
          client_fields: Json | null
          activities: Json | null
          notes: Json | null
          phones: Json | null
          emails: Json | null
          score: number | null
          expiration_date: string | null
          is_renewal: boolean | null
          parent_lead_id: string | null
          opportunity_type: string | null
          comision_calculada: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          propietario: string
          placa?: string | null
          insurance?: string | null
          email?: string | null
          phone?: string | null
          state?: string
          monto?: number | null
          valor_prima?: number | null
          fecha?: string | null
          assigned_to?: string | null
          lugar?: string | null
          client_fields?: Json | null
          activities?: Json | null
          notes?: Json | null
          phones?: Json | null
          emails?: Json | null
          score?: number | null
          expiration_date?: string | null
          is_renewal?: boolean | null
          parent_lead_id?: string | null
          opportunity_type?: string | null
          comision_calculada?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          propietario?: string
          placa?: string | null
          insurance?: string | null
          email?: string | null
          phone?: string | null
          state?: string
          monto?: number | null
          valor_prima?: number | null
          fecha?: string | null
          assigned_to?: string | null
          lugar?: string | null
          client_fields?: Json | null
          activities?: Json | null
          notes?: Json | null
          phones?: Json | null
          emails?: Json | null
          score?: number | null
          expiration_date?: string | null
          is_renewal?: boolean | null
          parent_lead_id?: string | null
          opportunity_type?: string | null
          comision_calculada?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_parent_lead_id_fkey"
            columns: ["parent_lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          from_user: string
          to_user: string | null
          text: string
          lead_id: string | null
          lead_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user: string
          to_user?: string | null
          text: string
          lead_id?: string | null
          lead_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user?: string
          to_user?: string | null
          text?: string
          lead_id?: string | null
          lead_name?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_alerts: {
        Row: {
          id: string
          user_id: string
          type: string
          message: string
          lead_id: string | null
          lead_name: string | null
          created_by: string | null
          dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          message: string
          lead_id?: string | null
          lead_name?: string | null
          created_by?: string | null
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          message?: string
          lead_id?: string | null
          lead_name?: string | null
          created_by?: string | null
          dismissed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_alerts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          }
        ]
      }
      crm_config: {
        Row: {
          id: string
          user_id: string
          config_data: Json
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          config_data: Json
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          config_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          display_name: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "vendedor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "vendedor"],
    },
  },
} as const
