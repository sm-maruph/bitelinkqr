begin;

insert into app.permissions(code, description) values
 ('orders.approve','Approve or reject newly placed orders'),('orders.cook','Accept approved orders and start cooking'),
 ('orders.ready','Mark cooked orders ready for service'),('orders.serve','Mark ready orders served'),('orders.complete','Complete served orders')
on conflict(code) do update set description=excluded.description;

update app.role_templates set permissions=permissions||array['orders.approve']::public.citext[] where code in ('owner','restaurant_manager','outlet_manager','order_staff') and not permissions @> array['orders.approve']::public.citext[];
update app.role_templates set permissions=permissions||array['orders.cook','orders.ready']::public.citext[] where code in ('owner','restaurant_manager','outlet_manager','kitchen_staff') and not permissions @> array['orders.cook','orders.ready']::public.citext[];
update app.role_templates set permissions=permissions||array['orders.serve','orders.complete']::public.citext[] where code in ('owner','restaurant_manager','outlet_manager','order_staff') and not permissions @> array['orders.serve','orders.complete']::public.citext[];
insert into app.role_permissions(role_id,permission_code)
select r.id,p.code from app.roles r join app.role_templates t on t.code=r.code cross join lateral unnest(t.permissions) p(code)
where p.code in ('orders.approve','orders.cook','orders.ready','orders.serve','orders.complete') on conflict do nothing;

create table app.notifications(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references app.tenants(id) on delete cascade,
 restaurant_id uuid not null, outlet_id uuid not null, user_id uuid not null references app.users(id) on delete cascade,
 order_id uuid, event_type text not null check(event_type in ('order_placed','order_approved','order_ready','order_served')),
 title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now(),
 foreign key(tenant_id,restaurant_id) references app.restaurants(tenant_id,id) on delete cascade,
 foreign key(tenant_id,outlet_id) references app.outlets(tenant_id,id) on delete cascade,
 foreign key(tenant_id,order_id) references app.orders(tenant_id,id) on delete cascade, unique(user_id,order_id,event_type));

create table app.order_reviews(
 id uuid primary key default gen_random_uuid(), tenant_id uuid not null references app.tenants(id) on delete cascade,
 restaurant_id uuid not null, outlet_id uuid not null, order_id uuid not null, rating smallint not null check(rating between 1 and 5),
 comment text check(char_length(comment)<=2000), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(order_id),
 foreign key(tenant_id,restaurant_id) references app.restaurants(tenant_id,id) on delete cascade,
 foreign key(tenant_id,outlet_id) references app.outlets(tenant_id,id) on delete cascade,
 foreign key(tenant_id,order_id) references app.orders(tenant_id,id) on delete cascade);

alter table app.notifications enable row level security; alter table app.order_reviews enable row level security;
create policy notifications_tenant_isolation on app.notifications for all using(tenant_id=app.current_tenant_id() and user_id=app.current_user_id()) with check(tenant_id=app.current_tenant_id() and app.is_tenant_member(tenant_id));
create policy order_reviews_tenant_isolation on app.order_reviews for all using(tenant_id=app.current_tenant_id() and app.is_tenant_member(tenant_id)) with check(tenant_id=app.current_tenant_id() and app.is_tenant_member(tenant_id));
grant select,insert,update,delete on app.notifications,app.order_reviews to bitelink_api;

create or replace function app.has_permission(target_tenant uuid,required_permission public.citext,target_restaurant uuid,target_outlet uuid,target_user uuid)
returns boolean language sql stable security definer set search_path=app,pg_temp as $$ select exists(
 select 1 from app.tenant_memberships m join app.membership_roles mr on mr.tenant_id=m.tenant_id and mr.membership_id=m.id
 join app.role_permissions rp on rp.role_id=mr.role_id where m.tenant_id=target_tenant and m.user_id=target_user and m.status='active'
 and rp.permission_code=required_permission and (mr.restaurant_id is null or mr.restaurant_id=target_restaurant) and (mr.outlet_id is null or mr.outlet_id=target_outlet)); $$;

create or replace function app.notify_order_staff(target_order uuid,target_permission public.citext,target_event text,target_title text)
returns void language sql security definer set search_path=app,pg_temp as $$
 insert into app.notifications(tenant_id,restaurant_id,outlet_id,user_id,order_id,event_type,title,body)
 select o.tenant_id,o.restaurant_id,o.outlet_id,m.user_id,o.id,target_event,target_title,'Order #'||o.order_number||' - Table '||t.table_number
 from app.orders o join app.dining_tables t on t.tenant_id=o.tenant_id and t.id=o.table_id join app.tenant_memberships m on m.tenant_id=o.tenant_id and m.status='active'
 where o.id=target_order and app.has_permission(o.tenant_id,target_permission,o.restaurant_id,o.outlet_id,m.user_id)
 on conflict(user_id,order_id,event_type) do nothing; $$;
grant execute on function app.has_permission(uuid,public.citext,uuid,uuid,uuid) to bitelink_api;
grant execute on function app.notify_order_staff(uuid,public.citext,text,text) to bitelink_api;
revoke all on function app.has_permission(uuid,public.citext,uuid,uuid,uuid) from public;
revoke all on function app.notify_order_staff(uuid,public.citext,text,text) from public;
commit;
