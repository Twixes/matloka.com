---
title: Floating-point arithmetic – all you need to know, explained interactively
description:
    'Software engineering keeps getting more abstract, but one thing is unchanging: the importance of floating-point
    arithmetic.'
tag: blog
image: /assets/floating-point-101/banner.png
stylesheet: /assets/floating-point-101/number-line.css
---

Software engineering keeps getting more abstract, but one thing is unchanging: the importance of floating-point
arithmetic. _Every_ computer programmer is bound to work with numbers (they call them _computers_ for a reason), so it's
genuinely useful to understand the way machines do math, no matter if your code is for a to-do app, a stock exchange, or
a fridge. How are numbers stored exactly? What's the significance of special values? And why is 0.1 + 0.2 not equal to
0.3? Let's explore this all!

## The Standard

Let's start with one key assumption: in all the world, on every continent, there's one and only one way of doing
floating-point arithmetic.

This makes things a lot easier, _and_ it's true in practice. That standard's name?

~~Albert Ein~~ **IEEE 754**.

How's this so simple? I mean, we all know how attempts at standardization _really_ turn out.

<figure>
<a href="https://xkcd.com/927/"><img src="https://imgs.xkcd.com/comics/standards_2x.png" title="Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit." alt="Standards" height="283" width="500" loading="lazy"></a>
<figcaption><i>fig. 1</i> — There's always a relevant XKCD.</figcaption>
</figure>

You'd be correct to think more than one format must have been invented. _Plenty_ were – in the early days of computing,
practically every system with floating-point capabilities had its own. Later on, brand-specific formats emerged: IBM
went for hexadecimal floating-point in their mainframes, Microsoft created Microsoft Binary Format for their BASIC
products, DEC cooked up yet something else for the VAX architecture.

