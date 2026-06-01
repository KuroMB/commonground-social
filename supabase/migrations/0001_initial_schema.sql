-- Enable fuzzy string matching
create extension if not exists pg_trgm;

-- ─────────────────────────────────────────────
-- CANONICAL TAGS
-- The source of truth for all resource types.
-- Raw user input maps to a canonical tag via
-- the tag_aliases table. Never store raw strings
-- as identifiers — always route through this table.
-- ─────────────────────────────────────────────
create table canonical_tags (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  display_name text not null,
  is_consumable boolean not null default false,
  verified    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_canonical_tags_trgm
  on canonical_tags using gin (display_name gin_trgm_ops);

-- ─────────────────────────────────────────────
-- TAG ALIASES
-- Many raw strings map to one canonical tag.
-- Allows renaming/merging without touching
-- any user_resources rows.
-- ─────────────────────────────────────────────
create table tag_aliases (
  id              uuid primary key default gen_random_uuid(),
  canonical_tag_id uuid not null references canonical_tags(id) on delete cascade,
  alias           text not null,
  created_at      timestamptz not null default now(),
  unique(alias)
);

create index idx_tag_aliases_trgm
  on tag_aliases using gin (alias gin_trgm_ops);

-- ─────────────────────────────────────────────
-- PROFILES
-- Minimal identity. No photos. No follower counts.
-- Display name + neighborhood-level location only.
-- Email stored in auth.users, never exposed here.
-- ─────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  zip_code      text not null,
  neighborhood  text,             -- human-readable area label e.g. "Cherokee Street"
  lat           numeric(9,6),     -- stored for proximity queries, never displayed
  lng           numeric(9,6),
  contact_pref  text,             -- how they want to be reached once connected
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read all profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────
-- USER RESOURCES (the flat pool)
-- What someone is offering. Points to a canonical
-- tag, never stores raw text as the identifier.
-- ─────────────────────────────────────────────
create table user_resources (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles(id) on delete cascade,
  canonical_tag_id uuid not null references canonical_tags(id),
  notes            text,          -- optional context e.g. "8ft ladder, aluminum"
  is_available     boolean not null default true,
  zip_code         text not null, -- denormalized for fast zip-level queries
  created_at       timestamptz not null default now()
);

alter table user_resources enable row level security;

create policy "Anyone can read available resources"
  on user_resources for select using (is_available = true);

create policy "Users can manage own resources"
  on user_resources for all using (
    auth.uid() = (select profile_id from user_resources ur where ur.id = user_resources.id)
  );

-- ─────────────────────────────────────────────
-- CONNECTION REQUESTS
-- Replaces direct messaging. User A signals
-- interest in User B's specific resource.
-- B gets notified, decides whether to respond.
-- No chat. No ambient presence.
-- ─────────────────────────────────────────────
create table connection_requests (
  id               uuid primary key default gen_random_uuid(),
  from_profile_id  uuid not null references profiles(id) on delete cascade,
  to_profile_id    uuid not null references profiles(id) on delete cascade,
  resource_id      uuid references user_resources(id) on delete set null,
  message          text,          -- optional short note (250 char max)
  status           text not null default 'pending'
                     check (status in ('pending', 'accepted', 'declined')),
  created_at       timestamptz not null default now(),
  check (from_profile_id != to_profile_id)
);

alter table connection_requests enable row level security;

create policy "Users can see requests involving them"
  on connection_requests for select using (
    auth.uid() = from_profile_id or auth.uid() = to_profile_id
  );

create policy "Users can create requests"
  on connection_requests for insert with check (auth.uid() = from_profile_id);

create policy "Recipients can update status"
  on connection_requests for update using (auth.uid() = to_profile_id);

-- ─────────────────────────────────────────────
-- SEED: COMMON CANONICAL TAGS
-- Pre-populate so day-one users see real options.
-- The pool looks alive before anyone signs up.
-- ─────────────────────────────────────────────
insert into canonical_tags (slug, display_name, is_consumable, verified) values
  -- TOOLS (non-consumable)
  ('drill',          'Drill',              false, true),
  ('ladder',         'Ladder',             false, true),
  ('circular-saw',   'Saw (Circular)',     false, true),
  ('hand-saw',       'Saw (Hand)',         false, true),
  ('lawnmower',      'Lawn Mower',         false, true),
  ('pressure-washer','Pressure Washer',    false, true),
  ('wheelbarrow',    'Wheelbarrow',        false, true),
  ('shovel',         'Shovel',             false, true),
  ('rake',           'Rake',               false, true),
  ('tiller',         'Tiller',             false, true),
  ('generator',      'Generator',          false, true),
  ('extension-cord', 'Extension Cord',     false, true),
  ('folding-table',  'Folding Table',      false, true),
  ('folding-chairs', 'Folding Chairs',     false, true),
  ('pickup-truck',   'Pickup Truck',       false, true),
  ('cargo-van',      'Cargo Van',          false, true),
  ('trailer',        'Trailer',            false, true),
  -- SPACE (non-consumable)
  ('backyard',       'Backyard / Yard',    false, true),
  ('driveway',       'Driveway',           false, true),
  ('garage',         'Garage',             false, true),
  ('parking-lot',    'Parking Lot',        false, true),
  ('community-room', 'Community Room',     false, true),
  -- MATERIALS (consumable)
  ('mulch',          'Mulch',              true,  true),
  ('topsoil',        'Topsoil',            true,  true),
  ('compost',        'Compost',            true,  true),
  ('lumber',         'Lumber',             true,  true),
  ('paint',          'Paint',              true,  true),
  ('native-plants',  'Native Plants',      true,  true),
  ('seeds',          'Seeds',              true,  true),
  ('moving-boxes',   'Moving Boxes',       true,  true),
  -- LABOR & TIME (consumable)
  ('hauling',        'Hauling Help',       true,  true),
  ('moving-help',    'Moving Help',        true,  true),
  ('yard-work',      'Yard Work Help',     true,  true),
  ('childcare',      'Childcare (swap)',   true,  true),
  ('pet-sitting',    'Pet Sitting',        true,  true),
  -- KNOWLEDGE
  ('electrician',    'Electrician',        false, true),
  ('plumber',        'Plumber',            false, true),
  ('carpenter',      'Carpentry Skills',   false, true),
  ('gardening',      'Gardening Knowledge',false, true),
  ('cooking',        'Cooking / Catering', false, true),
  ('notary',         'Notary',             false, true),
  ('translator',     'Translation',        false, true);
