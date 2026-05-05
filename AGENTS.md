# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Overview

This is a personal blog/portfolio site built with Jekyll 4.3+, using the github-pages gem. It's a static site generator that converts Markdown posts into HTML. The site is hosted via GitHub Pages.

## Development Commands

### Setup
```bash
bundle install
```

### Running the site locally
```bash
bundle exec jekyll serve
```

Common flags:
- `--drafts` - Include draft posts from `_drafts/` directory
- `--livereload` - Auto-reload browser on file changes

### Unsplash `/photos` locally

CI merges `UNSPLASH_ACCESS_KEY` with `_config.yml` via a temp YAML file (see `.github/workflows/jekyll.yml`). To mirror that locally:

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
export UNSPLASH_ACCESS_KEY='your-access-key'
base="$(mktemp "${TMPDIR:-/tmp}/matloka-unsplash.XXXXXX")"
tmp="${base}.yml"
mv "$base" "$tmp"
ruby -ryaml -e 'print({"unsplash"=>{"username"=>"matlokam","access_key"=>ENV.fetch("UNSPLASH_ACCESS_KEY","")}}.to_yaml)' >"$tmp"
trap 'rm -f "$tmp"' EXIT
bundle exec jekyll serve --config "_config.yml,$tmp"
```

### Building
```bash
bundle exec jekyll build
```
This generates the static site in the `_site/` directory. Use the same `--config "_config.yml,$tmp"` pattern as above if you need `/photos` with a key.

## Architecture

### Content Structure

**Blog posts** live in `_posts/` with the naming convention `YYYY-MM-DD-title.md`. Draft posts go in `_drafts/` without dates in filenames.

Post frontmatter format:
```yaml
---
title: Post Title
description: "Meta description for SEO"
tag: blog  # or 'talk' - see _data/tags.yml
image: /assets/path/to/banner.png  # optional social card image
---
```

**Layouts:**
- `base.html` - Root layout with analytics, scripts, footer
- `subpage.html` - Extends base, adds back navigation
- `post.html` - Extends subpage, adds post metadata, newsletter signup, comments (Giscus)

**Homepage** (`index.html`) displays a randomized tagline from the `fortunes` array and includes the posts list.

### Key Features

**Tags system:** Defined in `_data/tags.yml` with color and description metadata. Currently supports `blog` and `talk` tags.

**Styling:** The site uses custom CSS (linked as `/assets/main.css` with cache-busting query params). Syntax highlighting is configured via Kramdown with `_sass/_syntax.scss`.

**Analytics:** PostHog is integrated in `base.html` for tracking.

**Newsletter:** Buttondown email subscription form in post layout.

**Comments:** Giscus (GitHub Discussions) integration on blog posts.

**Social links:** Twitter/X, GitHub, LinkedIn, Unsplash, email (obfuscated).

### Jekyll Configuration

Key settings in `_config.yml`:
- Custom permalink structure: `/blog/:title`
- Plugins: jekyll-feed, jekyll-sitemap, jekyll-seo-tag, jekyll-github-metadata
- Date format: `%-d %b %Y`
- Kramdown syntax highlighting (no line numbers)

### Static Assets

Assets like images and audio files live in the `/assets/` directory. Cache-busting is managed manually via query parameters (e.g., `?2025-07-31`).

## Content Guidelines

The site has a distinctive voice - technical but casual, with personality. Posts are tagged as either `blog` (keyboard rambling) or `talk` (stage rambling).

When editing existing posts or creating new ones, maintain the existing markdown style and frontmatter structure. Images should be placed in `/assets/` subdirectories organized by post slug.
