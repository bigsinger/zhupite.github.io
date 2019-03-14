---
layout: 	post
category:	"duilib"
title:		DuiDesigner文件被修改重新载入（BUG是改出来的）
tags:		[duilib,ui,duidesigner]
---

### 预期效果：
点击TAB切换不同xml皮肤文件的时候，如果文档在外发生变化则提示是否重新加载。

MFC的单（多）文档设计不熟悉，页面激活状态不知道应该如何设置，这里从最熟悉的消息开始，重点看分析方法。

DuiDesigner是支持文件拖放的，如果拖放进多个文件，势必是最后一次的视图是激活状态，如果再拖进去之前的某一个相同文件进去，那么之前的那个视图就会被选中并处于激活状态。资源布局文件拖放进来时的逻辑比较好分析，很快便定位到函数CMainFrame::OnDropFiles，它最终调用的是CWinApp::OpenDocumentFile：
```c
CDocument* CWinApp::OpenDocumentFile(LPCTSTR lpszFileName)
{
    ENSURE_VALID(m_pDocManager);
    return m_pDocManager->OpenDocumentFile(lpszFileName);
}
```
它又调用了CDocManager::OpenDocumentFile：
```c
CDocument* CDocManager::OpenDocumentFile(LPCTSTR lpszFileName)
{
    if (lpszFileName == NULL)
    {
        AfxThrowInvalidArgException();
    }
    // find the highest confidence
    POSITION pos = m_templateList.GetHeadPosition();
    CDocTemplate::Confidence bestMatch = CDocTemplate::noAttempt;
    CDocTemplate* pBestTemplate = NULL;
    CDocument* pOpenDocument = NULL;

    TCHAR szPath[_MAX_PATH];
    ASSERT(lstrlen(lpszFileName) < _countof(szPath));
    TCHAR szTemp[_MAX_PATH];
    if (lpszFileName[0] == '\"')
        ++lpszFileName;
    Checked::tcsncpy_s(szTemp, _countof(szTemp), lpszFileName, _TRUNCATE);
    LPTSTR lpszLast = _tcsrchr(szTemp, '\"');
    if (lpszLast != NULL)
        *lpszLast = 0;
    
    if( AfxFullPath(szPath, szTemp) == FALSE )
    {
        ASSERT(FALSE);
        return NULL; // We won't open the file. MFC requires paths with
                     // length < _MAX_PATH    }

    TCHAR szLinkName[_MAX_PATH];
    if (AfxResolveShortcut(AfxGetMainWnd(), szPath, szLinkName, _MAX_PATH))
        Checked::tcscpy_s(szPath, _countof(szPath), szLinkName);

    while (pos != NULL)
    {
        CDocTemplate* pTemplate = (CDocTemplate*)m_templateList.GetNext(pos);
        ASSERT_KINDOF(CDocTemplate, pTemplate);

        CDocTemplate::Confidence match;
        ASSERT(pOpenDocument == NULL);
        match = pTemplate->MatchDocType(szPath, pOpenDocument);
        if (match > bestMatch)
        {
            bestMatch = match;
            pBestTemplate = pTemplate;
        }
        if (match == CDocTemplate::yesAlreadyOpen)
            break;      // stop here    }

    if (pOpenDocument != NULL)
    {
        POSITION posOpenDoc = pOpenDocument->GetFirstViewPosition();
        if (posOpenDoc != NULL)
        {
            CView* pView = pOpenDocument->GetNextView(posOpenDoc);// get first oneASSERT_VALID(pView);CFrameWnd* pFrame = pView->GetParentFrame();if (pFrame == NULL)
                TRACE(traceAppMsg, 0, "Error: Can not find a frame for document to activate.\n");
            else
            {
                pFrame->ActivateFrame();

                if (pFrame->GetParent() != NULL)
                {
                    CFrameWnd* pAppFrame;
                    if (pFrame != (pAppFrame = (CFrameWnd*)AfxGetApp()->m_pMainWnd))
                    {
                        ASSERT_KINDOF(CFrameWnd, pAppFrame);
                        pAppFrame->ActivateFrame();
                    }
                }
            }
        }
        else
            TRACE(traceAppMsg, 0, "Error: Can not find a view for document to activate.\n");

        return pOpenDocument;
    }

    if (pBestTemplate == NULL)
    {
        AfxMessageBox(AFX_IDP_FAILED_TO_OPEN_DOC);
        return NULL;
    }

    return pBestTemplate->OpenDocumentFile(szPath);
}
```
可以看出，当打开的文件是同一个时，匹配到CDocTemplate::yesAlreadyOpen，文档不再打开，而是找到该文档对应的视图的父窗口并激活之。需要注意的是两处红色部分的代码，其中CFrameWnd * pFrame对应的是所打开的文档对应的那个视图所在的窗口，动态跟踪时发现这个窗口的类型是CChildFrame，而CFrameWnd * pAppFrame的类型是CMainFrame。

