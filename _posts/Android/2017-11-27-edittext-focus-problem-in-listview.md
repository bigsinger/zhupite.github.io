---
layout:		post
category:	"android"
title:		"EditText在ListView中的键盘焦点问题"
tags:		[Android]
---


Android开发中遇到的EditText在ListView中的键盘焦点问题，网上解决方法很多，但是都比较麻烦，其实**最简单的解决方案**就是：
- 用**RecyclerView**，参见：[bigsinger/EditTextInRecyclerView](https://github.com/bigsinger/EditTextInRecyclerView)，注意控件不要用这个属性：

  ```xml
  android:descendantFocusability="blocksDescendants"
  ```

  

其他，有说要在RecyclerView控件中添加：
```
android:descendantFocusability="beforeDescendants"
android:fastScrollEnabled="false"
```
所在activity的AndroidManifest.xml属性添加：
```
android:windowSoftInputMode="stateHidden|adjustPan"
```

貌似不加也可以。
