---
layout: 	post
category:	"duilib"
title:		"DuiDesigner修改：增加对控件vscrollbar，hscrollbar属性的显示和保存"
tags:		[duilib,ui,duidesigner]
date:		2015-11-23
---

1、显示：**CUIProperties::ShowContainerProperty**
```修改为：
//hscrollbar
pPropContainer->GetSubItem(tagHScrollBar-tagContainer)->SetValue((_variant_t)(pContainer->GetHorizontalScrollBar()==NULL?false:true));
pPropContainer->GetSubItem(tagHScrollBar-tagContainer)->SetOriginalValue((_variant_t)(pContainer->GetHorizontalScrollBar()==NULL?false:true));
//vscrollbar
pPropContainer->GetSubItem(tagVScrollBar-tagContainer)->SetValue((_variant_t)(pContainer->GetVerticalScrollBar()==NULL?false:true));
pPropContainer->GetSubItem(tagVScrollBar-tagContainer)->SetOriginalValue((_variant_t)(pContainer->GetVerticalScrollBar()==NULL?false:true));
```


2、保存：**CLayoutManager::SaveControlProperty**
增加：
```
CContainerUI* pContainer=static_cast<CContainerUI*>(pControl->GetInterface(_T("Container")));
    if ( pContainer!=NULL ) {
        if ( pContainer->GetHorizontalScrollBar()!=NULL ) {
            pNode->SetAttribute("hscrollbar","true");
        }
        if ( pContainer->GetVerticalScrollBar()!=NULL ) {
            pNode->SetAttribute("vscrollbar","true");
        }
    }
```