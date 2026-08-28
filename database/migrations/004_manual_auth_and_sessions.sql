begin;

-- Authentication is owned by BiteLink. Only password hashes and hashed opaque
-- tokens are stored; plaintext passwords/tokens never enter PostgreSQL.
create table app.user_credentials (
  user_id uuid primary key references app.users(id) on delete cascade,
  password_hash text not null,
  password_changed_at timestamptz not null default now(),
  failed_attempts integer not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table app.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app.users(id) on delete cascade,
  refresh_token_hash text not null unique,
  family_id uuid not null,
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  replaced_by uuid references app.auth_sessions(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table app.password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table app.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references app.tenants(id) on delete cascade,
  email public.citext not null,
  role_id uuid not null,
  restaurant_id uuid,
  outlet_id uuid,
  token_hash text not null unique,
  invited_by uuid not null references app.users(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (tenant_id, role_id) references app.roles(tenant_id, id),
  foreign key (tenant_id, restaurant_id) references app.restaurants(tenant_id, id),
  foreign key (tenant_id, outlet_id) references app.outlets(tenant_id, id),
  check (outlet_id is null or restaurant_id is not null)
);

create index auth_sessions_user_active_idx on app.auth_sessions (user_id, expires_at desc) where revoked_at is null;
create index password_reset_user_idx on app.password_reset_tokens (user_id, expires_at desc) where used_at is null;
create index staff_invitations_tenant_idx on app.staff_invitations (tenant_id, email, expires_at desc);

create trigger user_credentials_updated_at before update on app.user_credentials
for each row execute function app.set_updated_at();

alter table app.user_credentials enable row level security;
alter table app.auth_sessions enable row level security;
alter table app.password_reset_tokens enable row level security;
alter table app.staff_invitations enable row level security;

-- Tenant administrators can inspect invitations, but credential/session tables
-- remain backend-only and intentionally have no client-facing RLS policies.
create policy staff_invitations_tenant_isolation on app.staff_invitations for all
  using (tenant_id = app.current_tenant_id() and app.has_permission(tenant_id, 'staff.manage', restaurant_id, outlet_id))
  with check (tenant_id = app.current_tenant_id() and app.has_permission(tenant_id, 'staff.manage', restaurant_id, outlet_id));

grant select, insert, update, delete on app.staff_invitations to bitelink_api;

commit;
