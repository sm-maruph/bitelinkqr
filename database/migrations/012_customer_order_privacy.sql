begin;

alter table app.orders add column if not exists customer_token_hash text;
create index if not exists orders_customer_history_idx
  on app.orders (tenant_id, table_id, customer_token_hash, placed_at desc)
  where customer_token_hash is not null;

commit;
