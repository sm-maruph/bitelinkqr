begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists app;
create schema if not exists billing;

create or replace function app.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Authentication identities. Passwords belong in the auth provider, never here.
create table app.users (
  id uuid primary key default gen_random_uuid(),
  auth_provider text not null default 'local',
  auth_subject text not null,
  email citext,
  phone text,
  display_name text not null,
  avatar_url text,
  locale text not null default 'en-BD',
  timezone text not null default 'Asia/Dhaka',
  is_platform_admin boolean not null default false,
  status text not null default 'active' check (status in ('invited','active','suspended','deleted')),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_provider, auth_subject),
  unique (email)
);

-- A tenant is the billable customer/account. One tenant may own many brands.
create table app.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  legal_name text,
  billing_email citext,
  phone text,
  country_code char(2) not null default 'BD',
  currency char(3) not null default 'BDT',
  timezone text not null default 'Asia/Dhaka',
  status text not null default 'trialing' check (status in ('trialing','active','past_due','suspended','cancelled')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table app.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  user_id uuid not null references app.users(id) on delete cascade,
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  invited_by uuid references app.users(id),
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id),
  unique (tenant_id, id)
);

create table app.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references app.tenants(id) on delete cascade,
  code citext not null,
  name text not null,
  description text,
  scope text not null check (scope in ('tenant','restaurant','outlet')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique nulls not distinct (tenant_id, code),
  unique (tenant_id, id)
);

create table app.permissions (
  code citext primary key,
  description text not null
);

create table app.role_permissions (
  role_id uuid not null references app.roles(id) on delete cascade,
  permission_code citext not null references app.permissions(code) on delete cascade,
  primary key (role_id, permission_code)
);

create table app.restaurants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  name text not null,
  slug citext not null,
  logo_url text,
  status text not null default 'active' check (status in ('draft','active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug),
  unique (tenant_id, id)
);

create table app.outlets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  name text not null,
  slug citext not null,
  phone text,
  email citext,
  address_line text,
  city text not null default 'Dhaka',
  timezone text not null default 'Asia/Dhaka',
  opening_hours jsonb not null default '{}'::jsonb,
  service_charge_rate numeric(6,5) not null default 0 check (service_charge_rate between 0 and 1),
  tax_rate numeric(6,5) not null default 0 check (tax_rate between 0 and 1),
  status text not null default 'active' check (status in ('setup','active','paused','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, slug),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade
);

create table app.membership_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  membership_id uuid not null,
  role_id uuid not null,
  restaurant_id uuid,
  outlet_id uuid,
  granted_by uuid references app.users(id),
  created_at timestamptz not null default now(),
  unique nulls not distinct (membership_id, role_id, restaurant_id, outlet_id),
  foreign key (tenant_id, membership_id) references app.tenant_memberships(tenant_id, id) on delete cascade,
  foreign key (tenant_id, role_id) references app.roles(tenant_id, id) on delete cascade,
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade,
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id) on delete cascade,
  check (outlet_id is null or restaurant_id is not null)
);

-- Subscription catalog and tenant billing state.
create table billing.plans (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  name text not null,
  description text,
  currency char(3) not null default 'BDT',
  monthly_price numeric(12,2) not null default 0 check (monthly_price >= 0),
  yearly_price numeric(12,2) check (yearly_price >= 0),
  trial_days integer not null default 0 check (trial_days >= 0),
  is_public boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table billing.plan_entitlements (
  plan_id uuid not null references billing.plans(id) on delete cascade,
  feature_key citext not null,
  enabled boolean not null default true,
  limit_value bigint,
  config jsonb not null default '{}'::jsonb,
  primary key (plan_id, feature_key),
  check (limit_value is null or limit_value >= 0)
);

create table billing.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  plan_id uuid not null references billing.plans(id),
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null check (status in ('trialing','active','past_due','paused','cancelled','expired')),
  billing_interval text not null default 'monthly' check (billing_interval in ('monthly','yearly','custom')),
  seats integer not null default 1 check (seats > 0),
  trial_ends_at timestamptz,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  check (current_period_end > current_period_start)
);

create unique index subscriptions_one_current_per_tenant
  on billing.subscriptions (tenant_id)
  where status in ('trialing','active','past_due','paused');

