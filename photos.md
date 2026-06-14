---
layout: about
title: Photos
description: "Photography portfolio — shots published on Unsplash."
permalink: /photos
image:
    path: /assets/banner.png
    height: 640
    width: 1280
---

<section class="page-hero" aria-label="Photos">
    {%- include tabs.html eyebrow="Seeing / shooting" -%}
</section>

<p>
<strong>A selection of photos I've taken.</strong><br/>Shot mostly with my trusty Sony RX100 Mark IV. Some with a Canon EOS R6.<br/><em>Hover to enlarge.</em>
</p>

<section
    id="photos-root"
    class="photos-root"
    aria-label="Photo gallery"
    data-unsplash-username="{{ site.unsplash.username | default: 'matlokam' | xml_escape }}"
    data-unsplash-access-key="{{ site.unsplash.access_key | default: '' | xml_escape }}"
    data-per-page="24"
>
    <p class="photos-status" role="status">Loading…</p>
</section>
