---
layout:		post
category:	"program"
title:		"编译错误解决：implicit declaration of function 'close' is invalid in C99"
tags:		[]
---


## 编译错误

```
error:
      implicit declaration of function 'close' is invalid in C99
      [-Werror,-Wimplicit-function-declaration]
        close(tfd);
        ^
1 error generated.
```

## 解决方案
在出错的这个文件中添加头文件包含：
```c
#include <fcntl.h> // for open
#include <unistd.h> // for close
```

## 参考：
[c \- Implicit declaration of function ‘close' \- Stack Overflow](https://stackoverflow.com/questions/19472546/implicit-declaration-of-function-close)