create unique index subscriptions_provider_reference_unique
  on billing.subscriptions (provider, provider_subscription_id)
  where provider_subscription_id is not null;

create table billing.subscription_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  subscription_id uuid not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  foreign key (tenant_id, subscription_id) references billing.subscriptions(tenant_id, id) on delete cascade
);

-- Content is independent of visual templates.
create table app.restaurant_profiles (
  restaurant_id uuid primary key,
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  tagline text,
  description text,
  cover_image_url text,
  phone text,
  email citext,
  chef_name text,
  social_links jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade
);

create table app.restaurant_themes (
  restaurant_id uuid primary key,
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  template_key citext not null default 'editorial',
  theme_key citext not null default 'coral',
  design_settings jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade
);

create table app.menu_categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  name text not null,
  slug citext not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, slug),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade
);

create table app.menu_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  category_id uuid not null,
  name text not null,
  slug citext not null,
  description text,
  image_url text,
  base_price numeric(12,2) not null check (base_price >= 0),
  preparation_minutes integer not null default 20 check (preparation_minutes between 0 and 1440),
  availability text not null default 'available' check (availability in ('available','sold_out','unavailable')),
  is_featured boolean not null default false,
  tags text[] not null default '{}',
  dietary jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, restaurant_id, slug),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade,
  foreign key (tenant_id, category_id) references app.menu_categories(tenant_id, id) on delete restrict
);

create table app.outlet_menu_items (
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  outlet_id uuid not null,
  menu_item_id uuid not null,
  price_override numeric(12,2) check (price_override >= 0),
  availability text check (availability in ('available','sold_out','unavailable')),
  updated_at timestamptz not null default now(),
  primary key (outlet_id, menu_item_id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id) on delete cascade,
  foreign key (tenant_id, menu_item_id) references app.menu_items(tenant_id, id) on delete cascade
);

create table app.offers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid,
  name text not null,
  description text,
  offer_type text not null check (offer_type in ('percentage','fixed','combo','time_based','day_based')),
  discount_value numeric(12,2) check (discount_value >= 0),
  rules jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade,
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id) on delete cascade,
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table app.dining_tables (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid not null,
  table_number text not null,
  qr_token_hash text not null,
  capacity integer check (capacity > 0),
  status text not null default 'available' check (status in ('available','ordering','preparing','served','payment_pending','disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, outlet_id, table_number),
  unique (qr_token_hash),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id) on delete cascade,
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id) on delete cascade
);

create table app.table_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid not null,
  table_id uuid not null,
  public_token_hash text not null unique,
  status text not null default 'active' check (status in ('active','bill_requested','payment_pending','completed','cancelled')),
  guest_count integer check (guest_count > 0),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id),
  foreign key (tenant_id, table_id) references app.dining_tables(tenant_id, id),
  check (closed_at is null or closed_at >= opened_at)
);

create unique index table_sessions_one_active_per_table
  on app.table_sessions (table_id)
  where status in ('active','bill_requested','payment_pending');

create table app.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid not null,
  table_id uuid not null,
  session_id uuid not null,
  order_number bigint not null,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','serving','served','completed','cancelled','rejected')),
  currency char(3) not null default 'BDT',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_total numeric(12,2) not null default 0 check (discount_total >= 0),
  tax_total numeric(12,2) not null default 0 check (tax_total >= 0),
  service_charge_total numeric(12,2) not null default 0 check (service_charge_total >= 0),
  grand_total numeric(12,2) not null check (grand_total >= 0),
  notes text,
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  completed_at timestamptz,
  created_by uuid references app.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, outlet_id, order_number),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id),
  foreign key (tenant_id, table_id) references app.dining_tables(tenant_id, id),
  foreign key (tenant_id, session_id) references app.table_sessions(tenant_id, id),
  check (grand_total = subtotal - discount_total + tax_total + service_charge_total)
);

create table app.order_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  order_id uuid not null,
  menu_item_id uuid,
  item_name_snapshot text not null,
  description_snapshot text,
  unit_price_snapshot numeric(12,2) not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  discount_snapshot numeric(12,2) not null default 0 check (discount_snapshot >= 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  options_snapshot jsonb not null default '[]'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, order_id) references app.orders(tenant_id, id) on delete cascade,
  foreign key (tenant_id, menu_item_id) references app.menu_items(tenant_id, id) on delete restrict,
  check (line_total = (unit_price_snapshot * quantity) - discount_snapshot)
);

