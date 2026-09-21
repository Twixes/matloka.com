source "https://rubygems.org"

gem "webrick"
# github-pages disables automatic loading of _plugins, even in custom builds.
# Explicitly load our build hook so both `jekyll serve` and CI fingerprint assets.
gem "github-pages", group: :jekyll_plugins,
    require: ["github-pages", File.expand_path("_plugins/asset_hashes", __dir__)]

group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
  gem "jekyll-github-metadata"
end
