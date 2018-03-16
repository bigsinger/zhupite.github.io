---
layout: 	post
category:	"duilib"
title:		关于duilib的CLayoutManager::SaveControlProperty代码
tags:		[duilib,ui]
date:		2015-09-21
---

```C
void CLayoutManager::SaveControlProperty(CControlUI* pControl, TiXmlElement* pNode)
{
 TCHAR szBuf[MAX_PATH] = {0};

 if(pControl->GetName() && _tcslen(pControl->GetName()) > 0)
 {
   CString strUIName=pControl->GetName();
   if (strUIName.Find(pControl->GetClass()) != 0)
   {
    pNode->SetAttribute("name", StringConvertor::WideToUtf8(pControl->GetName()));
   }
 }

```