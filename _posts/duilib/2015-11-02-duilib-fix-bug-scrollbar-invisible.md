---
layout:     post
category: 	"duilib"
title:      "duilib问题解决：滚动条不见了"
tags:		[duilib,ui]
date:		2015-11-02
---

如图，运行后RichEdit的滚动条显示如下：

滚动条的属性设置是在Window节点下设置的，无论在xml里怎么样设置都不行：
```
<Default name="VScrollBar" value="button1normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,90,16,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,90,34,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,90,52,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button1disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,90,70,106&apos; mask=&apos;#FFFF00FF&apos;&quot; button2normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,108,16,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,108,34,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,108,52,124&apos; mask=&apos;#FFFF00FF&apos;&quot; button2disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,108,70,124&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,126,16,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,126,34,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,126,52,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,126,70,142&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,144,16,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,144,34,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,144,52,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; raildisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,144,70,160&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bknormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,162,16,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,162,34,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,162,52,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,162,70,178&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; "/><Default name="HScrollBar" value="button1normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,0,16,16&apos; mask=&apos;#FFFF00FF&apos;&quot; button1hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,0,34,16&apos; mask=&apos;#FFFF00FF&apos;&quot; button1pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,0,52,16&apos; mask=&apos;#FFFF00FF&apos;&quot; button1disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,0,70,16&apos; mask=&apos;#FFFF00FF&apos;&quot; button2normalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,18,16,34&apos; mask=&apos;#FFFF00FF&apos;&quot; button2hotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,18,34,34&apos; mask=&apos;#FFFF00FF&apos;&quot; button2pushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,18,52,34&apos; mask=&apos;#FFFF00FF&apos;&quot; button2disabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,18,70,34&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,36,16,52&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,36,34,52&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,36,52,52&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; thumbdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,36,70,52&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railnormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,54,16,70&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,54,34,70&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; railpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,54,52,70&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; raildisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,54,70,70&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bknormalimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;0,72,16,88&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkhotimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;18,72,34,88&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkpushedimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;36,72,52,88&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; bkdisabledimage=&quot;file=&apos;scrollbar.bmp&apos; source=&apos;54,72,70,88&apos; corner=&apos;2,2,2,2&apos; mask=&apos;#FFFF00FF&apos;&quot; "/>
```

猜测可能的原因：

duilib核心代码的版本不对？因为duilib的版本网上有很多，googlecode上一份，github上一份，这两份虽然是官方团队自己维护的竟然也不一样，更别说网上散步的别的版本了，我们的工程代码就是不知道用了哪份代码。
由于比较想用DuiDesigner来设计资源，github上把DuiDesigner砍掉了，因为改到最后发现DuiDesigner支持不了了，比较坑。
所以，后面就以googlecode上的代码为准开始做分析。

第一步，验证googlecode的代码RichEdit是否能正确显示滚动条。
网上下载了一个duilib的显示程序，使其引用googlecode这一版本的duilib代码，修改使之编译通过（省略N个步骤）：

证实是可以正确显示滚动条的。于是就打算把项目中的duilib代码更换为googlecode这一版本的。

工程是采用vs2015，而duilib是vs2008来开发的，所以还是会有一些问题，这里一并罗列一下：
工程中需要导入库：
```
#pragma comment( lib, "comctl32.lib" )
#pragma comment( lib, "Gdi32.lib" )
#pragma comment( lib, "comdlg32.lib" )
```
UIFlash.h中有一处需要改动的：
```
#import "..\Utils/Flash11.tlb" raw_interfaces_only, named_guids, rename("IDispatchEx","IMyDispatchEx")
```
更改为：
```
//ref: http://blog.163.com/tijijun@126/blog/static/6820974520141201844104/
//#import "..\Utils/Flash11.tlb" raw_interfaces_only, named_guids
#import "PROGID:ShockwaveFlash.ShockwaveFlash" raw_interfaces_only, named_guids, \
rename("IDispatchEx", "IMyDispatchEx")    \
rename("ICanHandleException", "IMyICanHandleException")
```

编译通过后运行程序，发现RichEdit的滚动条仍然不能正常显示，为什么呢？
1. 网上下载的duidemo可以正常显示
2. 自己的工程不能正常显示

同一份核心代码，那就不是引擎的问题，于是就想到是不是设计的方式不对导致的？
对比了一下发现，duidemo的不同TAB页面都是在同一个Window里设计完成的，TAB页不同的switch页面也都是在同一个xml里设计完成的。这种设计方法有一个很大弊端就是：所有的子页面都是在同一个窗口区里设计，又不能通过设置visible的属性在设计阶段切换不同的设计页面，所以设计起来比较痛苦费时。我们的设计方法是添加自定义节点：
```
<HorizontalLayout bkcolor="#FFFFFFFF" bordercolor="#FF768D9B"><TabLayout name="tabSwitch"><HorizontalLayout><pageWrapper bkcolor="ffffffff"/></HorizontalLayout><HorizontalLayout><pageSign /></HorizontalLayout><HorizontalLayout><pageSetting /></HorizontalLayout><HorizontalLayout><pageAbout /></HorizontalLayout></TabLayout></HorizontalLayout>
```
每个节点代表一个子窗口，在代码中通过设置IDialogBuilderCallback来根据节点名动态加载对应的子页面资源配置文件：
```
class CDialogBuilderCallbackEx : public IDialogBuilderCallback
{
public:
    CControlUI* CreateControl(LPCTSTR pstrClass) 
    {
        if (_tcscmp(pstrClass, _T("pageWrapper")) == 0) {
            returnnew CPageWrapperUI;
        }
        elseif (_tcscmp(pstrClass, _T("pageSign")) == 0) {
            returnnew CPageSignUI;
        }
        elseif (_tcscmp(pstrClass, _T("pageSetting")) == 0) {
            returnnew CPageSettingUI;
        }
        elseif (_tcscmp(pstrClass, _T("pageAbout")) == 0) {
            returnnew CPageAboutUI;
        }
        return NULL;
    }
};
class CPageWrapperUI : public CContainerUI
{
public:
    CPageWrapperUI()
    {
        CDialogBuilder builder;
        CContainerUI* pPage = static_cast<CContainerUI*>(builder.Create(_T("pageWrapper.xml"), (UINT)0));
        if(pPage) {
            this->Add(pPage);
        }
        else {
            this->RemoveAll();
            return;
        }
    }
};
```
例如这里的子页面资源配置文件：pageWrapper.xml，我们要显示的RichEdit就是在这个页面显示的。它里面也有一个Window节点，即使在该xml以及main.xml里的Window节点下都设置了滚动条的属性，最终都不能正确显示出来。
想到，滚动条既然是Window的属性，何不把让pageWrapper.xml继承main.xml里的属性呢？于是
```
extern CPaintManagerUI* g_PM;class CPageWrapperUI : public CContainerUI
{
public:
    CPageWrapperUI()
    {
        CDialogBuilder builder;
        CContainerUI* pPage = static_cast<CContainerUI*>(builder.Create(_T("pageWrapper.xml"), (UINT)0, 0, g_PM, 0));
        if(pPage) {
            this->Add(pPage);
        }
        else {
            this->RemoveAll();
            return;
        }
    }
};
```

```
    m_pm.Init(m_hWnd);
    g_PM = &m_pm;
```
我们在CPaintManagerUI初始化后保存其指针，然后在IDialogBuilderCallback中创建CPageWrapperUI的时候把该指针传递进去，编译运行大功告成！