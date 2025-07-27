---
title: Glue teams vs. back-office teams
description: "As your product-focused org scales, you'll hear calls for two kinds of horizontal teams. They sound similar, but they aren't."
tag: blog
---

There's a trap that growing product-focused companies fall into: it's easy to confuse *glue teams* with *back-office teams*, and if you aren't careful, you can build an org that optimizes for fluffy internal goals more than actual value. Only, in avoiding that outcome you mustn't kill all cross-cutting work.

Let me explain.

## Two types of teams, world apart

As you scale, you'll hear calls for two kinds of teams that span product areas. They sound similar, but they aren't.

**Back-office teams** serve other teams. Period. Their customers are on the same payroll. Like the back office of a bank, paying customers never see them. They provide backend infrastructure, build developer tools, maintain component libraries, run data platforms.

Some of this work becomes critical early on – if you run a data-intensive SaaS (like we're doing at [PostHog](https://posthog.com)), the data infra is critical to operations, and you won't get far without a clear owner there.

But here's the thing about back-office teams: they're always one layer removed from real impact. They make tools that help people who help users. There's that layer of indirection, and an inevitable loss of context. Blink, and that team just spent a week solving an elegant internal problem with minimal impact.

**Glue teams** serve users. Directly. These teams do [glue work](https://www.noidea.dog/glue) at the level of the product – they're product teams that just happen to cut horizontally across features instead of owning vertical slices.

Think, auth. Not flashy, not a standalone product line – yet it keeps the product together in one piece. It makes or breaks enterprise deals, or a user's day. It may even bring revenue from the [SSO tax](https://sso.tax/), but that's only possible because of the core product. Billing? The ultimate glue. That's systems, UI, and accounting, all in one. The spice must flow.

The folks owning these areas should be talking to users, they should be owning product metrics.

## Resist the urge

Here's the uncomfortable truth: you can get away without back-office teams much longer than you think, and you should. Often what you need is a glue team instead.

I know. Engineers are complaining about CI. Internal tools could be better. Still, keep those zero degrees of separation from customers for as long as you can. The space of *possible* tasks is infinite, while the set of tasks leading to success with customers – so surprisingly small. Distance from users makes it hard to see what really matters, whether you're an engineer, designer, or founder!

Distributed ownership is the name of the game for those internal aspects. It only takes healthy agency: one person improves the dev environment as a side quest, someone else maintains the component library between feature work. It's not their full-time job, and it shouldn't be yet. For the hairiest problems, you agree to spin up a temporary project team to address that specifically.

The breaking point depends massively on your product. Deep tech needs back-office teams quick, actual research orgs even. In SaaS, this point is far out. Get to 50 engineers before actually thinking of it. Start back-office teams when you can honestly call their resources a rounding error compared to product development. Till then – a little bit of chaos is valuable. It teaches what problems actually matter.

Meanwhile, it's easy to set aside shared areas of the product and forget about them. That's precisely where you need glue teams. We're talking aspects customers hit all the time. Customers use your SDKs across 20 platforms? Without an SDK team, the quality of those SDKs plummets over time. Auth, billing? You already know the story.

## The bottom line

Create glue teams when users are suffering - often earlier than you think. Create back-office teams when the ROI starts feeling *unreasonably* large - much later than you think.

Keep building what people want!

_Thanks to Yakko Majuri and Stay SaaSy for reading drafts of this post._
