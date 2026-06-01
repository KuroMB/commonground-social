@AGENTS.md

# CommonGround Social — Claude Code Context

## What this is

A neighbor resource-sharing network. Anti-Nextdoor by design. People list things they can share (tools, space, materials, skills), neighbors browse and request a connection. No chat, no photos, no follower counts, no algorithmic feed.

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Auth + RLS) — use the JS client directly, no Prisma
- **Tailwind CSS v4**
- **AGPL-3.0** license

## Database schema

See `supabase/migrations/0001_initial_schema.sql` for the full schema. Key tables:

| Table | Purpose |
|---|---|
| `canonical_tags` | Source of truth for resource types (slug + display_name + is_consumable) |
| `tag_aliases` | Many raw strings → one canonical tag. Enables fuzzy match without duplication |
| `profiles` | Display name, zip_code, neighborhood label, lat/lng (never shown), contact_pref |
| `user_resources` | What someone offers. FK to canonical_tag_id + profile_id + zip_code (denormalized) |
| `connection_requests` | Interest signal. from → to, references a specific resource. status: pending/accepted/declined |

`pg_trgm` extension is enabled. Use `similarity()` for fuzzy tag search.

## Key product decisions

- **No photos** — privacy, no body image pressure, can add later
- **Magic link auth** — no passwords
- **Neighborhood-level location** — exact lat/lng stored internally, neighborhood label shown publicly
- **Connection requests only** — no chat, no DMs. Intentional friction.
- **Canonical tags** — never store raw strings as resource identifiers. Always route through canonical_tag_id.
- **Pre-seeded 42 tags** — tools, space, materials, labor, knowledge. Pool looks alive on day one.

## Supabase clients

- Browser: `src/lib/supabase/client.ts` — `createBrowserClient`
- Server: `src/lib/supabase/server.ts` — `createServerClient` with cookies

## Environment variables

Copy `.env.local.example` → `.env.local` and fill in from your Supabase project:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Philosophy

See `docs/PHILOSOPHY.md`. Core principle: **Inverse Retention** — success is measured by how fast users get offline. Every feature must pass the test: does this help someone connect with a neighbor, or does it keep them on the app?

## What's built (Phase 0)

- [x] Next.js scaffold with Supabase clients
- [x] Initial DB schema with RLS
- [x] 42 pre-seeded canonical tags
- [ ] Zip code entry → resource listing page (`/[zipcode]`)
- [ ] Profile creation + resource listing flow
- [ ] Connection request flow
- [ ] Deploy to Vercel free tier

## What's next

Build `app/[zipcode]/page.tsx` — a public page showing available resources in a zip code. No login required to browse. Login required to make a connection request.

Query pattern:
```typescript
const { data } = await supabase
  .from('user_resources')
  .select(`
    id, notes, zip_code,
    canonical_tags (slug, display_name, is_consumable),
    profiles (display_name, neighborhood)
  `)
  .eq('zip_code', zipcode)
  .eq('is_available', true)
```
