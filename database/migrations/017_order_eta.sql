alter table app.orders add column if not exists estimated_ready_at timestamptz;
create index if not exists orders_estimated_ready_idx on app.orders(tenant_id,outlet_id,estimated_ready_at) where status in ('confirmed','preparing');
