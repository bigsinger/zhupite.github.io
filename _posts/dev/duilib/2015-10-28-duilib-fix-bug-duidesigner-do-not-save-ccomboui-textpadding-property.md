---
layout: 	post
category:	"dev"
title: "duilib DuiDesigner修复：CComboUI的TextPadding属性不保存"
tags:		[duilib,ui,duidesigner]
date:		2015-10-28
---
# duilib DuiDesigner修复：CComboUI的TextPadding属性不保存

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