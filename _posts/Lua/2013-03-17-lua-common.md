---
layout:		post
category:	"lua"
title:		"Lua常用函数收集"
tags:		[lua]
---
- Content
{:toc}

# Lua基础
```lua
function main(...)
local p1 = select(1, ...)
local p2 = select(2, ...)
    print(select('#', ...))
    print(p2)
end

main(...)
```


# 字符串
```lua
--网址不是http前缀则添加上：
if string.lower(string.sub(url,1,4))~='http'then
    url = 'http://' .. url
end--字符串替换：
s = string.gsub(s,'a','b')

--网址不是http前缀则添加上：
function urlWithHttp(url)
	local protocol = url:match("^(.*)://")
	if protocol==nil then
		url = 'http://'..url
	else
		print(protocol)
		if(protocol:lower() == "http")then return url end
	end

	return url
end

print(urlWithHttp('www.baidu.com'))


--字符串去空格：
function trim(s)
    local from = s:match"^%s*()"
    return from > #s and "" or s:match(".*%S", from)
end

--注意匹配数用括号丢弃
function trim (s) 
    return (string.gsub(s, "^%s*(.-)%s*$", "%1")) 
end

--通过图片网址获取该图片的名称，默认认为图片后缀为.jpg：
function geturlimagename(url)
    local name=''
    p = star.reversefind(url,'/')
    if p~=nil then
        name = string.sub(url,p+1)
        if name~=''andstring.find(name,'%.')==nil then
            name = name..'.jpg'
        end
    end
    return name
end

s1 = 'http://img.169hao.com/template/003/images/003_13.gif'
s2 = 'http://img02.taobaocdn.com/imgextra/i2/36847788/T2wtz9XiFaXXXXXXXX_!!36847788.jpg'
```


## Lua字符串分割函数split
```lua
--将字符串分割为字符数组
--param    szFullString      source string
--param    szSeparator       separator
--return   nSplitArray       string array fill with separated strings
function split(szFullString, szSeparator)
    local nFindStartIndex = 1
    local nSplitIndex = 1
    local nSplitArray = {}
    while true do
        local nFindLastIndex = string.find(szFullString, szSeparator, nFindStartIndex)
        if not nFindLastIndex then
            nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, string.len(szFullString))
            break
        end
        nSplitArray[nSplitIndex] = string.sub(szFullString, nFindStartIndex, nFindLastIndex - 1)
        nFindStartIndex = nFindLastIndex + string.len(szSeparator)
        nSplitIndex = nSplitIndex + 1
    end
    return nSplitArray
end
```

# 正则表达式相关
```lua
--查找图片网址：
src.-(http[^"^'^%s]-.jpg)
for src in string.gfind(html, [[(http[^"^'^%s]-.jpg)]]) do
end
--查找某个超链：
href.-(http[^"^'^%s]*)--模式匹配并取匹配的文本：
_,_,s = string.find(s,'begin(.-)end')

--查找某个id:     
_,_,id= string.find(url,'.-/(%d+)/?')
_,_,id= string.find(url,'id=(%d+)')


--含正则表达式的字符串替换：
s = 'http://i05.c.aliimg.com/img/ibank/2012/468/679/725976864_1350950867.310x310.jpg'
s = string.gsub(s,'(%.%d+x%d+).jpg','.jpg')


--有时候需要查找的太多，速度明显很慢的时候，可以这样变换一下：
for s in string.gfind(html,[[trclassobj(.-)</tr>]]) do
    _,pos,liansai = string.find(s,[[yeltxt.->(.-)<]],lastpos) if pos~=nil then lastpos = pos end
    _,pos,zhu = string.find(s,[[href.->(.-)<]],lastpos) if pos~=nil then lastpos = pos end
    _,pos,s1 = string.find(s,[[greentxt">(.-)</td>]],lastpos) if pos~=nil then lastpos = pos end
end
```

# 编码解码
```lua
function unescape (s)
  s = string.gsub(s, "+", " ")
  s = string.gsub(s, "%%(%x%x)", function (h)
        return string.char(tonumber(h, 16))
    end)
  return s
end

function unescapexml (s)
  s = string.gsub(s, "&amp;", "&")
  s = string.gsub(s, "&lt;", "<")
  s = string.gsub(s, "&gt;", ">")
  s = string.gsub(s, "&quot;", '"')
  s = string.gsub(s, "&apos;", "'")
  return s;
end
```

