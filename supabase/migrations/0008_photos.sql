-- ─────────────────────────────────────────────
-- PHOTOS
-- Documentation of what was built — not who
-- built it. No profile photos. Photos belong to
-- visions, places, or resources.
--
-- Vision photos can be tagged by phase so a
-- project page shows a before/during/after
-- timeline. Completed visions show their 'after'
-- photo as the map pin thumbnail.
--
-- Storage: Supabase Storage bucket 'photos'
-- Path convention: {entity_type}/{entity_id}/{uuid}.{ext}
-- ─────────────────────────────────────────────

create table photos (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,           -- Supabase Storage path
  alt_text     text,                    -- accessibility + search
  caption      text,                    -- optional human note
  taken_at     timestamptz,             -- when the photo was taken (EXIF or manual)
  uploaded_by  uuid not null references profiles(id) on delete set null,

  -- What this photo documents (exactly one must be set)
  vision_id    uuid references visions(id)        on delete cascade,
  place_id     uuid references places(id)         on delete cascade,
  resource_id  uuid references user_resources(id) on delete cascade,

  -- For vision photos: where in the project timeline
  phase        text check (phase in ('before','during','after')),

  -- The featured/primary photo for this entity
  is_primary   boolean not null default false,

  created_at   timestamptz not null default now(),

  -- Exactly one parent entity
  constraint photo_has_one_parent check (
    (vision_id   is not null)::int +
    (place_id    is not null)::int +
    (resource_id is not null)::int = 1
  )
);

alter table photos enable row level security;

create policy "Anyone can view photos"
  on photos for select using (true);

create policy "Uploader can manage their photos"
  on photos for all using (auth.uid() = uploaded_by);

-- Only one primary photo per entity
create unique index idx_photos_primary_vision
  on photos (vision_id) where is_primary = true and vision_id is not null;

create unique index idx_photos_primary_place
  on photos (place_id) where is_primary = true and place_id is not null;

create unique index idx_photos_primary_resource
  on photos (resource_id) where is_primary = true and resource_id is not null;


-- ─────────────────────────────────────────────
-- MAP PIN VIEW
-- What the map API returns per completed vision.
-- Primary 'after' photo path included so the
-- map can render a thumbnail on the pin.
-- ─────────────────────────────────────────────

create view completed_vision_pins as
select
  v.id,
  v.title,
  v.lat,
  v.lng,
  v.location,
  v.completed_at,
  v.outcome,
  p.storage_path  as photo_path,
  p.alt_text      as photo_alt
from visions v
left join photos p
  on  p.vision_id  = v.id
  and p.phase      = 'after'
  and p.is_primary = true
where v.status = 'completed'
  and v.lat is not null;
