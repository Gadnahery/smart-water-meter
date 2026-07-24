-- Generic audit-log trigger for admin-mutated tables (spec section 39:
-- "Write audit log after admin action"). security definer since audit_logs
-- has no client-facing insert policy - only triggers may write to it.

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_record_id uuid;
begin
  v_user_id := public.current_profile_id();

  if TG_OP = 'DELETE' then
    v_record_id := OLD.id;
  else
    v_record_id := NEW.id;
  end if;

  insert into public.audit_logs (user_id, action, table_name, record_id)
  values (v_user_id, TG_OP, TG_TABLE_NAME, v_record_id);

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

drop trigger if exists audit_customers on public.customers;
create trigger audit_customers
  after insert or update or delete on public.customers
  for each row execute function public.log_audit_event();

drop trigger if exists audit_smart_meters on public.smart_meters;
create trigger audit_smart_meters
  after insert or update or delete on public.smart_meters
  for each row execute function public.log_audit_event();

drop trigger if exists audit_bills on public.bills;
create trigger audit_bills
  after insert or update or delete on public.bills
  for each row execute function public.log_audit_event();

drop trigger if exists audit_valve_commands on public.valve_commands;
create trigger audit_valve_commands
  after insert or update on public.valve_commands
  for each row execute function public.log_audit_event();
