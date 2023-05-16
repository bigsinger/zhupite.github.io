---

layout:		post
category:	"program"
title:		"c# enum枚举利用转json"

tags:		[c#,net]
---
- Content
{:toc}
```c#
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json;

namespace YiSha.Util.Extension;
public static partial class Extensions {
    #region 枚举成员转成dictionary类型
    /// <summary>
    /// 转成dictionary类型
    /// </summary>
    /// <param name="enumType"></param>
    /// <returns></returns>
    public static Dictionary<int, string> EnumToDictionary(this Type enumType) {
        Dictionary<int, string> dictionary = new Dictionary<int, string>();
        Type typeDescription = typeof(DescriptionAttribute);
        FieldInfo[] fields = enumType.GetFields();
        int sValue = 0;
        string sText = string.Empty;
        foreach (FieldInfo field in fields) {
            if (field.FieldType.IsEnum) {
                sValue = ((int)enumType.InvokeMember(field.Name, BindingFlags.GetField, null, null, null));
                object[] arr = field.GetCustomAttributes(typeDescription, true);
                if (arr.Length > 0) {
                    DescriptionAttribute da = (DescriptionAttribute)arr[0];
                    sText = da.Description;
                } else {
                    sText = field.Name;
                }
                dictionary.Add(sValue, sText);
            }
        }
        return dictionary;
    }
    /// <summary>
    /// 枚举成员转成键值对Json字符串
    /// </summary>
    /// <param name="enumType"></param>
    /// <returns></returns>
    public static string EnumToDictionaryString(this Type enumType) {
        List<KeyValuePair<int, string>> dictionaryList = EnumToDictionary(enumType).ToList();
        var sJson = JsonConvert.SerializeObject(dictionaryList);
        return sJson;
    }
    #endregion

    #region 获取枚举的描述
    /// <summary>
    /// 获取枚举值对应的描述
    /// </summary>
    /// <param name="enumType"></param>
    /// <returns></returns>
    public static string GetDescription(this System.Enum enumType) {
        FieldInfo EnumInfo = enumType.GetType().GetField(enumType.ToString());
        if (EnumInfo != null) {
            DescriptionAttribute[] EnumAttributes = (DescriptionAttribute[])EnumInfo.GetCustomAttributes(typeof(DescriptionAttribute), false);
            if (EnumAttributes.Length > 0) {
                return EnumAttributes[0].Description;
            }
        }
        return enumType.ToString();
    }
    #endregion

    #region 根据值获取枚举的描述
    public static string GetDescriptionByEnum<T>(this object obj) {
        var tEnum = System.Enum.Parse(typeof(T), obj.ParseToString()) as System.Enum;
        var description = tEnum.GetDescription();
        return description;
    }
    #endregion
}
```



使用时：

```c#
public enum GenderTypeEnum {
    [Description("其他")]
    Unknown = 0,

    [Description("男")]
    Male = 1,

    [Description("女")]
    Female = 2
}
```



`typeof(GenderTypeEnum).EnumToDictionaryString()`

