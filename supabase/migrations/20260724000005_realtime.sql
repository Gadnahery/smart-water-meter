-- Enable Realtime (spec sections 38, 56) for tables the UI should reflect
-- live without a manual refresh: meter status/readings, alerts,
-- notifications, and valve command execution.

alter publication supabase_realtime add table public.smart_meters;
alter publication supabase_realtime add table public.meter_readings;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.valve_commands;