这里继续查看CChildFrame的定义，并无过多代码，它是从CMDIChildWndEx派生而来（CMDIChildWndEx又从CMDIChildWnd派生），那么继续追踪CMDIChildWndEx，找到函数OnMDIActivate，查看其代码，有一处调用：CMDIChildWnd::OnMDIActivate，再打开该函数继续查看，找到代码：
```c
CView* pActiveView = GetActiveView();
    if (!bActivate && pActiveView != NULL)
        pActiveView->OnActivateView(FALSE, pActiveView, pActiveView);
```
参考OnActivateView的声明：
```c
protected:
    // Activation
virtual void OnActivateView(BOOL bActivate, CView* pActivateView,
                    CView* pDeactiveView);
    virtual void OnActivateFrame(UINT nState, CFrameWnd* pFrameWnd);
```
发现都是虚函数，刚好可以在CUIDesignerView中进行重载使用，这里使用OnActivateView函数，新增加函数：
```c
void CUIDesignerView::OnActivateView(BOOL bActivate, CView* pActivateView, CView* pDeactiveView)
{
    if ( bActivate ) {
        CString strFilePath = GetDocument()->GetPathName();
        CFileStatus  status;//获取文件相关时间if(CFile::GetStatus(strFilePath, status)) {
            CTime timeLastMod = status.m_mtime;//得到修改时间if ( timeLastMod!=m_timeDocLastMod ) {
                m_timeDocLastMod = timeLastMod;
                 if ( MessageBox(strFilePath + _T("\n文件发生变化，是否重新载入?"), _T("提示"), MB_YESNO)==IDYES ) {
                    //先关闭当前文档及视图
                    pActivateView->GetParentFrame()->SendMessage(WM_CLOSE); 
                     AfxGetApp()->OpenDocumentFile(strFilePath);
                    return;    //不再调用__super::OnActivateView                 }
            }
        }
    }

    __super::OnActivateView(bActivate, pActivateView, pDeactiveView);
}
```
使用pActivateView->GetParentFrame()->SendMessage(WM_CLOSE)关闭的好处是如果当前文档被修改还有一次保存的机会：是否保存对 xxx.xml 的更改？

后来发现函数CUIDesignerView::OnActivated，但是在里面实现逻辑效果没有在CUIDesignerView::OnActivateView中好。
```c
void CUIDesignerView::OnActivated()
{
    g_pPropertiesWnd->ShowProperty(m_MultiTracker.GetFocused());
    g_HookAPI.SetSkinDir(m_LayoutManager.GetSkinDir());
}
```

