---
title: async/await explained deeply – the primer I wish I had
description: "The modern `async`/`await` syntax is a neat abstraction for concurrent programming – but without knowledge of what exactly is being abstracted away, it's hard to truly reason about and fully leverage concurrency. This post explains is it all, in six flavors: JS, Python, Rust, Swift, C#, and Go."
tag: blog
---

The `async`/`await` syntax is all the rage these days. In recent years, it's been added to: C# ([2012](https://devblogs.microsoft.com/dotnet/async-in-4-5-worth-the-await/)), Python ([2015](https://www.python.org/dev/peps/pep-0492/)), JavaScript ([2017](https://262.ecma-international.org/8.0/#sec-async-function-definitions)), Rust ([2019](https://blog.rust-lang.org/2019/11/07/Async-await-stable.html)) or Swift ([2021](https://github.com/apple/swift-evolution/blob/main/proposals/0296-async-await.md)). The goal of it all: making _concurrent programming_ as straightforward as possible, by abstracting away its intricacies. That's noble, as concurrency is in many domains key for achieving satisfying performance, and `async`/`await`-enabled APIs really are pleasant to use.

_What_ is concurrency though, _why_ do we need it, and _how_ do these two keywords enable it? To truly reason about `async`/`await`-based code, it's pretty essential to have a clear idea of what's being abstracted away. With this post, I hope to lay it all out in plain terms.

## Defining concurrency

We'll dive deep into code later on, but first things first: let's explain the concept of concurrency.

It's pretty intuitive because humans do things concurrently a lot of the time. Let's take Alice for example. It's Friday evening and Alice is baking a cake for a friend, while also planning to read the final chapter of the new George R.R. Martin book "The Winds of Winter". That's basically two separate tasks:

-   baking the cake, starting with raw ingredients and ending with the baked cake
-   reading the chapter, from the beginning until the end

What _Alice_ would naturally do is:

1. Prepare the batter for the cake, pour it into a tin, put it all in the oven.
2. While waiting for the cake to bake, read the book page by page.
3. _(30 minutes after completing 1.)_ When baking time has passed, take the cake out of the oven.
4. Continue reading the book to the end.

We're here to talk computer science, so let's try to write this out in Python!

```python
bake_cake()
read_chapter()
```

So simple! But totally inefficient: plain code like this is **synchronous**, meaning that statements run sequentially and for a statement (a function call for instance) to run, all preceding statements need to have completed. The resulting order of actions would be:

1. Prepare the batter for the cake, pour it into a tin, put it all in the oven.
2. _(30 minutes after completing 1.)_ When baking time has passed, take the cake out of the oven.
3. Only then read the book to the end.

The problem is that Alice would do nothing at all for the 30 minutes between steps 1. and 2.! There's no way she'd actually do that, because that'd be incredibly boring, but boredom is not a disincentive computers know – all they have is instructions. So let's try to formulate the instructions more efficiently.

What we need is for `bake_cake` and `read_chapter` to have points at which they could be paused so that we can move some other task forward, while the paused one waits for some event:

```python
def bake_cake():
    prepare_ingredients()
    sleep()
```

## Parallelism

## Colored functions problem

## Rust tasks vs. promises

## C# history

## Cooperative concurrency

## Alternative: Preemptive concurrency with Goroutines

## IO vs CPU-bound
