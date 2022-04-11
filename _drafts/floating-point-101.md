---
title: Floating-point arithmetic – all you need to know, interactively
image: /assets/floating-point-101/banner.png
stylesheet: /assets/floating-point-101/number-line.css
---

Software engineering keeps getting more abstract, but one thing is unchanging: the importance of floating-point arithmetic. _Every_ programmer is bound to work with numbers (they call them _computers_ for a reason), so it's genuinely useful to understand the way computers do math, no matter if your code is for a ride-hailing service, a stock exchange, or a to-do app. Let's explore how this works!

## The Standard

Let's start with one key assumption: in all the world, on every continent, there's one and one only way of doing floating-point arithmetic.

This makes things a lot easier _and_ it's true in practice. That standard's name?

~~Albert Ein~~ **IEEE 754**.

How's this so simple? I mean, we all know how attempts at standardization _really_ turn out.

<figure>
<a href="https://xkcd.com/927/"><img src="https://imgs.xkcd.com/comics/standards_2x.png" title="Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit." alt="Standards" height="283" width="500" loading="lazy"></a>
<figcaption><i>fig. 1</i> — There's always a relevant XKCD.</figcaption>
</figure>

You'd be correct to think more than one format must have been invented. _Plenty_ were – in the early days of computing, practically every system with floating-point capabilities had its own. Later on, brand-specific formats emerged: IBM went for hexadecimal floating-point in their mainframes, Microsoft created Microsoft Binary Format for their BASIC products, DEC cooked up yet something else for the VAX architecture.

