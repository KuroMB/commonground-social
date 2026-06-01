-- ─────────────────────────────────────────────
-- PLACES REFACTOR
--
-- Resources can belong to a person, a place, or both.
-- Supernodes emerge from resource density — never assigned.
-- Replaces the communities tables from 0002.
-- ─────────────────────────────────────────────


-- ─────────────────────────────────────────────
-- Add category to canonical_tags.
-- Moves the JS categorize() logic into the DB
-- so SQL can filter and group by category.
-- ─────────────────────────────────────────────
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
-- 'knowledge' is the default; covers remaining tags.
-- 'capital' is seeded separately when that feature ships.


-- ─────────────────────────────────────────────
-- Drop communities tables from 0002.
-- Nothing is built on top of these yet.
-- ─────────────────────────────────────────────
drop table if exists community_members;
drop table if exists communities;

alter table user_resources drop column if exists community_id;


-- ─────────────────────────────────────────────
-- PLACES
-- Physical locations as first-class objects.
-- A garage, a church, a tool library, a wooded lot —
-- any real-world anchor for resources.
--
-- Verification is free-only:
--   self      = self-reported (default)
--   community = vouched by users who've visited
--   osm       = matched to an OpenStreetMap node/way
--   manual    = admin reviewed it (no cost, just time)
--   partner   = contractual relationship
-- ─────────────────────────────────────────────
create table places (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,
  description  text,
  address      text,
  zip_code     text not null,
  lat          numeric(9,6),
  lng          numeric(9,6),
  hours        jsonb,               -- { "mon": "9-5", "tue": null, ... }
  website      text,
  is_public    boolean not null default true,
  osm_id       text,                -- OpenStreetMap node/way ID for cross-reference
  trust_tier   text not null default 'self'
                 check (trust_tier in ('self','community','osm','manual','partner')),
  verified_at  timestamptz,
  created_by   uuid not null references profiles(id) on delete restrict,
  created_at   timestamptz not null default now()
);

alter table places enable row level security;

create policy "Anyone can read public places"
  on places for select using (is_public = true);

create policy "Managers can read their private places"
  on places for select using (
    not is_public
    and exists (
      select 1 from place_managers pm
      where pm.place_id = places.id and pm.profile_id = auth.uid()
    )
  );

create policy "Authenticated users can create places"
  on places for insert with check (auth.uid() = created_by);

create policy "Managers can update places"
  on places for update using (
    exists (
      select 1 from place_managers pm
      where pm.place_id = places.id and pm.profile_id = auth.uid()
    )
  );


-- ─────────────────────────────────────────────
-- PLACE MANAGERS
-- Who can operate and edit a given place.
-- Creator is added as owner via app logic on insert.
-- A person can manage multiple places.
-- A place can have multiple managers.
-- ─────────────────────────────────────────────
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


-- ─────────────────────────────────────────────
-- Update user_resources.
-- Resources can now belong to a person, a place,
-- or both. At least one must be set.
-- ─────────────────────────────────────────────
alter table user_resources
  alter column profile_id drop not null,
  add column place_id uuid references places(id) on delete cascade;

alter table user_resources
  add constraint resource_has_owner
    check (profile_id is not null or place_id is not null);

-- Replace the old single-owner policy with one that
-- allows both profile owners and place managers to manage resources.
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


-- ─────────────────────────────────────────────
-- SPONSORS
-- Credit-only. A badge on a place page.
-- No analytics, no targeting, no reporting.
-- ─────────────────────────────────────────────
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
  note        text,                -- "Donated initial tool inventory"
  primary key (place_id, sponsor_id)
);

alter table sponsors enable row level security;
alter table place_sponsors enable row level security;

create policy "Anyone can read active sponsors"
  on sponsors for select using (is_active = true);

create policy "Anyone can read place sponsors"
  on place_sponsors for select using (true);


-- ─────────────────────────────────────────────
-- SUPERNODES VIEW
-- Computed, never stored. A place becomes a supernode
-- when it has resources in 2+ categories or 5+ total.
-- No one assigns this — it emerges from the data.
-- ─────────────────────────────────────────────
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
