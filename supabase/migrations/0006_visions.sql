-- ─────────────────────────────────────────────
-- VISIONS
-- A proposed community project. Anyone can submit.
-- "Voting" happens by committing real resources,
-- labor, or money — not clicks.
-- ─────────────────────────────────────────────

create table visions (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  description           text,
  profile_id            uuid not null references profiles(id) on delete restrict,
  place_id              uuid references places(id) on delete set null,
  lat                   numeric(9,6),
  lng                   numeric(9,6),

  -- Funding (optional — many visions need no money)
  funding_goal_cents    integer,
  funding_minimum_cents integer default 5000,   -- $50 floor if funding is used
  target_date           date,

  -- Status lifecycle
  status                text not null default 'proposed'
                          check (status in (
                            'proposed',    -- submitted, accepting commitments
                            'active',      -- threshold met, officially underway
                            'funded',      -- funding goal reached, money held
                            'in_progress', -- work has started
                            'completed',   -- done
                            'cancelled'    -- abandoned
                          )),

  -- Auto-seed link: did the matching engine suggest this?
  seeded_from_need_id   uuid references user_resources(id) on delete set null,

  -- Completion
  outcome               text,
  completed_at          timestamptz,

  created_at            timestamptz not null default now()
);

alter table visions enable row level security;

create policy "Anyone can read proposed or active visions"
  on visions for select using (status in ('proposed','active','funded','in_progress','completed'));

create policy "Authors can manage their visions"
  on visions for all using (auth.uid() = profile_id);


-- ─────────────────────────────────────────────
-- VISION REQUIREMENTS
-- What the vision needs to happen.
-- Tools, materials, labor, capital, knowledge.
-- Fulfilled when a commitment covers it.
-- ─────────────────────────────────────────────

create table vision_requirements (
  id                uuid primary key default gen_random_uuid(),
  vision_id         uuid not null references visions(id) on delete cascade,
  canonical_tag_id  uuid not null references canonical_tags(id),
  quantity          integer not null default 1,
  notes             text,              -- "~20 sheets 4x8 plywood"
  is_fulfilled      boolean not null default false,
  created_at        timestamptz not null default now()
);

alter table vision_requirements enable row level security;

create policy "Anyone can read vision requirements"
  on vision_requirements for select using (true);

create policy "Vision authors can manage requirements"
  on vision_requirements for all using (
    auth.uid() = (
      select profile_id from visions where id = vision_requirements.vision_id
    )
  );


-- ─────────────────────────────────────────────
-- VISION COMMITMENTS
-- The "vote." A real commitment of something
-- you actually have: a resource, your time,
-- or money. Not a click.
--
-- Each row is one of:
--   resource_id set   → committing an existing listing
--   pledge_cents set  → financial pledge (held, not charged yet)
--   neither           → volunteering time/labor (notes describes it)
-- ─────────────────────────────────────────────

create table vision_commitments (
  id               uuid primary key default gen_random_uuid(),
  vision_id        uuid not null references visions(id) on delete cascade,
  profile_id       uuid not null references profiles(id) on delete cascade,
  requirement_id   uuid references vision_requirements(id) on delete set null,
  resource_id      uuid references user_resources(id) on delete set null,
  pledge_cents     integer,
  notes            text,              -- "I'll bring my truck Saturday morning"
  status           text not null default 'active'
                     check (status in ('active','withdrawn')),
  created_at       timestamptz not null default now(),

  -- Can't double-commit the same resource to the same vision
  unique (vision_id, profile_id, resource_id)
);

alter table vision_commitments enable row level security;

create policy "Anyone can see commitments"
  on vision_commitments for select using (true);

create policy "Users can manage their own commitments"
  on vision_commitments for all using (auth.uid() = profile_id);


-- ─────────────────────────────────────────────
-- VISION SEEDS
-- Auto-generated drafts from the matching engine.
-- A human must activate one into a real vision.
-- The engine suggests. The community decides.
-- ─────────────────────────────────────────────

create table vision_seeds (
  id                  uuid primary key default gen_random_uuid(),
  need_id             uuid references user_resources(id) on delete cascade,
  matched_resource_ids uuid[],          -- resource listings that triggered the match
  matched_pledge_ids   uuid[],          -- pledge pools that matched
  suggested_title     text,
  suggested_tags      text[],           -- canonical tag slugs for requirements
  status              text not null default 'pending'
                        check (status in ('pending','converted','dismissed')),
  converted_vision_id uuid references visions(id) on delete set null,
  created_at          timestamptz not null default now()
);

alter table vision_seeds enable row level security;

create policy "Anyone can read pending seeds"
  on vision_seeds for select using (status = 'pending');


-- ─────────────────────────────────────────────
-- VISION STATS VIEW
-- Computed strength of a vision — not stored,
-- derived from real commitments.
-- ─────────────────────────────────────────────

create view vision_stats as
select
  v.id,
  v.title,
  v.status,
  v.funding_goal_cents,
  v.funding_minimum_cents,
  count(distinct vc.profile_id)
    filter (where vc.status = 'active')                       as committed_people,
  coalesce(
    sum(vc.pledge_cents) filter (where vc.status = 'active'), 0
  )                                                           as pledged_cents,
  count(distinct vr.id)                                       as requirements_total,
  count(distinct vr.id) filter (where vr.is_fulfilled = true) as requirements_fulfilled
from visions v
left join vision_commitments vc on vc.vision_id = v.id
left join vision_requirements vr on vr.vision_id = v.id
group by v.id;


-- ─────────────────────────────────────────────
-- Geography column for visions (same pattern
-- as profiles and places)
-- ─────────────────────────────────────────────

alter table visions
  add column location geography(POINT, 4326)
    generated always as (
      case when lat is not null and lng is not null
        then st_makepoint(lng, lat)::geography
      end
    ) stored;

create index idx_visions_location on visions using gist (location);
