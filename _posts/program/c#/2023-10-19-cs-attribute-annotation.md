---
layout:		post
category:	"program"
title:		"C#自定义特性（注解）及使用"

tags:		[c#,attribute,annotation]
---
- Content
{:toc}


C#的特性`Attribute`，可以理解为Java里面的注解`Annotation`。其实这个在汉语翻译里面非常不好，如果搜索C#的特性，那大部分的结果是关于C#语言本身特性的介绍。也不能用**属性**这个词，**属性**在C#里是`property`，是跟成员变量相关。个人觉得**注解**这个词翻译得相当好，有**注释解释**之意，单从字节理解就很直观。

闲话不说，下面看自定义特性怎么用。

```csharp
using System;

// 自定义特性
[AttributeUsage(AttributeTargets.Field)]
public class MyAttribute : Attribute {
    private string name;
    private int value;

    public MyAttribute(string name, int value) {
        this.name = name;
        this.value = value;
    }

    public string Name { get { return name; } }
    public int Value { get { return value; } }
}


// 使用自定义特性
public class MyClass {
    [MyAttribute(name: "foo", value: 42)]		// 也可以简写为 My
    public static int MyStaticInt;

    [My("bar", 99)]								// 可以简写为 My
    public static string MyStaticString;
}

public class Program {
    public static void Main() {
        Type type = typeof(MyClass);
        foreach (var field in type.GetFields()) {
            if (field.IsStatic) {
                var attribute = Attribute.GetCustomAttribute(field, typeof(MyAttribute)) as MyAttribute;
                if (attribute != null) {
                    Console.WriteLine($"{field.Name}: Name={attribute.Name}, Value={attribute.Value}");
                    // 根据特性自动初始化成员变量
                    if(attribute.Name=="xxx") {
                    	field.Key.SetValue(null, 123);
                    }
                }
            }
        }
    }
}
```

