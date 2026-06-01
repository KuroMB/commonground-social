-- ─────────────────────────────────────────────
-- LOCATION REFACTOR: lat/lng + radius replaces
-- zip_code as the primary query key.
--
-- Zip codes become optional display metadata.
-- Works globally — no US-only assumption.
-- PostGIS handles the distance math.
-- ─────────────────────────────────────────────

create extension if not exists postgis;


-- ─────────────────────────────────────────────
-- PROFILES
-- lat/lng already exists. Add preferred radius
-- and make zip_code optional (display only).
-- ─────────────────────────────────────────────
alter table profiles
  alter column zip_code drop not null,
  add column preferred_radius_meters integer not null default 8047; -- 5 miles


-- ─────────────────────────────────────────────
-- PLACES
-- lat/lng already exists. Add radius.
-- zip_code becomes optional display metadata.
-- ─────────────────────────────────────────────
alter table places
  alter column zip_code drop not null,
  add column radius_meters integer not null default 8047; -- 5 miles default


-- ─────────────────────────────────────────────
-- USER_RESOURCES
-- Each listing carries its own radius.
-- A personal tool loan might be 2 miles.
-- A place-owned resource inherits place radius
-- unless overridden here (null = use parent).
-- zip_code becomes optional display metadata.
-- ─────────────────────────────────────────────
alter table user_resources
  alter column zip_code drop not null,
  add column radius_meters integer,          -- null = inherit from profile or place
  add column listing_type text not null default 'offer'
    check (listing_type in ('offer','need')),
  add column affected_count integer;         -- for needs: ~how many people affected


-- ─────────────────────────────────────────────
-- GEOGRAPHY COLUMNS
-- Computed from lat/lng for PostGIS queries.
-- Updated by trigger whenever lat/lng changes.
-- ─────────────────────────────────────────────
alter table profiles
  add column location geography(POINT, 4326)
    generated always as (
      case when lat is not null and lng is not null
        then st_makepoint(lng, lat)::geography
      end
    ) stored;

alter table places
  add column location geography(POINT, 4326)
    generated always as (
      case when lat is not null and lng is not null
        then st_makepoint(lng, lat)::geography
      end
    ) stored;


-- ─────────────────────────────────────────────
-- SPATIAL INDEXES
-- Required for ST_DWithin performance.
-- ─────────────────────────────────────────────
create index idx_profiles_location on profiles using gist (location);
create index idx_places_location   on places   using gist (location);


-- ─────────────────────────────────────────────
-- HELPER VIEW: resolved resource locations
-- Joins resources to their owner's coordinates
-- so callers don't have to join manually.
-- ─────────────────────────────────────────────
create view resource_locations as
select
  ur.id,
  ur.listing_type,
  ur.canonical_tag_id,
  ur.notes,
  ur.is_available,
  ur.affected_count,
  coalesce(ur.radius_meters,
    pl.radius_meters,
    pr.preferred_radius_meters,
    8047)                          as radius_meters,
  coalesce(pl.location, pr.location) as location,
  coalesce(pl.zip_code, pr.zip_code) as zip_code,
  coalesce(pl.name, pr.display_name) as owner_name,
  ur.place_id,
  ur.profile_id
from user_resources ur
left join places   pl on pl.id = ur.place_id
left join profiles pr on pr.id = ur.profile_id;
