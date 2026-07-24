export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          description: string | null
          id: string
          meter_id: string
          resolved_at: string | null
          severity: Database["public"]["Enums"]["alert_severity"]
          status: Database["public"]["Enums"]["alert_status"]
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description?: string | null
          id?: string
          meter_id: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description?: string | null
          id?: string
          meter_id?: string
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["alert_severity"]
          status?: Database["public"]["Enums"]["alert_status"]
        }
        Relationships: [
          {
            foreignKeyName: "alerts_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          billing_month: number
          billing_year: number
          consumption: number
          customer_id: string
          discount: number
          due_date: string
          generated_at: string
          id: string
          status: Database["public"]["Enums"]["bill_status"]
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          amount?: number
          billing_month: number
          billing_year: number
          consumption?: number
          customer_id: string
          discount?: number
          due_date: string
          generated_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bill_status"]
          tax?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_month?: number
          billing_year?: number
          consumption?: number
          customer_id?: string
          discount?: number
          due_date?: string
          generated_at?: string
          id?: string
          status?: Database["public"]["Enums"]["bill_status"]
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          address: string | null
          created_at: string
          customer_number: string
          id: string
          latitude: number | null
          longitude: number | null
          meter_id: string | null
          national_id: string | null
          profile_id: string
          updated_at: string
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          address?: string | null
          created_at?: string
          customer_number?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          meter_id?: string | null
          national_id?: string | null
          profile_id: string
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          address?: string | null
          created_at?: string
          customer_number?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          meter_id?: string | null
          national_id?: string | null
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_usage: {
        Row: {
          consumption: number
          created_at: string
          date: string
          estimated_cost: number | null
          id: string
          meter_id: string
        }
        Insert: {
          consumption?: number
          created_at?: string
          date: string
          estimated_cost?: number | null
          id?: string
          meter_id: string
        }
        Update: {
          consumption?: number
          created_at?: string
          date?: string
          estimated_cost?: number | null
          id?: string
          meter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_usage_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      device_logs: {
        Row: {
          created_at: string
          id: string
          log_level: Database["public"]["Enums"]["log_level"]
          message: string
          meter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          message: string
          meter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_level?: Database["public"]["Enums"]["log_level"]
          message?: string
          meter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_logs_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          maintenance_date: string
          meter_id: string
          next_service: string | null
          technician: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date?: string
          meter_id: string
          next_service?: string | null
          technician?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date?: string
          meter_id?: string
          next_service?: string | null
          technician?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      meter_readings: {
        Row: {
          created_at: string
          flow_rate: number | null
          id: string
          meter_id: string
          pressure: number | null
          reading_time: string
          signal_strength: number | null
          temperature: number | null
          voltage: number | null
          water_usage: number | null
        }
        Insert: {
          created_at?: string
          flow_rate?: number | null
          id?: string
          meter_id: string
          pressure?: number | null
          reading_time?: string
          signal_strength?: number | null
          temperature?: number | null
          voltage?: number | null
          water_usage?: number | null
        }
        Update: {
          created_at?: string
          flow_rate?: number | null
          id?: string
          meter_id?: string
          pressure?: number | null
          reading_time?: string
          signal_strength?: number | null
          temperature?: number | null
          voltage?: number | null
          water_usage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meter_readings_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          average_daily: number | null
          created_at: string
          estimated_bill: number | null
          id: string
          meter_id: string
          month: number
          total_consumption: number
          year: number
        }
        Insert: {
          average_daily?: number | null
          created_at?: string
          estimated_bill?: number | null
          id?: string
          meter_id: string
          month: number
          total_consumption?: number
          year: number
        }
        Update: {
          average_daily?: number | null
          created_at?: string
          estimated_bill?: number | null
          id?: string
          meter_id?: string
          month?: number
          total_consumption?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_usage_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bill_id: string
          customer_id: string
          id: string
          paid_at: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string | null
        }
        Insert: {
          amount: number
          bill_id: string
          customer_id: string
          id?: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
        }
        Update: {
          amount?: number
          bill_id?: string
          customer_id?: string
          id?: string
          paid_at?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_id: string
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["profile_role"]
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          auth_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          auth_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["profile_role"]
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: []
      }
      smart_meters: {
        Row: {
          battery_level: number | null
          created_at: string
          customer_id: string | null
          device_api_key: string
          firmware_version: string | null
          id: string
          installation_date: string | null
          last_seen: string | null
          latitude: number | null
          longitude: number | null
          meter_serial: string
          status: Database["public"]["Enums"]["meter_status"]
          updated_at: string
          wifi_signal: number | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          customer_id?: string | null
          device_api_key?: string
          firmware_version?: string | null
          id?: string
          installation_date?: string | null
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          meter_serial: string
          status?: Database["public"]["Enums"]["meter_status"]
          updated_at?: string
          wifi_signal?: number | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          customer_id?: string | null
          device_api_key?: string
          firmware_version?: string | null
          id?: string
          installation_date?: string | null
          last_seen?: string | null
          latitude?: number | null
          longitude?: number | null
          meter_serial?: string
          status?: Database["public"]["Enums"]["meter_status"]
          updated_at?: string
          wifi_signal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_meters_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          alert_threshold: number | null
          billing_cycle: string
          company_name: string
          currency: string
          id: string
          support_email: string | null
          support_phone: string | null
          updated_at: string
          water_tariff: number
        }
        Insert: {
          alert_threshold?: number | null
          billing_cycle?: string
          company_name?: string
          currency?: string
          id?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
          water_tariff?: number
        }
        Update: {
          alert_threshold?: number | null
          billing_cycle?: string
          company_name?: string
          currency?: string
          id?: string
          support_email?: string | null
          support_phone?: string | null
          updated_at?: string
          water_tariff?: number
        }
        Relationships: []
      }
      valve_commands: {
        Row: {
          command: Database["public"]["Enums"]["valve_command_type"]
          executed_at: string | null
          id: string
          issued_at: string
          issued_by: string | null
          meter_id: string
          status: Database["public"]["Enums"]["valve_command_status"]
        }
        Insert: {
          command: Database["public"]["Enums"]["valve_command_type"]
          executed_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          meter_id: string
          status?: Database["public"]["Enums"]["valve_command_status"]
        }
        Update: {
          command?: Database["public"]["Enums"]["valve_command_type"]
          executed_at?: string | null
          id?: string
          issued_at?: string
          issued_by?: string | null
          meter_id?: string
          status?: Database["public"]["Enums"]["valve_command_status"]
        }
        Relationships: [
          {
            foreignKeyName: "valve_commands_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "valve_commands_meter_id_fkey"
            columns: ["meter_id"]
            isOneToOne: false
            referencedRelation: "smart_meters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_customer_id: { Args: never; Returns: string }
      current_profile_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      account_status: "active" | "suspended" | "inactive"
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_status: "active" | "acknowledged" | "resolved"
      alert_type:
        | "leak"
        | "tampering"
        | "offline"
        | "high_usage"
        | "low_battery"
        | "valve_failure"
        | "communication_lost"
      bill_status: "pending" | "paid" | "overdue" | "cancelled"
      log_level: "INFO" | "WARNING" | "ERROR" | "DEBUG"
      meter_status: "online" | "offline" | "maintenance" | "disabled" | "fault"
      notification_type:
        | "general"
        | "bill"
        | "leak"
        | "usage"
        | "maintenance"
        | "emergency"
      payment_method: "cash" | "bank" | "mobile_money" | "card"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      profile_role: "admin" | "customer"
      valve_command_status: "pending" | "sent" | "executed" | "failed"
      valve_command_type:
        | "OPEN"
        | "CLOSE"
        | "RESET"
        | "RESTART"
        | "CALIBRATE"
        | "UPDATE"
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
      account_status: ["active", "suspended", "inactive"],
      alert_severity: ["low", "medium", "high", "critical"],
      alert_status: ["active", "acknowledged", "resolved"],
      alert_type: [
        "leak",
        "tampering",
        "offline",
        "high_usage",
        "low_battery",
        "valve_failure",
        "communication_lost",
      ],
      bill_status: ["pending", "paid", "overdue", "cancelled"],
      log_level: ["INFO", "WARNING", "ERROR", "DEBUG"],
      meter_status: ["online", "offline", "maintenance", "disabled", "fault"],
      notification_type: [
        "general",
        "bill",
        "leak",
        "usage",
        "maintenance",
        "emergency",
      ],
      payment_method: ["cash", "bank", "mobile_money", "card"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      profile_role: ["admin", "customer"],
      valve_command_status: ["pending", "sent", "executed", "failed"],
      valve_command_type: [
        "OPEN",
        "CLOSE",
        "RESET",
        "RESTART",
        "CALIBRATE",
        "UPDATE",
      ],
    },
  },
} as const
