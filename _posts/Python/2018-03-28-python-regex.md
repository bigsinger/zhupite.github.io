---
layout:		post
category:	"python"
title:		"Python查找并捕获字符串（模式匹配）"
tags:		[python]
---

```Python
import re

formhashRe = re.search('name="formhash" value="(\w+?)"', response.text, re.DOTALL)
refererRe = re.search('name="referer" value="(.*?)"', response.text, re.DOTALL)
print(f"formhashRe = {formhashRe}, refererRe = {refererRe}")
if formhashRe:
    formhash = formhashRe.group(1)
else:
    formhash = ""
if refererRe:
    referer = refererRe.group(1)
else:
    referer = ""
```

