---
layout: 	post
category:	"dev"
title: "duilib控件RichEdit的AppendMsg"
tags:		[duilib,ui]
date:		2015-10-27
---
# duilib控件RichEdit的AppendMsg

```c
    if (m_logOutCtrl == NULL) return;

    int lines = m_logOutCtrl->GetLineCount();
    //由于输出信息太多，所以当超过200行时，删除前100行
    if (lines >= 200)
    {
        m_logOutCtrl->SetSel(0, m_logOutCtrl->LineIndex(101));
        m_logOutCtrl->Clear();
    }

    long lSelBegin = 0, lSelEnd = 0;
    lSelEnd = lSelBegin = m_logOutCtrl->GetTextLength();
    m_logOutCtrl->SetSel(lSelEnd, lSelEnd);
    m_logOutCtrl->ReplaceSel(lpszText, false);
    //lSelEnd = m_logOutCtrl->GetTextLength();
    //m_logOutCtrl->SetSel(lSelEnd, lSelEnd);
    //m_logOutCtrl->ReplaceSel(_T("\n"), false);

    CHARFORMAT2 cf;
    ZeroMemory(&cf, sizeof(CHARFORMAT2));
    cf.cbSize = sizeof(cf);
    cf.dwReserved = 0;
    cf.dwMask = CFM_COLOR | CFM_LINK | CFM_UNDERLINE | CFM_UNDERLINETYPE;
    cf.crTextColor = rgbcolors; //RGB(110, 123, 202);
    cf.dwEffects = 0;
    lSelEnd = m_logOutCtrl->GetTextLength();
    m_logOutCtrl->SetSel(lSelBegin, lSelEnd);
    m_logOutCtrl->SetSelectionCharFormat(cf);


    PARAFORMAT2 pf;
    ZeroMemory(&pf, sizeof(PARAFORMAT2));
    pf.cbSize = sizeof(pf);
    pf.dwMask = PFM_STARTINDENT;
    pf.dxStartIndent = 0;
    m_logOutCtrl->SetParaFormat(pf);

    m_logOutCtrl->EndDown();
```