---
title: Back-office vs. glue teams
description: ""
tag: blog
---

There's a trap that growing product-focused companies fall into: you start confusing *glue teams* with *back-office teams*, and if you aren't careful, you'll build an org that optimizes for fluffy internal goals. But even worse: in a desperate fear of internal goals, you may accidentally kill actual customer value too.

Let me explain.

## Respect the hustle (while it's there)

In the early days of a startup, there's clarity. You've got a tight team. Everyone builds the product. Everyone's customer-obsessed. *Everyone's* scrambling for product-market fit.

These are the golden days: the org chart is more like a flat circle with a post-it note saying "build something people want". Nobody's arguing about ownership, and when hordes of users want to pay the [SSO tax](https://sso.tax/)? One of you just *ships it*.

But then you grow.

You hit 50 people. Then 100. Then 200. And the org chart starts to creak. Areas need to be split up for ownership. Some bits get chopped up nice and clean, others become murky waters. Here's where the confusion begins.

## In the back of the office

A permanent front-end _platform team_ building a component library. Sounds useful. Sounds efficient. The problem: the only customer are other teams. There's that layer of indirection. An inevitable loss of context. Blink, and that team just spent weeks solving an elegant internal problem with minimal impact on any timescale.

The hallmark of a back-office team: not being on the hook for user engagement or retention. You get abstractions no one truly needed. Shiny action at a distance. Till you reach big tech scale, most of these teams are a luxury.

## Meet glue teams

Glue teams look deceptively similar to back-office teams. They often span the product. They often build APIs. They often don't own one single vertical or feature. But there's a crucial difference:

**Glue teams serve users. Directly.**

A good example? Authentication. Not flashy. Not a standalone product line. But it keeps the product together in one piece. It makes or breaks entire deals by itself – or a user's day.

Glue teams live at that intersection of "supporting the product as a whole" and "delivering direct value".

Let me say that again: *glue teams are product teams*. They build cross-cutting features that touch the entire experience, but they build them *for customers*, not for colleagues. They own broad surface areas. They don't get the most glory. But they are indispensable.

## Confusion gets costly

When glue teams get lumped in with back-office teams, two things happen easily – both dangerous.

Trap one: you spin up back-office teams too early. Teams that don't talk to users, with no real product metrics. Their roadmaps may be filled with "platform improvements" and "DX wins". _Some_ of the work will move the needle, sure. The thing is, the space of _possible_ work is infinite. The space of work that'll genuinely make the product (and business) successful – surprisingly tiny. The key is to avoid distractions. Being out of touch with users is a recipe for focusing on distractions.

Trap two: you get spooked by the idea of any team not tied to revenue directly. So you kill glue work entirely. You dodge anything cross-cutting, anything shared, anything that isn’t a product line in itself. Congratulations: you’ve now guaranteed a fragmented product, repeated bugs, and half-baked experiences that fall through the cracks. Key cross-cutting areas that don't fit neatly into any product line – no man's lands. Well-known issues affecting everyone – hot potatoes. That's not to say it no longer is everyone's responsibility to *just do things*… but the reality is: scope outside of a team's area is just side quests.

The cost of going overboard is real both ways. With back-office teams too early, things get built in a disconnect from what matters. With glue teams verboten, what matters gets left out in the cold.

## What to do about it

If you're building in a product-led company, here's the cheat sheet:

* **Back-office teams** can optimize significantly, but they've got an opportunity cost associated as well.
* **Glue teams** are as valuable as other product teams. Hold them to the same standards: solving user problems, hearing from customers, shipping things that matter.

Ask: *"Who's the customer?"*

- Internal teams → be skeptical.
- Users → great. Keep the team focused. Hold them accountable.
