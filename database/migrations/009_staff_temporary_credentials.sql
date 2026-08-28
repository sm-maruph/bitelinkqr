begin;

alter table app.user_credentials
  add column if not exists must_change_password boolean not null default false;

-- Only a tenant-level staff administrator (normally the restaurant owner) may
-- create login identities and their initial credential record.
drop policy if exists users_staff_create on app.users;
create policy users_staff_create on app.users for insert
  with check (app.has_permission(app.current_tenant_id(), 'staff.manage', null, null));
drop policy if exists users_staff_team_select on app.users;
create policy users_staff_team_select on app.users for select
  using (exists(select 1 from app.tenant_memberships membership where membership.tenant_id=app.current_tenant_id() and membership.user_id=users.id)
    and app.has_permission(app.current_tenant_id(), 'staff.manage', null, null));
drop policy if exists user_credentials_staff_create on app.user_credentials;
create policy user_credentials_staff_create on app.user_credentials for insert
  with check (app.has_permission(app.current_tenant_id(), 'staff.manage', null, null));

commit;
