begin;

-- The API sets these transaction-local values only after verifying its JWT/session:
--   select set_config('app.user_id', '<uuid>', true);
--   select set_config('app.tenant_id', '<uuid>', true);
-- Never accept these values directly from client request fields.
create or replace function app.current_user_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create or replace function app.current_tenant_id()
returns uuid language sql stable as $$
  select nullif(current_setting('app.tenant_id', true), '')::uuid
$$;

create or replace function app.is_platform_admin()
returns boolean language sql stable security definer set search_path = app, pg_temp as $$
  select coalesce((select is_platform_admin from app.users where id = app.current_user_id()), false)
$$;

create or replace function app.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer set search_path = app, pg_temp as $$
  select app.is_platform_admin() or exists (
    select 1 from app.tenant_memberships m
    where m.tenant_id = target_tenant
      and m.user_id = app.current_user_id()
      and m.status = 'active'
  )
$$;

create or replace function app.has_permission(
  target_tenant uuid,
  permission_name public.citext,
  target_restaurant uuid default null,
  target_outlet uuid default null
)
returns boolean language sql stable security definer set search_path = app, pg_temp as $$
  select app.is_platform_admin() or exists (
    select 1
    from app.tenant_memberships m
    join app.membership_roles mr
      on mr.tenant_id = m.tenant_id and mr.membership_id = m.id
    join app.role_permissions rp on rp.role_id = mr.role_id
    where m.tenant_id = target_tenant
      and m.user_id = app.current_user_id()
      and m.status = 'active'
      and rp.permission_code = permission_name
      and (mr.restaurant_id is null or mr.restaurant_id = target_restaurant)
      and (mr.outlet_id is null or mr.outlet_id = target_outlet)
  )
$$;

insert into app.permissions (code, description) values
  ('tenant.manage', 'Manage tenant settings and billing'),
  ('restaurant.manage', 'Manage restaurant profile and theme'),
  ('outlet.manage', 'Manage outlet settings'),
  ('staff.manage', 'Invite staff and assign roles'),
  ('menu.read', 'View menu management data'),
  ('menu.write', 'Create and update categories, items and offers'),
  ('orders.read', 'View orders'),
  ('orders.write', 'Create and update order workflow'),
  ('tables.read', 'View tables and sessions'),
  ('tables.write', 'Manage tables and sessions'),
  ('payments.read', 'View payment records'),
  ('payments.verify', 'Verify or reject payments'),
  ('analytics.read', 'View restaurant analytics'),
  ('subscription.read', 'View subscription and entitlements'),
  ('subscription.manage', 'Change subscription')
on conflict do nothing;

-- Seed these role templates into each tenant during tenant provisioning.
create table if not exists app.role_templates (
  code public.citext primary key,
  name text not null,
  scope text not null check (scope in ('tenant','restaurant','outlet')),
  permissions public.citext[] not null
);

alter table app.role_templates enable row level security;

insert into app.role_templates (code, name, scope, permissions) values
  ('owner','Owner','tenant',array['tenant.manage','restaurant.manage','outlet.manage','staff.manage','menu.read','menu.write','orders.read','orders.write','tables.read','tables.write','payments.read','payments.verify','analytics.read','subscription.read','subscription.manage']::public.citext[]),
  ('manager','Restaurant manager','restaurant',array['restaurant.manage','outlet.manage','staff.manage','menu.read','menu.write','orders.read','orders.write','tables.read','tables.write','payments.read','payments.verify','analytics.read','subscription.read']::public.citext[]),
  ('outlet_manager','Outlet manager','outlet',array['outlet.manage','staff.manage','menu.read','menu.write','orders.read','orders.write','tables.read','tables.write','payments.read','payments.verify','analytics.read']::public.citext[]),
  ('order_staff','Order staff','outlet',array['menu.read','orders.read','orders.write','tables.read','payments.read']::public.citext[]),
  ('kitchen_staff','Kitchen staff','outlet',array['menu.read','orders.read','orders.write']::public.citext[]),
  ('cashier','Cashier','outlet',array['orders.read','tables.read','payments.read','payments.verify']::public.citext[]),
  ('analyst','Analyst','restaurant',array['orders.read','payments.read','analytics.read']::public.citext[])
on conflict (code) do update set name = excluded.name, scope = excluded.scope, permissions = excluded.permissions;

create or replace function app.provision_tenant_roles(target_tenant uuid)
returns void language plpgsql security definer set search_path = app, pg_temp as $$
declare template app.role_templates%rowtype;
declare new_role_id uuid;
declare permission_name public.citext;
begin
  for template in select * from app.role_templates loop
    insert into app.roles (tenant_id, code, name, scope, is_system)
    values (target_tenant, template.code, template.name, template.scope, true)
    on conflict (tenant_id, code) do update set name = excluded.name
    returning id into new_role_id;

    foreach permission_name in array template.permissions loop
      insert into app.role_permissions (role_id, permission_code)
      values (new_role_id, permission_name)
      on conflict do nothing;
    end loop;
  end loop;
