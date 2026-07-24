-- Auto-create a 'leak' alert when a meter reports sustained high flow rate.
-- Matches master spec section 39 ("Create alert after leak detection").
-- security definer so this fires regardless of who/what inserted the
-- reading (ESP32 devices and customers can't write to alerts directly per RLS).

create or replace function public.check_leak_alert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_threshold constant numeric := 20;
  v_sustained_count integer;
  v_existing_active_id uuid;
begin
  if new.flow_rate is null or new.flow_rate <= v_threshold then
    return new;
  end if;

  select count(*) into v_sustained_count
  from (
    select flow_rate
    from public.meter_readings
    where meter_id = new.meter_id
    order by reading_time desc
    limit 3
  ) recent
  where recent.flow_rate > v_threshold;

  if v_sustained_count < 3 then
    return new;
  end if;

  select id into v_existing_active_id
  from public.alerts
  where meter_id = new.meter_id and alert_type = 'leak' and status = 'active'
  limit 1;

  if v_existing_active_id is null then
    insert into public.alerts (meter_id, alert_type, severity, description, status)
    values (
      new.meter_id,
      'leak',
      'high',
      format('Sustained high flow rate detected: %s L/min over the last 3 readings', round(new.flow_rate::numeric, 1)),
      'active'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists meter_readings_leak_check on public.meter_readings;

create trigger meter_readings_leak_check
  after insert on public.meter_readings
  for each row execute function public.check_leak_alert();
