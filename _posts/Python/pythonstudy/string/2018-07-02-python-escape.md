---
layout:		post
category:	"python"
title:		"Python网页字符串的转义与反转义"
tags:		[python]
---
- Content
{:toc}

escape和unescape
```python
s = 'Elements are written as "<tag>text</tag>".'
import html
print(html.escape(s))
# Elements are written as &quot;&lt;tag&gt;text&lt;/tag&gt;&quot;.

# Disable escaping of quotes
print(html.escape(s, quote=False))  
# Elements are written as "&lt;tag&gt;text&lt;/tag&gt;".

t = 'The prompt is &gt;&gt;&gt;'
print(html.unescape(t)) # The prompt is >>>
```
