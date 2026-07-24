import { supabase } from '@/lib/supabase'
import type { ValveCommandType } from '@/types'

export async function sendValveCommand(meterId: string, command: ValveCommandType, issuedByProfileId: string) {
  const { error } = await supabase.from('valve_commands').insert({
    meter_id: meterId,
    command,
    issued_by: issuedByProfileId,
    status: 'pending',
  })
  if (error) throw error
}

export interface LatestValveCommand {
  meter_id: string
  command: ValveCommandType
  status: string
  issued_at: string
}

export async function fetchLatestValveCommands(): Promise<LatestValveCommand[]> {
  const { data, error } = await supabase
    .from('valve_commands')
    .select('meter_id, command, status, issued_at')
    .order('issued_at', { ascending: false })

  if (error) throw error

  const latestByMeter = new Map<string, LatestValveCommand>()
  for (const row of data ?? []) {
    if (!latestByMeter.has(row.meter_id)) latestByMeter.set(row.meter_id, row)
  }
  return Array.from(latestByMeter.values())
}
