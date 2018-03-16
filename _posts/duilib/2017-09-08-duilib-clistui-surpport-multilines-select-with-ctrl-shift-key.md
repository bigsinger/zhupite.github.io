---
layout: 	post
category:	"duilib"
title:		"Duilib中list控件支持ctrl和shif多行选中的实现"
tags:		[duilib,ui]
date:		2017-09-08
---

# 一、 由于diulib不支持list控件的多选修改。下面是修改的原理。
Ctrl+左键多选，按下Ctrl键点击，主要有三种情况：
- 选中一个
- 再点击，又选中一个
- 再点击前一个，前一个选中状态消失

总结分析：ctrl按下的情况，点击，不会使前一个（一部分）选中项失去选中状态，而只是让当前点击的项改变选中状态，并将焦点移到当前项。

shift+左键,主要有4中情况
- 点击选中一个（ID为2），向下选中一个（ID为5），则2-5被选中

-  再向下选中一个（ID为10），则2-10被选中

-  向上选中一个（ID为8），则2-8被选中

-  向上选中一个（ID为1），则1-2被选中。

总结分析：shift按下的情况，点击，是选中一个范围，起始项为焦点所在的项，shift点击的项为结束项。

# 二、代码修改
UIList.cpp将Select修改如下：
```
bool CListElementUI::Select(bool bSelect, bool bCallback)
{
    BOOL bShift = (GetKeyState(VK_SHIFT) & 0x8000);
    BOOL bCtrl = (GetKeyState(VK_CONTROL) & 0x8000);
    if (!IsEnabled()) return false;
    //if( bSelect == m_bSelected ) return true;
    if (bCtrl) {
        m_bSelected = !m_bSelected;
    }
    else {
        m_bSelected = bSelect;
    }
    if (m_bSelected == false) {
        Hot(false);
    }
    else {
        Hot(true);
    }
    if (bCallback && m_pOwner != NULL) {
        if (bShift) {
            m_pOwner->SelectRange(m_iIndex);
        }
        else {
            m_pOwner->SelectItem(m_iIndex);
        }
    }
    Invalidate();

    return true;
}
```
添加hot函数：
```
bool CListElementUI::Hot(bool bHot)
{
    if (!IsEnabled()) return false;
    if (bHot)
    {
        m_uButtonState |= UISTATE_HOT;
    }
    else {
        if ((m_uButtonState & UISTATE_HOT) != 0) {
            m_uButtonState &= ~UISTATE_HOT;
        }
    }
    //m_pOwner->HotItem(m_iIndex, bHot);
    Invalidate();

    return true;
}
```
修改SelectItem函数的实现：
```
bool CListUI::SelectItem(int iIndex, bool bTakeFocus)
{
    BOOL bCtrl = (GetKeyState(VK_CONTROL) & 0x8000);
    //if( iIndex == m_iCurSel ) return true; 
    //int iTempSel = -1;
    // We should first unselect the currently selected item 
    if (!bCtrl) {
        //if( m_iCurSel >= 0 ) { 
        for (int i = 0;i < GetCount();i++) {
            if (i != iIndex) {
                CControlUI* pControl = GetItemAt(i);
                if (pControl != NULL) {
                    IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
                    if (pListItem != NULL) {
                        if (pListItem->IsSelected()) {
                            pListItem->Select(false,false);
                        }
                    }
                }
            }
        }
        m_iCurSel = -1;
        //} 
    }
    if (iIndex == m_iCurSel) return true;

    int iOldSel = m_iCurSel;
    if (iIndex < 0) return false;

    CControlUI* pControl = GetItemAt(iIndex);

    if (pControl == NULL) return false;

    if (!pControl->IsVisible()) return false;

    if (!pControl->IsEnabled()) return false;

    IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));

    if (pListItem == NULL) return false;
    m_iCurSel = iIndex;
    /*if (!bCtrl) {
        if (!pListItem->Select(true)) {
            m_iCurSel = -1;
            return false;
        }
    }*/

    EnsureVisible(m_iCurSel);

    if (bTakeFocus) pControl->SetFocus();

    if (m_pManager != NULL) {
        m_pManager->SendNotify(this, DUI_MSGTYPE_ITEMSELECT, m_iCurSel, iOldSel);
    }
    return true;
}
```
添加下面的函数：
```
bool CListUI::SelectRange(int iIndex, bool bTakeFocus)
{
    int i = 0;
    int iFirst = m_iCurSel;
    int iLast = iIndex;
    int iCount = GetCount();

    if (iFirst == iLast) return true;

    CControlUI* pControl = GetItemAt(iIndex);
    if (pControl == NULL) return false;
    if (!pControl->IsVisible()) return false;
    if (!pControl->IsEnabled()) return false;

    IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
    if (pListItem == NULL) return false;
    if (!pListItem->Select(true,false)) {
        m_iCurSel = -1;
        return false;
    }
    EnsureVisible(iIndex);
    if (bTakeFocus) pControl->SetFocus();
    if (m_pManager != NULL) {
        m_pManager->SendNotify(this, DUI_MSGTYPE_ITEMSELECT, iIndex, m_iCurSel);
    }
    //locate (and select) either first or last
    // (so order is arbitrary)
    while (i < iCount) {
        if (i == iFirst || i == iLast) {
            i++;
            break;
        }

        CControlUI* pControl = GetItemAt(i);
        if (pControl != NULL) {
            IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
            if (pListItem != NULL) pListItem->Select(false, false);
        }
        i++;
    }

    // select rest of range
    while (i < iCount) {
        CControlUI* pControl = GetItemAt(i);
        if (pControl != NULL) {
            IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
            if (pListItem != NULL) pListItem->Select(true, false);
        }
        if (i == iFirst || i == iLast) {
            i++;
            break;
        }
        i++;
    }

    // unselect rest of range
    while (i < iCount) {
        CControlUI* pControl = GetItemAt(i);
        if (pControl != NULL) {
            IListItemUI* pListItem = static_cast<IListItemUI*>(pControl->GetInterface(_T("ListItem")));
            if (pListItem != NULL) pListItem->Select(false, false);
        }
        i++;
    }

    return true;
}
```

  ● UIList.h在class IListOwnerUI中添加虚函数：
```
virtual bool SelectRange(int iIndex, bool bTakeFocus = false) = 0;//@xdrt81y@20140218@支持shift多选
```

在class IListItemUI中替换select函数的声明：
```
virtual bool Select(bool bSelect = true, bool bCallback = true) = 0;
```

在class UILIB_API CListUI中添加函数声明：
```
bool SelectRange(int iIndex, bool bTakeFocus = false);//@xdrt81y@20140218@支持shift多选
```

在class UILIB_API CListElementUI中修改函数声明：
```
bool Select(bool bSelect = true, bool bCallback = true);
```

在class UILIB_API CListContainerElementUI中修改声明：
```
bool Select(bool bSelect = true, bool bCallback = true);
```

  ● UICombo.cpp添加函数实现：
```
bool CComboUI::SelectRange(int iIndex, bool bTakeFocus)
{
    return true;
}
```

  ● UICombo.h添加函数声明：
```
bool SelectRange(int iIndex, bool bTakeFocus = false);//@xdrt81y@20140218
```