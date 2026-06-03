drop table if exists community_members cascade;
drop table if exists communities cascade;

alter table canonical_tags
  add column category text not null default 'knowledge'
    check (category in ('tools','space','materials','labor','knowledge','capital'));

update canonical_tags set category = 'tools' where slug in (
  'drill','ladder','circular-saw','hand-saw','lawnmower',
  'pressure-washer','wheelbarrow','shovel','rake','tiller',
  'generator','extension-cord','folding-table','folding-chairs',
  'pickup-truck','cargo-van','trailer'
);
update canonical_tags set category = 'space' where slug in (
  'backyard','driveway','garage','parking-lot','community-room'
);
update canonical_tags set category = 'materials' where slug in (
  'mulch','topsoil','compost','lumber','paint','native-plants',
  'seeds','moving-boxes'
);
update canonical_tags set category = 'labor' where slug in (
  'hauling','moving-help','yard-work','childcare','pet-sitting'
);

alter table user_resources drop column if exists community_id;

create table places (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  description  text,
  address      text,
  zip_code     text not null,
  lat          numeric(9,6),
  lng          numeric(9,6),
  hours        jsonb,
  website      text,
  is_public    boolean not null default true,
  osm_id       text,
  trust_tier   text not null default 'self'
                 check (trust_tier in ('self','community','osm','manual','partner')),
  verified_at  timestamptz,
  created_by   uuid not null references profiles(id) on delete restrict,
  created_at   timestamptz not null default now()
);

alter table places enable row level security;

create policy "Anyone can read public places"
  on places for select using (is_public = true);

create policy "Authenticated users can create places"
  on places for insert with check (auth.uid() = created_by);

create table place_managers (
  place_id    uuid not null references places(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade,
  role        text not null default 'manager'
                check (role in ('owner','manager')),
  joined_at   timestamptz not null default now(),
  primary key (place_id, profile_id)
);

alter table place_managers enable row level security;

create policy "Managers can see co-managers of their places"
  on place_managers for select using (
    exists (
      select 1 from place_managers pm
      where pm.place_id = place_managers.place_id
        and pm.profile_id = auth.uid()
    )
  );

create policy "Owners can add managers"
  on place_managers for insert with check (
    exists (
      select 1 from place_managers pm
      where pm.place_id = place_managers.place_id
        and pm.profile_id = auth.uid()
        and pm.role = 'owner'
    )
  );

create policy "Owners can remove managers"
  on place_managers for delete using (
    exists (
      select 1 from place_managers pm
      where pm.place_id = place_managers.place_id
        and pm.profile_id = auth.uid()
        and pm.role = 'owner'
    )
  );

create policy "Managers can read their private places"
  on places for select using (
    not is_public
    and exists (
      select 1 from place_managers pm
      where pm.place_id = places.id and pm.profile_id = auth.uid()
    )
  );

create policy "Managers can update places"
  on places for update using (
    exists (
      select 1 from place_managers pm
      where pm.place_id = places.id and pm.profile_id = auth.uid()
    )
  );

alter table user_resources
  alter column profile_id drop not null,
  add column place_id uuid references places(id) on delete cascade;

alter table user_resources
  add constraint resource_has_owner
    check (profile_id is not null or place_id is not null);

drop policy if exists "Users can manage own resources" on user_resources;

create policy "Owners can manage their resources"
  on user_resources for all using (
    (profile_id is not null and auth.uid() = profile_id)
    or
    (place_id is not null and exists (
      select 1 from place_managers pm
      where pm.place_id = user_resources.place_id
        and pm.profile_id = auth.uid()
    ))
  );

create table sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table place_sponsors (
  place_id    uuid not null references places(id) on delete cascade,
  sponsor_id  uuid not null references sponsors(id) on delete cascade,
  note        text,
  primary key (place_id, sponsor_id)
);

alter table sponsors enable row level security;
alter table place_sponsors enable row level security;

create policy "Anyone can read active sponsors"
  on sponsors for select using (is_active = true);

create policy "Anyone can read place sponsors"
  on place_sponsors for select using (true);

create view supernodes as
select
  p.*,
  count(distinct ct.category) as category_count,
  count(ur.id)                as resource_count
from places p
join user_resources ur on ur.place_id = p.id and ur.is_available = true
join canonical_tags ct on ct.id = ur.canonical_tag_id
group by p.id
having count(distinct ct.category) >= 2
    or count(ur.id) >= 5;
