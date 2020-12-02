---
layout:		post
category:	"program"
title:		"OnCtlColor解决静态透明以及文本重影问题"
tags:		[mfc,c++]
---
- Content
{:toc}


```cpp
HBRUSH CDemoDlg::OnCtlColor(
	CDC* pDC,
	CWnd* pWnd,
	UINT nCtlColor
) {
	HBRUSH hBrush = CDialog::OnCtlColor(pDC, pWnd, nCtlColor);
	if (pWnd == &m_stcALabel) {
		pDC->SetTextColor(RGB(0, 255, 0));
		pDC->SetBkMode(TRANSPARENT);
		return (HBRUSH)GetStockObject(NULL_BRUSH);
	}

	return hBrush;
}

void CDemoDlg::SetCurrentText(CWnd*pWnd, CString strText) {
	CRect rect;
	pWnd->GetWindowRect(rect);
	this->ScreenToClient(rect);
	pWnd->SetWindowText(strText);
	this->InvalidateRect(rect);
}
```