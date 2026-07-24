-- Per-device API key so ESP32 firmware can authenticate to the ingestion
-- Edge Function without a Supabase Auth user session (spec section 43).
-- The Edge Function uses the service role key to bypass RLS after
-- validating meter_serial + device_api_key match.

alter table public.smart_meters
  add column if not exists device_api_key text unique not null default encode(gen_random_bytes(16), 'hex');

create index if not exists smart_meters_device_api_key_idx on public.smart_meters (device_api_key);
