# Matloka.com

Hey! I'm Michael. This is my harbor.

## Running the site locally

1. Make sure you have Ruby 3.3 installed and linked, along with Bundler. (On macOS: `brew install ruby@3.3 && brew link ruby@3.3 && bundle update --bundler`)
1. Run `bundle install` in this repo's directory to install dependencies.
1. Then simply run `bundle exec jekyll serve` to start the development server.
    - Use flag `--drafts` to show draft articles.
    - Use flag `--livereload` to reload the page automatically whenever a file is saved.

## Asset caching

Use normal asset URLs without manual version parameters. `_plugins/asset_hashes.rb`
runs after every Jekyll build (including `serve` and the Pages deployment), adding
`?v=<content hash>` to local asset references in generated HTML, CSS, JavaScript,
SVG, JSON, and XML. It covers images, fonts, media, and the exported presentation
as well as scripts and stylesheets. External URLs are left to their providers.
The Gemfile explicitly loads the hook because `github-pages` disables automatic
loading of custom plugins, including in local builds.

Hashes use the final file contents, including compiled Sass and hashed dependency
URLs: changing an image used by CSS also invalidates that CSS. Unchanged assets
keep their hashes. Query parameters and fragments are preserved. Circular asset
dependencies fail the build with the reference chain; break the cycle to resolve it.

Page URLs and canonical links stay clean. HTML freshness at those stable URLs is
controlled by GitHub Pages' HTTP caching, not by asset URL hashes.

Run the cache invalidation tests with `bundle exec ruby test/asset_hashes_test.rb`.
