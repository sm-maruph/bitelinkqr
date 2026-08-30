begin;

-- Managers may customize the provided role templates. The Owner role remains
-- protected by the API and is not exposed by the role editor.
drop policy if exists role_permissions_tenant_manage on app.role_permissions;

create policy role_permissions_tenant_manage
on app.role_permissions
for all
using (
  exists (
    select 1
    from app.roles r
    where r.id = role_id
      and r.tenant_id = app.current_tenant_id()
      and r.code <> 'owner'
      and app.has_permission(r.tenant_id, 'staff.manage')
  )
)
with check (
  exists (
    select 1
    from app.roles r
    where r.id = role_id
      and r.tenant_id = app.current_tenant_id()
      and r.code <> 'owner'
      and app.has_permission(r.tenant_id, 'staff.manage')
  )
);

commit;
