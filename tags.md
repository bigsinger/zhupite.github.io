---
layout: page
title: Tags
---
<svg class="cloud" style="width:95%;height:450px">
    <g></g>
</svg>
<div class="tag_posts">
</div>

<script src="{{ '/js/d3.js' | prepend: site.baseurl }}"></script>
<script src="{{ '/js/d3.layout.cloud.js' | prepend: site.baseurl }}"></script>

<script>
    var tags = [
        {% for tag in site.tags %}
            {
                tag: '{{ tag[0] }}',
                freq: {{ tag[1].size }},
                posts: [
                    {% for post in tag[1] %}
                        {
                            title: '{{ post.title }}',
                            url: '{{ BASE_PATH }}{{ post.url }}',
                            date: '{{ post.date | date: "%Y-%m-%d" }}'
                        },
                    {% endfor %}
                ]
            },
        {% endfor %}
    ];
    var minSize = 24, maxSize = 48;
    var minFreq = 1;
    var maxFreq = tags.reduce(function(memo, tag) {
        if (tag.freq > memo) {
            memo = tag.freq;
        }
        return memo;
    }, 0);
    var width = $('.cloud').width(), height = $('.cloud').height();
    var fill = d3.scale.category10();
    function scale(freq, minFreq, maxFreq, minSize, maxSize) {
        return minSize + Math.floor((freq - minFreq) / (maxFreq - minFreq) * (maxSize - minSize));
    }
    function showPosts(tagContent) {
        var tag = tags.filter(function(e) { return e.tag == tagContent; });
        if (tag.length == 0) {
            return;
        }
        tag = tag[0];
        var $ul = $('<ul></ul>').append(tag.posts.map(function(post) {
            var $li = $('<li></li>');
            $li.html(post.date + ' - ' + '<a href="' + post.url + '">' + post.title + '</a>');
            return $li;
        }));
        $('.tag_posts').slideUp('normal', function(e) {
            $('.tag_posts').empty().append($('<div class="tag_title">' + tagContent + '</div>')).append($ul).slideDown('normal');
        });
    }
    
    if (location.hash != '') {
        showPosts(location.hash.substring(1));
    }
    
    function draw(words) {
        d3.select('.cloud g')
            .attr('transform', 'translate(' + [width / 2, height / 2] + ')')
            .selectAll('text')
            .data(words)
            .enter()
            .append('text')
            .style('font-size', function(d) {
                return d.size + 'px'
            })
            .style('fill', function(d, i) {
                return fill(i);
            })
            .style('font-weight', function(d) {
                return 'bold';
            })
            .style('font-family', 'Microsoft YaHei')
            .style('cursor', 'pointer')
            .text(function(d) {
                return d.text;
            })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .on('mouseover', function(d) {
                d3.select(this).style('opacity', '0.5');
            })
            .on('mouseout', function(d) {
                d3.select(this).style('opacity', '1');
            })
            .on('click', function(d) {
                showPosts(d.text);
            });
    }
    
    var layout = d3.layout.cloud()
        .size([width, height])
        .words(tags.map(function(d) {
            return {
                text: d.tag,
                size: scale(d.freq, minFreq, maxFreq, minSize, maxSize)
            };
        }).sort(function(a, b) {
            return b.size - a.size;
        }))
        .padding(1)
        .rotate(function() {
            return ~~(Math.random() * 3 - 1) * 30;
        })
        .spiral('archimedean')
        .font('Microsoft Yahei')
        .fontSize(function(d) {
            return d.size;
        })
        .on('end', draw);
        
    layout.start();
    
</script>
