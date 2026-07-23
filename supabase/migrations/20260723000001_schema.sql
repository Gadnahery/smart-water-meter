-- SafeWater Smart Water Meter System
-- Phase 1 schema: profiles, customers, smart_meters, readings/usage, notifications,
-- alerts, valve_commands, device_logs, maintenance_logs, audit_logs, system_settings.
-- Billing (bills/payments) intentionally deferred to a later phase.

create extension if not exists "pgcrypto";

-- ---------- enums ----------

create type public.profile_role as enum ('admin', 'customer');
create type public.account_status as enum ('active', 'suspended', 'inactive');
create type public.meter_status as enum ('online', 'offline', 'maintenance', 'disabled', 'fault');
create type public.notification_type as enum ('general', 'bill', 'leak', 'usage', 'maintenance', 'emergency');
create type public.alert_type as enum ('leak', 'tampering', 'offline', 'high_usage', 'low_battery', 'valve_failure', 'communication_lost');
create type public.alert_severity as enum ('low', 'medium', 'high', 'critical');
create type public.alert_status as enum ('active', 'acknowledged', 'resolved');
create type public.valve_command_type as enum ('OPEN', 'CLOSE', 'RESET', 'RESTART', 'CALIBRATE', 'UPDATE');
create type public.valve_command_status as enum ('pending', 'sent', 'executed', 'failed');
create type public.log_level as enum ('INFO', 'WARNING', 'ERROR', 'DEBUG');

-- ---------- helper: updated_at trigger ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid not null unique references auth.users (id) on delete cascade,
  role public.profile_role not null default 'customer',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- customers ----------

create sequence public.customer_number_seq start 1;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  customer_number text not null unique default ('CUS-' || lpad(nextval('public.customer_number_seq')::text, 6, '0')),
  national_id text,
  address text,
  meter_id uuid, -- primary/default meter, FK added after smart_meters exists
  account_status public.account_status not null default 'active',
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_profile_id_idx on public.customers (profile_id);
create index customers_customer_number_idx on public.customers (customer_number);
create index customers_account_status_idx on public.customers (account_status);

create trigger set_updated_at before update on public.customers
  for each row execute function public.set_updated_at();

-- ---------- smart_meters ----------

create table public.smart_meters (
  id uuid primary key default gen_random_uuid(),
  meter_serial text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  firmware_version text,
  installation_date date,
  status public.meter_status not null default 'offline',
  battery_level smallint check (battery_level between 0 and 100),
  wifi_signal integer,
  last_seen timestamptz,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index smart_meters_meter_serial_idx on public.smart_meters (meter_serial);
create index smart_meters_customer_id_idx on public.smart_meters (customer_id);
create index smart_meters_status_idx on public.smart_meters (status);

create trigger set_updated_at before update on public.smart_meters
  for each row execute function public.set_updated_at();

alter table public.customers
  add constraint customers_meter_id_fkey foreign key (meter_id) references public.smart_meters (id) on delete set null;

-- ---------- meter_readings ----------

create table public.meter_readings (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  flow_rate numeric(10, 3),
  water_usage numeric(12, 3),
  voltage numeric(6, 2),
  temperature numeric(6, 2),
  pressure numeric(8, 2),
  signal_strength integer,
  reading_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index meter_readings_meter_id_idx on public.meter_readings (meter_id);
create index meter_readings_reading_time_idx on public.meter_readings (reading_time desc);

-- ---------- daily_usage ----------

create table public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  date date not null,
  consumption numeric(12, 3) not null default 0,
  estimated_cost numeric(12, 2),
  created_at timestamptz not null default now(),
  unique (meter_id, date)
);

create index daily_usage_meter_id_idx on public.daily_usage (meter_id);
create index daily_usage_date_idx on public.daily_usage (date desc);

-- ---------- monthly_usage ----------

create table public.monthly_usage (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  month smallint not null check (month between 1 and 12),
  year smallint not null,
  total_consumption numeric(12, 3) not null default 0,
  average_daily numeric(12, 3),
  estimated_bill numeric(12, 2),
  created_at timestamptz not null default now(),
  unique (meter_id, month, year)
);

create index monthly_usage_meter_id_idx on public.monthly_usage (meter_id);
create index monthly_usage_year_month_idx on public.monthly_usage (year desc, month desc);

-- ---------- notifications ----------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null default 'general',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_customer_id_idx on public.notifications (customer_id);
create index notifications_is_read_idx on public.notifications (is_read);

-- ---------- alerts ----------

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  alert_type public.alert_type not null,
  severity public.alert_severity not null default 'medium',
  description text,
  status public.alert_status not null default 'active',
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index alerts_meter_id_idx on public.alerts (meter_id);
create index alerts_status_idx on public.alerts (status);

-- ---------- valve_commands ----------

create table public.valve_commands (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  command public.valve_command_type not null,
  status public.valve_command_status not null default 'pending',
  issued_by uuid references public.profiles (id) on delete set null,
  issued_at timestamptz not null default now(),
  executed_at timestamptz
);

create index valve_commands_meter_id_idx on public.valve_commands (meter_id);
create index valve_commands_status_idx on public.valve_commands (status);

-- ---------- device_logs ----------

create table public.device_logs (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  log_level public.log_level not null default 'INFO',
  message text not null,
  created_at timestamptz not null default now()
);

create index device_logs_meter_id_idx on public.device_logs (meter_id);
create index device_logs_log_level_idx on public.device_logs (log_level);

-- ---------- maintenance_logs ----------

create table public.maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  technician text,
  description text,
  maintenance_date date not null default current_date,
  next_service date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index maintenance_logs_meter_id_idx on public.maintenance_logs (meter_id);

create trigger set_updated_at before update on public.maintenance_logs
  for each row execute function public.set_updated_at();

-- ---------- audit_logs ----------

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  ip_address text,
  created_at timestamptz not null default now()
);

create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_table_name_idx on public.audit_logs (table_name);

-- ---------- system_settings ----------

create table public.system_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'SafeWater',
  water_tariff numeric(10, 4) not null default 0,
  currency text not null default 'USD',
  billing_cycle text not null default 'monthly',
  alert_threshold numeric(10, 3),
  support_email text,
  support_phone text,
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();

insert into public.system_settings (company_name) values ('SafeWater');
