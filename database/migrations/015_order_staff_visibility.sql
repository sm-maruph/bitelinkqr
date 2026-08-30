begin;

-- Order staff monitor the full outlet workflow but may only move newly placed
-- orders into the approved/kitchen queue.
update app.role_templates
set permissions = array(
  select permission
  from unnest(permissions) permission
  where permission not in ('orders.serve', 'orders.complete')
)
where code = 'order_staff';

delete from app.role_permissions rp
using app.roles r
where rp.role_id = r.id
  and r.code = 'order_staff'
  and rp.permission_code in ('orders.serve', 'orders.complete');

insert into app.role_permissions(role_id, permission_code)
select r.id, required.permission
from app.roles r
cross join unnest(array[
  'orders.read',
  'orders.approve',
  'tables.read',
  'payments.read'
]::public.citext[]) required(permission)
where r.code = 'order_staff'
on conflict do nothing;

commit;
