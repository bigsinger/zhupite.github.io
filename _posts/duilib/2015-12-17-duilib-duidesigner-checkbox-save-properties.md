---
layout: 	post
category:	"duilib"
title:		DuiDesigner修改：增加对控件CheckBox属性的保存
tags:		[duilib,duidesigner]
date:   2015-12-17	
---

这次修改主要是DuiDesigner工程，duilib工程无须任何修改。

1. stdafx.h中enum UIClass枚举增加：**classCheckBox**，并引用命名空间：**using DuiLib::CCheckBoxUI;**

2. stdafx.cpp中**gGetUIClass**增加：
```c
if( _tcscmp(pstrClass, _T("CheckBoxUI")) == 0 )
    nClass=classCheckBox;

```
3. LayoutManager.cpp函数**CLayoutManager::NewUI**增加：
```c
case classCheckBox:
	pControl=new CCheckBoxUI;
	pExtended->nClass=classCheckBox;
	pControl->SetFloat(true);
	break;
```

函数**CLayoutManager::SaveOptionProperty**修改为：
```c
void CLayoutManager::SaveOptionProperty(CControlUI* pControl, TiXmlElement* pNode)
{
    SaveButtonProperty(pControl, pNode);

    TCHAR szBuf[MAX_PATH] = {0};
    CString strClass = pControl->GetClass();
    COptionUI* pOptionUI = static_cast<COptionUI*>(pControl->GetInterface(_T("Option")));
    if ( strClass==_T("OptionUI") ) {
        if(pOptionUI->GetGroup() && _tcslen(pOptionUI->GetGroup()))
            pNode->SetAttribute("group",StringConvertor::WideToUtf8(pOptionUI->GetGroup()));
    }//CheckBoxUI

    if(pOptionUI->IsSelected())
        pNode->SetAttribute("selected", pOptionUI->IsSelected()?"true":"false");

    if(pOptionUI->GetForeImage() && _tcslen(pOptionUI->GetForeImage()) > 0)
        pNode->SetAttribute("foreimage", StringConvertor::WideToUtf8(ConvertImageFileName(pOptionUI->GetForeImage())));

    if(pOptionUI->GetSelectedImage() && _tcslen(pOptionUI->GetSelectedImage()) > 0)
        pNode->SetAttribute("selectedimage", StringConvertor::WideToUtf8(ConvertImageFileName(pOptionUI->GetSelectedImage())));

}
```


函数**CLayoutManager::SaveProperties**，增加：
```c
case classOption:
case classCheckBox:
    SaveOptionProperty(pControl, pNode);
```