---
title: Floating-point arithmetic – all you need to know, interactively
image: /assets/floating-point-101/banner.png
---

Software engineering keeps getting more abstract, but one thing is unchanging: the importance of floating-point arithmetic. _Every_ programmer is bound to work with numbers (they call them _computers_ for a reason), so it's genuinely useful to understand the way computers do math, no matter if your code is for a ride-hailing service, a stock exchange, or a to-do app. Let's explore how this works!

## The Standard

Let's start with one key assumption: in all the world, on every continent, there's one and one only way to do floating-point arithmetic.

This makes things a lot easier _and_ it's true. That standard's name?

~~Albert Ein~~ **IEEE 754**.

How's this so simple? I mean, we all know how attempts at standardization _really_ turn out.

<a href="https://xkcd.com/927/"><img src="https://imgs.xkcd.com/comics/standards_2x.png" width="500" height="284"/></a>

You'd be correct to think more than one format must have been invented. _Plenty_ were – in the early days of computing, practically every system with floating-point capabilities had its own. Later on, brand-specific formats emerged: IBM went for hexadecimal floating-point in their mainframes, Microsoft created Microsoft Binary Format for their BASIC products, DEC cooked up yet something else for the VAX architecture.

This changed when Intel decided in the late 70s to design the floating-point chip to rule them all – which required a format to rule them all too, the best possible. The decision culminated in the Intel 8087 coprocessor of 1980, but even before that, other companies in the space caught wind of this work and set up [a common effort](https://www.researchgate.net/publication/2954891_IEEE_754_An_Interview_with_William_Kahan) to standardize floating-point arithmetic – the IEEE 754 working group. Two competing drafts prevailed: the Intel 8087 spec vs. the DEC VAX one. After some more arguments and [error analysis](http://people.eecs.berkeley.edu/~wkahan/19July10.pdf), in 1981 Intel's draft won out, rapidly got adopted by everyone, and [the rest is history](https://www.intel.com/content/dam/www/public/us/en/documents/case-studies/floating-point-case-study.pdf) (though it took them another four extra years of bickering to publish that draft, of course!).

> For a detailed look at historic floating-point formats, see [this great article by John Savard](http://www.quadibloc.com/comp/cp0201.htm).

## The Sizing

Let's get into the meat of it, starting with… value sizes in bits. This aspect informs the practical details of the scheme, but _can't_ really be worked out from first principles. Rather, the values we're using today are the result of a balancing act between precision, range, and hardware constraints (word size).

Two floating-point sizes are in common use:

- 32 bits, called **single-precision**. This can hold an absolute value of up to `3.403E+38` with 24 binary digits of precision.
- 64 bits, called **double-precision**. This can hold an absolute value of up to `1.798E+308` with 53 binary digits of precision.

Back in the day, double-precision was reserved for operations requiring exceptional precision or range. With 64-bit processor architectures becoming standard though, double is now often the default, as its performance penalty decreased significantly.

## The Notation

Much like how humans use [scientific notation](https://en.wikipedia.org/wiki/Scientific_notation) (e.g. `6.022 * 10^23`) for expressing numbers of arbitrary magnitude in a standard way, computers under the hood store each floating-point value as three numbers cleverly put together. These numbers all fit into either 32 bits (for single-precision floating-point) or 64 bits (for double-precision).

```
(-1)^sign * significand * 2^exponent
```

- The **sign** is a single bit – 0 if the number is positive, 1 if negative.
- The **exponent** is a signed integer. In a way, it establishes the magnitude, e.g. an exponent of 8 means that the absolute value of the number must be in the range `(256,512]` (`(2^8,2^9]`).  
  Curiously, despite the exponent being signed, it's stored not using [two's complement](https://en.wikipedia.org/wiki/Two%27s_complement) but as an unsigned integer, with the computer _knowing_ to subtract a known _bias_ to get the real value. The raw stored value is called the _biased exponent_. That bias is 127 in single-precision and 1023 in double.  
  The exponent's size determines the _range_ of the type – 8 bits of it in single-precision and 11 in double.  
- The **significand** (also called the _mantissa_) is a fixed-point number in the range `(1,2]` (e.g. 1 or 1.0625 or 1.984375). It "fine-tunes" the value within the working range set by the sign and exponent.  
  Because the significand's leading digit is always<a href="#the-tiny-gap" style="text-decoration: none">*</a> 1, that digit in fact totally omitted from the binary representation – if the significand is, say, `0b1.001` (that's binary for 1.125), only the `001` part ends up being stored. A significand with this implicit leading digit of 1 is called _normalized_.
  The significand's size determines the type's _precision_ – 24 significant bits of it in single-precision and 53 in double.

See for yourself how this all comes together using the widget below! Toggle the bits by clicking on them and see what number comes out, or enter a number to see what it looks like in your computer's memory:

<p style="text-align: right"><iframe src="https://cdpn.io/pen/debug/xxpKxZw" height="172"></iframe><a href="https://codepen.io/Twixes/pen/xxpKxZw">Play with this widget's code on CodePen</a></p>

## The Denormalized

We've left a gap in the explanation though. With the expression `(-1)^sign * significand * 2^exponent`

We've missed something though: how to represent 0? Mathematically, the only way to do that is to set the significand to 0… but that implicit leading 1 is standing in the way.

Here's the trick: a biased exponent value of 0 is a special case – it makes the significand's leading digit _also_ 0. Set both the exponent and significand to 0s and _voilà_, 0 as a result.

This still leaves us with a gap. Absolute differences between neighboring floating-point values get smaller as the values themselves do so too – after all, precision is defined here in terms of significant binary digits, not a constant interval. Using the tool above, we can see that the interval between numbers on the order of 2^62 is 1000, while for those on the order of 2^3 it's 0.000000000000002.

Naturally, the absolute interval is tiniest at the bottom end of the exponent range. For values on the order of 2^(-1022) it's just 5e-324 – a minuscule number. Now, the bias in the double-precision format is -1023, so you might think -1023 should be the lowest possible exponent, but we've got to keep that special case with 0 in mind. There are 3 --

## The Zeroes
+0 and -0

## The Guards
Guard digits

## The Scales
Fair rounding

## The Overflow

## The Fakes
 NaN != NaN

## The Unknowns
Undefined operations

## The Guarantees

## The Transformation
Converting from double to single and vice versa

## The Surprises
0.1 + 0.2