This changed when Intel decided in the late 70s to design the floating-point chip to rule them all – which required a
format to rule them all too, the best possible. The decision culminated in the Intel 8087 coprocessor of 1980, but even
before that, other companies in the space caught wind of this work and set up
[a common effort](https://www.researchgate.net/publication/2954891_IEEE_754_An_Interview_with_William_Kahan) at the
Institute of Electrical and Electronics Engineers (IEEE) to standardize floating-point arithmetic – the IEEE 754 working
group. Two competing drafts prevailed: the Intel 8087 spec vs. the DEC VAX one. After some more arguments and error
analysis, in 1981 Intel's draft won out, rapidly got adopted by everyone,
and [the rest is history](https://www.intel.com/content/dam/www/public/us/en/documents/case-studies/floating-point-case-study.pdf)
(though it took the committee another four years of bickering to publish that draft, of course).

> For a detailed look at historic floating-point formats, see
> [this great article by John Savard](http://www.quadibloc.com/comp/cp0201.htm).

## The Specs

When you type `let x = 0.5` (might be JavaScript, Rust, Swift, or perhaps something else), that `x` needs to be stored
in a usable way. For a computer usable equals binary – ones and zeros. Were we talking about an integer, say,
`let x = 5`, the solution would be simple – integers can be expressed in binary just as easily as in decimal, so a quick
conversion of 5 to 101<sub>2</sub>, and we're all set.

Things get trickier when we want to represent **real** numbers though. The difference there is arbitrary precision.
Whole numbers are spaced uniformly apart on the number line, so between 0.5 and 2.5 there are exactly two integers: 1
and 2. Real numbers also include _every_ number in-between, so there's an _infinite_ amount of points between 0.5 and
2.5. (If you come up with a number with an insane amount of fractional digits, another digit can always be tacked on to
get a brand-new value.)

That's the mathematical theory in a nutshell. Sadly, computing capabilities are limited by the physical world, so
infinite precision is out of the question. To be very pedestrian,
[machine word](<https://en.wikipedia.org/wiki/Word_(computer_architecture)>) sizes are a major limitation – handling 32
bit long values comes naturally to a 32-bit processor, but any longer than that and things become slow. Nowadays, 64-bit
architectures rule the world, and this is reflected in the way floating-point is used. Two floating-point formats are
generally used:

-   32 bits, technically named `binary32`, but commonly **single precision**.  
    Values of this size are called **floats**.
-   64 bits, technically named `binary64`, but commonly **double precision**.  
    Values of this size are called **doubles**.

With this introduction out of the way, let's venture into the workings of those formats.

## The Notation

As the name suggests, floating-point values don't have a fixed number of integer and fractional digits – instead, the
<dfn title="In base-10 the border between the integer and fractional part is called the decimal point. Radix point is the base-independent version of the same concept.">radix
point</dfn> _floats_ so that there's rather a certain number of _significant digits_. This allows representing a wide
range of magnitudes usefully.

Much like how humans use [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) (an example:
`6.022 * 10^23`) to express real numbers of arbitrary magnitude in a standard way, computers under the hood store each
floating-point value as three numbers cleverly put together:

```
(-1)^sign * significand * 2^exponent
```

-   The **sign** is a single bit – 0 if the number is positive, 1 if negative.
-   The **significand** (also called the *mantissa*) is a fixed-point number in the range `[1, 2)`. It might be
    something like 1, 1.0625 or 1.984375, but it _can't_ be 2. What it intuitively does is it "fine-tunes" the value
    within the range set by the sign and exponent.  
    Because the significand's leading digit normally<a href="#the-zeros" style="text-decoration: none">\*</a> is 1
    (**normal number** being the technical term for such a case), **only the fractional part of the significand is
    included in the binary representation** – if the significand is, say, 1.001<sub>2</sub> (that's binary for 1.125),
    only the `001` part ends up being stored. This has the nice property of ensuring **there's only one way to store a
    given number**.  
    The significand's size determines the type's _precision_ – 24 significant bits of it in single-precision and 53 in
    double.
-   The **exponent** is a
    <dfn title="Signed means the value may have a minus sign – so it can be positive OR negative.">signed</dfn> integer.
    In a way, it establishes the magnitude, for instance an exponent of 8 means that the absolute value of the number
    must be in the range `[256, 512)` (`[2^8, 2^9)`).  
    Even though the exponent being signed, it's not stored using
    [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement) like regular signed integers. Instead, the
    stored value is an _unsigned_ integer and the computer subtract a format-specific **bias** to obtain the true value.
    The raw, pre-subtraction value is called the **biased exponent**. That bias is specifically `127` in
    single-precision and `1023` in double.  
    The exponent's size determines the _range_ of the type – 8 bits of it in single-precision and 11 in double.

See for yourself how this all comes together using the calculator below! Toggle bits by clicking on them and see what
number comes out, or type in a number to see what it looks like in your computer's memory:

<figure id="calculator">
<iframe src="https://cdpn.io/pen/debug/xxpKxZw" height="172" title="IEEE 754 Floating Point Calculator" frameborder="0"></iframe>
    <figcaption><i>widget 1</i> — A handy calculator. <a href="https://codepen.io/Twixes/pen/xxpKxZw?editors=0110" target="_blank">Play with this tool's code on CodePen!</a></figcaption>
</figure>

## The Precision

Since value sizes are very much finite, their precision is too, and this means there's a minimum distance between two
values. The thing is, this spacing is different depending on the magnitude (as defined by the exponent). In effect, for
small values the distance is tiny in absolute terms, while for larger ones it's roughly proportionally bigger.

A value's immediate neighbors are essentially a ±1 in its last significant digit away, and the difference such an
increment makes is our measure of minimum distance – called **unit in the last place**, **ULP** in short. You can easily
see how ULP size differs depending on the exponent in the calculator above. Simply change the exponent value around and
you'll notice the size of the ULP when you toggle the last bit of the significand!

ULP is the best way of defining floating-point precision as it's valid at any magnitude, but another related definition
is **machine epsilon**. This one, as opposed to the abstract ULP, is a constant value – specifically, the ULP between 1
and the next largest number.

It's tempting to use machine epsilon for checking if the result of a routine is within some error bounds, especially
because it's often exposed by standard libraries (e.g. in JS it's available as `Number.EPSILON`). Beware! Machine
epsilon makes some sense for values around 1, but it's useless for values much larger than that as the ULP is then
bigger too, and for smaller values it might be surprisingly large in ULP terms. Moreover, in reality error tolerance
rarely depends on the floating-point format of all things. In summary, you should almost always just use a custom
epsilon value tuned for your specific application.

## The Zero(s)

We've omitted something though: how to represent `0`? Mathematically, the only way to do that is to set the significand
to `0`… but that implicit leading `1` is standing in the way.

Here's the trick: when the significand is `0`, setting the biased exponent to `0` makes the significand's leading digit
_also_ `0`. _Voilà_, `0` as a result! That's a useful number to have.

Hmm, what if we set the _sign_ to `1` at the same time? That signifies a negative value, but it's obviously ridiculous
for _zero_ to be neg– WHAT?! According to all sources _(what sources now)_ we _do_ actually get `-0` this way. It's not
even as absurd as it seems at first glance: for practically all intents and purposes `-0 == +0` and this only doesn't
hold when there's an important reason – we'll go into it in [The Enormous](#the-enormous).

> See how the signed zero is stored in binary by trying `-0` in [the calculator](#calculator).

## The Undefined

Some mathematical expressions simply cannot be evaluated. Take `0 / 0` for instance: the result of this is said to be
_undefined_ in mathematics. This means there is no answer at all (not to be confused with JavaScript's `undefined`
value, which means the value hasn't been initiated) or, in other words, the answer certainly is _not a number_.

Programs used to crash immediately whenever they encountered such expressions and in fact they still do when this
happens with integers – integer formats don't have a way of safely representing an undefined value, so there's no
recourse. Floating-point has a solution though: the **NaN** value, short for "not a number".

> See how NaN is stored in binary by trying `NaN` in [the calculator](#calculator).

Specifically, you get a NaN whenever:

1. An [indeterminate form](https://en.wikipedia.org/wiki/Indeterminate_form) is encountered:

    - `0 / 0`
    - `infinity / infinity`
    - `0 * infinity`
    - `infinity ± infinity`
    - `x % 0`
    - `infinity % x`

2. The result of an operation would have to be a complex number (floating-point only represents reals):
    - `sqrt(x)` for `x` below 0
    - `log(x)` for `x` below 0
    - `asin(x)` and `acos(x)` for `x` below -1 or above 1

Additionally, NaNs propagate, so a NaN _anywhere_ in an expression makes it almost guaranteed that the final result will
be NaN too.

Be careful with comparisons, as NaNs uniquely have an **unordered** relation to all values, instead of being smaller,
greater, or equal. That means `<`, `>`, `<=`, `>=`, and `==` comparisons involving a NaN _always_ come out false – no
matter if the special value is on the left or right side, or even if it's on _both_ (so a NaN is never ever equal to
another NaN). On the other hand `!=` always comes out true. An important implication of the above is that `>=` _cannot_
be implemented as just a negation of `<` for floating-point!

## The Microscopic

When a result of a calculation is so tiny that it can't be represented by a normal number we see **underflow** occur.
It's an edge case, but an important one. How it gets handled has significant implications for some operations.

<!-- TODO? Examples of operations -->

Historically, underflow was handled by returning zero – a solution called **flush-to-zero**. It's very straightforward,
but not quite optimal for the accuracy of calculations taking place near zero. The issue is, the absolute difference
between neighboring floating-point values (i.e. ULP) gets smaller as the values themselves do so too – but with the
significand's leading digit always being 1, the jump between 0 and the smallest representable value is MUCH larger than
the jump between that smallest value and the _second_-smallest one. You can see this in figure 2, which shows what
this'd look like for double precision. Note that the 2<sup>-1023</sup> marker is dashed, because it couldn't be reached
– we'd go straight to 0 instead.

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
    <figcaption><div class="recommendation recommendation--dont"></div><i>fig. 2</i> — Don't.</figcaption>
</figure>

During development of IEEE 754 it turned out there's a
[verifiably better way](http://people.eecs.berkeley.edu/~wkahan/19July10.pdf). Remember how 0 is stored in binary? It
relies on the significand's leading digit being 0 when the biased exponent is 0. We can extend this to non-zero values
of the significand – this way, there's no odd gap when going from 0 up. The gap has merely moved away from 0 though – to
get rid of it, we make it so that the unbiased exponent is the same for the biased exponent value of 0 as it is for 1.
As you can see in figure 3, this way we trade away some precision at the bottom range of our number line… but we no
longer return 0 when the real result is (in relative terms) quite far away from 0. We call this solution **gradual
underflow** and those extremely small values that have 0 as the significand's leading digit –
**<span style="color: magenta">subnormal numbers</span>** (or _denormalized_).

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
    <figcaption><div class="recommendation recommendation--do"></div><i>fig. 3</i> — Do.</figcaption>
</figure>

> See how subnormal numbers are stored in binary by trying `8e-323` in [the calculator](#calculator).

## The Enormous

On the other hand, when the result of a calculation is so _large_ that it can't be represented – a situation called
**overflow** – another special value is returned: infinity. It can be positive or negative, depending on the direction
of overflow.

Infinity obviously almost never is the correct result at all, but that's a feature, not a bug. Returning the maximum
representable number would be much more unsafe – you'd end up with a _seemingly_ normal value, that would actually be
off by 1, or perhaps by orders of magnitude, with no way to tell. Infinity makes it evident an overflow happened and the
rules of calculations involving it are well-defined: basically, any such operation that doesn't produce a NaN (listed in
[The Undefined](#the-undefined)) results in infinity (with sign rules applying, i.e. `Infinity * (-3) == -Infinity`).

> See how infinity is stored in binary by trying `Infinity` in [the calculator](#calculator).

Interestingly, one extra case where you get infinity is division by 0. Ordinarily in such case the answer is considered
to be undefined, but IEEE 754 stipulates that the sign ought to be preserved, which is why NaN only is returned if the
numerator is 0 too (0 divided by 0 – when there is no way to interpret the expression _at all_). Otherwise, the
interpretation that's used is that the _limit_ of the expression is taken, approaching from either positive or negative
numbers – here's where the sign of the zero uniquely plays a role. For instance: `123 / -0 == -Infinity`.

## The More-or-Less

In floating-point, what you see is usually not what you get. As outlined in [The Precision](#the-precision), bits don't
quite grow on trees, so only a limited subset of points on the number line can be stored, and those points are all in
base-2. These two facts combined are a source of constant friction between humans and computers, kept at bay thanks to
an array of tricks.

Whether it's a user providing data or you hard-coding values, the starting point for many real numbers is a string of
characters representing the decimal value. We can, for instance, parse `"0.2"` as a double. Print that back and you get
`0.2` as expected. That's not exactly what's stored though. If we calculate the value a bit more accurately based on the
binary data, using [The Notation](#the-notation), we get `0.2000000000000000111022...`. That's evidently off! But there
just _isn't_ such number as `0.2` in binary.

As an illustration of the problem behind this, let's take 1/3. It doesn't have an _exact_ decimal counterpart, so we
humans resort to limited approximations, such as 0.3333. The reason for this predicament is that **for a rational number
`x` to be representable in base `b`, that `x`'s denominator cannot have any prime factor that isn't also a prime factor
of `b`**. In the case of 1/3, the denominator's only prime factor is 3, while the prime factors of our target base, 10,
are 2 and 5. That's a mismatch. In the same vein, binary means base-2, so it only is completely compatible with
denominators that are a power of 2. `0.2`'s rational form is 1/5, and it is that 5 which precludes finite representation
of the value in binary!

> See how 0.2 is stored in binary by trying `0.2` in [the calculator](#calculator).  
> The display shows the number's standard decimal representation, but the significand is extraordinarily precise
> (specifically, it's shown with extra 5 digits of decimal precision thanks to being parsed with
> [`decimal.js`](https://mikemcl.github.io/decimal.js/) instead of as a double), so that you can see how far the
> floating-point value is from the original by pasting the decomposed form into a much more precise calculator.
> [Try this out in Wolfram Alpha](https://www.wolframalpha.com/input?i=1.600000000000000088818+*+2%5E%281020-1023%29),
> which is what I've done above.

There are some assurances to keep the errors in check. IEEE 754 requires that parsing a base-10 string representation of
a number results in the closest binary representation possible. This same guarantee applies to results of elementary
arithmetic operations: addition, subtraction, multiplication, division, and square root.

Define "closest" though. Oh, actually the standard includes that too. It describes five rounding modes:

-   `roundTowardPositive` – takes the floor (i.e. towards negative infinity),
-   `roundTowardNegative` – takes the ceiling (i.e. towards positive infinity),
-   `roundTowardZero` – truncates (i.e. towards zero),
-   `roundTiesToAway` – chooses the nearest value, breaks ties by rounding away from zero,
-   `roundTiesToEven` – chooses the nearest value, breaks ties by rounding to the value ending in an even digit.

See table 1 for a demonstration of each mode, on decimal values being rounded to integers.

<figure>
<figcaption><i>table 1</i> — IEEE 754-2008 rounding modes</figcaption>
<table style="text-align: right">
  <tr>
    <th>Original</th>
    <td><code>-12.3</code></td>
    <td><code>19.6</code></td>
    <td><code>3.5</code></td>
    <td><code>4.5</code></td>
    <td><code>-2.5</code></td>
  </tr>
  <tr>
    <th><code>roundTowardPositive</code></th>
    <td><code>-12</code></td>
    <td><code>20</code></td>
    <td><code>4</code></td>
    <td><code>5</code></td>
    <td><code>-2</code></td>
  </tr>
  <tr>
    <th><code>roundTowardNegative</code></th>
    <td><code>-13</code></td>
    <td><code>19</code></td>
    <td><code>3</code></td>
    <td><code>4</code></td>
    <td><code>-3</code></td>
  </tr>
  <tr>
    <th><code>roundTowardZero</code></th>
    <td><code>-12</code></td>
    <td><code>19</code></td>
    <td><code>3</code></td>
    <td><code>4</code></td>
    <td><code>-2</code></td>
  </tr>
  <tr>
    <th><code>roundTiesToAway</code></th>
    <td><code>-12</code></td>
    <td><code>20</code></td>
    <td><code>4</code></td>
    <td><code>5</code></td>
    <td><code>-3</code></td>
  </tr>
  <tr>
    <th><code>roundTiesToEven</code></th>
    <td><code>-12</code></td>
    <td><code>20</code></td>
    <td><code>4</code></td>
    <td><code>4</code></td>
    <td><code>-2</code></td>
  </tr>
</table>
</figure>

The one you're using, even if you don't know it yet, is `roundTiesToEven`. It's the default, because:

1. It takes the nearest value in the common case, which is almost always what you'd expect – this way the error cannot
   be greater than ±0.5 ULP; but also…
2. When the result is smack-dab in the middle between two floating-point values, it rounds _up_ in 50% of cases and
   _down_ in the other 50%, making the bias _zero_ on average.

## The Unexpected

Unfortunately, even tolerable errors add up. This can result in some odd results, like in the (in)famous case of…
`0.1 + 0.2`.

This equals `0.3`, right? Not in double precision, no, it doesn't. The actual result: `0.30000000000000004`.

Due to friction between bases 2 and 10 (explained in [The More-or-Less](#the-more-or-less)), what you see as `0.1` in
double-precision is more precisely (by a few digits)
[`0.1000000000000000055511`](https://www.wolframalpha.com/input?i=1.600000000000000088818+*+2%5E%281019-1023%29), and
that `0.2` is rather
[`0.2000000000000000111022`](https://www.wolframalpha.com/input?i=1.600000000000000088818+*+2%5E%281020-1023%29). Now,
when you add those in binary, approx.
[`0.3000000000000000444089`](https://www.wolframalpha.com/input?i=1.2000000000000001776356839400+*+2%5E%281021-1023%29)
ensues. Close enough? Not so fast. `0.3` is stored as approx.
[`0.2999999999999999888978`](https://www.wolframalpha.com/input?i=1.199999999999999955591+*+2%5E%281021-1023%29), while
the _next_ immediate value (i.e. exactly 1 ULP bigger) is approx.
[`0.3000000000000000444089`](https://www.wolframalpha.com/input?i=1.2000000000000001776357+*+2%5E%281021-1023%29). Our
result clearly is much closer to the latter! And that's how `0.30000000000000004` is deemed the correct result.

<figure>
    <a href="https://xkcd.com/217/">
        <img src="https://imgs.xkcd.com/comics/e_to_the_pi_minus_pi.png" title="Also, I hear the 4th root of (9^2 + 19^2/22) is pi." alt="e to the pi Minus pi" height="264" width="700" loading="lazy">
    </a>
    <figcaption><i>fig. 4</i> — <em>Another</em> XKCD?</figcaption>
</figure>

This category of errors, where parsing and arithmetic add up to a result a human would not expect, is why it's crucial
NOT to use binary floating-point formats where this would be straight-up unacceptable. Prime example: finance. At the
scale of institutions managing billions, those errors would be inevitable. The solution: **decimal floating-point
formats**.

Two such formats are in fact part of IEEE 754: `decimal64` and `decimal128`. As you can infer from those technical
names, they have a base of 10 instead of 2, and are respectively 64 and 128 bits long. Unfortunately, their adoption
isn't nearly as universal as that of standardized binary formats. That's largely because hardware acceleration of
decimal floating-point arithmetic is extremely niche, so the math practically always is implemented in software –
resulting in less pressure to use a standard _and also_ much poorer performance in comparison with binary arithmetic.
Nevertheless, when correct handling decimal values is of utmost importance, there's no better way than decimal
floating-point.

## The There-and-Back-Again

Suppose you've got a float but need to convert it to a double. To perform this transmutation, just take the existing
exponent and significand values and pad them with zeros. Simple enough! Beware of false precision though: we've found in
[The More-or-Less](#the-more-or-less) that a parsed value is off by a bit (but less than 0.5 ULP) _immediately_, unless
the denominator of the original value was a power of 2. So, say, `"5.9"` parsed as a float will be printed back as
`5.9`, as expected. Cast that to a double though and what you see is… `5.9000000953674316`. Where did the processor get
all this extra information from? Truth is, that's what a _lack_ of information looks like. The extra digits are simply
the initial error, made glaring because of the ULP being orders of magnitude smaller in the more precise format.

The other way around – from a higher-precision format to a lower-precision one – the situation is straightforward.
Information is unambiguously lost as the least significant digits of the significand are cut. Just one thing to watch
out for here is the exponent being outside the target format's range – that's an example of overflow, so infinity is the
result.

## The End

You've reached the finish line. Congratulations. I hope you feel enlightened, or at least marginally smarter than before
opening this page. Now go and build great things using floating-point!

If you're somehow yearning for more, there's a few topics I deemed less relevant to the day-to-day of most programmers,
which nonetheless might be useful or interesting. Venture out at your own discretion with this non-exhaustive list:

-   How hardware uses guard bits and the sticky bit to minimize calculation errors
-   Tricks to squeeze the last bits of performance out of floating-point operations
-   Minimizing error in implementations of arithmetic operations (e.g. Kahan summation algorithm)
-   Quiet vs. signaling NaNs
-   Not just NaNs - how status flags can be used to detect exceptions
-   Managing exceptions manually with trap handlers

And finally, I could not end this without crediting David Goldberg and his classic
[What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
paper. It's been my direct inspiration for writing this post and spreading the knowledge.
