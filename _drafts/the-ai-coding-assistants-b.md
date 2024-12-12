---
title: 'Benchmarking the AI coding assistants: Copilot, Cody, Codewhisperer, Cursor, and Tabnine tested'
description: "GitHub Copilot started a new era of AI programming tools, but it's gained competition. A lot of it in fact, and all so similar: code completion alongside chat-based assistance. Is GitHub's product still the best out there, or has it been outdone, perhaps by AWS or Sourcegraph? It's so hard to tell! That means one thing: it's time for a benchmark."
tag: blog
---

GitHub Copilot started a new era of AI programming tools, but it's gained competition. A lot of it in fact, and all so similar: code completion alongside chat-based assistance. Is GitHub's product still the best out there, or has it been outdone, perhaps by AWS or Sourcegraph? It's so hard to tell! That means one thing: it's time for a benchmark.

## An ever-evolving landscape

I've been using **[GitHub Copilot](https://github.com/features/copilot)** in VS Code for over a year now, and _have_ been finding it a bit magical at times. At other times, dumb and stubborn – but nobody's perfect. No<i>model</i>'s perfect, I mean. For a long time, I'd been living in peace with Copilot at my side.

That peace has been disturbed lately.

I don't live under a rock, so I heard about AWS launching **[Codewhisperer](https://aws.amazon.com/codewhisperer/)** in 2022 (made generally available in 2023). I sort of dismissed it, because while I associate AWS with reliability, I do not associate it with joy or sleekness.
Then I began seeing **[Tabnine](https://www.tabnine.com/)** being mentioned again – it actually predates Copilot significantly, but was overshadowed for a while. It's been catching up apparently.
Most recently, Sourcegraph released **[Cody](https://about.sourcegraph.com/cody)** in 2023 and made it generally available in December. Sourcegraph is rich in code search expertise and now seems to be betting the house on Cody, which has made me really hopeful about it, since context awareness is key in a coding assistant.
To top it all off, a small startup called Anysphere went all the way and _forked_ VS Code to integrate AI deeply their own way. The fork is called **[Cursor](https://cursor.sh/)**, and I honestly don't know yet if it's a good idea or a bad one.

These five tools differ in their UX, but all do the same jobs:

1. Most essentially, completing code as you're writing it,
1. Writing new code based on your instructions,
1. Refactoring existing code based on your instructions,
1. Explaining existing code.

Yet, in no debate about the merits of these products is their output actually compared, despite a comparison surely being possible and meaningful! All while large language models, which underpin the assistants, _constantly_ are compared on the basis of on their performance in benchmarks such as HellaSwag or real-world exams.

It's time to change this.

## Methodology

It's important to preface with the platform we'll be using: VS Code. While AWS, Tabnine, and Sourcegraph already support JetBrains IDEs plus some other editors (with GitHub _planning_ to support JetBrains), VS Code is simply where AI assistance really took off, and it's still at the forefront.

It's also crucial for the tests to be conducted in a real-world codebase – it's so temptingly easy to create sterile snippets in an empty editor workspace, but that's not how most code is created and not where AI coding tools really provide value. The value is in making day-to-day work more efficient, and that happens in projects with thousands or millions lines of code, where scattered pieces of the codebase depend on each other.

In this benchmark, I'll be using the [PostHog](https://github.com/PostHog/posthog) codebase as such a real-world environment. It's conveniently open-source, reasonably complex (705k lines of code according to `scc`), somewhat diverse in terms of languages (Python, TypeScript, C++, SQL), and also it just happens that I'm [pretty familiar](https://posthog.com/community/profiles/124) with it. Solid foundations for challenges reflective of real work.)

For each product being tested, I'll clone the repo at [commit `72064c8`](https://github.com/PostHog/posthog/tree/72064c8b42f8cf6ebaf50a2576ace151a0442f95) into a new directory, e.g. `posthog-copilot` or `posthog-tabnine`. This way each product will have its own isolated editor workspace, preventing the output of one product influencing the ones tested subsequently.

In each test a product can score between 0 and 3 points (inclusive):

- 0 points for broken syntax
- 1 point for correct syntax, but irrelevant logic
- 2 points for correct syntax and mostly relevant logic
- 3 points for correct syntax and optimal logic

To keep things simple, all tests will have equal weight, so the final score of a product will just be the sum of points it's garnered.

## 99 challenges

1. Code completion
    1. Completing a common util in Python
        ```python utils.py
        from random import random
        from datetime import date

        def random_date_since_epoch():
            return date.fromtimestamp(random() * 10e9)

        def num_seconds_to_formatted_duration(seconds: int) -> str:
            """Convert something like 4001 to 1h 6min 41s"""
            # HERE
        ```
    1. Completing a common util in C++
        ```cpp utils.cpp
        #include <boost/algorithm/string.hpp>

        #include "error.h"
        #include "string.h"

        using namespace std;

        /// Remove double or single quotes wrapping the string.
        string unquote_string(string text) {
            // HERE
        ```
    2. Completing a common algorithm in TypeScript

    3. Completing domain-specific business logic
    4. Type consistency
    5. Test generation (including test data)
    6. SQL SELECT generation
2. Code modification
    1. Fixing logically incorrect code
    2. Code optimization
    3. Refactoring for maintainability
3. Chat
    1. Test generation
    2. Code explanation

## Summaryupstarts



Products:

- [GitHub Copilot](https://github.com/features/copilot)
- [Amazon Codewhisperer](https://aws.amazon.com/codewhisperer/)
- [Sourcegraph Cody](https://about.sourcegraph.com/cody)
- [Cursor](https://cursor.sh/)
- [Tabnine](https://www.tabnine.com/