文档的修改时间初始化是在：**CUIDesignerView::OnInitialUpdate()**，添加代码：
```c
//////////////////////////////////////////////////////////////////////////
//打开时先获取文件最后修改时间，后面视图激活时如果发现文件修改时间变化则重新载入 
CFileStatus status;
 CFile::GetStatus(pDoc->GetPathName(), status);
m_timeDocLastMod = status.m_mtime;
 //////////////////////////////////////////////////////////////////////////
另外，在文档保存成功后也要重新记录下时间：
void CUIDesignerView::SaveSkinFile(LPCTSTR pstrPathName)
{
    if(!m_LayoutManager.SaveSkinFile(pstrPathName)){
        MessageBox(_T("保存XML文件失败!"),_T("错误"),MB_OK);
    }else{
        CFileStatus status;
        CFile::GetStatus(pstrPathName, status);
        m_timeDocLastMod = status.m_mtime;
    }
    g_pResourceView->CopyImageToSkinDir(m_LayoutManager.GetSkinDir(), this->GetDocument()->GetTitle());
}
```

### 新的BUG：
改完后，流程上没有问题，但是会出现崩溃：

![](http://wx3.sinaimg.cn/mw690/006C9P7Ugy1fper7ikgo1j30lq0cg3z3.jpg)

崩溃堆栈比较复杂，不是很好排查，按照经验习惯性地把工程的编译属性改为了静态MFC链接方式，这样方便在不同的机器上运行，避免出现某某dll找不到的情况。崩溃不再出现，以为BUG解决了，时隔多日，差不多都忘记这茬了，在一次使用DuiDesigner设计资源时，发现拖拽手型图标不见了，找找原因。

### 排查过程：
手型鼠标是跟view的setcursor有关的，所以对CUIDesignerView::OnSetCursor下断，动态跟踪时找到：
```c
CMultiUITracker::SetCursor

CUITracker::SetCursor

ENSURE(nHandle < _countof(m_hCursors));
::SetCursor(m_hCursors[nHandle]);
```
发现句柄均为空，说明初始化的时候就没成功，搜索m_hCursors定位到初始化代码：
```c
// Note: all track cursors must live in same module
HINSTANCE hInst = AfxFindResourceHandle(
    ATL_MAKEINTRESOURCE(AFX_IDC_TRACK4WAY), ATL_RT_GROUP_CURSOR);

// initialize the cursor array
m_hCursors[0] = ::LoadCursor(hInst, ATL_MAKEINTRESOURCE(AFX_IDC_TRACKNWSE));
```
LoadCursor找不到相应的资源，从这里也可以看出图标是从DLL里加载的，以共享的方式使用。但是如果使用了静态MFC链接，代码可以链接，但是资源不行，所以导致加载不成功。

### 解决办法：
1. 如果一定要静态链接，则资源图标自行打包进去，或者知道某个dll自行加载获取。记得某个非MFC的dll是有该资源的。
2. 继续使用共享MFC链接方式。



又是时隔多日，突然又要用到DuiDesigner了，发现重新载入文档还是会崩溃。再次回到上面的那个BUG，通过修改MFC链接方式是行不通了，因为会导致拖拽手型图标不见，所以只能继续想办法解决BUG。

崩溃堆栈比较复杂，不是很好排查，只能靠经验来猜测。
1. BUG是改出来，所以需要审查改动的几处代码。
2. 崩溃定位在失活相关的代码，因此可以大致猜测出跟CUIDesignerView::OnActivateView中添加的：
```c
pActivateView->GetParentFrame()->SendMessage(WM_CLOSE); 
AfxGetApp()->OpenDocumentFile(strFilePath);
```
有关系。

### 解决办法：
让OnActivateView执行完毕，通过PostMessage发送自定义消息给视图，视图接收到消息后再处理关闭与重新打开的操作，修改为：
```c
pActivateView->PostMessage(WM_RELOADDOCUMENTFILE, 0, (LPARAM)pActivateView->GetParentFrame());
```
消息处理函数：
```c
LRESULT CUIDesignerView::OnReloadDocumentFile(WPARAM wParam, LPARAM lParam)
{
    CFrameWnd *pWnd = (CFrameWnd *)lParam;
    if ( pWnd ) {
        CString strFilePath = GetDocument()->GetPathName();   //注意要放到WM_CLOSE前，窗口小消失后拿不到Document
        pWnd->SendMessage(WM_CLOSE); 
        AfxGetApp()->OpenDocumentFile(strFilePath);
    }

    return0;
}
```