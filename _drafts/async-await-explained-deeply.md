---
title: async/await explained deeply – the primer I wish I had
lead: "The modern `async`/`await` syntax is a neat abstraction for concurrent programming – but without knowledge of what exactly is being abstracted away, it's hard to truly reason about and fully leverage concurrency. This post explains is it all, in six flavors: JS, Python, Rust, Swift, C#, and Go."
---

The `async`/`await` syntax is all the rage these days. In recent years, it's been added to: C# ([2012](https://devblogs.microsoft.com/dotnet/async-in-4-5-worth-the-await/)), Python ([2015](https://www.python.org/dev/peps/pep-0492/)), JavaScript ([2017](https://262.ecma-international.org/8.0/#sec-async-function-definitions)), Rust ([2019](https://blog.rust-lang.org/2019/11/07/Async-await-stable.html)) or Swift ([2021](https://github.com/apple/swift-evolution/blob/main/proposals/0296-async-await.md)). The goal of it all: making _concurrent programming_ as straightforward as possible, by abstracting away all its intricacies. That's noble, as concurrency is in many domains key for achieving satisfying performance, and `async`/`await`-enabled APIs really are pleasant to use.

_What_ is concurrency though, _why_ do we need it, and _how_ do these two keywords enable it? To truly reason about `async`/`await`-based code, it's essential to have an idea of what's being abstracted away. For me, it took a few of years of learning plus coding to build a deep understanding of the various concurrency abstractions out there. I never really found a resource that would lay it all out succinctly, so with this article I hope to offer you one!

## Defining concurrency

Humans are concurrent by default. Let's take Alice for example. It's Friday evening and Alice is baking a cake for a friend, while also planning to finish reading the new Game of Thrones book "The Winds of Winter".

Naturally, Alice would do it in this order:

1. Prepare the batter for the cake, pour it into a tin, put it all in the oven.
2. While waiting for the cake to bake, read the book page by page.
3. _(30 minutes after completing 1.)_ When baking time has passed, take the cake out of the oven.
4. Continue reading the book to the end.

Let's write this out as JavaScript code!

We'll assume two functions:

-   `bakeCake()` that represents baking the cake (starting with raw ingredients, ending with the baked cake right out of the oven).
-   `readBook()` that represents reading the book (until it's finished of course).

```javascript
bakeCake()
readBook()
```

So simple! But… wrong. This code is **synchronous**, meaning that a statement can only run once all the preceding ones have completed. The resulting order of actions would be:

1. Prepare the batter for the cake, pour it into a tin, put it all in the oven.
2. _(30 minutes after completing 1.)_ When baking time has passed, take the cake out of the oven.
3. Only then read the book to the end.

The problem here is that Alice would have to mindlessly stare at the oven for 30 minutes between steps 1. and 2. instead of doing something productive! There's no way she'd actually do that, because that'd be incredibly boring, but computers don't have the disincentive of boredom – only instructions. So let's try to formulate these instructions more efficiently.
