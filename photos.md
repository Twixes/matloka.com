---
layout: about
title: Photos
description: "Photography portfolio — shots published on Unsplash."
permalink: /photos
---

<section class="page-hero" aria-label="Photos">
    {%- include tabs.html eyebrow="Seeing / shooting" -%}
</section>

<section class="photo-section" aria-label="Photo gallery">
    <div
        id="photos-root"
        class="photos-root"
        data-unsplash-username="{{ site.unsplash.username | default: 'matlokam' | xml_escape }}"
        data-unsplash-access-key="{{ site.unsplash.access_key | default: '' | xml_escape }}"
        data-per-page="24"
    >
        <p class="photos-status" role="status">Loading…</p>
    </div>
</section>
