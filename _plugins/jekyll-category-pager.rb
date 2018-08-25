module Jekyll
  module Paginate
    module CategoryPager
      VERSION = "0.1.2"
	  
      class Pagination < Generator
        safe true
        priority :lowest

        def generate(site)
          if Paginate::Pager.pagination_enabled?(site)
            site.categories.each do |category, posts|
              total = Paginate::Pager.calculate_pages(posts, site.config['paginate'])
              (1..total).each do |page|
                site.pages << IndexPage.new(site, category, page)
              end
            end
          end
        end
      end

      class IndexPage < Page
        def initialize(site, category, num_page)
          @site = site
          @base = site.source

          @dir = File.join(category)

          if num_page ==1
            @name = 'index.html'
          else
            @name = "/index_#{num_page}.html"
          end 
          self.process(@name)

          category_layout = site.config['category_layout']
          self.read_yaml(@base, category_layout)
          
          self.data.merge!(
                'title'     => category,
                'category'  => category,
                'paginator' => Paginate::Pager.new(site, num_page, site.categories[category])
          )
        end

        def template
          '/:path/:basename:output_ext'
        end
      end
      
    end
  end
end
