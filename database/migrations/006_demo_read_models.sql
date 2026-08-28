begin;

-- Development-only read models. Every row is restricted to tenants explicitly
-- marked {"demo": true}; production admin dashboards use authenticated APIs.
create or replace view app.public_demo_tables with (security_barrier=true) as
select r.slug restaurant_slug,o.slug outlet_slug,t.id,t.table_number,t.capacity,t.status
from app.dining_tables t join app.tenants x on x.id=t.tenant_id and x.settings @> '{"demo":true}'
join app.restaurants r on r.id=t.restaurant_id join app.outlets o on o.id=t.outlet_id;

create or replace view app.public_demo_orders with (security_barrier=true) as
select r.slug restaurant_slug,ou.slug outlet_slug,o.id,o.order_number,o.status,o.currency,
       o.subtotal,o.discount_total,o.tax_total,o.service_charge_total,o.grand_total,o.placed_at,
       t.table_number,coalesce(string_agg(oi.item_name_snapshot||' x '||oi.quantity,'; ' order by oi.created_at),'') items
from app.orders o join app.tenants x on x.id=o.tenant_id and x.settings @> '{"demo":true}'
join app.restaurants r on r.id=o.restaurant_id join app.outlets ou on ou.id=o.outlet_id
join app.dining_tables t on t.id=o.table_id left join app.order_items oi on oi.order_id=o.id
group by r.slug,ou.slug,o.id,t.table_number;

create or replace view app.public_demo_payments with (security_barrier=true) as
select r.slug restaurant_slug,o.slug outlet_slug,p.id,p.amount,p.currency,p.method,p.status,
       p.customer_reference,p.created_at,t.table_number
from app.payments p join app.tenants x on x.id=p.tenant_id and x.settings @> '{"demo":true}'
join app.restaurants r on r.id=p.restaurant_id join app.outlets o on o.id=p.outlet_id
join app.table_sessions s on s.id=p.session_id join app.dining_tables t on t.id=s.table_id;

create or replace view app.public_demo_requests with (security_barrier=true) as
select r.slug restaurant_slug,o.slug outlet_slug,q.id,q.request_type,q.status,q.created_at,t.table_number
from app.service_requests q join app.tenants x on x.id=q.tenant_id and x.settings @> '{"demo":true}'
join app.restaurants r on r.id=q.restaurant_id join app.outlets o on o.id=q.outlet_id
join app.dining_tables t on t.id=q.table_id;

create or replace view app.public_demo_team with (security_barrier=true) as
select x.slug tenant_slug,u.id,u.display_name,u.email,m.status,
       coalesce(string_agg(distinct ro.name,', '),'Member') roles
from app.tenant_memberships m join app.tenants x on x.id=m.tenant_id and x.settings @> '{"demo":true}'
join app.users u on u.id=m.user_id left join app.membership_roles mr on mr.membership_id=m.id
left join app.roles ro on ro.id=mr.role_id group by x.slug,u.id,m.status;

revoke all on app.public_demo_tables,app.public_demo_orders,app.public_demo_payments,app.public_demo_requests,app.public_demo_team from public;
grant select on app.public_demo_tables,app.public_demo_orders,app.public_demo_payments,app.public_demo_requests,app.public_demo_team to bitelink_public;

commit;
