---
layout:     post
category:	"duilib"
title:      "DuiDesigner控件Label无法设置文本对齐属性的BUG解决方案"
tags:		[duilib,ui,duidesigner]
---


1. 修复duilib资源编辑器的bug：label、按钮控件无法设置除了center之外的文本对齐方式
2. 修复duilb文本显示对齐方式的逻辑错误代码，DT_LEFT和DT_RIGHT必须配合属性DT_SINGLELINE使用
3. 另外添加了左对齐和右对齐文本显示属性默认纵向居中的逻辑，便于编排控件

首先解决文字绘制不支持左对齐的BUG，因为文字属于绘制逻辑实现的，所以我们先从视图的绘制开始找起。
```c
void CUIDesignerView::OnDraw(CDC* pDrawDC)
```
找到这一行：
```c
m_LayoutManager.Draw(&hCloneDC);
```
这个就是布局的绘制逻辑：
```c
void CLayoutManager::Draw(CDC* pDC)
{
 CSize szForm = GetForm()->GetInitSize();
 CRect rcPaint(0, 0, szForm.cx, szForm.cy);
 CControlUI* pForm = m_Manager.GetRoot();

 pForm->DoPaint(pDC->GetSafeHdc(), rcPaint);

 CContainerUI* pContainer = static_cast<CContainerUI*>(pForm->GetInterface(_T("Container")));
 ASSERT(pContainer);
 DrawAuxBorder(pDC, pContainer->GetItemAt(0));
 DrawGrid(pDC, rcPaint);
}
```
再继续看：
```c
 void CControlUI::DoPaint(HDC hDC, const RECT& rcPaint)
{
    if( !::IntersectRect(&m_rcPaint, &rcPaint, &m_rcItem) ) return;

    // 绘制循序：背景颜色->背景图->状态图->文本->边框if( m_cxyBorderRound.cx > 0 || m_cxyBorderRound.cy > 0 ) {
        CRenderClip roundClip;
        CRenderClip::GenerateRoundClip(hDC, m_rcPaint,  m_rcItem, m_cxyBorderRound.cx, m_cxyBorderRound.cy, roundClip);
        PaintBkColor(hDC);
        PaintBkImage(hDC);
        PaintStatusImage(hDC);
        PaintText(hDC);
        PaintBorder(hDC);
    }
    else {
        PaintBkColor(hDC);
        PaintBkImage(hDC);
        PaintStatusImage(hDC);
        PaintText(hDC);
        PaintBorder(hDC);
    }
}
```
再跟进函数PaintText：
```c
void CControlUI::PaintText(HDC hDC)
{
    return;
}
```
是一个空函数，一定是基类的虚函数，具体绘制实现在派生类对应的函数中，这里是为了解决按钮和label控件的文字绘制对齐问题，所以这里直接查看CLabelUI（CButtonUI继承自CLabelUI）的PaintText函数：
```c
void CLabelUI::PaintText(HDC hDC)
{
	if( m_dwTextColor == 0 ) m_dwTextColor = m_pManager->GetDefaultFontColor();
	if( m_dwDisabledTextColor == 0 ) m_dwDisabledTextColor = m_pManager->GetDefaultDisabledColor();

	RECT rc = m_rcItem;
	rc.left += m_rcTextPadding.left;
	rc.right -= m_rcTextPadding.right;
	rc.top += m_rcTextPadding.top;
	rc.bottom -= m_rcTextPadding.bottom;

	if(!GetEnabledEffect())
	{
		if( m_sText.IsEmpty() ) return;
		int nLinks = 0;
		if( IsEnabled() ) {
			if( m_bShowHtml )
				CRenderEngine::DrawHtmlText(hDC, m_pManager, rc, m_sText, m_dwTextColor, \
				NULL, NULL, nLinks, DT_SINGLELINE | m_uTextStyle);
			else CRenderEngine::DrawText(hDC, m_pManager, rc, m_sText, m_dwTextColor, \
				m_iFont, DT_SINGLELINE |m_uTextStyle);
		}
		else {
			if( m_bShowHtml )
				CRenderEngine::DrawHtmlText(hDC, m_pManager, rc, m_sText, m_dwDisabledTextColor, \
				NULL, NULL, nLinks, DT_SINGLELINE | m_uTextStyle);
			else CRenderEngine::DrawText(hDC, m_pManager, rc, m_sText, m_dwDisabledTextColor, \
				m_iFont, DT_SINGLELINE |m_uTextStyle);
		}
	}
	else
	{
		……
	}
}   
```     
CRenderEngine::DrawText最后是调用API函数DrawText绘制的文本：
```c
void CRenderEngine::DrawText(HDC hDC, CPaintManagerUI* pManager, RECT& rc, LPCTSTR pstrText, DWORD dwTextColor, int iFont, UINT uStyle)
{
    ASSERT(::GetObjectType(hDC)==OBJ_DC || ::GetObjectType(hDC)==OBJ_MEMDC);
    if( pstrText == NULL || pManager == NULL ) return;
    ::SetBkMode(hDC, TRANSPARENT);
    ::SetTextColor(hDC, RGB(GetBValue(dwTextColor), GetGValue(dwTextColor), GetRValue(dwTextColor)));
    HFONT hOldFont = (HFONT)::SelectObject(hDC, pManager->GetFont(iFont));
    ::DrawText(hDC, pstrText, -1, &rc, uStyle | DT_NOPREFIX);
    ::SelectObject(hDC, hOldFont);
}
```
文字对齐属性主要取决于**m_uTextStyle**，在CLabelUI的源码中搜索m_uTextStyle的引用，找到SetAttribute函数：
```c
void CLabelUI::SetAttribute(LPCTSTR pstrName, LPCTSTR pstrValue)
{
	if( _tcscmp(pstrName, _T("align")) == 0 ) {
if( _tcsstr(pstrValue, _T("left")) != NULL ) {
			m_uTextStyle &= ~(DT_CENTER | DT_RIGHT | DT_VCENTER | DT_SINGLELINE);
			m_uTextStyle |= DT_LEFT;
		}if( _tcsstr(pstrValue, _T("center")) != NULL ) {
			m_uTextStyle &= ~(DT_LEFT | DT_RIGHT );
			m_uTextStyle |= DT_CENTER;
		}
if( _tcsstr(pstrValue, _T("right")) != NULL ) {
			m_uTextStyle &= ~(DT_LEFT | DT_CENTER | DT_VCENTER | DT_SINGLELINE);
			m_uTextStyle |= DT_RIGHT;
		}if( _tcsstr(pstrValue, _T("top")) != NULL ) {
			m_uTextStyle &= ~(DT_BOTTOM | DT_VCENTER | DT_VCENTER);
			m_uTextStyle |= (DT_TOP | DT_SINGLELINE);
		}
		if( _tcsstr(pstrValue, _T("vcenter")) != NULL ) {
			m_uTextStyle &= ~(DT_TOP | DT_BOTTOM );            
			m_uTextStyle |= (DT_CENTER | DT_VCENTER | DT_SINGLELINE);
		}
		if( _tcsstr(pstrValue, _T("bottom")) != NULL ) {
			m_uTextStyle &= ~(DT_TOP | DT_VCENTER | DT_VCENTER);
			m_uTextStyle |= (DT_BOTTOM | DT_SINGLELINE);
		}
	}
```



