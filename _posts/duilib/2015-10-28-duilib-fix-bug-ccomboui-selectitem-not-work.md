---
layout: 	post
category:	"duilib"
title:		CComboUI执行SelectItem无效果排查
tags:		[duilib,ui]
date:		2015-10-28
---

动态跟进CComboUI::SelectItem：
```c
bool CComboUI::SelectItem(int iIndex, bool bTakeFocus)
{
    if( m_pWindow != NULL ) m_pWindow->Close();
    if( iIndex == m_iCurSel ) return true;
    int iOldSel = m_iCurSel;
    if( m_iCurSel >= 0 ) {
        CControlUI* pControl = static_cast<CControlUI*>(m_items[m_iCurSel]);
        if( !pControl ) return false;
        IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
        if( pListItem != NULL ) pListItem->Select(false);
        m_iCurSel = -1;
    }
    if( iIndex < 0 ) return false;
    if( m_items.GetSize() == 0 ) return false;
    if( iIndex >= m_items.GetSize() ) iIndex = m_items.GetSize() - 1;
    CControlUI* pControl = static_cast<CControlUI*>(m_items[iIndex]);
    if( !pControl || !pControl->IsVisible() || !pControl->IsEnabled() ) return false;
    IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
    if( pListItem == NULL ) return false;
    m_iCurSel = iIndex;
    if( m_pWindow != NULL || bTakeFocus ) pControl->SetFocus();
    pListItem->Select(true);
    if( m_pManager != NULL ) m_pManager->SendNotify(this, DUI_MSGTYPE_ITEMSELECT, m_iCurSel, iOldSel);
    Invalidate();

    return true;
}
```
跟进IsVisible：
```c
bool CControlUI::IsVisible() const
{
    return m_bVisible && m_bInternVisible;
}
```
发现m_bInternVisible为false。
在向CComboUI添加元素时会调用Add:
```c
bool CContainerUI::Add(CControlUI* pControl)
{
    if( pControl == NULL) return false;

    if( m_pManager != NULL ) m_pManager->InitControls(pControl, this);
    if( IsVisible() ) NeedUpdate();
    else pControl->SetInternVisible(false);
    return m_items.Add(pControl);   
}
```
整个界面使用了Tab，Tab在显示一页的时候其他页面是隐藏的，那么它所有的子控件也都设置了隐藏：
```c
bool CTabLayoutUI::Add(CControlUI* pControl)
{
    bool ret = CContainerUI::Add(pControl);
    if( !ret ) return ret;

    if(m_iCurSel == -1 && pControl->IsVisible())
    {
        m_iCurSel = GetItemIndex(pControl);
    }
    else
    {
        pControl->SetVisible(false);
    }

    return ret;
}
void CContainerUI::SetVisible(bool bVisible)
{
    if( m_bVisible == bVisible ) return;
    CControlUI::SetVisible(bVisible);
    for( int it = 0; it < m_items.GetSize(); it++ ) {
        static_cast<CControlUI*>(m_items[it])->SetInternVisible(IsVisible());
    }
}
void CControlUI::SetInternVisible(bool bVisible)
{
    m_bInternVisible = bVisible;
    if (!bVisible && m_pManager && m_pManager->GetFocus() == this) {
        m_pManager->SetFocus(NULL) ;
    }
}
```

所以解决办法是在调用**CComboUI::Add**添加元素后再重新调一下**SetInternVisible设置为true**。
