---
title: Glue teams vs. back-office teams
description: "As your product-focused org scales, you'll hear calls for two kinds of horizontal teams. They sound similar, but they aren't."
tag: blog
image: /assets/glue-teams-vs-back-office-teams/banner.png
---

> *Since I initially published this post, it's also become an [edition of the Product for Engineers newsletter](https://newsletter.posthog.com/p/glue-teams-vs-back-office-teams) ran by my PostHog colleagues.*

There's a trap that growing product-focused companies fall into: it's easy to confuse *glue teams* with *back-office teams*, and if you aren't careful, you can build an org that optimizes for fluffy internal goals more than actual value. If *too* careful… value will slip through your fingers.

Let me explain.

## The hustle-to-scale pipeline

In the early days of a startup, there's clarity. You've got a tight team. Everyone builds the product. Everyone's "customer-obsessed". *Everyone*'s scrambling for product-market fit. A customer wants to pay the [SSO tax](https://sso.tax/)? *Say no more.* The org chart is a circle with a post-it note saying "build something people want".

But then you grow. Areas need to be split up for ownership. Some bits get chopped up cleanly, others turn into murky waters. Here's where the confusion begins.

## Two types of teams, worlds apart

As you scale, you'll hear calls for two kinds of teams that span product areas. They sound similar, but they aren't.

**Back-office teams** serve other teams. Period. Their customers are on the same payroll. Like the back office of a bank, paying customers never see them. They provide backend infrastructure, build developer tools, maintain component libraries, run data platforms. It's neat stuff.

Here's the thing about back-office teams: they're always one layer removed from real impact. They make tools that help people who help users. There's that layer of indirection, and an inevitable loss of context. Blink, and that team just spent a week solving an elegant internal problem with minimal impact.

> *Some* back-office work is an early must-have – if you run a data-intensive SaaS (like we're doing at [PostHog](https://posthog.com)), you won't get far without a clear owner of data infra. Still, with so much of hosting outsourced to cloud providers, infra is leaner than ever. More so if you run on Vercel + Supabase.

**Glue teams** serve users directly. These folks do [glue work](https://www.noidea.dog/glue) at the level of the product – they're product teams that just happen to cut horizontally across features instead of owning vertical slices.

Think, auth. Not flashy, not a standalone product line – yet it keeps the product together in one piece. It makes or breaks enterprise deals, or a user's day.

Billing? The ultimate glue. That's systems, UI, and accounting, all in one. The spice must flow.

The folks owning these areas should be talking to users, they should be owning product metrics.

## Resist the calls for nice-to-haves

The truth: you can get away without back-office teams much longer than you think, and you should.

I know. Engineers are complaining about CI. Internal tools could be better. Still, keep those zero degrees of separation from customers for as long as you can. The space of *possible* work is infinite, but the set of tasks needed for success – surprisingly narrow. Distance from users makes it hard to see which is which, whether you're an engineer, designer, or founder!

Distributed ownership is the name of the game for those internal aspects. It takes some healthy agency: one person improves the dev environment as a side quest, someone else maintains the component library between feature work. It's not their full-time job, and it shouldn't be yet. For the hairiest problems, you agree to spin up a **short-lived** project team to address that specifically.

Start a back-office team when you can honestly call its resources a rounding error compared to product development. Backend infra at 20 engineers, anything else at 50+. Till then – a little bit of chaos is valuable. It teaches what problems actually matter.

## Address the must-have gaps

Meanwhile, it's easy to set aside shared areas of the product and forget about them. Don’t mistake them for back-office functions. This is precisely where you need glue teams.

We're talking aspects users hit all the time. Customers using your SDKs across 10 platforms? Without dedicated owners, the quality of those SDKs plummets over time. Paying users suffer, and not only them, as the mess is *also* making other teams less productive. Auth, billing? You already know the story.

Those glue areas don't bring product-market fit by themselves, but neglecting them sure as hell can lose you *product-user fit*.

## The bottom line

Spin up back-office teams when the ROI of such a team starts feeling *unreasonably* large - much later than you think.
Spin up glue teams when users run into pain in cross-cutting areas of the product - often earlier than you think.
Keep building something people want this way.

<br/>

*Thanks to Yakko Majuri and the Stay SaaSy vigilantes for reading drafts of the post.*
