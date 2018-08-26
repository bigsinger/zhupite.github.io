module Jekyll
  module Paginate
    module IndexPager
      VERSION = "0.1.2"
	  
      class Pagination < Generator
        safe true
        priority :lowest

        def generate(site)
          if Paginate::Pager.pagination_enabled?(site)
			  #revert posts
			  posts_len = site.posts.docs.size
			  revert_posts = Array.new
			  (0..(posts_len-1)).each do |id|
				revert_posts[(posts_len-1)-id] = site.posts.docs[id];
			  end
			  #paginate
              total = Paginate::Pager.calculate_pages(site.posts, site.config['paginate'])
              (1..total).each do |page|
                site.pages << IndexPage.new(site, page, revert_posts, total)
              end
          end
        end
      end

      class IndexPage < Page
        def initialize(site, num_page,all_posts, total_pages)
          @site = site
          @base = site.source
          @dir = File.join('/')

          if num_page ==1
            @name = 'index.html'
          else
            @name = "index_#{num_page}.html"
          end 

          self.process(@name)
          
          index_layout = site.config['index_layout']
          self.read_yaml(@base, index_layout)
          
          self.data.merge!(
                           'category'  => 'index',
                           'paginator' => Paginate::Pager.new(site, num_page, all_posts, total_pages)
          )
        end

        def template
          '/:basename:output_ext'
        end
      end
      
    end
  end
end

