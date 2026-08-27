-- SafeWater Smart Water Meter System: Water Tokens & Active Water Sessions
-- Phase 2 migration: Adds first-class prepaid water tokens and active water sessions
-- connected to valve control, realtime consumption, and automatic shutoff.

-- ---------- enums ----------
create type public.token_status as enum ('pending', 'paid', 'ready', 'active', 'completed', 'expired', 'cancelled');
create type public.session_status as enum ('pending', 'opening', 'active', 'closing', 'completed', 'failed');

-- ---------- water_tokens ----------
create table public.water_tokens (
  id uuid primary key default gen_random_uuid(),
  token_code text not null unique,
  customer_id uuid not null references public.customers (id) on delete cascade,
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  allocated_litres numeric(12, 3) not null check (allocated_litres > 0),
  remaining_litres numeric(12, 3) not null check (remaining_litres >= 0),
  consumed_litres numeric(12, 3) not null default 0 check (consumed_litres >= 0),
  amount numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status public.token_status not null default 'ready',
  payment_reference text,
  payment_method text not null default 'demo_payment',
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index water_tokens_customer_id_idx on public.water_tokens (customer_id);
create index water_tokens_meter_id_idx on public.water_tokens (meter_id);
create index water_tokens_status_idx on public.water_tokens (status);
create index water_tokens_token_code_idx on public.water_tokens (token_code);

create trigger set_updated_at before update on public.water_tokens
  for each row execute function public.set_updated_at();

-- ---------- water_sessions ----------
create table public.water_sessions (
  id uuid primary key default gen_random_uuid(),
  token_id uuid not null references public.water_tokens (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  meter_id uuid not null references public.smart_meters (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  starting_reading numeric(12, 3) not null default 0,
  ending_reading numeric(12, 3),
  allocated_litres numeric(12, 3) not null,
  consumed_litres numeric(12, 3) not null default 0,
  status public.session_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index water_sessions_customer_id_idx on public.water_sessions (customer_id);
create index water_sessions_meter_id_idx on public.water_sessions (meter_id);
create index water_sessions_token_id_idx on public.water_sessions (token_id);
create index water_sessions_status_idx on public.water_sessions (status);

create trigger set_updated_at before update on public.water_sessions
  for each row execute function public.set_updated_at();

-- ---------- RLS Policies ----------
alter table public.water_tokens enable row level security;
alter table public.water_sessions enable row level security;

create policy "water_tokens_select_own_or_admin" on public.water_tokens
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_tokens_insert_own_or_admin" on public.water_tokens
  for insert with check (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_tokens_update_own_or_admin" on public.water_tokens
  for update using (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_tokens_delete_admin" on public.water_tokens
  for delete using (public.is_admin());

create policy "water_sessions_select_own_or_admin" on public.water_sessions
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_sessions_insert_own_or_admin" on public.water_sessions
  for insert with check (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_sessions_update_own_or_admin" on public.water_sessions
  for update using (customer_id = public.current_customer_id() or public.is_admin());

create policy "water_sessions_delete_admin" on public.water_sessions
  for delete using (public.is_admin());

-- ---------- Realtime Consumption & Auto-Shutoff Trigger ----------
create or replace function public.apply_reading_to_water_session()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session record;
  v_token record;
  v_prev_reading numeric;
  v_delta numeric;
  v_new_consumed numeric;
  v_new_remaining numeric;
begin
  if new.water_usage is null then
    return new;
  end if;

  -- Find active water session for this meter
  select * into v_session
  from public.water_sessions
  where meter_id = new.meter_id and status in ('active', 'opening')
  order by started_at desc
  limit 1;

  if v_session.id is null then
    return new;
  end if;

  -- Calculate delta reading
  select water_usage into v_prev_reading
  from public.meter_readings
  where meter_id = new.meter_id and id <> new.id
  order by reading_time desc
  limit 1;

  if v_prev_reading is null then
    v_delta := greatest(new.water_usage - v_session.starting_reading, 0);
  elsif new.water_usage >= v_prev_reading then
    v_delta := new.water_usage - v_prev_reading;
  else
    v_delta := greatest(new.water_usage, 0);
  end if;

  if v_delta <= 0 then
    return new;
  end if;

  -- Update water session consumed litres
  v_new_consumed := v_session.consumed_litres + v_delta;
  
  -- Fetch token
  select * into v_token from public.water_tokens where id = v_session.token_id;
  if v_token.id is not null then
    v_new_remaining := greatest(v_token.remaining_litres - v_delta, 0);

    -- Check if allocation is exhausted
    if v_new_remaining <= 0 then
      -- Mark session completed
      update public.water_sessions
      set consumed_litres = v_session.allocated_litres,
          ending_reading = new.water_usage,
          ended_at = now(),
          status = 'completed'
      where id = v_session.id;

      -- Mark token completed
      update public.water_tokens
      set remaining_litres = 0,
          consumed_litres = allocated_litres,
          completed_at = now(),
          status = 'completed'
      where id = v_token.id;

      -- Issue automatic CLOSE valve command to ESP32
      insert into public.valve_commands (meter_id, command, status)
      values (new.meter_id, 'CLOSE', 'pending');

      -- Insert notification
      insert into public.notifications (customer_id, title, message, type, is_read)
      values (
        v_session.customer_id,
        'Water session completed',
        format('Your water allocation of %s L has finished. Valve has been safely closed.', v_session.allocated_litres),
        'usage',
        false
      );
    else
      -- Update remaining on token and consumed on session
      update public.water_tokens
      set remaining_litres = v_new_remaining,
          consumed_litres = v_token.consumed_litres + v_delta
      where id = v_token.id;

      update public.water_sessions
      set consumed_litres = v_new_consumed,
          status = 'active'
      where id = v_session.id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists meter_readings_water_session_sync on public.meter_readings;
create trigger meter_readings_water_session_sync
  after insert on public.meter_readings
  for each row execute function public.apply_reading_to_water_session();

-- ---------- Realtime Publication ----------
do $$
begin
  begin
    alter publication supabase_realtime add table public.water_tokens;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.water_sessions;
  exception when duplicate_object then null;
  end;
end $$;
