require 'digest'
require 'uri'

# Run after Sass/Liquid conversion and static-file copying, so hashes describe
# the bytes we actually serve. No filters or manual version bumps are needed.
module AssetHashes
  class Build
    TEXT_EXTENSIONS = %w[.html .css .js .mjs .svg .json .xml].freeze
    PAGE_EXTENSIONS = %w[.html .xml].freeze
    URL_TOKEN = %r{[^\s"'`<>()\\,]+}.freeze
    # Only URL-shaped literals, not prose such as "normalize.css v8.0" in a
    # license comment. Entity quotes cover HTML embedded in the Atom feed.
    URL_REFERENCE = %r{
      /\*.*?\*/ | <!--.*?--> |
      (?<prefix>["'`(]|&quot;|&apos;)
      (?<url>[^\s"'`<>()\\,]+?)
      (?=["'`)]|&quot;|&apos;)
    }mx.freeze

    def initialize(destination, site_url: '', baseurl: '')
      @destination = File.expand_path(destination)
      @origin = URI.parse(site_url.to_s)
      @baseurl = baseurl.to_s.sub(%r{/$}, '')
      @files = Dir.glob(File.join(@destination, '**', '*')).select { |path| File.file?(path) }
      @assets = @files.reject { |path| PAGE_EXTENSIONS.include?(File.extname(path)) }.to_h { |path| [path, true] }
      @output = {}
      @hashes = {}
      @visiting = []
    end

    def run
      @files.each { |path| render(path) if text?(path) }
      @output.each do |path, content|
        File.write(path, content) unless File.read(path, encoding: 'UTF-8') == content
      end
    end

    private

    def text?(path)
      TEXT_EXTENSIONS.include?(File.extname(path))
    end

    def render(path)
      return @output[path] if @output.key?(path)
      if @visiting.include?(path)
        raise "Circular asset reference: #{(@visiting + [path]).map { |item| item.delete_prefix(@destination) }.join(' -> ')}"
      end

      @visiting << path
      content = File.read(path, encoding: 'UTF-8')
      content = content.gsub(/((?:data-)?srcset=)(["'])(.*?)\2/m) do
        attribute, quote, urls = Regexp.last_match.captures
        "#{attribute}#{quote}#{urls.gsub(URL_TOKEN) { |url| version(url, path) }}#{quote}"
      end
      @output[path] = content.gsub(URL_REFERENCE) do |match|
        prefix, url = Regexp.last_match.values_at(:prefix, :url)
        url ? "#{prefix}#{version(url, path)}" : match
      end
      @visiting.pop
      @output[path]
    end

    def digest(path)
      @hashes[path] ||= if text?(path)
                         Digest::SHA256.hexdigest(render(path))[0, 16]
                       else
                         Digest::SHA256.file(path).hexdigest[0, 16]
                       end
    end

    def version(url, source)
      uri = URI.parse(url)
      return url if uri.path.to_s.empty? || uri.path.end_with?('/')
      return url if uri.scheme && !%w[http https].include?(uri.scheme)
      if uri.host
        return url unless uri.host == @origin.host && (uri.scheme.nil? || uri.port == @origin.port)
      end

      path = URI::DEFAULT_PARSER.unescape(uri.path)
      return url if path.include?("\0")
      if path.start_with?('/')
        return url unless @baseurl.empty? || path.start_with?("#{@baseurl}/")
        path = File.join(@destination, path.delete_prefix(@baseurl).delete_prefix('/'))
      else
        path = File.join(File.dirname(source), path)
      end
      path = File.expand_path(path)
      return url unless @assets.key?(path)

      # Preserve functional parameters and fragments; replace only our version
      # parameter (or a legacy bare date such as ?2026-06-15d).
      separator = url.include?('&amp;') ? '&amp;' : '&'
      params = uri.query.to_s.split(/&amp;|&/).reject do |param|
        param.start_with?('v=') || param.match?(/\A\d{4}-\d{2}-\d{2}[a-z]?\z/)
      end
      params << "v=#{digest(path)}"
      bare_url = url.split(/[?#]/, 2).first
      fragment = uri.fragment ? "##{uri.fragment}" : ''
      "#{bare_url}?#{params.join(separator)}#{fragment}"
    rescue URI::Error
      url
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  AssetHashes::Build.new(site.dest, site_url: site.config['url'], baseurl: site.baseurl).run
end