This changed when Intel decided in the late 70s to design the floating-point chip to rule them all – which required a format to rule them all too, the best possible. The decision culminated in the Intel 8087 coprocessor of 1980, but even before that, other companies in the space caught wind of this work and set up [a common effort](https://www.researchgate.net/publication/2954891_IEEE_754_An_Interview_with_William_Kahan) to standardize floating-point arithmetic – the IEEE 754 working group. Two competing drafts prevailed: the Intel 8087 spec vs. the DEC VAX one. After some more arguments and [error analysis](http://people.eecs.berkeley.edu/~wkahan/19July10.pdf), in 1981 Intel's draft won out, rapidly got adopted by everyone, and [the rest is history](https://www.intel.com/content/dam/www/public/us/en/documents/case-studies/floating-point-case-study.pdf) (though it took them another four extra years of bickering to publish that draft, of course!).

> For a detailed look at historic floating-point formats, see [this great article by John Savard](http://www.quadibloc.com/comp/cp0201.htm).

## The Sizes

Let's get into the meat of it, starting with… value sizes in bits. This aspect informs the practical details of the scheme, but _can't_ really be worked out from first principles. Rather, the values we're using today are the result of a balancing act between precision, range, and hardware constraints (word size).

Two floating-point sizes are in common use:

-   32 bits, called **single-precision**. This can hold an absolute value of up to `3.403E+38` with 24 binary digits of precision.
-   64 bits, called **double-precision**. This can hold an absolute value of up to `1.798E+308` with 53 binary digits of precision.

Back in the day, double-precision was reserved for operations requiring exceptional precision or range. With 64-bit processor architectures becoming standard though, double is now often the default, as its performance penalty decreased significantly.

## The Notation

Much like how humans use [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) (e.g. `6.022 * 10^23`) for expressing numbers of arbitrary magnitude in a standard way, computers under the hood store each floating-point value as three numbers cleverly put together. These numbers all fit into either 32 bits (for single-precision floating-point) or 64 bits (for double-precision).

```
(-1)^sign * significand * 2^exponent
```

-   The **sign** is a single bit – 0 if the number is positive, 1 if negative.
-   The **exponent** is a signed integer. In a way, it establishes the magnitude, e.g. an exponent of 8 means that the absolute value of the number must be in the range `(256,512]` (`(2^8,2^9]`).  
    Curiously, despite the exponent being signed, it's stored not using [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement) but as an unsigned integer, with the computer _knowing_ to subtract a known **bias** to get the real value. The raw stored value is called the **biased exponent**. That bias is 127 in single-precision and 1023 in double.  
    The exponent's size determines the _range_ of the type – 8 bits of it in single-precision and 11 in double.
-   The **significand** (also called the *mantissa*) is a fixed-point number in the range `(1,2]` (e.g. 1 or 1.0625 or 1.984375). It "fine-tunes" the value within the working range set by the sign and exponent.  
    Because the significand's leading digit normally<a href="#the-zeros" style="text-decoration: none">\*</a> is 1 (**normal number** being the technical term for such a case), that digit in fact totally omitted from the binary representation – if the significand is, say, `0b1.001` (that's binary for 1.125), only the `001` part ends up being stored.  
    The significand's size determines the type's _precision_ – 24 significant bits of it in single-precision and 53 in double.

See for yourself how this all comes together using the calculator below! Toggle bits by clicking on them and see what number comes out, or enter a number to see what it looks like in your computer's memory:


<figure class="number-line">
<iframe src="https://cdpn.io/pen/debug/xxpKxZw" height="172" title="IEEE 754 Floating Point Calculator"></iframe>
    <figcaption><i>fig. 2</i> — <a href="https://codepen.io/Twixes/pen/xxpKxZw?editors=0110">Play with this widget's code on CodePen!</a></figcaption>
</figure>

## The Zero(s)

We've missed something though: how to represent 0? Mathematically, the only way to do that is to set the significand to 0… but that implicit leading 1 is standing in the way.

Here's the trick: when the significand is `0`, setting the biased exponent to `0` makes the significand's leading digit _also_ `0`. _Voilà_, `0` as a result! That's a useful number to have.

Hmm, what if we set the _sign_ to `1` at the same time? That signifies a negative value, but it's obviously ridiculous for _zero_ to be neg– WHAT?! According to all sources _(what sources now)_ we _do_ actually get `-0` this way. It's not even as absurd as it seems at first glance: for practically all intents and purposes `-0 == +0`, but there are a few logical edge cases where that doesn't hold. We'll get to those in TODO.

## The Almost Zero

What should happen when the result of a calculation is a value so small that it can't be represented by a normal number? This situation is called **underflow** and it's more significant than it might sound – for mathematics to be reliable we need to handle _all_ of the number line predictably.

Historically, underflow was handled by returning zero. This mechanism is called **flush-to-zero** and it's very obvious. It's not great for accuracy though. The issue is, absolute differences between neighboring floating-point values get smaller as the values themselves do so too, BUT because the significand's leading digit always is 1, the jump between 0 and the smallest representable value is MUCH larger than the jump between that smallest value and the _second_ smallest one. You can see this in figure 3, which shows what this'd look like for double precision. Note that 2<sup>-1023</sup> couldn't be achieved, because we'd go straight to 0.
 

<figure class="number-line">
    <div class="number-line__axis number-line__axis--problematic">
        <div class="number-line__marker number-line__marker--0 number-line__marker--power"><span>0</span></div>
        <div class="number-line__marker number-line__marker--4 number-line__marker--power number-line__marker--problem number-line__marker--open"><span>2<sup>-1023</sup></span></div>
        <div class="number-line__marker number-line__marker--1"></div>
        <div class="number-line__marker number-line__marker--1"></div>
        <div class="number-line__marker number-line__marker--1"></div>
        <div class="number-line__marker number-line__marker--1 number-line__marker--power"><span>2<sup>-1022</sup></span></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--power"><span>2<sup>-1021</sup></span></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4 number-line__marker--power"><span>2<sup>-1020</sup></span></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8 number-line__marker--power"><span>2<sup>-1019</sup></span></div>
    </div>
    <figcaption><div class="recommendation recommendation--dont"></div><i>fig. 3</i> — Don't.</figcaption>
</figure>

During development of IEEE 754 it turned out there's a verifiably better way. Remember how 0 is represented? It relies on the significand's leading digit being 0 when the biased exponent is 0. We can extend this to non-zero values of the significand – this way, there's no odd gap when going from 0 up. The gap has merely moved away from 0 though – to get rid of it, we can make it so that the unbiased exponent is the same for the biased exponent value of 0 as it is for 1. As you can see in figure 4, this way we trade away some precision at the bottom range of normal numbers… but what we get is a more continuous number line. Those extremely small values that have 0 as the significand's leading digit are called **<span style="color: magenta">subnormal numbers</span>** (or *denormalized*).

<figure class="number-line">
    <div class="number-line__axis">
        <div class="number-line__marker number-line__marker--0 number-line__marker--power"><span>0</span></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--subnormal"></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--subnormal"></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--subnormal"></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--power"><span>2<sup>-1022</sup></span></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2"></div>
        <div class="number-line__marker number-line__marker--2 number-line__marker--power"><span>2<sup>-1021</sup></span></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4"></div>
        <div class="number-line__marker number-line__marker--4 number-line__marker--power"><span>2<sup>-1020</sup></span></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8"></div>
        <div class="number-line__marker number-line__marker--8 number-line__marker--power"><span>2<sup>-1019</sup></span></div>
    </div>
    <figcaption><div class="recommendation recommendation--do"></div><i>fig. 4</i> — Do.</figcaption>
</figure>

## The Overflow


## The Scales

Fair rounding


## The Fakes

NaN != NaN

## The Unknowns

Undefined operations

## The Guarantees

## The Transformation

Converting from double to single and vice versa

## The Surprises

0.1 + 0.2
