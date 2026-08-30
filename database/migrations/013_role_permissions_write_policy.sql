begin;

-- role_permissions does not carry tenant_id, so authorize writes through its
-- parent role. The API still performs the same staff.manage authorization
-- before attempting a role change.
create policy role_permissions_tenant_manage
on app.role_permissions
for all
using (
  exists (
    select 1
    from app.roles r
    where r.id = role_id
      and r.tenant_id = app.current_tenant_id()
      and not r.is_system
      and app.has_permission(r.tenant_id, 'staff.manage')
  )
)
with check (
  exists (
    select 1
    from app.roles r
    where r.id = role_id
      and r.tenant_id = app.current_tenant_id()
      and not r.is_system
      and app.has_permission(r.tenant_id, 'staff.manage')
  )
);

commit;
