begin;

create table if not exists app.outlet_order_counters (
  tenant_id uuid not null,
  outlet_id uuid not null,
  last_number bigint not null default 0,
  primary key (tenant_id,outlet_id),
  foreign key (tenant_id,outlet_id) references app.outlets(tenant_id,id) on delete cascade
);

insert into app.outlet_order_counters(tenant_id,outlet_id,last_number)
select tenant_id,outlet_id,max(order_number) from app.orders group by tenant_id,outlet_id
on conflict(tenant_id,outlet_id) do update set last_number=greatest(app.outlet_order_counters.last_number,excluded.last_number);

create or replace function app.next_order_number(target_tenant uuid,target_outlet uuid)
returns bigint language sql volatile as $$
  insert into app.outlet_order_counters(tenant_id,outlet_id,last_number)
  values(target_tenant,target_outlet,1)
  on conflict(tenant_id,outlet_id) do update set last_number=app.outlet_order_counters.last_number+1
  returning last_number;
$$;

create index if not exists orders_workspace_recent_idx on app.orders(tenant_id,restaurant_id,outlet_id,placed_at desc);
create index if not exists payments_workspace_recent_idx on app.payments(tenant_id,restaurant_id,outlet_id,created_at desc);

alter table app.outlet_order_counters enable row level security;
drop policy if exists outlet_order_counters_tenant on app.outlet_order_counters;
create policy outlet_order_counters_tenant on app.outlet_order_counters for all
using(tenant_id=app.current_tenant_id()) with check(tenant_id=app.current_tenant_id());
grant select,insert,update on app.outlet_order_counters to bitelink_api;
grant execute on function app.next_order_number(uuid,uuid) to bitelink_api;

commit;
