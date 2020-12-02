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

# 字符串扩展
使用String.prototype扩展，扩展示例参考：[javascript字符串函数汇总\_基础知识\_脚本之家](https://www.jb51.net/article/75937.htm)

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

## includes
includes() 方法用于检查字符串是否包含指定的字符串或字符。
```js
var mystring = "Hello, welcome to edureka";
var n = mystring.includes("edureka");
//output: True
```js

## endsWith
endsWith()函数检查字符串是否以指定的字符串或字符结束。

## startsWith
endsWith()函数检查字符串是否以指定的字符串或字符开始。



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

# 字符串替换
## replace(regexp/substr, replacement)
replace()方法用来进行字符串替换操作，它可以接收两个参数，前者为被替换的子字符串（可以是正则），后者为用来替换的文本。

如果第一个参数传入的是子字符串或是没有进行全局匹配的正则表达式，那么replace()方法将只进行一次替换（即替换最前面的），返回经过一次替换后的结果字符串。
```js
var str = 'abcdeabcde';
console.log(str.replace('a', 'A'));     //Abcdeabcde
console.log(str.replace(/a/, 'A'));     //Abcdeabcde
```

如果第一个参数传入的全局匹配的正则表达式，那么replace()将会对符合条件的子字符串进行多次替换，最后返回经过多次替换的结果字符串。
```js
var str = 'abcdeabcdeABCDE';
console.log(str.replace(/a/g, 'A'));    //返回AbcdeAbcdeABCDE
console.log(str.replace(/a/gi, '$'));   //返回$bcde$bcde$BCDE
```

# 字符串分割
## split(separator, howmany)

split()方法用于把一个字符串分割成字符串数组。第一个参数separator表示分割位置(参考符)，第二个参数howmany表示返回数组的允许最大长度(一般情况下不设置)。
```js
var str = 'a|b|c|d|e';
console.log(str.split('|'));        //返回["a", "b", "c", "d", "e"]
console.log(str.split('|', 3));     //返回["a", "b", "c"]
console.log(str.split(''));         //返回["a", "|", "b", "|", "c", "|", "d", "|", "e"]
```

也可以用正则来进行分割
```js
var str = 'a1b2c3d4e';
console.log(str.split(/\d/));       //返回["a", "b", "c", "d", "e"]
```

# 大小写转换
- toLowerCase
- toUpperCase

toLowerCase()方法可以把字符串中的大写字母转换为小写，toUpperCase()方法可以把字符串中的小写字母转换为大写。
```js
var str = 'JavaScript';
console.log(str.toLowerCase());     //返回javascript
console.log(str.toUpperCase());     //返回JAVASCRIPT
```

# 静态方法
## fromCharCode(num1, num2, ..., numN)

# 其他
## concat
concat() 方法用于连接两个或多个字符串，此方法不改变现有的字符串，返回拼接后的新的字符串。
```js
var message="Sam"
var final=message.concat(" is a"," hopeless romantic.")
```

## repeat
repeat() 构造并返回一个新字符串，该字符串包含被连接在一起的指定数量的字符串的副本。
```js
var string = "Welcome to Edureka";
string.repeat(2);
//output: Welcome to Edureka Welcome to Edureka
```

## valueOf
valueOf() 方法返回一个String对象的原始值（primitive value），该值等同于String.prototype.toString()。
```js
var mystr = "Hello World!";
var res = mystr.valueOf();
//output: Hello World!
```

## trim
trim()方法会从一个字符串的两端删除空白字符。在这个上下文中的空白字符是所有的空白字符 (space, tab, no-break space 等) 以及所有行终止符字符（如 LF，CR）

类似的函数还有：
- trimStart
- trimEnd
- trimLeft
- trimRight
