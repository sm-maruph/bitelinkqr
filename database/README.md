# BiteLink PostgreSQL database

This design targets PostgreSQL 16+ with a Node/Express API. It uses one shared database and shared schema, with `tenant_id` on every tenant-owned row.

## Migration order

1. `migrations/001_initial_schema.sql`
2. `migrations/002_security_and_rbac.sql`
3. `migrations/003_api_runtime_roles.sql`
4. `migrations/004_manual_auth_and_sessions.sql`
5. `migrations/005_demo_catalog.sql` (development/demo environments only)
6. `migrations/006_demo_read_models.sql` (development/demo environments only)

Run each file as a complete transaction in the PostgreSQL SQL editor. Test first in a non-production branch/database.

## Ownership model

```text
Tenant (billable SaaS customer)
├── Subscription → Plan → Entitlements
├── Users through tenant_memberships
│   └── membership_roles scoped to tenant, restaurant, or outlet
└── Restaurants (brands)
    ├── Restaurant profile (content)
    ├── Restaurant theme (presentation only)
    ├── Outlets
    │   ├── Tables → Table sessions
    │   │            ├── Orders → immutable order item snapshots
    │   │            ├── Payments → payment event history
    │   │            └── Service requests
    │   └── Outlet menu overrides
    ├── Categories → Menu items
    └── Offers
```

`restaurant_profiles` stores client-entered content. `restaurant_themes` stores only template/design choices. Changing a template never changes menu or business content.

## Authentication and RLS

`app.users` stores the external auth identity, not passwords. After verifying a request, the API must begin a transaction and set trusted context:

```sql
begin;
select set_config('app.user_id', 'USER_UUID', true);
select set_config('app.tenant_id', 'TENANT_UUID', true);
-- tenant-scoped queries
commit;
```

Use a non-owner runtime database role. PostgreSQL table owners and roles with `BYPASSRLS` bypass normal RLS enforcement.

The generic RLS policies prevent cross-tenant access. Application services must additionally call `app.has_permission(...)` or enforce equivalent permission checks for each write operation. Do not accept `tenant_id` from the browser without comparing it to the authenticated membership.

## Tenant provisioning transaction

1. Create `app.users` identity if missing.
2. Create tenant.
3. Run `select app.provision_tenant_roles(<tenant_id>);`.
4. Create owner membership.
5. Assign the tenant-scoped `owner` role.
6. Create initial subscription, restaurant, profile, theme, and outlet.
7. Commit or roll back everything.

## Important implementation rules

- Generate opaque QR tokens, store only hashes in PostgreSQL, and rotate compromised tokens.
- Orders must be created through a transaction that locks/rechecks menu availability and calculates totals server-side.
- Never trust prices, discounts, totals, tenant IDs, table IDs, or subscription entitlements supplied by the browser.
- Preserve `order_items` snapshots even when menu items change. Prefer soft-deleting referenced menu items.
- Use an idempotency key for placing orders and submitting/verifying payments.
- Append status changes to `order_status_history` and payment changes to `payment_events`.
- Put uploaded images in object storage and store only URLs/keys in PostgreSQL.
- Queue analytics aggregation, emails, SMS, webhooks, and payment callbacks outside request transactions.
- Partition `orders`, `audit_logs`, and event tables by time only after their size and query plans justify it.

## Recommended service boundaries

- Identity/RBAC
- Tenant provisioning
- Subscription and entitlement enforcement
- Restaurant/outlet/profile/theme
- Menu and offers
- Tables and QR sessions
- Orders and kitchen workflow
- Billing and payments
- Audit and analytics

The schema is deliberately provider-neutral. It can run on managed PostgreSQL services such as Neon, Supabase, AWS RDS, or Cloud SQL.
