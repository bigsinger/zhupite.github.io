---
layout: 	post
category:	"duilib"
title:		DuiDesigner修复编辑器不保存CComboUI的textpadding属性的bug
tags:		[duilib,ui,duidesigner]
date:		2015-10-28
---

实际使用发现CComboUI的textpadding为 5 较好，在CComboUI::CComboUI中添加：
```c
m_rcTextPadding.left = 5;
```

DuiDesigner中的CLayoutManager::SaveComboProperty增加：
```c
RECT rcTextPadding = pComboUI->GetTextPadding();
_stprintf_s(szBuf, _T("%d,%d,%d,%d"), rcTextPadding.left, rcTextPadding.top, rcTextPadding.right, rcTextPadding.bottom);
pNode->SetAttribute("textpadding", StringConvertor::WideToUtf8(szBuf));
```