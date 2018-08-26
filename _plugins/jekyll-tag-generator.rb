module Jekyll
    module Tags
      VERSION = "0.0.1"
	  
      class TagGenerator < Generator
        safe true
        priority :lowest
		
        def generate(site)
			for tag in site.tags 
				site.pages << IndexPage.new(site, tag[0], tag[1]);
			end
         end
		 
      end

      class IndexPage < Page
        def initialize(site, tag, all_posts)
          @site = site
          @base = site.source
          @dir = File.join('/tag')
		  @name = "#{tag}.html"
          self.process(@name)
          
          tag_layout = site.config['tag_layout']
          self.read_yaml(@base, tag_layout)
		  self.data['posts'] = all_posts
		  self.data['title'] = tag 
		  self.data['url'] = "#{@dir}/#{@name}" #设置了无效，好奇怪
		  
        end
      end
      
    end
end

