-- Billing & payments (mock/demo only - no real payment gateway, per spec
-- sections 28-29). Payments are recorded as 'completed' the instant a
-- customer clicks "Pay", there is no external money movement.

create type public.bill_status as enum ('pending', 'paid', 'overdue', 'cancelled');
create type public.payment_method as enum ('cash', 'bank', 'mobile_money', 'card');
create type public.payment_status as enum ('pending', 'completed', 'failed', 'refunded');

-- ---------- bills ----------

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  billing_month smallint not null check (billing_month between 1 and 12),
  billing_year smallint not null,
  consumption numeric(10, 3) not null default 0,
  amount numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  due_date date not null,
  status public.bill_status not null default 'pending',
  generated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, billing_month, billing_year)
);

create index bills_customer_id_idx on public.bills (customer_id);
create index bills_status_idx on public.bills (status);

create trigger set_updated_at before update on public.bills
  for each row execute function public.set_updated_at();

-- ---------- payments ----------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references public.bills (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete cascade,
  amount numeric(10, 2) not null,
  payment_method public.payment_method not null default 'card',
  transaction_reference text,
  payment_status public.payment_status not null default 'completed',
  paid_at timestamptz not null default now()
);

create index payments_bill_id_idx on public.payments (bill_id);
create index payments_customer_id_idx on public.payments (customer_id);

-- ---------- RLS ----------

alter table public.bills enable row level security;
alter table public.payments enable row level security;

create policy "bills_select_own_or_admin" on public.bills
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "bills_insert_admin" on public.bills
  for insert with check (public.is_admin());

create policy "bills_update_admin" on public.bills
  for update using (public.is_admin());

create policy "bills_delete_admin" on public.bills
  for delete using (public.is_admin());

create policy "payments_select_own_or_admin" on public.payments
  for select using (customer_id = public.current_customer_id() or public.is_admin());

create policy "payments_insert_own_or_admin" on public.payments
  for insert with check (customer_id = public.current_customer_id() or public.is_admin());

-- Defense in depth: even though the UI only ever lets a customer pay their
-- own bill, enforce bill.customer_id = payment.customer_id at the DB layer
-- too, since the insert RLS policy above can't see across tables.
create or replace function public.validate_payment_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bill_customer_id uuid;
begin
  select customer_id into v_bill_customer_id from public.bills where id = new.bill_id;
  if v_bill_customer_id is null or v_bill_customer_id != new.customer_id then
    raise exception 'payment customer_id does not match the bill''s customer_id';
  end if;
  return new;
end;
$$;

drop trigger if exists payments_validate_customer on public.payments;
create trigger payments_validate_customer
  before insert on public.payments
  for each row execute function public.validate_payment_customer();

-- ---------- auto-generate a bill after monthly usage lands ----------

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
  on conflict (customer_id, billing_month, billing_year) do nothing;

  return new;
end;
$$;

drop trigger if exists monthly_usage_generate_bill on public.monthly_usage;
create trigger monthly_usage_generate_bill
  after insert on public.monthly_usage
  for each row execute function public.generate_bill_after_monthly_usage();

-- ---------- mark bill paid + notify after a completed payment ----------

create or replace function public.handle_payment_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.payment_status = 'completed' then
    update public.bills set status = 'paid' where id = new.bill_id;

    insert into public.notifications (customer_id, title, message, type, is_read)
    values (
      new.customer_id,
      'Payment received',
      format('We received your payment of %s. Thank you!', new.amount),
      'bill',
      false
    );
  end if;

  return new;
end;
$$;

drop trigger if exists payments_handle_completed on public.payments;
create trigger payments_handle_completed
  after insert on public.payments
  for each row execute function public.handle_payment_completed();