现在再来解决问题1，属性的显示是在CUIProperties::ShowLabelProperty中实现的：
```c
void CUIProperties::ShowLabelProperty(CControlUI* pControl)
{
 ShowControlProperty(pControl);

 ASSERT(pControl);
 CLabelUI* pLabel=static_cast<CLabelUI*>(pControl->GetInterface(_T("Label")));
 ASSERT(pLabel);

 CMFCPropertyGridProperty* pPropLabel=m_wndPropList.FindItemByData(classLabel,FALSE);
 ASSERT(pPropLabel);

 //align
 UINT uStyle=pLabel->GetTextStyle();
 CString strStyle;
 if(uStyle&DT_CENTER)
  strStyle=_T("Center");
 elseif(uStyle&DT_LEFT)    //这里有BUG
  strStyle=_T("Left");
 elseif(uStyle&DT_RIGHT)
  strStyle=_T("Right");
 elseif(uStyle&DT_TOP)
  strStyle=_T("Top");
 elseif(uStyle&DT_BOTTOM)
  strStyle=_T("Bottom");
```
**注意看处理左对齐的代码逻辑，由于DT_LEFT被定义为0x00000000，因此uStyle&DT_LEFT恒不为真，这也就是为什么设置不了文字左对齐的原因。** 修改的逻辑如下：
```c
 void CUIProperties::ShowLabelProperty(CControlUI* pControl)
{
 ShowControlProperty(pControl);

 ASSERT(pControl);
 CLabelUI* pLabel=static_cast<CLabelUI*>(pControl->GetInterface(_T("Label")));
 ASSERT(pLabel);

 CMFCPropertyGridProperty* pPropLabel=m_wndPropList.FindItemByData(classLabel,FALSE);
 ASSERT(pPropLabel);

 //align
 UINT uStyle=pLabel->GetTextStyle();
 CString strStyle;
 if(uStyle&DT_CENTER)
  strStyle=_T("Center");
 else if(uStyle==0)
  strStyle=_T("Left");
 elseif(uStyle&DT_RIGHT)
  strStyle=_T("Right");
 elseif(uStyle&DT_TOP)
  strStyle=_T("Top");
 elseif(uStyle&DT_BOTTOM)
  strStyle=_T("Bottom");
```
至此，在资源编辑器中便可以设置文本对齐属性了，但是修改完成后保存发现属性并未保存成功，继续排查。
布局文件最终保存为xml文件，因此肯定会使用到xml的操作，而工程中使用了tinyxml，因此通过搜索tinyxml文档类的引用最终找到保存布局文件的函数：CLayoutManager::SaveSkinFile，它会在最后调用：
```c
 SaveProperties(pForm->GetItemAt(0), pNode->ToElement());
```
我们看CLayoutManager::SaveProperties：
```c
 void CLayoutManager::SaveProperties(CControlUI* pControl, TiXmlElement* pParentNode
……
  case classLabel:
  case classText:
  SaveLabelProperty(pControl, pNode);
  break;
……
```
继续查看CLayoutManager::SaveLabelProperty，向下找到代码：
```c
if(uTextStyle & DT_LEFT) tstrAlgin = _T("left");
```
仍然是犯了相同的错误，代码应该修改为：
```c
if( uTextStyle==0 ) tstrAlgin = _T("left");
```

