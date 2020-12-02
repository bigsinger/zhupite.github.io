---
layout:		post
category:	"lua"
title:		"lua-closure"
tags:		[lua]
---

```
function  newCounter()
    local  i = 0
    return function ()      -- anonymous function
        i = i + 1return i
    end
end

c1 = newCounter()
print(c1())  --> 1print(c1())  --> 2
c2 = newCounter()
print(c2())  --> 1print(c2())  --> 2print(c1())  --> 3
```