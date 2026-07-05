
create or replace function public.tg_bootstrap_first_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
      on conflict do nothing;
  end if;
  return new;
end;
$$;

revoke execute on function public.tg_bootstrap_first_admin() from public, anon, authenticated;

create trigger bootstrap_first_admin_on_signup
  after insert on auth.users
  for each row execute function public.tg_bootstrap_first_admin();
