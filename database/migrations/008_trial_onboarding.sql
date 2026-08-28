begin;

insert into billing.plans(code,name,description,currency,monthly_price,yearly_price,trial_days,is_public,is_active)
values('starter','Starter','QR ordering and restaurant operations for one outlet','BDT',1490,14900,7,true,true),
      ('business','Business','Multi-outlet operations, roles, and analytics','BDT',3490,34900,7,true,true),
      ('enterprise','Enterprise','Unlimited outlets and advanced controls','BDT',0,null,7,true,true)
on conflict(code) do update set name=excluded.name,description=excluded.description,monthly_price=excluded.monthly_price,
 yearly_price=excluded.yearly_price,trial_days=7,is_public=excluded.is_public,is_active=true;

-- Backfill a seven-day Starter trial for existing trial tenants that do not yet
-- have a subscription. New accounts receive the same record during registration.
insert into billing.subscriptions(tenant_id,plan_id,status,billing_interval,seats,trial_ends_at,current_period_start,current_period_end)
select t.id,p.id,'trialing','monthly',1,now()+interval '7 days',now(),now()+interval '7 days'
from app.tenants t cross join billing.plans p
where p.code='starter' and t.status='trialing' and not exists(select 1 from billing.subscriptions s where s.tenant_id=t.id)
on conflict do nothing;

commit;
