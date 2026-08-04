-- Real-time usage aggregation + live billing.
--
-- Root cause of "no usage data / empty charts / bills stuck at TSh 0":
-- meter_readings rows were being inserted correctly by the esp32-ingest
-- Edge Function, but NOTHING ever rolled those readings into daily_usage
-- or monthly_usage. Every chart (Home, Usage, admin Consumption, admin
-- Dashboard) and the bill-generation trigger all read from daily_usage /
-- monthly_usage, not from meter_readings directly - so they stayed empty
-- forever no matter how much data the ESP32 sent.
--
-- This migration adds the missing trigger that turns each new reading
-- into real consumption, and makes the existing bill-generation trigger
-- update live (previously it only fired once, on the very first
-- monthly_usage insert, and used ON CONFLICT DO NOTHING).

-- ============================================================
-- 1. Roll each new reading into daily_usage + monthly_usage
-- ============================================================

create or replace function public.apply_reading_to_usage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev_usage numeric;
  v_delta numeric;
  v_date date;
  v_month smallint;
  v_year smallint;
  v_day_of_month smallint;
  v_tariff numeric;
begin
  if new.water_usage is null then
    return new;
  end if;

  -- Readings carry a CUMULATIVE total (litres since the meter last
  -- booted - see firmware/flow_sensor.cpp). Find the previous reading for
  -- this same meter so we can diff and get the litres consumed *since*
  -- that reading (a handful of litres per upload, not the whole total).
  select water_usage into v_prev_usage
  from public.meter_readings
  where meter_id = new.meter_id and id <> new.id
  order by reading_time desc
  limit 1;

  if v_prev_usage is null then
    -- First reading ever seen for this meter - nothing to diff against,
    -- so the whole cumulative value is this reading's contribution.
    v_delta := greatest(new.water_usage, 0);
  elsif new.water_usage >= v_prev_usage then
    v_delta := new.water_usage - v_prev_usage;
  else
    -- Cumulative total went backwards: the device rebooted and lost its
    -- persisted running total (or was factory reset). Count the new
    -- value as fresh consumption instead of silently dropping it or
    -- going negative.
    v_delta := greatest(new.water_usage, 0);
  end if;

  if v_delta <= 0 then
    return new;
  end if;

  v_date := new.reading_time::date;
  v_month := extract(month from new.reading_time);
  v_year := extract(year from new.reading_time);
  v_day_of_month := extract(day from new.reading_time);

  select water_tariff into v_tariff from public.system_settings order by updated_at desc limit 1;
  v_tariff := coalesce(v_tariff, 0);

  insert into public.daily_usage (meter_id, date, consumption, estimated_cost)
  values (new.meter_id, v_date, v_delta, v_delta * v_tariff)
  on conflict (meter_id, date) do update
    set consumption = public.daily_usage.consumption + excluded.consumption,
        estimated_cost = (public.daily_usage.consumption + excluded.consumption) * v_tariff;

  insert into public.monthly_usage (meter_id, month, year, total_consumption, average_daily, estimated_bill)
  values (new.meter_id, v_month, v_year, v_delta, v_delta / greatest(v_day_of_month, 1), v_delta * v_tariff)
  on conflict (meter_id, month, year) do update
    set total_consumption = public.monthly_usage.total_consumption + excluded.total_consumption,
        average_daily = (public.monthly_usage.total_consumption + excluded.total_consumption) / greatest(v_day_of_month, 1),
        estimated_bill = (public.monthly_usage.total_consumption + excluded.total_consumption) * v_tariff;

  return new;
end;
$$;

drop trigger if exists meter_readings_apply_usage on public.meter_readings;

create trigger meter_readings_apply_usage
  after insert on public.meter_readings
  for each row execute function public.apply_reading_to_usage();

-- ============================================================
-- 2. Keep the current month's bill live as consumption grows
-- ============================================================
-- Previously this only ran on the very first INSERT into monthly_usage
-- and used ON CONFLICT DO NOTHING, so a bill (if it ever appeared) was
-- frozen at whatever the first row said. Now it fires on every update to
-- monthly_usage too, and keeps a 'pending' bill's numbers in sync with
-- real consumption in real time. A bill that's already paid, overdue, or
-- cancelled is never touched.

create or replace function public.generate_bill_after_monthly_usage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_tariff numeric;
  v_amount numeric(10, 2);
  v_tax numeric(10, 2);
  v_due_date date;
begin
  select customer_id into v_customer_id from public.smart_meters where id = new.meter_id;
  if v_customer_id is null then
    return new;
  end if;

  select water_tariff into v_tariff from public.system_settings order by updated_at desc limit 1;
  v_tariff := coalesce(v_tariff, 0);

  v_amount := round((new.total_consumption * v_tariff)::numeric, 2);
  v_tax := round((v_amount * 0.05)::numeric, 2);
  v_due_date := (make_date(new.year, new.month, 1) + interval '1 month' + interval '15 days')::date;

  insert into public.bills (customer_id, billing_month, billing_year, consumption, amount, tax, discount, total, due_date, status)
  values (v_customer_id, new.month, new.year, new.total_consumption, v_amount, v_tax, 0, v_amount + v_tax, v_due_date, 'pending')
  on conflict (customer_id, billing_month, billing_year) do update
    set consumption = excluded.consumption,
        amount = excluded.amount,
        tax = excluded.tax,
        total = excluded.total
    where public.bills.status = 'pending';

  return new;
end;
$$;

drop trigger if exists monthly_usage_generate_bill on public.monthly_usage;

create trigger monthly_usage_generate_bill
  after insert or update on public.monthly_usage
  for each row execute function public.generate_bill_after_monthly_usage();

-- ============================================================
-- 3. Add the new/changed tables to Realtime
-- ============================================================
-- So the Usage charts, Consumption page, admin Dashboard, and Bills pages
-- update live in the browser the instant a trigger above writes a row,
-- with no manual refresh - same mechanism already used for meter_readings
-- and smart_meters (see 20260724000005_realtime.sql).

do $$
begin
  begin
    alter publication supabase_realtime add table public.daily_usage;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.monthly_usage;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.bills;
  exception when duplicate_object then null;
  end;
end $$;
