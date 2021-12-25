---
title: Using GPT-3 in a side project
lead: Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
---

I'm Polish, a software engineer, a fan of Discord _and_ I enjoy building software tools in my free time. You'll surely be surprised then that I run a [Polish Discord bot called Somsiad](https://somsiad.net) ([open source, written in Python](https://github/com/Twixes/somsiad)), which is now used on well over 3 000 servers. It has a ton of features – they would be incredibly tedious to event list here.

However, there's one ability it's always lacked: to chat.

Then, right after 2021 kicked off, I got a thought: why not make the bot an actual _chat_bot too – now that'd be super.  
The obvious thought, and a trendy one for sure, was "GPT-3 FTW". The new OpenAI text-processing machine learning
model of 2020 made the rounds around the internet. It's proven itself to be imperfect… but still a \_fantastic_ achievement (dangerously so even, maybe).

Only problem: it was (and still is almost a year after relase) in private beta. As a solo developer without
great cause, there's no fast track. You have to submit your request along with lots of other people and hope that eventually it gets accepted. I did that – after all, why not – but without much hope for quick access.

In the meantime, maaaybe there was a more DIY way?

## Handmade

Well, I know some vague details of ML inner workings, but, like most software engineers, I don't have the domain knowledge or resources (time/money…) to implement a quality model from scratch – let alone a model capable of expressing something meaningful with natural language.
I turned to some libraries implementing a variety of ML approaches. Python excels in this space. I found [Hugging Face](https://huggingface.co/) a greatly useful resource. And GPT-2 is actually open source!

But for an actual chat bot resembling a human even approximately, and _particularly_ non-English
(this is Polish we're talking about), nothing was up to par. Not even GPT-2. I mean, I could get some responses even, but nothing resembling coherent human speech. Not without training on a **massive** amount of relevant and varied data, that we carbon-based lifeforms take years to soak in.

No way for me to match GPT-3, even for all its imperfections. And I've still heard nothing from OpenAI.

So I abondoned the topic of a chatbot of my own, hoping for better times when this may be more feasible without massive resources.

## Welcome

A few months passed, I shipped pretty cool stuff at work (advancing product analytics at [PostHog](https://posthog.com)), added a few relatively "dumb" (but useful) features to the bot, watched its usage grow, started a new side project in Rust (of course)…

Then, I noticed a new email in my inbox:

![Welcome to the OpenAI API beta](./assets/welcome.png)

A surprise to be sure, but a welcome one! After a 5 months' wait, GPT-3 was now only one account to create away. I did that and everything went smoothly. I was plopped into
