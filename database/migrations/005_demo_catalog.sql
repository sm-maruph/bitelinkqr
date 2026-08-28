begin;

do $$
declare
  demo_tenant uuid;
  terrace_id uuid;
  kacchi_id uuid;
  noodle_id uuid;
  terrace_outlet uuid;
  kacchi_outlet uuid;
  noodle_outlet uuid;
  category_id uuid;
  i integer;
begin
  insert into app.tenants (name, slug, billing_email, status, settings)
  values ('BiteLink Demo Group', 'bitelink-demo', 'demo@bitelink.local', 'trialing', '{"demo":true}'::jsonb)
  on conflict (slug) do update set name=excluded.name, settings=excluded.settings
  returning id into demo_tenant;

  insert into app.restaurants (tenant_id,name,slug,status) values
    (demo_tenant,'The Terrace','terrace','active')
  on conflict (tenant_id,slug) do update set name=excluded.name,status='active' returning id into terrace_id;
  insert into app.restaurants (tenant_id,name,slug,status) values
    (demo_tenant,'Kacchi Vai','kacchi','active')
  on conflict (tenant_id,slug) do update set name=excluded.name,status='active' returning id into kacchi_id;
  insert into app.restaurants (tenant_id,name,slug,status) values
    (demo_tenant,'Noodle House','noodle','active')
  on conflict (tenant_id,slug) do update set name=excluded.name,status='active' returning id into noodle_id;

  insert into app.outlets (tenant_id,restaurant_id,name,slug,address_line,city,status) values
    (demo_tenant,terrace_id,'Dhanmondi','dhanmondi','Road 8, Dhanmondi','Dhaka','active')
  on conflict (tenant_id,restaurant_id,slug) do update set address_line=excluded.address_line,status='active' returning id into terrace_outlet;
  insert into app.outlets (tenant_id,restaurant_id,name,slug,address_line,city,status) values
    (demo_tenant,terrace_id,'Gulshan','gulshan','Gulshan Avenue','Dhaka','active')
  on conflict (tenant_id,restaurant_id,slug) do update set address_line=excluded.address_line,status='active';
  insert into app.outlets (tenant_id,restaurant_id,name,slug,address_line,city,status) values
    (demo_tenant,kacchi_id,'Dhanmondi','dhanmondi','Satmasjid Road','Dhaka','active')
  on conflict (tenant_id,restaurant_id,slug) do update set address_line=excluded.address_line,status='active' returning id into kacchi_outlet;
  insert into app.outlets (tenant_id,restaurant_id,name,slug,address_line,city,status) values
    (demo_tenant,kacchi_id,'Uttara','uttara','Sector 7, Uttara','Dhaka','active')
  on conflict (tenant_id,restaurant_id,slug) do update set address_line=excluded.address_line,status='active';
  insert into app.outlets (tenant_id,restaurant_id,name,slug,address_line,city,status) values
    (demo_tenant,noodle_id,'Banani','banani','Road 11, Banani','Dhaka','active')
  on conflict (tenant_id,restaurant_id,slug) do update set address_line=excluded.address_line,status='active' returning id into noodle_outlet;

  insert into app.restaurant_profiles (tenant_id,restaurant_id,tagline,description,cover_image_url,phone,email,chef_name)
  values (demo_tenant,terrace_id,'A little more flavour.','Thoughtful plates, lively spices, and a table worth lingering at.','https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1800&q=85','+8801700000000','hello@theterrace.bd','Chef Arman Rahman')
  on conflict (restaurant_id) do update set tagline=excluded.tagline,description=excluded.description,cover_image_url=excluded.cover_image_url;
  insert into app.restaurant_profiles (tenant_id,restaurant_id,tagline,description,cover_image_url,phone,email,chef_name)
  values (demo_tenant,kacchi_id,'Tradition served generously.','Slow-cooked meats, fragrant rice, and familiar Bangladeshi hospitality.','https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=1800&q=85','+8801800000000','hello@kacchivai.bd','Chef Mahmud Hasan')
  on conflict (restaurant_id) do update set tagline=excluded.tagline,description=excluded.description,cover_image_url=excluded.cover_image_url;
  insert into app.restaurant_profiles (tenant_id,restaurant_id,tagline,description,cover_image_url,phone,email,chef_name)
  values (demo_tenant,noodle_id,'Bowls made for sharing.','Fresh noodles, bright broths, and wok-fired favourites.','https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1800&q=85','+8801900000000','hello@noodlehouse.bd','Chef Nabila Chowdhury')
  on conflict (restaurant_id) do update set tagline=excluded.tagline,description=excluded.description,cover_image_url=excluded.cover_image_url;

  insert into app.restaurant_themes (tenant_id,restaurant_id,template_key,theme_key,published_at) values
    (demo_tenant,terrace_id,'editorial','coral',now()),
    (demo_tenant,kacchi_id,'ember','saffron',now()),
    (demo_tenant,noodle_id,'future-neon','olive',now())
  on conflict (restaurant_id) do update set template_key=excluded.template_key,theme_key=excluded.theme_key,published_at=now();

  -- Terrace menu
  insert into app.menu_categories (tenant_id,restaurant_id,name,slug,sort_order) values
    (demo_tenant,terrace_id,'Kitchen signatures','signatures',1)
  on conflict (tenant_id,restaurant_id,slug) do update set name=excluded.name returning id into category_id;
  insert into app.menu_items (tenant_id,restaurant_id,category_id,name,slug,description,image_url,base_price,is_featured,tags,sort_order) values
    (demo_tenant,terrace_id,category_id,'Smoked Beef Rib','smoked-beef-rib','Slow-smoked beef rib with charred vegetables.','https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85',690,true,array['Chef pick'],1),
    (demo_tenant,terrace_id,category_id,'Tandoori Chicken','tandoori-chicken','Fire-roasted chicken with house spices.','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=85',420,true,array['Popular'],2)
  on conflict (tenant_id,restaurant_id,slug) do update set base_price=excluded.base_price,image_url=excluded.image_url,availability='available';
  insert into app.menu_categories (tenant_id,restaurant_id,name,slug,sort_order) values
    (demo_tenant,terrace_id,'Small plates','small-plates',2)
  on conflict (tenant_id,restaurant_id,slug) do update set name=excluded.name returning id into category_id;
  insert into app.menu_items (tenant_id,restaurant_id,category_id,name,slug,description,image_url,base_price,tags,sort_order) values
    (demo_tenant,terrace_id,category_id,'Crispy Prawn Toast','crispy-prawn-toast','Crisp toast, prawns, herbs, and fresh chilli.','https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?auto=format&fit=crop&w=900&q=85',360,array['New'],1),
    (demo_tenant,terrace_id,category_id,'Charred Aubergine','charred-aubergine','Smoky aubergine with garden vegetables.','https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=900&q=85',280,array['Vegetarian'],2)
  on conflict (tenant_id,restaurant_id,slug) do update set base_price=excluded.base_price,image_url=excluded.image_url,availability='available';

  -- Kacchi Vai menu
  insert into app.menu_categories (tenant_id,restaurant_id,name,slug,sort_order) values
    (demo_tenant,kacchi_id,'Kacchi','kacchi',1)
  on conflict (tenant_id,restaurant_id,slug) do update set name=excluded.name returning id into category_id;
  insert into app.menu_items (tenant_id,restaurant_id,category_id,name,slug,description,image_url,base_price,is_featured,tags,sort_order) values
    (demo_tenant,kacchi_id,category_id,'Special Mutton Kacchi','special-mutton-kacchi','Tender mutton and aromatic basmati rice.','https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=85',350,true,array['Signature'],1),
    (demo_tenant,kacchi_id,category_id,'Chicken Kacchi','chicken-kacchi','Spiced chicken layered with fragrant rice.','https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=85',280,false,array['Popular'],2),
    (demo_tenant,kacchi_id,category_id,'Beef Kacchi','beef-kacchi','Rich beef kacchi with potato and egg.','https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',320,false,array['Rich'],3)
  on conflict (tenant_id,restaurant_id,slug) do update set base_price=excluded.base_price,image_url=excluded.image_url,availability='available';
  insert into app.menu_categories (tenant_id,restaurant_id,name,slug,sort_order) values
    (demo_tenant,kacchi_id,'Drinks','drinks',2)
  on conflict (tenant_id,restaurant_id,slug) do update set name=excluded.name returning id into category_id;
  insert into app.menu_items (tenant_id,restaurant_id,category_id,name,slug,description,image_url,base_price,tags,sort_order) values
    (demo_tenant,kacchi_id,category_id,'Borhani','borhani','Traditional spiced yogurt drink.','https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85',60,array['House made'],1)
  on conflict (tenant_id,restaurant_id,slug) do update set base_price=excluded.base_price,image_url=excluded.image_url,availability='available';

  -- Noodle House menu
  insert into app.menu_categories (tenant_id,restaurant_id,name,slug,sort_order) values
    (demo_tenant,noodle_id,'Noodles','noodles',1)
  on conflict (tenant_id,restaurant_id,slug) do update set name=excluded.name returning id into category_id;
  insert into app.menu_items (tenant_id,restaurant_id,category_id,name,slug,description,image_url,base_price,is_featured,tags,sort_order) values
    (demo_tenant,noodle_id,category_id,'Chilli Garlic Noodles','chilli-garlic-noodles','Wok-fired noodles with chilli, garlic, and vegetables.','https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=900&q=85',290,true,array['Popular'],1),
    (demo_tenant,noodle_id,category_id,'Chicken Ramen','chicken-ramen','Comforting broth, noodles, chicken, and soft egg.','https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85',420,false,array['Chef pick'],2)
  on conflict (tenant_id,restaurant_id,slug) do update set base_price=excluded.base_price,image_url=excluded.image_url,availability='available';

  insert into app.offers (tenant_id,restaurant_id,outlet_id,name,description,offer_type,discount_value,starts_at,ends_at,is_active)
  select demo_tenant,terrace_id,null,'20% off signature plates','Enjoy 20% off selected signature dishes.','percentage',20,now()-interval '1 day',now()+interval '90 days',true
  where not exists (select 1 from app.offers where tenant_id=demo_tenant and restaurant_id=terrace_id and name='20% off signature plates');
  insert into app.offers (tenant_id,restaurant_id,outlet_id,name,description,offer_type,discount_value,starts_at,ends_at,is_active)
  select demo_tenant,kacchi_id,null,'Kacchi combo','Two kacchi plates with two borhani drinks.','combo',50,now()-interval '1 day',now()+interval '90 days',true
  where not exists (select 1 from app.offers where tenant_id=demo_tenant and restaurant_id=kacchi_id and name='Kacchi combo');

  -- Real table records make floor dashboards database-backed even before orders exist.
  for category_id in select id from app.outlets where tenant_id=demo_tenant loop
    for i in 1..8 loop
      insert into app.dining_tables(tenant_id,restaurant_id,outlet_id,table_number,qr_token_hash,capacity,status)
      select demo_tenant,o.restaurant_id,o.id,lpad(i::text,2,'0'),encode(digest(o.id::text||':'||i::text,'sha256'),'hex'),4,'available'
      from app.outlets o where o.id=category_id
      on conflict (tenant_id,outlet_id,table_number) do update set capacity=excluded.capacity;
    end loop;
  end loop;
end $$;

commit;
