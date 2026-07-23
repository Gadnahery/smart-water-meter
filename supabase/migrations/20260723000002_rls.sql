-- Row Level Security: customer / admin roles.
-- ESP32 devices talk to the backend through a service-role Edge Function
-- (see spec section 43/47/48), so device writes bypass RLS entirely and no
-- "device" policies are defined here.

-- ---------- helper functions ----------

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.customers where profile_id = public.current_profile_id();
$$;

-- ---------- enable RLS ----------

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.smart_meters enable row level security;
alter table public.meter_readings enable row level security;
alter table public.daily_usage enable row level security;
alter table public.monthly_usage enable row level security;
alter table public.notifications enable row level security;
alter table public.alerts enable row level security;
alter table public.valve_commands enable row level security;
alter table public.device_logs enable row level security;
alter table public.maintenance_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.system_settings enable row level security;

-- ---------- profiles ----------

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth_id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth_id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete using (public.is_admin());

-- ---------- customers ----------

create policy "customers_select_own_or_admin" on public.customers
  for select using (profile_id = public.current_profile_id() or public.is_admin());

create policy "customers_insert_admin" on public.customers
  for insert with check (public.is_admin());

create policy "customers_update_own_or_admin" on public.customers
  for update using (profile_id = public.current_profile_id() or public.is_admin());

create policy "customers_delete_admin" on public.customers
  for delete using (public.is_admin());

-- ---------- smart_meters ----------

create policy "smart_meters_select_own_or_admin" on public.smart_meters
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "smart_meters_insert_admin" on public.smart_meters
  for insert with check (public.is_admin());

create policy "smart_meters_update_admin" on public.smart_meters
  for update using (public.is_admin());

create policy "smart_meters_delete_admin" on public.smart_meters
  for delete using (public.is_admin());

-- ---------- meter_readings ----------

create policy "meter_readings_select_own_or_admin" on public.meter_readings
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "meter_readings_insert_admin" on public.meter_readings
  for insert with check (public.is_admin());

create policy "meter_readings_update_admin" on public.meter_readings
  for update using (public.is_admin());

create policy "meter_readings_delete_admin" on public.meter_readings
  for delete using (public.is_admin());

-- ---------- daily_usage ----------

create policy "daily_usage_select_own_or_admin" on public.daily_usage
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "daily_usage_write_admin" on public.daily_usage
  for insert with check (public.is_admin());

create policy "daily_usage_update_admin" on public.daily_usage
  for update using (public.is_admin());

-- ---------- monthly_usage ----------

create policy "monthly_usage_select_own_or_admin" on public.monthly_usage
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "monthly_usage_write_admin" on public.monthly_usage
  for insert with check (public.is_admin());

create policy "monthly_usage_update_admin" on public.monthly_usage
  for update using (public.is_admin());

-- ---------- notifications ----------

create policy "notifications_select_own_or_admin" on public.notifications
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "notifications_insert_admin" on public.notifications
  for insert with check (public.is_admin());

create policy "notifications_update_own_or_admin" on public.notifications
  for update using (customer_id = public.current_customer_id() or public.is_admin());

create policy "notifications_delete_admin" on public.notifications
  for delete using (public.is_admin());

-- ---------- alerts ----------

create policy "alerts_select_own_or_admin" on public.alerts
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "alerts_write_admin" on public.alerts
  for insert with check (public.is_admin());

create policy "alerts_update_admin" on public.alerts
  for update using (public.is_admin());

create policy "alerts_delete_admin" on public.alerts
  for delete using (public.is_admin());

-- ---------- valve_commands ----------

create policy "valve_commands_select_own_or_admin" on public.valve_commands
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "valve_commands_insert_admin" on public.valve_commands
  for insert with check (public.is_admin());

create policy "valve_commands_update_admin" on public.valve_commands
  for update using (public.is_admin());

-- ---------- device_logs (admin/internal only) ----------

create policy "device_logs_select_admin" on public.device_logs
  for select using (public.is_admin());

-- ---------- maintenance_logs ----------

create policy "maintenance_logs_select_own_or_admin" on public.maintenance_logs
  for select using (
    public.is_admin()
    or meter_id in (select id from public.smart_meters where customer_id = public.current_customer_id())
  );

create policy "maintenance_logs_write_admin" on public.maintenance_logs
  for insert with check (public.is_admin());

create policy "maintenance_logs_update_admin" on public.maintenance_logs
  for update using (public.is_admin());

create policy "maintenance_logs_delete_admin" on public.maintenance_logs
  for delete using (public.is_admin());

-- ---------- audit_logs (admin only) ----------

create policy "audit_logs_select_admin" on public.audit_logs
  for select using (public.is_admin());

-- ---------- system_settings ----------

create policy "system_settings_select_authenticated" on public.system_settings
  for select using (auth.role() = 'authenticated');

create policy "system_settings_update_admin" on public.system_settings
  for update using (public.is_admin());
