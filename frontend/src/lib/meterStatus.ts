// A meter's `status` column in the database only ever gets pushed to
// 'online' by the ESP32 (on every reading/heartbeat) - nothing ever pushes
// it back to 'offline' when the device goes quiet, so the raw column
// alone is not trustworthy for "is this meter online right now".
//
// Instead we derive online/offline live from `last_seen`: the firmware
// heartbeats every HEARTBEAT_INTERVAL_MS (60s by default, see
// firmware/config.h) and every reading upload also refreshes last_seen.
// If we haven't heard from the device within ONLINE_THRESHOLD_MS, it's
// offline - full stop, regardless of what the stored status says.
//
// Manual statuses an admin sets by hand (maintenance, disabled, fault)
// are left alone - this only concerns the online/offline distinction.
export const ONLINE_THRESHOLD_MS = 150_000 // 2.5x the 60s heartbeat interval

export function isMeterOnline(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() <= ONLINE_THRESHOLD_MS
}

export function onlineThresholdIso(): string {
  return new Date(Date.now() - ONLINE_THRESHOLD_MS).toISOString()
}
