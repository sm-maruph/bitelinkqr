alter table app.payments add column if not exists order_id uuid;

do $$ begin
  alter table app.payments add constraint payments_order_fk
    foreign key (tenant_id,order_id) references app.orders(tenant_id,id) on delete restrict;
exception when duplicate_object then null; end $$;

create unique index if not exists payments_one_active_order_idx
  on app.payments(tenant_id,order_id)
  where order_id is not null and status in ('pending','submitted','verified');

create index if not exists payments_order_lookup_idx on app.payments(tenant_id,order_id,created_at desc);
