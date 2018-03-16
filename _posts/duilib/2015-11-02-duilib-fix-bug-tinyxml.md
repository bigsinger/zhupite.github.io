---
layout:     post
category: 	"duilib"
title:      "修复duilib使用的tinyxml的一个BUG"
tags:		[duilib,tinyxml]
date:		2015-11-02
---

以RichListRes为例，用修改后的DuiDesigner重新载入xml皮肤配置文件，稍作修改并撤销然后保存，为的是重新保存xml文件，运行RichListRes工程会崩溃。

然后发现DuiDesigner用的是tinyxml保存的xml，而加载的时候用的是CMarkup，以至于以为是两者操作xml的不同导致的问题，当时差点就要把这两者的操作改为同一个库了。实际上这是不可取的，毕竟工作量太大了。然后用DuiDesigner关闭当前xml并重新载入，发现也不能正常显示了。

通过SVN找BUG：DuiDesigner修改前后的xml通过svn进行对比，并逐块恢复，最终定位到导致出错的xml代码：

原：
```
<Default name="VScrollBar" value="button1normalimage=&quot;file='scrollbar.bmp' source='0,90,16,106' mask='#FFFF00FF'&quot; button1hotimage=&quot;file='scrollbar.bmp' source='18,90,34,106' mask='#FFFF00FF'&quot; button1pushedimage=&quot;file='scrollbar.bmp' source='36,90,52,106' mask='#FFFF00FF'&quot; button1disabledimage=&quot;file='scrollbar.bmp' source='54,90,70,106' mask='#FFFF00FF'&quot; button2normalimage=&quot;file='scrollbar.bmp' source='0,108,16,124' mask='#FFFF00FF'&quot; button2hotimage=&quot;file='scrollbar.bmp' source='18,108,34,124' mask='#FFFF00FF'&quot; button2pushedimage=&quot;file='scrollbar.bmp' source='36,108,52,124' mask='#FFFF00FF'&quot; button2disabledimage=&quot;file='scrollbar.bmp' source='54,108,70,124' mask='#FFFF00FF'&quot; thumbnormalimage=&quot;file='scrollbar.bmp' source='0,126,16,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbhotimage=&quot;file='scrollbar.bmp' source='18,126,34,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbpushedimage=&quot;file='scrollbar.bmp' source='36,126,52,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbdisabledimage=&quot;file='scrollbar.bmp' source='54,126,70,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; railnormalimage=&quot;file='scrollbar.bmp' source='0,144,16,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; railhotimage=&quot;file='scrollbar.bmp' source='18,144,34,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; railpushedimage=&quot;file='scrollbar.bmp' source='36,144,52,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; raildisabledimage=&quot;file='scrollbar.bmp' source='54,144,70,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; bknormalimage=&quot;file='scrollbar.bmp' source='0,162,16,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkhotimage=&quot;file='scrollbar.bmp' source='18,162,34,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkpushedimage=&quot;file='scrollbar.bmp' source='36,162,52,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkdisabledimage=&quot;file='scrollbar.bmp' source='54,162,70,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; "/>
```
改：
```
<Default name="VScrollBar" value='button1normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,90,16,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,90,34,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,90,52,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,90,70,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button2normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,108,16,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,108,34,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,108,52,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,108,70,124&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,126,16,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,126,34,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,126,52,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,126,70,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,144,16,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,144,34,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,144,52,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; raildisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,144,70,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bknormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,162,16,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,162,34,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,162,52,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,162,70,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; '/>
```
可以看出问题来了，也就是value值的部分是用的单引号而非双引号，导致后面CMarkup解析出错。下面就要排查tinyxml在保存文件时候的代码逻辑。
在CLayoutManager::SaveSkinFile函数中找到以下代码：
```
const CStdStringPtrMap& defaultAttrHash = m_Manager.GetDefaultAttribultes();
 if(defaultAttrHash.GetSize() > 0)
 {
  for (int index = 0; index < defaultAttrHash.GetSize(); ++index)
  {
   LPCTSTR lpstrKey = defaultAttrHash.GetAt(index);
   LPCTSTR lpstrAttribute = m_Manager.GetDefaultAttributeList(lpstrKey);

   TiXmlElement* pAttributeElem = new TiXmlElement("Default");
   pAttributeElem->SetAttribute("name", StringConvertor::WideToUtf8(lpstrKey));

   CString strAttrib(lpstrAttribute);
   pAttributeElem->SetAttribute("value", StringConvertor::WideToUtf8(strAttrib));

   pNode->ToElement()->InsertEndChild(*pAttributeElem);

   delete pAttributeElem;
   pAttributeElem = NULL;
  }
 }
```
也正是保存上面那段xml代码的地方。一直跟进到value被保存的代码：
```
 void TiXmlAttribute::Print( FILE* cfile, int/*depth*/, TIXML_STRING* str ) const
{
 TIXML_STRING n, v;

 EncodeString( name, &n );
 EncodeString( value, &v );

 if (value.find ('\"') == TIXML_STRING::npos) {
  if ( cfile ) {
  fprintf (cfile, "%s=\"%s\"", n.c_str(), v.c_str() );
  }
  if ( str ) {
   (*str) += n; (*str) += "=\""; (*str) += v; (*str) += "\"";
  }
 }
 else {
  if ( cfile ) {
  fprintf (cfile, "%s='%s'", n.c_str(), v.c_str() );
  }
  if ( str ) {
   (*str) += n; (*str) += "='"; (*str) += v; (*str) += "'";
  }
 }
}
```
从这里就能发现问题了，EncodeString会把value处理一次，会把字符串里面出现的引号给转义掉生成新的v，后面的代码：
```
if (value.find ('\"') == TIXML_STRING::npos)是有bug的，应该是用v比较而不是用value比较，所以就被添加了单引号进去。后来想起，tinyxml被我用最新版的代码替换过一次，可以通过svn恢复：
 void TiXmlAttribute::Print( FILE* cfile, int/*depth*/, TIXML_STRING* str ) const
{
    TIXML_STRING n, v;

    EncodeString( name, &n );
    EncodeString( value, &v );

    if ( cfile ) {
        fprintf (cfile, "%s=\"%s\"", n.c_str(), v.c_str() );
    }
    if ( str ) {
        (*str) += n; (*str) += "=\""; (*str) += v; (*str) += "\"";
    }
}
```
重新编译后崩溃消除，看来最新的代码也不见得最稳定啊。
