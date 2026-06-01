# CommonGround Social — Origins

## Where this came from

CommonGround started as a consulting practice — a small advisory firm helping organizations with strategy. The name, the idea of shared ground, was about bringing people together to solve problems.

At some point that framing flipped. Instead of a firm that helps organizations, what if it was a platform that helps neighbors? The advisory work stays. But the name and the mission expand into something more direct: actual common ground, actual neighbors, actual shared resources.

That's the pivot. This repository is the result.

---

## The problem we kept running into

Nextdoor exists. It doesn't work the way neighbors need it to.

Nextdoor is an ad platform. It optimizes for engagement — posts that generate reactions and comments, not posts that help someone borrow a ladder. The result is a neighborhood feed full of complaints about leaf blowers and arguments about local politics. The useful signal (my neighbor has a pressure washer) drowns in the noise.

There are also coordination platforms — Kickstarter, GoFundMe, Facebook Events — but they're all designed around broadcast. You post something to everyone. There's no lightweight way to say "I have this thing, who needs it?"

And Reddit, which is genuinely useful for communities organized around interests, isn't organized around physical proximity. r/STL can help you find a plumber recommendation. It can't help you find out that your neighbor two blocks over has a tiller sitting unused in their garage.

The gap is: **hyper-local resource discovery with minimal friction and no algorithmic noise.**

---

## The design constraints (and why)

**No photos of people.**
Privacy. Safety. Photos enable appearance-based filtering, which replicates social hierarchies we're trying to step around. Resources can have photos eventually. People don't need them.

**No direct messaging.**
Every platform with DMs eventually becomes a harassment vector. The connection request model is intentional friction: you signal interest, they get notified, they decide whether to respond with contact info. The conversation moves off-platform. This is a feature, not a limitation.

**Obscure exact location.**
We store lat/lng for proximity queries. We show neighborhood labels publicly ("Cherokee Street area"). True addresses are never stored. This is both a privacy protection and a safety one — especially important for people sharing resources from their home.

**No follower counts or reputation scores.**
These create status hierarchies. The person with 500 connections isn't a better neighbor than the person who just moved in. We want the new arrival to feel as welcome as the longtime resident. Reputation systems, even well-designed ones, tend to calcify existing social hierarchies rather than flatten them.

**Canonical tags, not free-text.**
If everyone types whatever they want as a resource name, you end up with "handsaw," "hand saw," "hand-saw," "Handsaw," and "Stanley hand saw" all as separate things that mean the same thing. The canonical tag + alias system solves this without requiring users to think about it. Type anything, we match it fuzzy to the right canonical.

---

## The first milestone

Get a live link. Post it on Reddit — r/solarpunk, r/degrowth, r/privacy, maybe r/vandwellers or r/homesteading depending on the framing. See if anyone signs up and lists a resource.

We're not trying to go viral. We're trying to find the first 50 people who think this is the right idea. Those 50 people tell us what's broken about the first version. We fix it. Repeat.

That's the whole growth strategy. Organic, slow, community-driven. No paid acquisition. No influencer partnerships. No launch party.

---

## What "nonprofit tech" means to us

Signal doesn't take ads. Wikipedia runs on donations. Mozilla publishes its finances. Craigslist is deliberately ugly and stubbornly resistant to optimization.

These organizations prove that durable, useful, non-extractive technology is possible. They've existed for decades. They're trusted in a way that ad-funded platforms will never be.

We want to be in that category. Not because it's strategically clever, but because it's the right way to build something for communities.

The legal structure is a question for later — nonprofit, cooperative, something hybrid. The intention is fixed now: no VC money, no advertising, transparent operations, community-governed over time.

If we're wrong about the model, we'll say so publicly and figure out what to do next. That's also part of the model.

---

## A note on the name

CommonGround is the consulting practice. CommonGround Social is the platform.

They share a name because they share a premise: the most interesting problems are solved when people with different resources, knowledge, and needs find each other and work together. The consulting firm does that at the organizational level. The platform does it at the neighborhood level.

Eventually they may be separate entities. For now, they're the same person's attempt to act on the same belief in two different contexts.
