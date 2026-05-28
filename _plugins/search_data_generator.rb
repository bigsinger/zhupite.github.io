require 'json'

module Jekyll
  class SearchDataGenerator < Generator
    safe true
    priority :low

    def generate(site)
      # Only generate in production (not needed for --watch in most cases)
      search_data = []

      site.posts.docs.each do |post|
        # Extract title
        title = post.data['title']

        # Clean excerpt
        excerpt = post.data['excerpt']
          .to_s
          .gsub(/<[^>]*>/, '')   # strip HTML tags
          .gsub(/\s+/, ' ')       # collapse whitespace
          .strip

        # Clean content for search indexing (strip HTML and truncate)
        content = post.content
          .to_s
          .gsub(/<[^>]*>/, '')
          .gsub(/\s+/, ' ')
          .strip
          .slice(0, 5000)  # limit content size for JSON file

        entry = {
          'title'   => title,
          'url'     => post.url,
          'date'    => post.data['date'].to_s,
          'tags'    => (post.data['tags'] || []).join(', '),
          'excerpt' => excerpt,
          'content' => content
        }

        search_data << entry
      end

      # Write directly to assets/
      json_file = File.join(site.source, 'assets', 'search_data.json')
      FileUtils.mkdir_p(File.dirname(json_file))
      File.write(json_file, JSON.pretty_generate(search_data))

      # Register as a static file so Jekyll copies it to _site/
      site.static_files << Jekyll::StaticFile.new(site, site.source, 'assets', 'search_data.json')

      Jekyll.logger.info 'Search:', "Generated search_data.json with #{search_data.size} entries"
    end
  end
end
