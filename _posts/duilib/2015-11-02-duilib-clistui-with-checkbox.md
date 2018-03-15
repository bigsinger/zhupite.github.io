---
layout:     post
category: 	"duilib"
title:      "duilib对CListUI的改造：支持checkbox"
tags:		[duilib,ui,DuiDesigner]
date:		2015-11-02
---

参考：http://blog.csdn.net/tragicguy/article/details/21893065

注意：
此处需要将内嵌控件的ListHeaderItem 添加一个inset属性，控制内嵌的控件不要铺满整个ListHeaderItem ，否则表头拖动不了，如：
```
ListHeaderItem text="" inset="1,0,1,0"
```

这个注意其实很容易被遗忘，而且duidisigner并不会把inset属性给保存到xml里去，这里用代码内置进去，在CListHeaderItemUI的构造函数里添加代码：
```
 CListHeaderItemUI::CListHeaderItemUI() : m_bDragable(true), m_uButtonState(0), m_iSepWidth(4),
m_uTextStyle(DT_VCENTER | DT_CENTER | DT_SINGLELINE), m_dwTextColor(0), m_iFont(-1), m_bShowHtml(false)
{
//设置内边距，防止遮挡拖放的间隔条
    RECT rcInset = GetInset();
    if ( rcInset.left==0 || rcInset.right==0 ) {
        SetInset(CDuiRect(4, 0, 4, 0));
    }

    SetTextPadding(CDuiRect(2, 0, 2, 0));
    ptLastMouse.x = ptLastMouse.y = 0;
    SetMinWidth(16);
}
```
这个好处是，如果xml里配置了且左右边距不为0则不会设置，否则会设置一下，这里边距设置为4，足够拖放用的了。

但是后面的改造有点复杂。。。。
后来看到树控件是支持checkbox的：

在xml里找到关于checkbox的属性：checkboxattr，搜索源代码：
```
voidCTreeNodeUI::SetAttribute( LPCTSTR pstrName, LPCTSTR pstrValue )
    {
        if(_tcscmp(pstrName, _T("text")) == 0 )
            pItemButton->SetText(pstrValue);
        elseif(_tcscmp(pstrName, _T("horizattr")) == 0 )
            pHoriz->ApplyAttributeList(pstrValue);
        elseif(_tcscmp(pstrName, _T("dotlineattr")) == 0 )
            pDottedLine->ApplyAttributeList(pstrValue);
        elseif(_tcscmp(pstrName, _T("folderattr")) == 0 )
            pFolderButton->ApplyAttributeList(pstrValue);
        elseif(_tcscmp(pstrName, _T("checkboxattr")) == 0 )
            pCheckBox->ApplyAttributeList(pstrValue);
```
类CTreeNodeUI继承自CListContainerElementUI，而这个也同样是list控件里显示元素内容的容器。
那就好办了，可以把派生类里的有关checkbox的东西全部搬到基类里实现，这样无论是list还是tree都能用了，妥妥的。

修改好后：

发现checkbox在最前面了，因为我们在基类CListContainerElementUI的构造函数中，最先添加的checkbox。
在派生类中先移除之，后添加：
```
  m_pHoriz->Remove(m_pCheckBox);
  m_pHoriz->Add(pDottedLine);
  m_pHoriz->Add(pFolderButton);
  m_pHoriz->Add(m_pCheckBox);
  m_pHoriz->Add(pItemButton);
```
运行崩溃：

我们看移除函数：
```
bool CContainerUI::Remove(CControlUI* pControl)
    {
        if( pControl == NULL) returnfalse;

        for( int it = 0; it < m_items.GetSize(); it++ ) {
            if( static_cast<CControlUI*>(m_items[it]) == pControl ) {
                NeedUpdate();
                if( m_bAutoDestroy ) {
                    if( m_bDelayedDestroy && m_pManager ) m_pManager->AddDelayedCleanup(pControl);             
                    elsedelete pControl;
                }
                return m_items.Remove(it);
            }
        }
        returnfalse;
    }
void CControlUI::NeedUpdate()
{
    if( !IsVisible() ) return;
    m_bUpdateNeeded = true;
    Invalidate();

    if( m_pManager != NULL ) m_pManager->NeedUpdate();
}
```
remove函数会导致控件被刷新，所以在移除前先设置不可见，移除后再设置回去。

原代码：
```
        pHoriz->Add(pDottedLine);
        pHoriz->Add(pFolderButton);
        pHoriz->Add(pCheckBox);
        pHoriz->Add(pItemButton);
        Add(pHoriz);
```
修改后：
```
bool bVisible = m_pHoriz->IsVisible();    //保存bool bAutoDestroy = m_pHoriz->IsAutoDestroy();
        m_pHoriz->SetVisible(false);
        m_pHoriz->SetAutoDestroy(false);
        m_pHoriz->Remove(m_pCheckBox);
        m_pHoriz->SetAutoDestroy(bAutoDestroy);//设置回之前的状态
        m_pHoriz->SetVisible(bVisible);            
        m_pHoriz->Add(pDottedLine);
        m_pHoriz->Add(pFolderButton);
        m_pHoriz->Add(m_pCheckBox);
        m_pHoriz->Add(pItemButton);
```