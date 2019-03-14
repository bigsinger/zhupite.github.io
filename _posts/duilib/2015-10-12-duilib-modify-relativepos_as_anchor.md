---
layout: 	post
category:	"duilib"
title:		DUILIB相对位置修改为锚概念
tags:		[duilib,ui,duidesigner]
---
duilib里面的relativepos设计的感觉不是很好用，采用CAnchorCtrl的模式以及C#窗口设计的模式，我们重新把相对位置的概念定义为“锚”。

![](http://wx2.sinaimg.cn/mw690/006C9P7Ugy1fper06as6sj306z0a1q2x.jpg)

![](http://wx2.sinaimg.cn/mw690/006C9P7Ugy1fper05vnzmj308u03mjr8.jpg)

如图所示，锚可以设置为相对父窗口：顶部，底部，左侧，右侧，以及它们中间的任意组合：
```c
enum {
    Left = 1, Top = 2, Right = 4, Bottom = 8, 
    LeftTop = Left | Top,
    LeftRight = Left | Right,
    LeftBottom = Left | Bottom,
    TopRight = Top | Right,
    TopBottom = Top | Bottom,
    RightBottom = Right | Bottom,
    LeftTopRight = Left | Top | Right,
    LeftTopBottom = Left | Top | Bottom,
    LeftRightBottom = Left | Right | Bottom,
    TopRightBottom = Top | Right | Bottom,
    LeftTopRightBottom = Left | Top | Right | Bottom,
};
```
删除与相对位置相关的函数及调用：
```c
virtual void SetRelativePos(SIZE szMove,SIZE szZoom);
virtual void SetRelativeParentSize(SIZE sz);
virtual TRelativePosUI GetRelativePos() const;
virtual bool IsRelativePos() const;
::ZeroMemory(&m_tRelativePos, sizeof(TRelativePosUI));
```
增加成员变量及函数：
```
int  GetAnchorMode();
void SetAnchorMode(int nAnchorMode);
public:
    int        m_nAnchorMode;
    int        m_nMarginLeft;
    int        m_nMarginTop;
    int        m_nMarginRight;
    int        m_nMarginBottom;
    int        m_nWidth;
    int        m_nHeight;
```
函数实现（注意成员变量的初始化）：
```c
int CControlUI::GetAnchorMode() {
    return m_nAnchorMode;
}

void CControlUI::SetAnchorMode(int nAnchorMode) {
    m_nAnchorMode = nAnchorMode;
}
```
把属性相关的先改掉。
修改属性时：
```c
LRESULT CPropertiesWnd::OnUIPropChanged(WPARAM wp, LPARAM lp) {
    CMFCPropertyGridProperty* pProp = (CMFCPropertyGridProperty *)lp;
    SetUIValue(pProp, pProp->GetData());
    
    return TRUE;
}
```
进而追踪：
```c
CPropertiesWnd::SetUIValue
pControl->SetAttribute(strName,strNewVal);
CControlUI::SetAttribute
elseif( _tcscmp(pstrName, _T("relativepos")) == 0 ) {
    SIZE szMove,szZoom;
    LPTSTR pstr = NULL;
    szMove.cx = _tcstol(pstrValue, &pstr, 10);  ASSERT(pstr);    
    szMove.cy = _tcstol(pstr + 1, &pstr, 10);    ASSERT(pstr);    
    szZoom.cx = _tcstol(pstr + 1, &pstr, 10);  ASSERT(pstr);    
    szZoom.cy = _tcstol(pstr + 1, &pstr, 10); ASSERT(pstr); 
    SetRelativePos(szMove,szZoom);
}
```
修改为：
```c
elseif( _tcscmp(pstrName, _T("anchor")) == 0 ) {
    LPTSTR pstr = NULL;
    int nAnchorMode = _tcstol(pstrValue, &pstr, 10);
    SetAnchorMode(nAnchorMode);
}
```
保存属性时的代码：
```c
CLayoutManager::SaveSkinFile
CLayoutManager::SaveProperties
CLayoutManager::SaveControlProperty
TRelativePosUI relativePos = pControl->GetRelativePos();
if(relativePos.bRelative)
{
    _stprintf_s(szBuf, _T("%d,%d,%d,%d"), relativePos.nMoveXPercent, relativePos.nMoveYPercent, relativePos.nZoomXPercent, relativePos.nZoomYPercent);
    pNode->SetAttribute("relativepos", StringConvertor::WideToUtf8(szBuf));
}
```
修改为（0的时候就不保存了，还可以减小xml的体积）：
```c
int nAnchorMode = pControl->GetAnchorMode();
if ( nAnchorMode > 0 ) {
    pNode->SetAttribute("anchor", nAnchorMode);
}
```
属性编辑器的初始化代码：
```c
pValueList = new CMFCPropertyGridProperty(_T("RelativePos"),tagRelativePos,TRUE);//relativepos
pProp=new CMFCPropertyGridProperty(_T("MoveX"),(_variant_t)(LONG)0,_T("控件的水平位移"));
pValueList->AddSubItem(pProp);
pProp=new CMFCPropertyGridProperty(_T("MoveY"),(_variant_t)(LONG)0,_T("控件的垂直位移"));
pValueList->AddSubItem(pProp);
pProp=new CMFCPropertyGridProperty(_T("ZoomX"),(_variant_t)(LONG)0,_T("控件的水平比例"));
pValueList->AddSubItem(pProp);
pProp=new CMFCPropertyGridProperty(_T("ZoomY"),(_variant_t)(LONG)0,_T("控件的垂直比例"));
pValueList->AddSubItem(pProp);
pPropUI->AddSubItem(pValueList);
```
修改为：
```c
pProp=new CMFCPropertyGridProperty(_T("Anchor"),(_variant_t)(LONG)0,_T("控件相对位置"),tagAnchor);
pPropUI->AddSubItem(pProp);
```
属性显示：
```c
//relativepos
TRelativePosUI posRelative=pControl->GetRelativePos();
pValueList=pPropControl->GetSubItem(tagRelativePos-tagControl);
pValueList->GetSubItem(0)->SetValue((_variant_t)(LONG)posRelative.nMoveXPercent);
pValueList->GetSubItem(1)->SetValue((_variant_t)(LONG)posRelative.nMoveYPercent);
pValueList->GetSubItem(2)->SetValue((_variant_t)(LONG)posRelative.nZoomXPercent);
pValueList->GetSubItem(3)->SetValue((_variant_t)(LONG)posRelative.nZoomYPercent);
pValueList->GetSubItem(0)->SetOriginalValue((_variant_t)(LONG)posRelative.nMoveXPercent);
pValueList->GetSubItem(1)->SetOriginalValue((_variant_t)(LONG)posRelative.nMoveYPercent);
pValueList->GetSubItem(2)->SetOriginalValue((_variant_t)(LONG)posRelative.nZoomXPercent);
pValueList->GetSubItem(3)->SetOriginalValue((_variant_t)(LONG)posRelative.nZoomYPercent);
```
    
修改为：
```c
//anchor
pPropControl->GetSubItem(tagAnchor-tagControl)->SetValue((_variant_t)(LONG)pControl->GetAnchorMode());
pPropControl->GetSubItem(tagAnchor-tagControl)->SetOriginalValue((_variant_t)(LONG)pControl->GetAnchorMode());
```
这里需要把tagRelativePos修改为tagAnchor。



上面只是把属性界面部分相关的改掉了，但是要想显示出效果，还需要修改下设置控件位置的代码，设置相对位置有两个比较重要的地方：
1. 记录设计时候的初始位置。
2. 在窗口resize时根据初始位置和锚来计算新位置。
由于duilib在实际工程代码中和DuiDesigner不加区分地都调用了设置控件位置的函数：
SetPos和SetFloatPos（实际上Float属性在引入了锚的概念后也可以一并砍掉，但是为了降低复杂地，一次只优化一个节点）。


例如在资源编辑时，拖动控件：
```c
CUIDesignerView::OnLButtonDown
CMultiUITracker::Track
CMultiUITracker::MultiTrackHandle
CMultiUITracker::UpdateUIRect
CUIDesignerView::Notify
CHorizontalLayoutUI::SetPos
CContainerUI::SetFloatPos
```

因为编辑资源时和运行时设置控件位置的函数一样，这里考虑在SetPos和SetFloatPos中增加一个参数用于区分：BOOL bInitedData，在资源编辑时设置的bInitedData均设为TRUE，其他情况皆为FALSE。并不设定默认的参数，这一点是为了后面修改方便。

首先，只在duilib项目里把所有有关SetPos和SetFloatPos的声明的函数都添加上以上参数（派生类重载的方法有很多），修改完成后编译duilib，找到出错的代码一个个添加缺失的参数，大部分是设置的FALSE。

偷巧的一点：因为在DuiDesigner中手动修改的控件坐标都认定为第一次设置，也就是bInitedData为TRUE，在成功编译duilib后再单独编译DuiDesigner，凡是出现错误的地方一律添加缺失的参数，基本上都是TRUE。

尤其是CUIDesignerView被加载的时候：
```c
CUIDesignerView::OnInitialUpdate()
CLayoutManager::Init
CWindowUI::SetInitSize
CWindowUI::SetPos
CControlUI::SetPos
```

最后修改的函数如下：
```c
void CControlUI::SetPos(RECT rc, BOOL bInitedData)
{
    if( rc.right < rc.left ) rc.right = rc.left;
    if( rc.bottom < rc.top ) rc.bottom = rc.top;

    CDuiRect invalidateRc = m_rcItem;
    if( ::IsRectEmpty(&invalidateRc) ) invalidateRc = rc;

    m_rcItem = rc;
    if( m_pManager == NULL ) return;

    if( !m_bSetPos ) {
        m_bSetPos = true;
        if( OnSize ) OnSize(this);
        m_bSetPos = false;
    }
    CControlUI* pParent = GetParent();
    if ( pParent==NULL ) {
        return;
    }
    RECT rcParentPos = pParent->GetPos();
    if ( bInitedData==TRUE ) {
        m_nMarginLeft = m_rcItem.left - rcParentPos.left;
        m_nMarginTop = m_rcItem.top - rcParentPos.top;
        m_nMarginRight = m_rcItem.right - rcParentPos.right;
        m_nMarginBottom = m_rcItem.bottom - rcParentPos.bottom;
        m_nWidth = m_rcItem.right - m_rcItem.left;
        m_nHeight = m_rcItem.bottom - m_rcItem.top;
    }if( m_bFloat ) {
        if( m_cXY.cx >= 0 ) m_cXY.cx = m_rcItem.left - rcParentPos.left;
        else m_cXY.cx = m_rcItem.right - rcParentPos.right;
        if( m_cXY.cy >= 0 ) m_cXY.cy = m_rcItem.top - rcParentPos.top;
        else m_cXY.cy = m_rcItem.bottom - rcParentPos.bottom;
        m_cxyFixed.cx = m_rcItem.right - m_rcItem.left;
        m_cxyFixed.cy = m_rcItem.bottom - m_rcItem.top;
    }

    m_bUpdateNeeded = false;
    invalidateRc.Join(m_rcItem);

    pParent = this;
    RECT rcTemp;
    RECT rcParent;
    while( pParent = pParent->GetParent() )
    {
        rcTemp = invalidateRc;
        rcParent = pParent->GetPos();
        if( !::IntersectRect(&invalidateRc, &rcTemp, &rcParent) ) 
        {
            return;
        }
    }
    m_pManager->Invalidate(invalidateRc);
}
```
也就是在初始化的时候记录相对父控件的上下左右的距离和宽高，以方便后面窗口大小发生变化的时候使用。



下面是一个小插曲，很多时候在你解决问题的时候往往会穿插或者伴随着别的问题，诸多问题连结在一起的时候怎么办？



以RichListRes为例，用修改后的DuiDesigner重新载入xml皮肤配置文件，稍作修改并撤销然后保存，为的是重新保存xml文件，运行RichListRes工程会崩溃。

然后发现DuiDesigner用的是tinyxml保存的xml，而加载的时候用的是CMarkup，以至于以为是两者操作xml的不同导致的问题，当时差点就要把这两者的操作改为同一个库了。实际上这是不可取的，毕竟工作量太大了。然后用DuiDesigner关闭当前xml并重新载入，发现也不能正常显示了。

通过SVN找BUG：DuiDesigner修改前后的xml通过svn进行对比，并逐块恢复，最终定位到导致出错的xml代码：

原：
```xml
<Default name="VScrollBar" value="button1normalimage=&quot;file='scrollbar.bmp' source='0,90,16,106' mask='#FFFF00FF'&quot; button1hotimage=&quot;file='scrollbar.bmp' source='18,90,34,106' mask='#FFFF00FF'&quot; button1pushedimage=&quot;file='scrollbar.bmp' source='36,90,52,106' mask='#FFFF00FF'&quot; button1disabledimage=&quot;file='scrollbar.bmp' source='54,90,70,106' mask='#FFFF00FF'&quot; button2normalimage=&quot;file='scrollbar.bmp' source='0,108,16,124' mask='#FFFF00FF'&quot; button2hotimage=&quot;file='scrollbar.bmp' source='18,108,34,124' mask='#FFFF00FF'&quot; button2pushedimage=&quot;file='scrollbar.bmp' source='36,108,52,124' mask='#FFFF00FF'&quot; button2disabledimage=&quot;file='scrollbar.bmp' source='54,108,70,124' mask='#FFFF00FF'&quot; thumbnormalimage=&quot;file='scrollbar.bmp' source='0,126,16,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbhotimage=&quot;file='scrollbar.bmp' source='18,126,34,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbpushedimage=&quot;file='scrollbar.bmp' source='36,126,52,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; thumbdisabledimage=&quot;file='scrollbar.bmp' source='54,126,70,142' corner='2,2,2,2' mask='#FFFF00FF'&quot; railnormalimage=&quot;file='scrollbar.bmp' source='0,144,16,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; railhotimage=&quot;file='scrollbar.bmp' source='18,144,34,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; railpushedimage=&quot;file='scrollbar.bmp' source='36,144,52,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; raildisabledimage=&quot;file='scrollbar.bmp' source='54,144,70,160' corner='2,2,2,2' mask='#FFFF00FF'&quot; bknormalimage=&quot;file='scrollbar.bmp' source='0,162,16,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkhotimage=&quot;file='scrollbar.bmp' source='18,162,34,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkpushedimage=&quot;file='scrollbar.bmp' source='36,162,52,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; bkdisabledimage=&quot;file='scrollbar.bmp' source='54,162,70,178' corner='2,2,2,2' mask='#FFFF00FF'&quot; "/>
```
改：
```xml
<Default name="VScrollBar" value='button1normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,90,16,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,90,34,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,90,52,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,90,70,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button2normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,108,16,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,108,34,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,108,52,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,108,70,124&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,126,16,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,126,34,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,126,52,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,126,70,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,144,16,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,144,34,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,144,52,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; raildisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,144,70,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bknormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,162,16,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,162,34,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,162,52,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,162,70,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; '/>
```
可以看出问题来了，也就是value值的部分是用的单引号而非双引号，导致后面CMarkup解析出错。下面就要排查tinyxml在保存文件时候的代码逻辑。

在CLayoutManager::SaveSkinFile函数中找到以下代码：
```c
const CStdStringPtrMap& defaultAttrHash = m_Manager.GetDefaultAttribultes();
 if(defaultAttrHash.GetSize() > 0)
 {
  for (int index = 0; index < defaultAttrHash.GetSize(); ++index)
  {
   LPCTSTR lpstrKey = defaultAttrHash.GetAt(index);
   LPCTSTR lpstrAttribute = m_Manager.GetDefaultAttributeList(lpstrKey);

   TiXmlElement* pAttributeElem = new TiXmlElement("Default");
   pAttributeElem->SetAttribute("name", StringConvertor::WideToUtf8(lpstrKey));

   CString strAttrib(lpstrAttribute);
   pAttributeElem->SetAttribute("value", StringConvertor::WideToUtf8(strAttrib));

   pNode->ToElement()->InsertEndChild(*pAttributeElem);

   delete pAttributeElem;
   pAttributeElem = NULL;
  }
 }
```
也正是保存上面那段xml代码的地方。一直跟进到value被保存的代码：
```c
void TiXmlAttribute::Print( FILE* cfile, int/*depth*/, TIXML_STRING* str ) const
{
 TIXML_STRING n, v;

 EncodeString( name, &n );
 EncodeString( value, &v );

 if (value.find ('\"') == TIXML_STRING::npos) {
  if ( cfile ) {
  fprintf (cfile, "%s=\"%s\"", n.c_str(), v.c_str() );
  }
  if ( str ) {
   (*str) += n; (*str) += "=\""; (*str) += v; (*str) += "\"";
  }
 }
 else {
  if ( cfile ) {
  fprintf (cfile, "%s='%s'", n.c_str(), v.c_str() );
  }
  if ( str ) {
   (*str) += n; (*str) += "='"; (*str) += v; (*str) += "'";
  }
 }
}
```
从这里就能发现问题了，EncodeString会把value处理一次，会把字符串里面出现的引号给转义掉生成新的v，后面的代码：
```c
if (value.find ('\"') == TIXML_STRING::npos)
```
是有bug的，应该是用v比较而不是用value比较，所以就被添加了单引号进去。后来想起，tinyxml被我用最新版的代码替换过一次，可以通过svn恢复：
```c
void TiXmlAttribute::Print( FILE* cfile, int/*depth*/, TIXML_STRING* str ) const
{
    TIXML_STRING n, v;

    EncodeString( name, &n );
    EncodeString( value, &v );

    if ( cfile ) {
        fprintf (cfile, "%s=\"%s\"", n.c_str(), v.c_str() );
    }
    if ( str ) {
        (*str) += n; (*str) += "=\""; (*str) += v; (*str) += "\"";
    }
}
```
重新编译后崩溃消除，看来最新的代码也不见得最稳定啊。


解决掉上述问题后继续，在duilib里面作为父容器的有：CContainerUI、CHorizontalLayoutUI、CVerticalLayoutUI、CTileLayoutUI、CTabLayoutUI、CChildLayoutUI等。后面的几个layout均派生自CContainerUI。

这里修改下CContainerUI的SetPos：
```c
void CContainerUI::SetPos(RECT rc, BOOL bInitedData)
{
    CControlUI::SetPos(rc, bInitedData);
    if( m_items.IsEmpty() ) return;
    rc.left += m_rcInset.left;
    rc.top += m_rcInset.top;
    rc.right -= m_rcInset.right;
    rc.bottom -= m_rcInset.bottom;
    RECT rcCtrl = rc;

    for( int it = 0; it < m_items.GetSize(); it++ ) {
        CControlUI* pControl = static_cast<CControlUI*>(m_items[it]);
        if( !pControl->IsVisible() ) continue;
        if( pControl->IsFloat() ) {
            SetFloatPos(it, bInitedData);
        }
        else {
            int nAnchorMode = pControl->GetAnchorMode();
            if ( nAnchorMode >0 ) {
                DWORD dwFlag = nAnchorMode;
                if ( dwFlag & Left ) {
                    rcCtrl.left = rc.left + pControl->m_nMarginLeft;
                    if ( dwFlag & Right ) {
                        rcCtrl.right = rc.right + pControl->m_nMarginRight;
                    }else{
                        rcCtrl.right = rcCtrl.left + m_nWidth;
                    }
                }else{
                    if ( dwFlag & Right ) {
                        rcCtrl.right = rc.right + pControl->m_nMarginRight;
                    }
                    rcCtrl.left = rcCtrl.right - m_nWidth;
                }

                if ( dwFlag & Top ) {
                    rcCtrl.top = rc.top + m_nMarginTop;
                    if ( dwFlag & Bottom ) {
                        rcCtrl.bottom = rc.bottom + pControl->m_nMarginBottom;
                    }else{
                        rcCtrl.bottom = rcCtrl.top + m_nHeight;
                    }
                }else{
                    if ( dwFlag & Bottom ) {
                        rcCtrl.bottom = rc.bottom + pControl->m_nMarginBottom;
                    }
                    rcCtrl.top = rcCtrl.bottom - m_nHeight;
                }
            }

            pControl->SetPos(rcCtrl, bInitedData); // 所有非float子控件放大到整个客户区            }
    }
}
```
这段代码在Anchor设置为0的时候同原逻辑一样，因此不会影响原来皮肤的使用。

其他几个容器都有重载SetPos，太多了不想改了。目前的这个版本兼容之前的皮肤使用。

## 总结：
CContainerUI作为填充容器，默认撑满其余空间，这一点要好好利用。CContainerUI放在
例如在一个HorizontalLayout里的控件，子控件的Float属性设置为false则会自动排列，这一点也要好好利用。

![](http://wx3.sinaimg.cn/mw690/006C9P7Ugy1fper05j65fj30b301g0sl.jpg)