-- Auto-provision a profiles + customers row whenever a new Supabase Auth
-- user is created (i.e. right after Register). Role is always forced to
-- 'customer' here regardless of client-supplied metadata -- admin accounts
-- are promoted manually, never through public signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_profile_id uuid;
begin
  insert into public.profiles (auth_id, role, first_name, last_name, email, phone)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  returning id into new_profile_id;

  insert into public.customers (profile_id)
  values (new_profile_id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