end;
$$;

-- RLS is defense in depth. The API must still authorize every command.
alter table app.tenants enable row level security;
alter table app.users enable row level security;
alter table app.permissions enable row level security;
alter table app.role_permissions enable row level security;
alter table app.tenant_memberships enable row level security;
alter table app.roles enable row level security;
alter table app.membership_roles enable row level security;
alter table app.restaurants enable row level security;
alter table app.outlets enable row level security;
alter table app.restaurant_profiles enable row level security;
alter table app.restaurant_themes enable row level security;
alter table app.menu_categories enable row level security;
alter table app.menu_items enable row level security;
alter table app.outlet_menu_items enable row level security;
alter table app.offers enable row level security;
alter table app.dining_tables enable row level security;
alter table app.table_sessions enable row level security;
alter table app.orders enable row level security;
alter table app.order_items enable row level security;
alter table app.order_status_history enable row level security;
alter table app.payments enable row level security;
alter table app.payment_events enable row level security;
alter table app.service_requests enable row level security;
alter table app.audit_logs enable row level security;
alter table app.idempotency_keys enable row level security;
alter table billing.subscriptions enable row level security;
alter table billing.subscription_events enable row level security;
alter table billing.plans enable row level security;
alter table billing.plan_entitlements enable row level security;

-- Identity and global catalogs do not carry tenant_id, so they need explicit policies.
create policy users_self_select on app.users for select
  using (id = app.current_user_id() or app.is_platform_admin());
create policy users_self_update on app.users for update
  using (id = app.current_user_id() or app.is_platform_admin())
  with check (id = app.current_user_id() or app.is_platform_admin());

create policy permissions_authenticated_select on app.permissions for select
  using (app.current_user_id() is not null);
create policy role_permissions_authenticated_select on app.role_permissions for select
  using (app.current_user_id() is not null);
create policy role_templates_platform_admin_select on app.role_templates for select
  using (app.is_platform_admin());

create policy plans_authenticated_select on billing.plans for select
  using (app.current_user_id() is not null and is_active);
create policy plan_entitlements_authenticated_select on billing.plan_entitlements for select
  using (app.current_user_id() is not null);

create policy tenants_member_select on app.tenants for select
  using (app.is_tenant_member(id));
create policy tenants_owner_update on app.tenants for update
  using (app.has_permission(id, 'tenant.manage'))
  with check (app.has_permission(id, 'tenant.manage'));

-- Standard tenant isolation policy for tables carrying tenant_id.
do $$
declare relation_name text;
begin
  foreach relation_name in array array[
    'tenant_memberships','roles','membership_roles','restaurants','outlets','restaurant_profiles',
    'restaurant_themes','menu_categories','menu_items','outlet_menu_items','offers','dining_tables',
    'table_sessions','orders','order_items','order_status_history','payments','payment_events',
    'service_requests','audit_logs','idempotency_keys'
  ] loop
    execute format(
      'create policy %I_tenant_isolation on app.%I for all using (tenant_id = app.current_tenant_id() and app.is_tenant_member(tenant_id)) with check (tenant_id = app.current_tenant_id() and app.is_tenant_member(tenant_id))',
      relation_name, relation_name
    );
  end loop;
end;
$$;

create policy subscriptions_tenant_isolation on billing.subscriptions for all
  using (tenant_id = app.current_tenant_id() and app.is_tenant_member(tenant_id))
  with check (tenant_id = app.current_tenant_id() and app.has_permission(tenant_id, 'subscription.manage'));

create policy subscription_events_tenant_select on billing.subscription_events for select
  using (tenant_id = app.current_tenant_id() and app.has_permission(tenant_id, 'subscription.read'));

-- Public menu reads should go through narrowly scoped API endpoints or views,
-- not by granting anonymous access to every tenant table.
create or replace view app.public_menu_items as
select
  r.slug as restaurant_slug,
  o.slug as outlet_slug,
  c.name as category_name,
  c.sort_order as category_sort_order,
  i.id,
  i.name,
  i.slug,
  i.description,
  i.image_url,
  coalesce(omi.price_override, i.base_price) as price,
  coalesce(omi.availability, i.availability) as availability,
  i.preparation_minutes,
  i.is_featured,
  i.tags,
  i.sort_order
from app.menu_items i
join app.restaurants r on r.tenant_id = i.tenant_id and r.id = i.restaurant_id and r.status = 'active'
join app.menu_categories c on c.tenant_id = i.tenant_id and c.id = i.category_id and c.is_active
join app.outlets o on o.tenant_id = i.tenant_id and o.restaurant_id = i.restaurant_id and o.status = 'active'
left join app.outlet_menu_items omi on omi.tenant_id = i.tenant_id and omi.outlet_id = o.id and omi.menu_item_id = i.id
where i.availability <> 'unavailable';

revoke all on all tables in schema app from public;
revoke all on all tables in schema billing from public;
revoke all on all functions in schema app from public;

commit;