# url编码解码
```lua
--url解码
local function unicode_codepoint_as_utf8(codepoint)
    --
    -- codepoint is a number
    --
    if codepoint <= 127 then
        return string.char(codepoint)

    elseif codepoint <= 2047 then
        --
        -- 110yyyxx 10xxxxxx         <-- useful notation from http://en.wikipedia.org/wiki/Utf8
        --
        local highpart = math.floor(codepoint / 0x40)
        local lowpart  = codepoint - (0x40 * highpart)
        return string.char(0xC0 + highpart,
            0x80 + lowpart)

    elseif codepoint <= 65535 then
        --
        -- 1110yyyy 10yyyyxx 10xxxxxx
        --
        local highpart  = math.floor(codepoint / 0x1000)
        local remainder = codepoint - 0x1000 * highpart
        local midpart   = math.floor(remainder / 0x40)
        local lowpart   = remainder - 0x40 * midpart

        highpart = 0xE0 + highpart
        midpart  = 0x80 + midpart
        lowpart  = 0x80 + lowpart

        --
        -- Check for an invalid characgter (thanks Andy R. at Adobe).
        -- See table 3.7, page 93, in http://www.unicode.org/versions/Unicode5.2.0/ch03.pdf#G28070
        --
        if ( highpart == 0xE0 and midpart < 0xA0 ) or
                ( highpart == 0xED and midpart > 0x9F ) or
                ( highpart == 0xF0 and midpart < 0x90 ) or
                ( highpart == 0xF4 and midpart > 0x8F )
        then
            return "?"
        else
            return string.char(highpart,
                midpart,
                lowpart)
        end

    else
        --
        -- Not actually used in this JSON-parsing code, but included here for completeness.
        --
        -- 11110zzz 10zzyyyy 10yyyyxx 10xxxxxx
        --
        local highpart  = math.floor(codepoint / 0x40000)
        local remainder = codepoint - 0x40000 * highpart
        local midA      = math.floor(remainder / 0x1000)
        remainder       = remainder - 0x1000 * midA
        local midB      = math.floor(remainder / 0x40)
        local lowpart   = remainder - 0x40 * midB

        return string.char(0xF0 + highpart,
            0x80 + midA,
            0x80 + midB,
            0x80 + lowpart)
    end
end

function unescape (s)
    s = string.gsub(s, "+", " ")
    s = string.gsub(s, "%%(%x%x)", function (h)
        return string.char(tonumber(h, 16))
    end)
    s = string.gsub(s, "%%u(%x+)", function(c)
        return unicode_codepoint_as_utf8(tonumber(c, 16))
    end)
    return s
end

--url编码
function escape (s)
    s = string.gsub(s, "[&=+/%%%c%z\128-\255]", function(c)
        return string.format("%%%02X", string.byte(c))
    end)
    s = string.gsub(s, " ", "+")
    return s
end

--一个汉字转换为两个%的字符
urlencode = escape;
urldecode = unescape;

--xml内容解码
function unescapexml (s)
    s = string.gsub(s, "&amp;", "&")
    s = string.gsub(s, "&lt;", "<")
    s = string.gsub(s, "&gt;", ">")
    s = string.gsub(s, "&quot;", '"')
    s = string.gsub(s, "&apos;", "'")
    s = string.gsub(s, "&#(%d+);", function(c)
        return unicode_codepoint_as_utf8(tonumber(c, 10))
    end)
    s = string.gsub(s, "&#x(%w+);", function(c)
        return unicode_codepoint_as_utf8(tonumber(c, 16))
    end)
    return s;
end
```

# 文件名解析
```lua
function getsuffix(filename)
      suffix = string.sub(filename, string.find(filename, '[^.]-$'))
    return '.'..suffix
end

function getfilename(url)
    filename = ''
    s, e = string.find(url, '?')
    if s then
        url = string.sub(url, 1, s-1)
    end
    s, e = string.find(url, '[^%/]-$')
    if s then
        filename = string.sub(url, s, e)
    end
    return filename
end
```

# 其他
```lua
--产生一个随机浮点数字符串：
function randfloatnum()
    s = '0.'
    math.randomseed(os.time())
    for i = 1,16 do
        s = s .. math.random(0,9);
    end
    return s;
end


--计算一定数量所占的页数：
pages,_ = math.modf(count/20)
rest = math.mod(count,20)
pages = pages + (rest~=0 and 1 or 0)
```

# 数据库
## 创建数据库
```lua
local sqlite3 = require("lsqlite3")
local db = nil

for i = 1,9 do
 db = sqlite3.open(i..'.db')
 db:exec('CREATE TABLE user (id INTEGER PRIMARY KEY, sendflag INTEGER DEFAULT 0, nick);')
 db:exec('create index index_id on user(id);')
 db:exec('create index index_nick on user(nick);')
 db:close()
end
```

## 插入数据
```lua
require'star'

sql = star.SQL()
sql:open('match.db')
sql:executesql(s)

s = string.format([[SELECT okid FROM match WHERE okid='%s';]],okid)
if sql:isexists(s)~=0 then
    print(okid..'已经存在')
else
    s = string.format([[INSERT INTO match(okid,liansai,zhu,ke,scorezhu,scoreke,winp,drawp,losep,winy,pankou,losey,touzhutype,tm) VALUES('%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s');]],
    okid,liansai,zhu,ke,scorezhu,scoreke,winp,drawp,losep,winy,pankou,losey,touzhutype,matchday)
    sql:executesql(s)

end

sql:close()
```

