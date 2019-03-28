---
layout:		post
category:	"JavaScript"
title:		"JavaScript字符串操作大全"
tags:		[JavaScript]
---
- Content
{:toc}

# 属性
## 字符串长度length
```js
var str = 'abc';
console.log(str.length);
```

## 添加属性或方法prototype
添加的方法或属性在所有的实例上共享，常用来扩展js内置对象。例如，给字符串添加了一个去除两边空格的方法：
```js
String.prototype.trim = function() {
    return this.replace(/^\s*|\s*$/g, '');
}
```

# 字符相关

## charAt(index)
charAt()方法可用来获取指定位置的字符，index为字符串索引值，从0开始到string.length – 1，若不在这个范围将返回一个空字符串。如：
```js
var str = 'abcde';
console.log(str.charAt(2));     //返回c
console.log(str.charAt(8));     //返回空字符串
```

## charCodeAt(index)
charCodeAt()方法可返回指定位置的字符的Unicode编码。
```js
var str = 'abcde';
console.log(str.charCodeAt(0));     //返回97
```

## fromCharCode(num1, num2, ..., numN)
fromCharCode()可接受一个或多个Unicode值，然后返回一个字符串。另外该方法是String的静态方法，字符串中的每个字符都由单独的数字Unicode编码指定。
```js
String.fromCharCode(97, 98, 99, 100, 101);   //返回abcde
```

# 查找相关
## indexOf(value, fromIndex)
indexOf()用来检索指定的字符串值在字符串中首次出现的位置。
- value表示要查找的子字符串
- fromIndex表示查找的开始位置，省略的话则从开始位置进行检索。
```js
var str = 'abcdeabcde';
console.log(str.indexOf('a'));      // 返回0
console.log(str.indexOf('a', 3));   // 返回5
console.log(str.indexOf('bc'));     // 返回1
```

## lastIndexOf(value, fromIndex)
lastIndexOf()语法与indexOf()类似，它返回的是一个指定的子字符串值最后出现的位置，检索顺序是从后向前。
```js
var str = 'abcdeabcde';
console.log(str.lastIndexOf('a'));      // 返回5
console.log(str.lastIndexOf('a', 3));   // 返回0 从第索引3的位置往前检索
console.log(str.lastIndexOf('bc'));     // 返回6
```

## search
- search(substr)
- search(regexp)

search()方法用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串。返回第一个匹配的子字符串的起始位置，没有匹配则返回-1。
```js
var str = 'abcDEF';
console.log(str.search('c'));       //返回2
console.log(str.search('d'));       //返回-1
console.log(str.search(/d/i));      //返回3
```

## match
- match(substr)
- match(regexp)

match()方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。

如果参数中传入的是子字符串或是**非全局匹配正则表达式**，那么match()方法会从开始位置执行一次匹配，如果没有匹配到结果，则返回null。
否则返回一个数组，该数组的第0个元素存放的是匹配文本，除此之外，返回的数组还含有两个对象属性index和input，分别表示匹配文本的起始字符索引和原字符串的引用。
```js
var str = '1a2b3c4d5e';
console.log(str.match('h'));    //返回null
console.log(str.match('b'));    //返回["b", index: 3, input: "1a2b3c4d5e"]
console.log(str.match(/b/));    //返回["b", index: 3, input: "1a2b3c4d5e"]
```js

如果参数传入的是具有**全局匹配的正则表达式**，那么match()从开始位置进行多次匹配，直到最后。如果没有匹配到结果，则返回null。否则则会返回一个数组，数组中存放所有符合要求的子字符串，并且没有index和input属性。
```js
var str = '1a2b3c4d5e';
console.log(str.match(/h/g));   //返回null
console.log(str.match(/\d/g));  //返回["1", "2", "3", "4", "5"]
```

# 截取子串
## substring(start, end)
substring()是最常用到的字符串截取方法，它可以接收两个参数(参数不能为负值)，分别是要截取的**开始位置**和**结束位置**，它将返回一个新的字符串，其内容是从**[start, end)**的所有字符。若结束参数(end)省略，则表示从start位置一直截取到最后。
```js
var str = 'abcdefg';
console.log(str.substring(1, 4));   //返回bcd
console.log(str.substring(1));      //返回bcdefg
console.log(str.substring(-1));     //返回abcdefg，传入负值时会视为0
```

## slice(start, end)
slice()方法与substring()方法非常类似，它传入的两个参数也分别对应着开始位置和结束位置。而区别在于，slice()中的参数可以为负值，如果参数是负数，则该参数规定的是从字符串的尾部开始算起的位置，-1 指字符串的最后一个字符。
```js
var str = 'abcdefg';
console.log(str.slice(1, 4));       //返回bcd
console.log(str.slice(-3, -1));     //返回ef
console.log(str.slice(1, -1));      //返回bcdef
console.log(str.slice(-1, -3));     //返回空字符串，若传入的参数有问题，则返回空
```

## substr(start, length)
substr()方法可在字符串中抽取从start下标开始的指定数目的字符。其返回值为一个字符串，包含从 start（包括）处开始的length个字符。如果没有指定length，那么返回的字符串包含从start到结尾的字符。**如果start为负数，则从字符串尾部开始算起**。
```js
var str = 'abcdefg';
console.log(str.substr(1, 3))       //返回bcd
console.log(str.substr(2))          //返回cdefg
console.log(str.substr(-2, 4))      //返回fg，目标长度较大的话，以实际截取的长度为准
```

https://www.cnblogs.com/lanyueff/p/5443147.html
https://www.jb51.net/article/75937.htm

# 静态方法
## fromCharCode(num1, num2, ..., numN)

