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
export type SystemSettings = Tables['system_settings']['Row']

export type ProfileRole = Database['public']['Enums']['profile_role']
export type MeterStatus = Database['public']['Enums']['meter_status']
export type AlertSeverity = Database['public']['Enums']['alert_severity']
export type AlertStatus = Database['public']['Enums']['alert_status']

export interface AuthUser {
  profile: Profile
  customer: Customer | null
}
