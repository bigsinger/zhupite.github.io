---
layout: 	post
category:	"duilib"
title:		duilib保存属性的代码CLayoutManager::SaveProperties
tags:		[duilib,ui]
---

```c
void CUIProperties::InitPropList()

 pProp=new CMFCPropertyGridProperty(_T("Class"),(_variant_t)_T(""),_T("控件的类型"),tagClass);//class
 pPropUI->AddSubItem(pProp);
```
```c
void CUIProperties::ShowControlProperty(CControlUI* pControl)
{
 ASSERT(pControl);

 CMFCPropertyGridProperty* pPropControl=m_wndPropList.FindItemByData(classControl,FALSE);
 ASSERT(pPropControl);

 //class
 CString strClass = pControl->GetClass();
 strClass = strClass.Mid(0, strClass.GetLength() - 2);
 pPropControl->GetSubItem(tagClass-tagControl)->SetValue((_variant_t)strClass);
 pPropControl->GetSubItem(tagClass-tagControl)->SetOriginalValue((_variant_t)strClass);
```

```c
void CLayoutManager::SaveProperties(CControlUI* pControl, TiXmlElement* pParentNode
         , BOOL bSaveChildren/* = TRUE*/)
{
 if((pControl == NULL) || (pParentNode == NULL))
  return;

 CString strClass = pControl->GetClass();
 strClass = strClass.Mid(0, strClass.GetLength() - 2);
```
