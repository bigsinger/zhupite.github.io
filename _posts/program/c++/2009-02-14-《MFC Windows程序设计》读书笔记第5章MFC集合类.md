---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第5章MFC集合类"
tags:		[mfc,c++]
---
- Content
{:toc}

# 数组，MFC数组类CArray
在头文件Afxtempl.h中定义了CArray,它实际上是一个模板类,利用它可以创建任何数据类型的类型安全数组.
非模板化数组类定义在Afxcoll.h中,有:**CByteArray**,**CWordArray**,**CDwordArray**...

# 相关函数
- SetSize用来指定数组大小，重载“[]”运算符调用数组的SetAt函数或GetAt函数，
- InsertAt用以插入元素或一个数组。
- GetSize或GetUpperBound获取数组元素个数。
- 删除函数：RemoveAt，RemoveAll，如果数组元素保存的是指向对象的指针时，
要首先清除对象再删除数组元素以防止内存泄露：
```cpp
delete arr[i];
arr.RemoveAt(i);
```

- 动态调整数组大小：SetSize，SetAtGrow，Add

当减小数组时，SetSize并不会自动缩小保存数组数据的缓冲区，需要调用**FreeExtra**，如：
```cpp
array.SetSize(50);
array.SetSize(20);
array.FreeExtra();
```

同样，对于RemoveAt和RemoveAll之后再调用FreeExtra可以缩小数组空间为剩下元素需要的最新尺寸。

# 用CArray创建类型安全数组类
声明一个CPoint对象的类型安全数组：
```cpp
CArray<CPoint,CPoint&>array;
```
第一个参数指定了数组中的数据类型，第二个参数指定类型在参数列表中的表示方法。另：非模板化数组类CUIntArray可以如下定义：
```
typedef CArray<UINT ,UINT> CUIntArray;
```

# 列表
可以将之前讲述的数组看做是顺序存储的线性表，这里的列表视为链表，这里的列表是双向链表且不是循环的。

# MFC列表类
非模板化列表类有：CObList（数据类型：CObject指针），CPtrList（数据类型：void指针），CStringList（数据类型：Cstring）。
列表中的位置由抽象数值POSITION标示，POSITION实际上是指向CNode数据结构的指针。

# 用CList创建类型安全列表类
CList<CPoint,CPoint&>list;

如果在CList中使用了类而不是原始数据类型而且调用列表的Find函数，则必须实现下列之一：

1. 类重载==运算符
2. 覆盖模板函数CompareElements。

否则程序不会得到编译。

重载==运算符：
```cpp
class CPoint3D
{
public:
CPoint3D(){x=y=z=0}
CPoint3D(int xPos,int yPos,int zPos)
{
   x=xPos;
   y=yPos;
   z=zPos;
}
operator==(CPoint3D point)const
{
   return (x==point.x&&y==point.y&&z==point.z);
}
public:
int x,y,z;
};
```

覆盖模板函数CompareElements:
```cpp
class CPoint3D
{
public:
CPoint3D(){x=y=z=0}
CPoint3D(int xPos,int yPos,int zPos)
{
   x=xPos;
   y=yPos;
   z=zPos;
}
public:
int x,y,z;
};

BOOL AFXAPI CompareElements(const CPoint3D*P1,const CPoint3D*P2)
{
return(P1->x==P2->x&&P1->y==P2->y&&P1->z&&P2->z);
}
```

# 映射表
设计映射表的主要目的就是给定一个关键字，可以很快地在表中找到对应的项目，通常只查找一次。
映射表生成后不久，会为一个列表分配内存空间，该表实际上是一个指向CAssoc结构指针的数组，MFC使用CAssoc结构来给映射表添加项目和关键字。

例如CMapStringToString定义CAssoc：
```cpp
struct CAssoc
{
CAssoc*pNext;
UINT nHashKey;
CString key;
CString Value;
};
```
CAssoc结构存放在散列表数组中，索引号为：i=nHashValue%nHashTableSize,参见P254图5-1，如果索引号相同，则会链成一个链表。

# 用CMap创建类型安全映射表
CMap<CString,CString&,CPoint,CPoint&>map;
如果使用自己的类调用CMap::Lookup则仍需重载==运算符或覆盖CompareElements函数。

# 类型指针类
```cpp
CTypedPtrList<CObList,CLine*>list;
...
CLine*pLine=new CLine(x,0,x,100);
list.AddTail(pLine);                     //CLine*--》CObject*
...
CLine*pLine=list.GetNext(pos); //无需强制转换了
```