begin;

alter table app.menu_items add column if not exists outlet_id uuid;
alter table app.menu_items add constraint menu_items_outlet_scope_fk foreign key (tenant_id,outlet_id) references app.outlets(tenant_id,id) on delete cascade;
create index if not exists menu_items_outlet_scope_idx on app.menu_items(tenant_id,restaurant_id,outlet_id);

create or replace view app.public_menu_items as
select r.slug restaurant_slug,o.slug outlet_slug,c.name category_name,c.sort_order category_sort_order,i.id,i.name,i.slug,i.description,i.image_url,
 coalesce(omi.price_override,i.base_price) price,coalesce(omi.availability,i.availability) availability,i.preparation_minutes,i.is_featured,i.tags,i.sort_order
from app.menu_items i join app.restaurants r on r.tenant_id=i.tenant_id and r.id=i.restaurant_id and r.status='active'
join app.menu_categories c on c.tenant_id=i.tenant_id and c.id=i.category_id and c.is_active
join app.outlets o on o.tenant_id=i.tenant_id and o.restaurant_id=i.restaurant_id and o.status='active'
left join app.outlet_menu_items omi on omi.tenant_id=i.tenant_id and omi.outlet_id=o.id and omi.menu_item_id=i.id
where i.availability<>'unavailable' and (i.outlet_id is null or i.outlet_id=o.id);

commit;
