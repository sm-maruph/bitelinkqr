begin;

insert into billing.plan_entitlements(plan_id,feature_key,enabled,limit_value)
select id,'outlets.max',true,case code when 'starter' then 1 when 'business' then 3 else null end
from billing.plans where code in ('starter','business','enterprise')
on conflict(plan_id,feature_key) do update set enabled=true,limit_value=excluded.limit_value;

commit;
