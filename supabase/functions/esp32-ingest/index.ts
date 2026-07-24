// ESP32 device ingestion gateway (spec sections 43, 47-51).
//
// ESP32 devices have no Supabase Auth session - they authenticate with
// meter_serial + device_api_key (set on smart_meters, see migration
// 20260724000004_device_auth.sql). This function validates that pair,
// then uses the service role key to write past RLS on their behalf.
//
// Request body: { action, meter_serial, api_key, ...payload }
// Actions: "reading" | "heartbeat" | "get_commands" | "ack_command"

import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed' }, 405)
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return json({ success: false, message: 'Invalid JSON body' }, 400)
  }

  const { action, meter_serial, api_key } = payload
  if (typeof action !== 'string' || typeof meter_serial !== 'string' || typeof api_key !== 'string') {
    return json({ success: false, message: 'action, meter_serial, and api_key are required' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: meter, error: meterError } = await supabase
    .from('smart_meters')
    .select('id, status')
    .eq('meter_serial', meter_serial)
    .eq('device_api_key', api_key)
    .maybeSingle()

  if (meterError) return json({ success: false, message: meterError.message }, 500)
  if (!meter) return json({ success: false, message: 'Unknown meter or invalid API key' }, 401)

  switch (action) {
    case 'reading': {
      const flowRate = Number(payload.flow_rate)
      const waterUsage = Number(payload.water_usage)
      if (Number.isNaN(flowRate) || Number.isNaN(waterUsage)) {
        return json({ success: false, message: 'flow_rate and water_usage must be numbers' }, 400)
      }

      const { error: insertError } = await supabase.from('meter_readings').insert({
        meter_id: meter.id,
        flow_rate: flowRate,
        water_usage: waterUsage,
        voltage: payload.voltage != null ? Number(payload.voltage) : null,
        temperature: payload.temperature != null ? Number(payload.temperature) : null,
        pressure: payload.pressure != null ? Number(payload.pressure) : null,
        signal_strength: payload.wifi_signal != null ? Number(payload.wifi_signal) : null,
      })
      if (insertError) return json({ success: false, message: insertError.message }, 500)

      const { error: updateError } = await supabase
        .from('smart_meters')
        .update({
          last_seen: new Date().toISOString(),
          status: typeof payload.status === 'string' ? payload.status.toLowerCase() : 'online',
          battery_level: payload.battery != null ? Number(payload.battery) : undefined,
          wifi_signal: payload.wifi_signal != null ? Number(payload.wifi_signal) : undefined,
        })
        .eq('id', meter.id)
      if (updateError) return json({ success: false, message: updateError.message }, 500)

      return json({ success: true, message: 'Reading saved' })
    }

    case 'heartbeat': {
      const { error: updateError } = await supabase
        .from('smart_meters')
        .update({
          last_seen: new Date().toISOString(),
          status: 'online',
          battery_level: payload.battery != null ? Number(payload.battery) : undefined,
          wifi_signal: payload.wifi_signal != null ? Number(payload.wifi_signal) : undefined,
          firmware_version: typeof payload.firmware_version === 'string' ? payload.firmware_version : undefined,
        })
        .eq('id', meter.id)
      if (updateError) return json({ success: false, message: updateError.message }, 500)

      return json({ success: true, message: 'Heartbeat received' })
    }

    case 'get_commands': {
      const { data: commands, error: commandsError } = await supabase
        .from('valve_commands')
        .select('id, command')
        .eq('meter_id', meter.id)
        .eq('status', 'pending')
        .order('issued_at', { ascending: true })
      if (commandsError) return json({ success: false, message: commandsError.message }, 500)

      return json({ success: true, commands })
    }

    case 'ack_command': {
      const commandId = payload.command_id
      const commandStatus = payload.status
      if (typeof commandId !== 'string' || typeof commandStatus !== 'string') {
        return json({ success: false, message: 'command_id and status are required' }, 400)
      }

      const { error: ackError } = await supabase
        .from('valve_commands')
        .update({ status: commandStatus, executed_at: new Date().toISOString() })
        .eq('id', commandId)
        .eq('meter_id', meter.id)
      if (ackError) return json({ success: false, message: ackError.message }, 500)

      return json({ success: true, message: 'Command acknowledged' })
    }

    default:
      return json({ success: false, message: `Unknown action: ${action}` }, 400)
  }
})
