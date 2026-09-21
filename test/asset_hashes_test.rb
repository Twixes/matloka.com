require 'minitest/autorun'
require 'tmpdir'
require 'fileutils'
require 'jekyll'
# Exercise the same plugin loading as the Jekyll CLI (github-pages enables safe mode).
Jekyll::PluginManager.require_from_bundler

class AssetHashesTest < Minitest::Test
  def setup
    @directory = Dir.mktmpdir('asset-hashes')
  end

  def teardown
    FileUtils.remove_entry(@directory)
  end

  def write(path, content)
    full_path = File.join(@directory, path)
    FileUtils.mkdir_p(File.dirname(full_path))
    File.write(full_path, content)
  end

  def read(path)
    File.read(File.join(@directory, path))
  end

  def run_hashes(baseurl: '')
    AssetHashes::Build.new(@directory, site_url: 'https://example.com', baseurl: baseurl).run
  end

  def hash_for(path)
    Digest::SHA256.file(File.join(@directory, path)).hexdigest[0, 16]
  end

  def test_versions_assets_in_html_css_and_js_and_propagates_dependency_changes
    write('assets/picture.svg', '<svg>before</svg>')
    write('assets/main.css', 'body { background: url(picture.svg#icon); }')
    write('assets/app.js', 'const style = "/assets/main.css";')
    write('index.html', '<link href="/assets/main.css?2026-06-15d"><script src="/assets/app.js"></script>')
    run_hashes

    assert_includes read('assets/main.css'), "picture.svg?v=#{hash_for('assets/picture.svg')}#icon"
    assert_includes read('assets/app.js'), "/assets/main.css?v=#{hash_for('assets/main.css')}"
    assert_includes read('index.html'), "/assets/app.js?v=#{hash_for('assets/app.js')}"
    assert_includes read('index.html'), "/assets/main.css?v=#{hash_for('assets/main.css')}"
    refute_includes read('index.html'), '2026-06-15d'

    before = read('index.html')
    run_hashes
    assert_equal before, read('index.html'), 'Unchanged builds must keep their URLs'
    write('assets/picture.svg', '<svg>after</svg>')
    run_hashes
    refute_equal before, read('index.html')
    assert_includes read('index.html'), "/assets/app.js?v=#{hash_for('assets/app.js')}"
    assert_includes read('assets/main.css'), "picture.svg?v=#{hash_for('assets/picture.svg')}#icon"
  end

  def test_relative_urls_baseurl_srcset_absolute_theme_and_query_parameters
    write('assets/image.png', 'image')
    write('assets/theme.css', 'body {}')
    write('nested/index.html', <<~HTML)
      <img src="../assets/image.png?size=2&amp;format=png&amp;v=old#part"
           srcset="/blog/assets/image.png 1x, /blog/assets/image.png 2x">
      <script data-theme="https://example.com/blog/assets/theme.css"></script>
      <img src="//example.com/blog/assets/image.png">
    HTML
    run_hashes(baseurl: '/blog')

    output = read('nested/index.html')
    assert_includes output, "../assets/image.png?size=2&amp;format=png&amp;v=#{hash_for('assets/image.png')}#part"
    assert_includes output, "/blog/assets/image.png?v=#{hash_for('assets/image.png')} 1x, /blog/assets/image.png?v=#{hash_for('assets/image.png')} 2x"
    assert_includes output, "https://example.com/blog/assets/theme.css?v=#{hash_for('assets/theme.css')}"
    assert_includes output, "//example.com/blog/assets/image.png?v=#{hash_for('assets/image.png')}"
  end

  def test_keeps_navigation_external_urls_data_urls_and_missing_files_unchanged
    write('assets/image.png', 'image')
    write('other.html', '<p>Page</p>')
    html = <<~HTML
      <a href="/other.html">Page</a><a href="/other">Pretty page</a><a href="#top">Top</a>
      <img src="https://other.example/assets/image.png?version=1">
      <img src="https://example.com:8443/assets/image.png">
      <img src="data:image/png;base64,abc"><img src="/missing.png">
      <script>const operator = "~~~"; const invalid = "%00";</script>
      <a href="mailto:%4D%69%63%68%61%65%6C%20%3C%6D%40%65%2E%63%6F%6D%3E">Email</a>
    HTML
    write('index.html', html)
    run_hashes
    assert_equal html, read('index.html')
  end

  def test_reports_circular_asset_dependencies_without_writing_partial_output
    write('a.css', '@import "b.css";')
    write('b.css', '@import "a.css";')
    error = assert_raises(RuntimeError) { run_hashes }
    assert_includes error.message, 'Circular asset reference'
    assert_equal '@import "b.css";', read('a.css')
  end

  def test_preserves_comments_and_versions_assets_in_escaped_feed_html
    css = '/* normalize.css v8.0; "normalize.css" */ body {}'
    write('normalize.css', css)
    write('assets/image.png', 'image')
    write('feed.xml', '&lt;img src=&quot;/assets/image.png&quot; /&gt;')
    run_hashes
    assert_equal css, read('normalize.css')
    assert_includes read('feed.xml'), "/assets/image.png?v=#{hash_for('assets/image.png')}&quot;"
  end

  def test_versions_assets_in_exported_htm_presentations_but_keeps_page_links_clean
    write('slides/engine/main.css', 'body {}')
    write('slides/index.htm', '<link href="engine/main.css"><a href="index.htm">Slides</a>')
    run_hashes
    assert_equal "<link href=\"engine/main.css?v=#{hash_for('slides/engine/main.css')}\"><a href=\"index.htm\">Slides</a>", read('slides/index.htm')
  end

  def test_jekyll_hashes_compiled_sass_and_rebuilds_when_an_import_changes
    source = File.join(@directory, 'source')
    destination = File.join(@directory, 'output')
    write('source/index.html', "---\n---\n<link href=\"/assets/main.css\">")
    write('source/assets/main.scss', "---\n---\n@import 'colors';\nbody { color: $color; }")
    write('source/_sass/_colors.scss', '$color: red;')
    site = Jekyll::Site.new(Jekyll.configuration(
      'source' => source, 'destination' => destination,
      'url' => 'https://example.com', 'quiet' => true
    ))
    site.process
    assert_includes read('output/index.html'), "/assets/main.css?v=#{hash_for('output/assets/main.css')}"
    before = read('output/index.html')
    write('source/_sass/_colors.scss', '$color: blue;')
    site.process
    refute_equal before, read('output/index.html')
    assert_includes read('output/index.html'), "/assets/main.css?v=#{hash_for('output/assets/main.css')}"
  end
end
