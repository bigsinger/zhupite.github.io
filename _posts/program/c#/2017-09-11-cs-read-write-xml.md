---
layout:		post
category:	"program"
title:		"C#读写XML"
tags:		[c#]
---

```
string filename = Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, FILENAME_OPTIONS);
XmlDocument xmlDoc = new XmlDocument();
XmlNode root = null;
XmlElement element = null;

try
{
    xmlDoc.Load(filename);
    root = xmlDoc.SelectSingleNode("option");
    foreach (XmlNode item in root.ChildNodes)
    {
        element = (XmlElement)item;
        string name = element.GetAttribute("name");
        string param = element.GetAttribute("param");
        string desc = element.GetAttribute("desc");

        if (string.IsNullOrEmpty(name) == false && string.IsNullOrEmpty(param) == false)
        {
            //...
        }

    }//end for

}
catch (Exception e)
{
    bRet = false;
    throw e;
}
```
