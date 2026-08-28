begin;

-- NOLOGIN roles are assumed by the backend inside each transaction. The database
-- connection itself remains secret and must never be exposed to the browser.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'bitelink_api') then
    create role bitelink_api nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'bitelink_public') then
    create role bitelink_public nologin nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
  end if;
end $$;

-- Allow the role executing this migration (and therefore the backend connection
-- user) to assume only these restricted roles.
do $$
begin
  execute format('grant bitelink_api to %I', current_user);
  execute format('grant bitelink_public to %I', current_user);
end $$;

grant usage on schema app, billing to bitelink_api;
grant select, insert, update, delete on all tables in schema app to bitelink_api;
grant select, insert, update, delete on all tables in schema billing to bitelink_api;
grant usage, select on all sequences in schema app, billing to bitelink_api;
grant execute on function app.current_user_id() to bitelink_api;
grant execute on function app.current_tenant_id() to bitelink_api;
grant execute on function app.is_platform_admin() to bitelink_api;
grant execute on function app.is_tenant_member(uuid) to bitelink_api;
grant execute on function app.has_permission(uuid, public.citext, uuid, uuid) to bitelink_api;

-- These owner-executed views expose only published restaurant data. Public users
-- receive no direct table privileges.
create or replace view app.public_restaurants
with (security_barrier = true) as
select r.id, r.name, r.slug, r.logo_url, o.id as outlet_id, o.name as outlet_name,
       o.slug as outlet_slug, o.address_line, o.city, o.phone as outlet_phone,
       p.tagline, p.description, p.cover_image_url, p.phone, p.email, p.chef_name,
       p.social_links, p.seo, t.template_key, t.theme_key, t.design_settings
from app.restaurants r
join app.outlets o on o.tenant_id = r.tenant_id and o.restaurant_id = r.id
left join app.restaurant_profiles p on p.tenant_id = r.tenant_id and p.restaurant_id = r.id
left join app.restaurant_themes t on t.tenant_id = r.tenant_id and t.restaurant_id = r.id
where r.status = 'active' and o.status = 'active' and t.published_at is not null;

create or replace view app.public_offers
with (security_barrier = true) as
select r.slug as restaurant_slug, o.slug as outlet_slug, f.id, f.name, f.description,
       f.offer_type, f.discount_value, f.rules, f.starts_at, f.ends_at, f.created_at
from app.offers f
join app.restaurants r on r.tenant_id = f.tenant_id and r.id = f.restaurant_id and r.status = 'active'
join app.outlets o on o.tenant_id = f.tenant_id and o.restaurant_id = r.id and o.status = 'active'
where f.is_active and (f.outlet_id is null or f.outlet_id = o.id)
  and (f.starts_at is null or f.starts_at <= now())
  and (f.ends_at is null or f.ends_at > now());

revoke all on app.public_menu_items, app.public_restaurants, app.public_offers from public;
grant usage on schema app to bitelink_public;
grant select on app.public_menu_items, app.public_restaurants, app.public_offers to bitelink_public;

commit;
