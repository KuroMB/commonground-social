-- ─────────────────────────────────────────────
-- FEEDBACK / SUPPORT TICKETS
-- Anonymous or authenticated. One text field.
-- No category dropdowns, no required fields
-- besides the message itself.
-- ─────────────────────────────────────────────

create table feedback (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('support', 'give')),
  message     text not null,
  contact     text,                                    -- optional, provided by user
  profile_id  uuid references profiles(id) on delete set null,
  page_path   text,                                    -- which page they were on
  created_at  timestamptz not null default now()
);

alter table feedback enable row level security;

create policy "Anyone can submit feedback"
  on feedback for insert with check (true);

create policy "Users can read own submissions"
  on feedback for select using (auth.uid() = profile_id);
