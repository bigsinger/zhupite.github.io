---
layout:		post
category:	"program"
title:		"《MFC Windows程序设计》读书笔记第2章在窗口中绘图"
tags:		[mfc,c++]
---
- Content
{:toc}

# 专门用途的设备描述表类

![](http://hiphotos.baidu.com/asmcvc/pic/item/76129e032054b0573812bb18.jpg)

有时可以用CMindowDC创造特殊效果，如绘制标题栏和带圆角的窗口。
若想在窗口非客户区作图，可借助OnNcPaint处理程序捕获WM_NCPAINT消息。
OnNcPaint不需要调用BeginPaint和EndPaint。

需要操作屏幕时，只要创建CClientDC或CWindowDC对象，构造函数的参数
传递NULL即可。

# 设备描述表属性
每当从windows中获取设备描述表时，设备描述表都被设置为默认值。如果
不想在使用设备描述表时反复对它进行初始化设定，则可以用CDC::SaveDC
保存它的状态，并在下次使用时用CDC::RestoreDC将它恢复；另一种方法：
注册WNDCLASS时使用CS_OWNDC样式，这样windows便会分配它设置好的设备
描述表。

# 映射模式
映射模式是设备描述表的属性，用以确定从逻辑坐标值到设备坐标值的转换方式。

# 可编程映射模式
只有MM_ISOTROPIC和MM_ANISOTROPIC映射模式允许倒转x轴和y轴的方向，
这两个映射模式的区别为：MM_ISOTROPIC中x方向和y方向具有同一个缩放比例，
也即水平方向上的一个单位和垂直方向上的一个单位长度相等。Isotropic意即
“各个方向上相等”。
用MM_ISOTROPIC映射模式画圆和正方形是非常理想的：
CRect rect;
GetClientRect(&rect);
dc.SetMapMode(MM_ISOTROPIC);
dc.SetWindowExt(500,500);
dc.SetViewportExt(rect.Width(),rect.Height());
dc.Ellips(0,0,500,500);

代码中，将窗口的逻辑尺寸设为500单位x500单位，再把逻辑单位转换为设备单位时，
由于使用了MM_ISOTROPIC映射模式，GDI将输出设备的长宽也考虑进去了。
SetWindowExt设定“窗口”范围，SetViewportExt设定“视口”范围。窗口尺寸以逻辑
单位计算呢，视口尺寸以设备单位(如像素点)计算。
一般来说，视口范围是画图所在窗口的大小(以像素点数目计算)，而窗口范围是指以
逻辑单位表示的窗口尺寸。

注：
CWnd::GetClientRect,rect.Width,rect.Height返回的是以像素点表示的尺寸，由于默认
的映射模式为MM_TEXT，因此像素点和一个逻辑单位长度相等，如果是在其他映射模式下
编程，则需使用CDC::DPtoLP和CDC::LPtoDP在逻辑坐标值和设备坐标值之间进行转换。
在响应鼠标单击的命中测试时，LPtoDP和DPtoLP是必不可少的，因为鼠标单击后获取
的是设备坐标值，如果你已经使用了其他映射模式画了一个矩形，则应当调用这两个函数
的一个统一坐标单位后进行Hit测试。

# 移动原点
默认方式下，设备描述表的原点位于显示平面的左上角。使用CDC::SetWindowOrg移动
窗口原点；使用CDC::SetViewportOrg移动视口原点。但是只能使用两个函数中的一个。
如果是使用SetViewportOrg，则只需将需要设为原点的(x,y)坐标作为参数传入即可，
如将窗口中心设为原点：
dc.SetViewportOrg(rect.Width()/2,rect.Height()/2);
如果是使用SetWindowOrg，则情况要复杂一些，它意味着设定了新的原点后，原来原点的
新坐标变化。例如仍将窗口中心设置为原点,

则编程代码应为：SetWindowOrg(-rect.Width()/2,-rect.Height()/2);

# GDI画笔和CPen类

创建基本画笔
1. CPen pen(PS_SOLID,1,RGB(255,0,0));
2. CPen pen;
pen.CreatePen(PS_SOLID,1,RGB(255,0,0));
3. CPen pen;
LOGPEN lp;
lp.lopnStyle = PS_SOLID;
lp.lopnWidth.x=1;
lp.lopnColor = RGB(255,0,0);
pen.CreatePenIndirect(&lp);

"NULL笔"用于创建无边框图，"NULL画刷"画图内部透明。

使用画笔：在创建了画笔之后，即可以选入设备描述表使用了
...
CPen *pOldPen = dc.SelectObject(&pen);
dc.Ellipse(....);

扩展笔
参见CPen构造函数的其他重载形式。

# GDI画刷和CBrush类
画刷三种基本类型:单色，带阴影线，带图案。
创建单色画刷：
1. CBrush brush(RGB(255,0,0));
2. CBrush brush;
brush.CreateSolidBrush(RGB(....));
3. CBrush::CreateBrushIndirect(&LOGBRUSH);

创建阴影线画刷：
1. CBrush brush(HS_DIAGCROSS,RGB(...));
2. CBrush brush;
brush.CreateHatchBrush(HS_DIAGCROSS,RGB(...));

CDC::SetBkMode(TRANSPARENT);用于设置背景填充色为透明。

画刷原点：
见书P55

# 画文本

![](http://hiphotos.baidu.com/asmcvc/pic/item/0590db1be6ede2398718bf3b.jpg)


# GDI字体和CFont类
CFont font；构造了CFont对象之后，就可以通过其成员函数创建字体了，如果以像素
为单位指定字体尺寸，则调用CreateFont或CreateFontIndirect；若以点(一点相当于1/72英寸)
为单位指定字体尺寸，则调用CreatePointFont或CreatePointFontIndirect。如：
CFont font；
font.CreatePointFont(120,_T("Times New Roman"));
是创建12点的字体，第一个参数大小是期望字体大小的10倍。使用CreatePointFontIndirect可以
创建加粗，倾斜等格式的字体：
LOGFONT lf；
::ZeroMemory(&lf,sizeof(lf));
lf.lfHeight = 120;
lf.lfWeight = FW_BOLD;
lf.lfItalic = TRUE;
::lstrcpy(lf.lfFaceName,_T("Times New Roman"));

CFont font;
font.CreatePointFontIndirect(&lf);

光栅字体与TrueType字体
创建旋转字体：
调用CFont::CreateFontIndirect或CFont::CreatePointFontIndirect创建一种字体(适用于TrueType字体)，
在LOGFONT结构的lfEscapment和lfOrientation设定为旋转的角度(*10倍)。

备用对象
 
![](http://hiphotos.baidu.com/asmcvc/pic/item/6ee4b8162399b138962b433b.jpg) 

使用备用对象：
1. dc.SelectStockObject(NULL_PEN);
2. pen.CreateStockObject(NULL_PEN);

取消对GDI对象的选定：
CPen*pPen = new CPen(....);
CPen*pOldPen = dc.SelectObject(pPen);
....
dc.SelectObject(pOldPen);
delete pPen;

其他：
OnCreate处理程序：
int CMainWindow::OnCreate(LPCREATESTRUCT lpCreateStruct)
{
if(CFrameWnd::OnCreate(lpCreateStruct)==-1)
     return -1;
....
return 0;
}