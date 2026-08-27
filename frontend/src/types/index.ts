import type { Database } from './database.types'

export type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type Customer = Tables['customers']['Row']
export type SmartMeter = Tables['smart_meters']['Row']
export type MeterReading = Tables['meter_readings']['Row']
export type DailyUsage = Tables['daily_usage']['Row']
export type MonthlyUsage = Tables['monthly_usage']['Row']
export type Notification = Tables['notifications']['Row']
export type Alert = Tables['alerts']['Row']
export type ValveCommand = Tables['valve_commands']['Row']
export type MaintenanceLog = Tables['maintenance_logs']['Row']
export type DeviceLog = Tables['device_logs']['Row']
export type SystemSettings = Tables['system_settings']['Row']
export type Bill = Tables['bills']['Row']
export type Payment = Tables['payments']['Row']
export type AuditLog = Tables['audit_logs']['Row']

// Water Tokens & Sessions (Prepaid water allocation)
export type TokenStatus = 'pending' | 'paid' | 'ready' | 'active' | 'completed' | 'expired' | 'cancelled'
export type SessionStatus = 'pending' | 'opening' | 'active' | 'closing' | 'completed' | 'failed'

export interface WaterToken {
  id: string
  token_code: string
  customer_id: string
  meter_id: string
  allocated_litres: number
  remaining_litres: number
  consumed_litres: number
  amount: number
  tax: number
  total: number
  status: TokenStatus
  payment_reference: string | null
  payment_method: string
  created_at: string
  activated_at: string | null
  expires_at: string
  completed_at: string | null
  updated_at: string
}

export interface WaterSession {
  id: string
  token_id: string
  customer_id: string
  meter_id: string
  started_at: string
  ended_at: string | null
  starting_reading: number
  ending_reading: number | null
  allocated_litres: number
  consumed_litres: number
  status: SessionStatus
  created_at: string
  updated_at: string
  // Virtual joins for UI
  meter_serial?: string
  customer_name?: string
  customer_number?: string
  token_code?: string
  current_flow_rate?: number
}

export type ProfileRole = Database['public']['Enums']['profile_role']
export type AccountStatus = Database['public']['Enums']['account_status']
export type MeterStatus = Database['public']['Enums']['meter_status']
export type AlertType = Database['public']['Enums']['alert_type']
export type AlertSeverity = Database['public']['Enums']['alert_severity']
export type AlertStatus = Database['public']['Enums']['alert_status']
export type BillStatus = Database['public']['Enums']['bill_status']
export type PaymentMethod = Database['public']['Enums']['payment_method']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type ValveCommandType = Database['public']['Enums']['valve_command_type']
export type ValveCommandStatus = Database['public']['Enums']['valve_command_status']

export interface AuthUser {
  profile: Profile
  customer: Customer | null
}
