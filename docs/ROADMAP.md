# CommonGround Social — Roadmap

This is a living document. Items move. Priorities shift as we learn from real users.

The north star for every phase: **does this help a neighbor connect with a neighbor offline?**

---

## Phase 0 — Proof of Concept (current)

Goal: Get a live link that we can share on Reddit. $0/month infrastructure. No users yet — this phase is about proving the technical foundation is solid enough to invite real people in.

### Infrastructure
- [x] Next.js 16 + Supabase scaffold
- [x] Supabase Auth (magic link)
- [x] PostgreSQL schema with RLS
- [x] 42 pre-seeded canonical tags
- [ ] Deploy to Vercel free tier (connect GitHub repo)
- [ ] Supabase project created, migration run

### Core flows
- [ ] Public browse page: enter zip → see available resources (`/[zipcode]`)
- [ ] Profile creation: display name, zip code, neighborhood
- [ ] Resource listing: pick a canonical tag, add optional notes, mark available
- [ ] Connection request: "I'm interested" → email notification to resource owner
- [ ] Connection request response: accept/decline via email link or app

### Launch readiness
- [ ] Basic error states (no resources in this zip, user not found)
- [ ] Mobile-responsive layout
- [ ] Clear explanation of how it works on the home page
- [ ] Privacy statement (simple, plain language)

---

## Phase 1 — First Real Users

Goal: 50–100 active resource listings across 2–3 zip codes. At least 5 successful offline connections (someone got the thing they needed from a neighbor).

### Discovery
- [ ] Fuzzy tag search (using `pg_trgm` similarity)
- [ ] Browse by category (tools / space / materials / skills)
- [ ] "Request a tag" — user can suggest a new resource type

### Trust
- [ ] Report a listing (abuse, spam)
- [ ] Mark a connection as completed (voluntary, private — just for our metrics)
- [ ] Basic email digest: "New resources in your zip this week"

### Profile
- [ ] Edit profile (display name, neighborhood, contact pref)
- [ ] View your active listings
- [ ] Export your data (JSON)
- [ ] Delete account (full cascade)

### Ops
- [ ] Admin panel: review flagged listings, approve new canonical tags
- [ ] Basic analytics (resource listing counts by zip, connection request counts) — internal only, never user-facing

---

## Phase 2 — Visions (Community Projects)

Goal: Enable small community projects to form and coordinate. A vision is a project that needs multiple people and possibly resources or funding.

### Visions
- [ ] Create a vision: title, description, what's needed (resources + people)
- [ ] Express interest in a vision
- [ ] Vision updates (like a changelog, not a feed)
- [ ] Vision completion — mark as done, brief outcome description

### Coordination
- [ ] Resource pool for a vision — request specific listed resources for a project
- [ ] Volunteer sign-up for a role in a vision

### No chat
We're explicitly not building in-vision messaging. Use the connection request flow to exchange contact info and coordinate off-platform.

---

## Phase 3 — Funding Layer

Goal: Enable community visions to receive funding from neighbors and supporters. Capture 8% platform fee on funded amounts.

### Fundraising
- [ ] Funding goal for a vision
- [ ] Stripe integration for contributions
- [ ] Transparent fee display (8% shown at contribution)
- [ ] Payout to vision organizer when goal met (or milestone-based)

### Accountability
- [ ] Public vision budget: how funds were requested vs. spent
- [ ] Organizer updates required for funded visions
- [ ] Refund flow for uncompleted funded visions

### Legal
- [ ] Terms of service for funded visions
- [ ] Consider fiscal sponsorship structure for nonprofit visions
- [ ] Identity verification for vision organizers handling funds (not for general users)

---

## Phase 4 — Managed Hosting for Communities

Goal: Let an organization (neighborhood association, mutual aid group, community garden) run their own CommonGround instance with their own branding and member list.

### Multi-tenancy
- [ ] Community namespace (`/[community-slug]/`)
- [ ] Community admin: approve members, manage tags
- [ ] Community-specific canonical tags (in addition to platform-wide)

### Isolation
- [ ] Option: closed community (invite-only)
- [ ] Option: open community (anyone in zip range can join)
- [ ] Data isolation between communities (opt-in: a resource can be listed in multiple communities)

### Sustainability
- [ ] Monthly subscription for managed hosting (pricing TBD — keep it accessible)
- [ ] Self-hosting option: AGPL means you can run your own instance for free

---

## Things we're explicitly not building

- Advertising
- Premium user tiers that gate basic functionality
- Identity verification tied to behavior surveillance
- Algorithmic feeds
- Direct messaging
- Photos of people
- Reputation scores or star ratings
- "Top neighbor" leaderboards
- Push notifications optimized for re-engagement

---

## How priorities shift

This roadmap is driven by what real users need, not by what makes the platform look impressive in a pitch deck. If Phase 1 reveals that the connection request flow is broken, we fix that before touching Phase 2. If nobody wants Visions, we skip Phase 2 entirely.

We will update this document when we learn things that change the plan.
