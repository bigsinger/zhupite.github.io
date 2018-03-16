---
layout:     post
category: 	"duilib"
title:      "DuiDesigner修改：增加对RichEdit控件属性的保存"
tags:		[duilib,ui,DuiDesigner]
date:		2015-10-15
---

当资源中有RichEdit时，无论怎么样修改其属性，最终保存时并不会被写到XML中去，仅仅是一个节点：<RichEdit />，属性一概没有保存。

通过动态跟踪xml保存的调用过程，定位到函数：CLayoutManager::SaveProperties：
```
switch(pExtended->nClass)
    {case classControl:
        SaveControlProperty(pControl, pNode);
        break;
    case classLabel:
    case classText:
        SaveLabelProperty(pControl, pNode);
        break;
    case classButton:
        SaveButtonProperty(pControl, pNode);
        break;
    case classEdit:
        SaveEditProperty(pControl, pNode);
        break;
    case classOption:
        SaveOptionProperty(pControl, pNode);
        break;
    case classProgress:
        SaveProgressProperty(pControl, pNode);
        break;
    case classSlider:
        SaveSliderProperty(pControl, pNode);
        break;
    case classCombo: 
        SaveComboProperty(pControl, pNode);
        break;
    case classList:
        SaveListProperty(pControl, pNode);
        break;
    case classListContainerElement:
        SaveListContainerElementProperty(pControl, pNode);
        break;
    case classListHeaderItem:
        SaveListHeaderItemProperty(pControl, pNode);
        break;
    case classActiveX:
        SaveActiveXProperty(pControl, pNode);
        break;
    case classListHeader:
        SaveListHeaderProperty(pControl,pNode);
        break;
    case classContainer:
    case classVerticalLayout:
        SaveContainerProperty(pControl,pNode);
        break;
    case classTabLayout:
        SaveTabLayoutProperty(pControl, pNode);
        break;
    case classHorizontalLayout:
        SaveHorizontalLayoutProperty(pControl, pNode);
        break;
    case classTileLayout:
        SaveTileLayoutProperty(pControl, pNode);
        break;
    case classChildLayout:
        SaveChildWindowProperty(pControl,pNode);
        break;
    case classWebBrowser:
        SaveWebBrowserProperty(pControl,pNode);
        break;
    default:
        break;
    }
```
其中并没有处理对RichEdit的保存，问题就出现在这里，考虑增加一个函数SaveRichEditProperty，关键还要动态跟踪出RichEdit的pExtended->nClas是多少，动态发现是100。这些枚举值被定义在stdafx.h头文件中：
```
//UI classenum UIClass
{
    classPointer=100,
    classWindow,
    classControl,
    classButton,
    classEdit,
    classLabel,
    classText,
    classOption,
    classCombo,
    classList,
    classSlider,
    classProgress,
    classActiveX,
    classContainer,
    classVerticalLayout,
    classHorizontalLayout,
    classTabLayout,
    classTileLayout,
    classListHeader,
    classListHeaderItem,
    classListTextElement,
    classListLabelElement,
    classListExpandElement,
    classListContainerElement,
    classItem,
    classScrollBar,
    classChildLayout,
    classWebBrowser
};
```
100刚好等于classPointer，其实不太好，为了不影响后面的改动，暂时改为：
```
//UI classenum UIClass
{
    classPointer=100,
    classRichEdit = 100,
    classWindow,
    classControl,
    classButton,
    classEdit,
    classLabel,
    classText,
    classOption,
    classCombo,
    classList,
    classSlider,
    classProgress,
    classActiveX,
    classContainer,
    classVerticalLayout,
    classHorizontalLayout,
    classTabLayout,
    classTileLayout,
    classListHeader,
    classListHeaderItem,
    classListTextElement,
    classListLabelElement,
    classListExpandElement,
    classListContainerElement,
    classItem,
    classScrollBar,
    classChildLayout,
    classWebBrowser
};
```

CLayoutManager::SaveProperties中增加：
```
 case classRichEdit:
        {
            if ( strClass.Compare(DUI_CTR_RICHEDIT)==0 ) {
                SaveRichEditProperty(pControl, pNode);
            }
        }
        break;
```
并实现SaveRichEditProperty：
```
void CLayoutManager::SaveRichEditProperty(CControlUI* pControl, TiXmlElement* pNode)
{
 SaveControlProperty(pControl, pNode);
 CRichEditUI* pRichEditUI = static_cast<CRichEditUI*>(pControl->GetInterface(DUI_CTR_RICHEDIT));

 pNode->SetAttribute("multiline", "true");
 pNode->SetAttribute("autovscroll", "true");
 pNode->SetAttribute("vscrollbar", "true");
 
 if(pRichEditUI->IsReadOnly())
  pNode->SetAttribute("readonly", "true");

 if ( pRichEditUI->IsRich() ) {
  pNode->SetAttribute("rich", "true");
 }
}
```
RichEdit常用的几个属性保存一下，当然不保证是全的，如果有遗漏的可以再加。
