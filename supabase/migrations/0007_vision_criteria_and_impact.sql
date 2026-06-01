-- ─────────────────────────────────────────────
-- VISION ACCEPTANCE CRITERIA
-- The organizer defines "done" when submitting.
-- All criteria must be marked met before a vision
-- can be marked complete. The creator is the
-- product owner — only they can close it.
-- ─────────────────────────────────────────────

create table vision_criteria (
  id          uuid primary key default gen_random_uuid(),
  vision_id   uuid not null references visions(id) on delete cascade,
  description text not null,       -- "The playground is built and kids are using it"
  is_met      boolean not null default false,
  met_at      timestamptz,
  created_at  timestamptz not null default now()
);

alter table vision_criteria enable row level security;

create policy "Anyone can read vision criteria"
  on vision_criteria for select using (true);

create policy "Vision author can manage criteria"
  on vision_criteria for all using (
    auth.uid() = (
      select profile_id from visions where id = vision_criteria.vision_id
    )
  );


-- ─────────────────────────────────────────────
-- Track who closed the vision and require an
-- outcome note before marking complete.
-- ─────────────────────────────────────────────

alter table visions
  add column completed_by uuid references profiles(id) on delete set null;


-- ─────────────────────────────────────────────
-- Remove vision_seeds — visions are always a
-- human intention, never auto-generated.
-- The matching engine surfaces awareness;
-- it does not create projects.
-- ─────────────────────────────────────────────

drop table if exists vision_seeds;


-- ─────────────────────────────────────────────
-- IMPACT VIEWS
-- Computed from completed visions only.
-- Never stored as a score. Not a leaderboard.
-- A record of what was actually built.
-- ─────────────────────────────────────────────

-- How many completed visions each person contributed to
create view profile_impact as
select
  vc.profile_id,
  count(distinct v.id)
    filter (where v.status = 'completed')  as visions_completed,
  count(distinct v.id)                     as visions_total
from vision_commitments vc
join visions v on v.id = vc.vision_id
where vc.status = 'active'
group by vc.profile_id;


-- How many completed visions each resource contributed to
create view resource_impact as
select
  vc.resource_id,
  ct.display_name                          as resource_name,
  count(distinct v.id)
    filter (where v.status = 'completed')  as visions_completed
from vision_commitments vc
join visions v on v.id = vc.vision_id
join user_resources ur on ur.id = vc.resource_id
join canonical_tags ct on ct.id = ur.canonical_tag_id
where vc.resource_id is not null
  and vc.status = 'active'
group by vc.resource_id, ct.display_name;


-- How many completed visions each place supported
create view place_impact as
select
  ur.place_id,
  p.name                                   as place_name,
  count(distinct v.id)
    filter (where v.status = 'completed')  as visions_completed
from vision_commitments vc
join user_resources ur on ur.id = vc.resource_id
join places p on p.id = ur.place_id
join visions v on v.id = vc.vision_id
where ur.place_id is not null
  and vc.status = 'active'
group by ur.place_id, p.name;