完成以上代码修改后，重新编译并运行DuiDesigner即可。

### 新的问题：
我们回到上面的CLabelUI::SetAttribute看，发现里面有一个vcenter属性，属性的设置是又外部属性编辑器中发生改变时调用的，但是编辑器中并没有提供vcenter属性：

![](http://wx2.sinaimg.cn/mw690/006C9P7Ugy1fpelltgau3j309003bq2r.jpg)

而且保存的时候有一个wrap属性：
```c
if(uTextStyle & DT_WORDBREAK)
	tstrAlgin += _T("wrap");
```

### 产生原因：

duilib核心库作者一直在维护，但是duidesigner后面没有再维护了，甚至被作者从开源库中删除了，甚至悲剧。所以满足不了需求了，后面修改一下。
先梳理一下实现效果：
//left和top作为默认属性，冲突属性：DT_RIGHT存在时不能有left，DT_BOTTOM存在时不能有top，DT_WORDBREAK存在时不能有left和top
//DT_CENTER存在时不能有left和right，DT_VCENTER存在时不能有top和bottom
DT_WORDBREAK属性也考虑一下，继续设计成wrap属性，并增加一个none属性，表述没有任何风格。

### 兼容性考虑：
新的设计要兼容老的选项，而代码中处理属性的时候是使用_tcsstr来判断一个属性例如left或top字符串是否存在，存在则添加上对应的风格，因此新的属性应该至少满足让旧版查询到字符串即可。

### 修改步骤：
1. 选择属性时设置对应的风格：CLabelUI::SetAttribute，DT_LEFT、DT_TOP值为0，处理位操作比较麻烦，穷举方式处理。
2. 编辑器初始化时（CUIProperties::InitPropList）Align的选项修改为：LeftVCenter,RightVCenter,Center,TopCenter,BottomCenter,LeftTop,LeftBottom,RightTop,RightBottom,Wrap,None，默认使用LeftVCenter。这种设计可以让老版代码识别。
3. 属性保存的时候CLayoutManager::SaveLabelProperty，CLayoutManager::SaveListHeaderItemProperty
4. 点击控件时，显示属性CUIProperties::ShowLabelProperty。


### 编辑器初始化时：
```c
//Label
#pragma region Label
pPropUI=new CMFCPropertyGridProperty(_T("Label"),classLabel);

//align
pProp=new CMFCPropertyGridProperty(_T("Align"),_T("Center"),_T("指示文本的对齐方式"),tagAlign);
pProp->AddOption(_T("Center"));
pProp->AddOption(_T("Left"));
pProp->AddOption(_T("Right"));
pProp->AddOption(_T("Top"));
pProp->AddOption(_T("Bottom"));
pProp->AllowEdit(TRUE);
pPropUI->AddSubItem(pProp);
```
修改为：
```
//align
pProp=new CMFCPropertyGridProperty(_T("Align"),_T("LeftVCenter"),_T("指示文本的对齐方式"),tagAlign);
pProp->AddOption(_T("LeftVCenter"));
pProp->AddOption(_T("RightVCenter"));
pProp->AddOption(_T("Center"));
pProp->AddOption(_T("TopCenter"));
pProp->AddOption(_T("BottomCenter"));
pProp->AddOption(_T("LeftTop"));
pProp->AddOption(_T("LeftBottom"));
pProp->AddOption(_T("RightTop"));
pProp->AddOption(_T("RightBottom"));
pProp->AddOption(_T("Wrap"));
pProp->AddOption(_T("None"));
pProp->AllowEdit(FALSE);
pPropUI->AddSubItem(pProp);
```

![](http://wx2.sinaimg.cn/mw690/006C9P7Ugy1fpellt3oi8j3085063gli.jpg)

属性保存时：
```c
CLayoutManager::SaveLabelProperty：
std::wstring tstrAlgin;
UINT uTextStyle = pLabelUI->GetTextStyle();
uTextStyle &= ~(DT_SINGLELINE);

if( uTextStyle == (DT_LEFT | DT_VCENTER) ) {
    tstrAlgin = _T("leftvcenter");
}else if ( uTextStyle == (DT_RIGHT | DT_VCENTER) ) {
    tstrAlgin = _T("rightvcenter");
}else if ( uTextStyle == (DT_CENTER | DT_VCENTER) ) {
    tstrAlgin = _T("center");
}else if ( uTextStyle == (DT_CENTER | DT_TOP) ) {
    tstrAlgin = _T("topcenter");
}else if ( uTextStyle == (DT_CENTER | DT_BOTTOM) ) {
    tstrAlgin = _T("bottomcenter");
}else if ( uTextStyle == (DT_LEFT | DT_TOP) ) {
    tstrAlgin = _T("lefttop");
}else if ( uTextStyle == (DT_LEFT | DT_BOTTOM) ) {
    tstrAlgin = _T("leftbottom");
}else if ( uTextStyle == (DT_RIGHT | DT_TOP) ) {
    tstrAlgin = _T("righttop");
}else if ( uTextStyle == (DT_RIGHT | DT_BOTTOM) ) {
    tstrAlgin = _T("rightbottom");
}else if ( uTextStyle == DT_WORDBREAK ) {
    tstrAlgin = _T("wrap");
}else{
    tstrAlgin = _T("");
}
```
还有一处用到了Label：CLayoutManager::SaveListHeaderItemProperty：
```c
std::wstring tstrAlgin;
UINT uTextStyle = pListHeaderItemUI->GetTextStyle();
uTextStyle &= ~(DT_SINGLELINE);

if( uTextStyle == (DT_LEFT | DT_VCENTER) ) {
    tstrAlgin = _T("leftvcenter");
}else if ( uTextStyle == (DT_RIGHT | DT_VCENTER) ) {
    tstrAlgin = _T("rightvcenter");
}else if ( uTextStyle == (DT_CENTER | DT_VCENTER) ) {
    tstrAlgin = _T("center");
}else if ( uTextStyle == (DT_CENTER | DT_TOP) ) {
    tstrAlgin = _T("topcenter");
}else if ( uTextStyle == (DT_CENTER | DT_BOTTOM) ) {
    tstrAlgin = _T("bottomcenter");
}else if ( uTextStyle == (DT_LEFT | DT_TOP) ) {
    tstrAlgin = _T("lefttop");
}else if ( uTextStyle == (DT_LEFT | DT_BOTTOM) ) {
    tstrAlgin = _T("leftbottom");
}else if ( uTextStyle == (DT_RIGHT | DT_TOP) ) {
    tstrAlgin = _T("righttop");
}else if ( uTextStyle == (DT_RIGHT | DT_BOTTOM) ) {
    tstrAlgin = _T("rightbottom");
}else if ( uTextStyle == DT_WORDBREAK ) {
    tstrAlgin = _T("wrap");
}else{
    tstrAlgin = _T("");
}
```
编辑器中显示控件属性：
```c
CUIProperties::ShowLabelProperty：
CString strStyle;
UINT uTextStyle=pLabel->GetTextStyle();
uTextStyle &= ~(DT_SINGLELINE);

if( uTextStyle == (DT_LEFT | DT_VCENTER) ) {
    strStyle = _T("LeftVCenter");
}else if ( uTextStyle == (DT_RIGHT | DT_VCENTER) ) {
    strStyle = _T("RightVCenter");
}else if ( uTextStyle == (DT_CENTER | DT_VCENTER) ) {
    strStyle = _T("Center");
}else if ( uTextStyle == (DT_CENTER | DT_TOP) ) {
    strStyle = _T("TopCenter");
}else if ( uTextStyle == (DT_CENTER | DT_BOTTOM) ) {
    strStyle = _T("BottomCenter");
}else if ( uTextStyle == (DT_LEFT | DT_TOP) ) {
    strStyle = _T("LeftTop");
}else if ( uTextStyle == (DT_LEFT | DT_BOTTOM) ) {
    strStyle = _T("LeftBottom");
}else if ( uTextStyle == (DT_RIGHT | DT_TOP) ) {
    strStyle = _T("RightYop");
}else if ( uTextStyle == (DT_RIGHT | DT_BOTTOM) ) {
    strStyle = _T("RightBottom");
}else if ( uTextStyle == DT_WORDBREAK ) {
    strStyle = _T("Wrap");
}else{
    strStyle = _T("None");
}
```

设置控件属性：
```c
CLabelUI::SetAttribute：
if( _tcscmp(pstrValue, _T("leftvcenter")) == 0 ) {
    m_uTextStyle = DT_LEFT | DT_VCENTER | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("rightvcenter")) == 0 ) {
    m_uTextStyle = DT_RIGHT | DT_VCENTER | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("center")) == 0 ) {
    m_uTextStyle = DT_CENTER | DT_VCENTER | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("topcenter")) == 0 ) {
    m_uTextStyle = DT_CENTER | DT_TOP | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("bottomcenter")) == 0 ) {
    m_uTextStyle = DT_CENTER | DT_BOTTOM | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("lefttop")) == 0 ) {
    m_uTextStyle = DT_LEFT | DT_TOP | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("leftbottom")) == 0 ) {
    m_uTextStyle = DT_LEFT | DT_BOTTOM | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("righttop")) == 0 ) {
    m_uTextStyle = DT_RIGHT | DT_TOP | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("rightbottom")) == 0 ) {
    m_uTextStyle = DT_RIGHT | DT_BOTTOM | DT_SINGLELINE;
}else if ( _tcscmp(pstrValue, _T("wrap")) == 0 ) {
    m_uTextStyle = DT_WORDBREAK;
}else if ( _tcscmp(pstrValue, _T("none")) == 0 ) {
    m_uTextStyle = 0x10000000;
}else{
    m_uTextStyle = 0;
}
```