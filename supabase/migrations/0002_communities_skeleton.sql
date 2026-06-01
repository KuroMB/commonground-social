-- ─────────────────────────────────────────────
-- COMMUNITIES (Phase 4 skeleton)
-- Managed hosting for orgs/neighborhood associations.
-- Schema laid in now to avoid a live-data migration later.
-- No UI is built for this yet — all community_id FKs are
-- nullable so existing behavior is completely unchanged.
-- ─────────────────────────────────────────────

create table communities (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,       -- URL segment: /[slug]/
  name        text not null,
  admin_id    uuid not null references profiles(id) on delete restrict,
  is_closed   boolean not null default false,  -- false = open to any zip match
  zip_codes   text[] not null default '{}',    -- zip codes this community covers
  created_at  timestamptz not null default now()
);

alter table communities enable row level security;

create policy "Anyone can read open communities"
  on communities for select using (is_closed = false);

create policy "Admins can read their own closed community"
  on communities for select using (auth.uid() = admin_id);

create policy "Users can create communities"
  on communities for insert with check (auth.uid() = admin_id);

create policy "Admins can update their community"
  on communities for update using (auth.uid() = admin_id);

-- ─────────────────────────────────────────────
-- COMMUNITY MEMBERS (skeleton)
-- Only meaningful for closed communities.
-- Open communities derive membership from zip match.
-- ─────────────────────────────────────────────

create table community_members (
  community_id  uuid not null references communities(id) on delete cascade,
  profile_id    uuid not null references profiles(id) on delete cascade,
  role          text not null default 'member'
                  check (role in ('member', 'admin')),
  joined_at     timestamptz not null default now(),
  primary key (community_id, profile_id)
);

alter table community_members enable row level security;

create policy "Members can see other members in their community"
  on community_members for select using (
    auth.uid() = profile_id
    or exists (
      select 1 from community_members cm
      where cm.community_id = community_members.community_id
        and cm.profile_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- Add community scope to user_resources
-- Null = platform-wide listing (current behavior)
-- Non-null = scoped to that community
-- ─────────────────────────────────────────────

alter table user_resources
  add column community_id uuid references communities(id) on delete set null;