create table app.order_status_history (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  order_id uuid not null,
  from_status text,
  to_status text not null,
  changed_by uuid references app.users(id),
  note text,
  changed_at timestamptz not null default now(),
  foreign key (tenant_id, order_id) references app.orders(tenant_id, id) on delete cascade
);

create table app.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid not null,
  session_id uuid not null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null default 'BDT',
  method text not null check (method in ('bangla_qr','cash','card','other')),
  status text not null default 'pending' check (status in ('pending','submitted','verified','rejected','refunded')),
  provider text,
  external_reference text,
  customer_reference text,
  submitted_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references app.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id),
  foreign key (tenant_id, session_id) references app.table_sessions(tenant_id, id)
);

create table app.payment_events (
  id bigint generated always as identity primary key,
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  payment_id uuid not null,
  event_type text not null,
  status text not null,
  actor_user_id uuid references app.users(id),
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  foreign key (tenant_id, payment_id) references app.payments(tenant_id, id) on delete cascade
);

create table app.service_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  restaurant_id uuid not null,
  outlet_id uuid not null,
  table_id uuid not null,
  session_id uuid not null,
  request_type text not null check (request_type in ('call_waiter','request_bill','request_water','request_assistance')),
  status text not null default 'open' check (status in ('open','acknowledged','resolved','cancelled')),
  resolved_by uuid references app.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id),
  foreign key (tenant_id, table_id) references app.dining_tables(tenant_id, id),
  foreign key (tenant_id, session_id) references app.table_sessions(tenant_id, id)
);

create table app.audit_logs (
  id bigint generated always as identity primary key,
  tenant_id uuid references app.tenants(id) on delete cascade,
  actor_user_id uuid references app.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  occurred_at timestamptz not null default now()
);

create table app.idempotency_keys (
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  idempotency_key text not null,
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, idempotency_key)
);

-- High-value tenant and operational indexes.
create index tenant_memberships_user_idx on app.tenant_memberships (user_id, status);
create index membership_roles_scope_idx on app.membership_roles (tenant_id, restaurant_id, outlet_id);
create index outlets_restaurant_idx on app.outlets (tenant_id, restaurant_id, status);
create index menu_categories_order_idx on app.menu_categories (tenant_id, restaurant_id, is_active, sort_order);
create index menu_items_browse_idx on app.menu_items (tenant_id, restaurant_id, category_id, availability, sort_order);
create index offers_active_idx on app.offers (tenant_id, restaurant_id, outlet_id, starts_at, ends_at) where is_active;
create index tables_outlet_status_idx on app.dining_tables (tenant_id, outlet_id, status);
create index sessions_outlet_status_idx on app.table_sessions (tenant_id, outlet_id, status, opened_at desc);
create index orders_live_board_idx on app.orders (tenant_id, outlet_id, status, placed_at desc);
create index orders_session_idx on app.orders (tenant_id, session_id, placed_at);
create index order_items_order_idx on app.order_items (tenant_id, order_id);
create index payments_review_idx on app.payments (tenant_id, outlet_id, status, created_at desc);
create index requests_open_idx on app.service_requests (tenant_id, outlet_id, status, created_at) where status in ('open','acknowledged');
create index audit_logs_tenant_time_idx on app.audit_logs (tenant_id, occurred_at desc);
create index subscription_events_tenant_idx on billing.subscription_events (tenant_id, occurred_at desc);

-- Generic updated_at triggers.
do $$
declare t text;
begin
  foreach t in array array[
    'users','tenants','tenant_memberships','restaurants','outlets','restaurant_profiles',
    'restaurant_themes','menu_categories','menu_items','offers','dining_tables','orders','payments'
  ] loop
    execute format('create trigger %I_updated_at before update on app.%I for each row execute function app.set_updated_at()', t, t);
  end loop;
end;
$$;

create trigger plans_updated_at before update on billing.plans for each row execute function app.set_updated_at();
create trigger subscriptions_updated_at before update on billing.subscriptions for each row execute function app.set_updated_at();

commit;
