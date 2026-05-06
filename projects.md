---
layout: about
title: Projects
description: "Products, devtools, and useful infrastructure by Michael Matloka."
permalink: /projects
image:
    path: /assets/banner.png
    height: 640
    width: 1280
---

<section class="page-hero" aria-label="Projects">
    {%- include tabs.html eyebrow="Building / shipping" -%}
</section>

<section class="project-section" aria-label="Project cards">
    <div class="project-grid project-grid--showcase">
        {% for project in site.data.projects %}
        {% assign primary_link = project.links | first %}
        <article class="project-card{% if project.hero %} project-card--hero{% endif %}">
            <a class="project-visual" href="{{ project.url }}" target="_blank" title="Go to {{ primary_link.label }} ↗" aria-label="Go to {{ primary_link.label }} ↗">
                <div class="project-placeholder{% if project.image %} project-placeholder--image{% endif %}">
                    {% if project.image %}
                    <div class="project-og-frame">
                        <img class="project-image" src="{{ project.image.url }}" alt="{{ project.image.alt }}" />
                    </div>
                    {% else %}
                    <span>1200 × 630</span>
                    <strong>{{ project.name }} illustration</strong>
                    {% endif %}
                </div>
            </a>
            <div class="project-card__body">
                <div class="project-card__topline">
                    <p class="project-kicker">{{ project.kicker }}</p>
                    <span class="project-status"{% if project.status_tooltip %} title="{{ project.status_tooltip }}"{% endif %}>{{ project.status }}</span>
                </div>
                <h3><a href="{{ project.url }}" target="_blank" title="Go to {{ primary_link.label }} ↗" aria-label="Go to {{ primary_link.label }} ↗">{{ project.name }}</a></h3>
                <dl class="project-copy">
                    <div class="project-copy__item project-copy__item--what">
                        <dt>What</dt>
                        <dd>{{ project.what }}</dd>
                    </div>
                    <div class="project-copy__item project-copy__item--why{% if project.why contains 'TODO:' %} project-copy__item--placeholder{% endif %}">
                        <dt>Why</dt>
                        <dd>{{ project.why }}</dd>
                    </div>
                </dl>
                <div class="project-links">
                    {% for link in project.links %}
                    {% unless link.icon == 'github' %}
                    <a class="button project-link" href="{{ link.url }}" target="_blank" rel="noopener noreferrer">
                        <span class="project-link__icon">{% include project-link-icon.html icon=link.icon %}</span>
                        <span>{{ link.label }}</span>
                    </a>
                    {% endunless %}
                    {% endfor %}
                    {% assign github_link = project.links | where: 'icon', 'github' | first %}
                    {% if github_link %}
                    <a class="button project-link" href="{{ github_link.url }}" target="_blank" rel="noopener noreferrer">
                        <span class="project-link__icon">{% include project-link-icon.html icon='github' %}</span>
                        <span>GitHub</span>
                    </a>
                    {% else %}
                    <span class="button project-link project-link--disabled"
                          title="{{ project.name }} uniquely isn't open-source! Its userbase simply doesn't even know GitHub exists"
                          aria-disabled="true">
                        <span class="project-link__icon">{% include project-link-icon.html icon='lock' %}</span>
                        <span>GitHub</span>
                    </span>
                    {% endif %}
                </div>
            </div>
        </article>
        {% endfor %}
    </div>
</section>
