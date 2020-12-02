---
layout: 	post
category:	"duilib"
title:		DuiDesigner增加：打开皮肤配置文件所在的文件夹
tags:		[duilib,ui,duidesigner]
date:		2015-10-27
---

经常使用VisualStudio，习惯使用该功能：打开并选择对应的文档，但是DuiDesigner只是打开文件夹，并不选中对应的文档：
```c
void CUIDesignerDoc::OnMdiOpenFullPath()
{
    if(m_strPathName.IsEmpty())
    {
        MessageBox(NULL, _T("请先保存当前文件。"), _T("提示"), MB_ICONINFORMATION);
        return;
    }

    int nPos = m_strPathName.ReverseFind(_T('\\'));
    if(nPos == -1)
        return;
    CString strDir = m_strPathName.Left(nPos + 1);
    ShellExecute(NULL, _T("open"), strDir, NULL, NULL, SW_SHOW);
}
```
修改为：
```c
void CUIDesignerDoc::OnMdiOpenFullPath()
{
    if(m_strPathName.IsEmpty())
    {
        MessageBox(NULL, _T("请先保存当前文件。"), _T("提示"), MB_ICONINFORMATION);
        return;
    }
    
    CString strFileName = m_strPathName;
    if ( GetFileAttributes(strFileName)==-1 ){    
        //文件不存在打开它所在的目录
        CString strFolder;
        int nPos=strFileName.ReverseFind('\\');
        if ( nPos!=-1 ){
            strFolder=strFileName.Left(nPos);
        }

        if ( GetFileAttributes(strFolder)==-1 ){
            //AfxMessageBox("以下文件不存在，可能已经被删除了：\n"+strFileName);
        }else{
            ShellExecute(NULL,_T("open"),_T("explorer.exe"),strFolder,NULL,SW_NORMAL);
        }
    }else{
        CString strCmdLine;
        strCmdLine.Format( _T("/select, \"%s\""), strFileName );
        ShellExecute(NULL,_T("open"),_T("explorer.exe"),strCmdLine,NULL,SW_NORMAL);
    }
}
```