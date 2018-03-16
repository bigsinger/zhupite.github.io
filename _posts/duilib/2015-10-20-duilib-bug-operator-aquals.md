---
layout: 	post
category:	"duilib"
title:		duilib中判断是否相等和等于号重载的一个BUG
tags:		[duilib,ui]
date:		2015-10-20
---

CDuiString的bug (重温了一下 Effective C++，发现这就是条款24所指出的问题，看来读书百遍不如写代码一遍啊)

在Notify处理消息时会有很多if语句，我通常喜欢把常量放在双等号前面，变量放在后面，比如：
```
if( _T("click") ==  msg.sType ) {
}
```
但是却发现并没有进到这个if里，调试发现，将常量调到前面时，并没有进入到CDuiString重载的 == 函数里面，所以这里必须将常量放到后面。
```
if( msg.sType == _T("click") ) {
    }
```
 
这个bug的原因是因为将常量放在前面时，并没有调用CDuiString重载的 == 函数，而是调用了CDuiString重载的 ()函数，然后用系统自带的==函数做比较，而系统自己的 == 函数只是比较两个指针的首地址是否相等。

_T("click") 的首地址指向的是一块临时变量，而msg.sType 是返回了CDuiString里面那个字符串的指针，很显然这两个指针地址是不相等的，所以我们只能把它放在前面，或者直接调用_tcscmp：
```
if( ! _tcscmp( _T("click"), msg.sType) ) {
    }
```

当然，如果要解决这个bug，就要重载多个 == 操作符，    由于CDuiString是将 == 函数作为成员函数重载的，所以只有CDuiString对象在操作符左边时，才会调用这个重载函数，如果想要CDuiString对象在右边时也能调用重载的 == 函数，那么必须将重载操作符放到外部。

```
class UILIB_API CDuiString
{
public:
   enum { MAX_LOCAL_STRING_LEN = 63 };

   CDuiString();
   CDuiString(const TCHAR ch);
   CDuiString(const CDuiString& src);
   CDuiString(LPCTSTR lpsz, int nLen = -1);
   ~CDuiString();

   void Empty();
   int GetLength() const;
   bool IsEmpty() const;
   TCHAR GetAt(int nIndex) const;
   void Append(LPCTSTR pstr);
   void Assign(LPCTSTR pstr, int nLength = -1);
   LPCTSTR GetData() const;

   void SetAt(int nIndex, TCHAR ch);
   operator LPCTSTR() const;

   TCHAR operator[] (int nIndex) const;
   const CDuiString& operator=(const CDuiString& src);
   const CDuiString& operator=(const TCHAR ch);
   const CDuiString& operator=(LPCTSTR pstr);
#ifdef _UNICODE
   const CDuiString& CDuiString::operator=(LPCSTR lpStr);
   const CDuiString& CDuiString::operator+=(LPCSTR lpStr);
#else
   const CDuiString& CDuiString::operator=(LPCWSTR lpwStr);
   const CDuiString& CDuiString::operator+=(LPCWSTR lpwStr);
#endif
   CDuiString operator+(const CDuiString& src) const;
   CDuiString operator+(LPCTSTR pstr) const;
   const CDuiString& operator+=(const CDuiString& src);
   const CDuiString& operator+=(LPCTSTR pstr);
   const CDuiString& operator+=(const TCHAR ch);

   bool operator == (LPCTSTR str) const;
   bool operator != (LPCTSTR str) const;
   bool operator <= (LPCTSTR str) const;
   bool operator <  (LPCTSTR str) const;
   bool operator >= (LPCTSTR str) const;
   bool operator >  (LPCTSTR str) const;

   int Compare(LPCTSTR pstr) const;
   int CompareNoCase(LPCTSTR pstr) const;

   void MakeUpper();
   void MakeLower();

   CDuiString Left(int nLength) const;
   CDuiString Mid(int iPos, int nLength = -1) const;
   CDuiString Right(int nLength) const;

   int Find(TCHAR ch, int iPos = 0) const;
   int Find(LPCTSTR pstr, int iPos = 0) const;
   int ReverseFind(TCHAR ch) const;
   int Replace(LPCTSTR pstrFrom, LPCTSTR pstrTo);

   int __cdecl Format(LPCTSTR pstrFormat, ...);
   int __cdecl SmallFormat(LPCTSTR pstrFormat, ...);

protected:
   LPTSTR m_pstr;
   TCHAR m_szBuffer[MAX_LOCAL_STRING_LEN + 1];
};
```


```
void Notify(TNotifyUI& msg)
{
    if( _T("click") ==  msg.sType ) {
        if( msg.pSender->GetName() == _T("closebtn") || msg.pSender->GetName() == _T("closebtn2") ) {
            PostQuitMessage(0); 
            return; 
        }
    }
    else  {
        ....
    }
}
```

解决：可以看一下MFC的CString是怎么重载的。此处省略。