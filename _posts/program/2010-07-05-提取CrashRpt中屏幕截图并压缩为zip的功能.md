---
layout:		post
category:	"program"
title:		"提取CrashRpt中屏幕截图并压缩为zip的功能"
tags:		[c++]
---
- Content
{:toc}

CrashRpt中除了错误处理之外值得学习的地方还是不少的，如屏幕截图、邮件发送。
这里主要提取屏幕截图的功能。

1.从CrashRpt源码目录中分别复制minizip、zlib、libpng到一个目录作为公共库使用，并分别编译它们生成lib，需要设置工程属性为“多线程调试(/MTd)”。

2.在公共目录新建ScreenCap目录，复制ScreenCap.h、ScreenCap.cpp到ScreenCap目录。

3.在你的MFC工程中添加过滤器ScreenCap，并把ScreenCap.h、ScreenCap.cpp导入进来。

4.复制核心代码并做相应修改：
```c
// This method compresses the files contained in the report and produces ZIP archive.
BOOL CompressFileAsZip(vector<CString>vtFiles,CString strZipFileName)
{ 
CStringA strZipFileNameA;
BOOL bStatus = FALSE;
zipFile hZip = NULL;
CString sMsg;
LONG64 lTotalSize = 0;
LONG64 lTotalCompressed = 0;
BYTE buff[1024];
DWORD dwBytesRead=0;
HANDLE hFile = INVALID_HANDLE_VALUE;
LARGE_INTEGER lFileSize;
BOOL bGetSize = FALSE;

strZipFileNameA=strZipFileName;
hZip = zipOpen(strZipFileNameA, APPEND_STATUS_CREATE);
if(hZip==NULL)
{
TRACE(_T("Failed to create ZIP file."));
goto cleanup;
}

for(vector<CString>::iterator iter=vtFiles.begin(); 
iter!=vtFiles.end(); ++iter ){ 

CStringA sDstFileNameA;
CString sFileName=*iter;
int nPos=sFileName.ReverseFind('\\');
if ( nPos!=-1 ){
sDstFileNameA=sFileName.Mid(nPos+1);
}else{
sDstFileNameA=sFileName;
}
CString sDesc = _T("描述");
CStringA sDescA;
sDescA=sDesc;

sMsg.Format(_T("Compressing %s\n"), sDstFileNameA);
TRACE(sMsg);

HANDLE hFile = CreateFile(sFileName, 
GENERIC_READ, FILE_SHARE_READ, NULL, OPEN_EXISTING, NULL, NULL); 
if(hFile==INVALID_HANDLE_VALUE)
{
sMsg.Format(_T("Couldn't open file %s\n"), sFileName);
TRACE(sMsg);
continue;
}

bGetSize = GetFileSizeEx(hFile, &lFileSize);
if(!bGetSize)
{
sMsg.Format(_T("Couldn't get file size of %s\n"), sFileName);
TRACE(sMsg);
CloseHandle(hFile);
continue;
}

lTotalSize += lFileSize.QuadPart;

BY_HANDLE_FILE_INFORMATION fi;
GetFileInformationByHandle(hFile, &fi);

SYSTEMTIME st;
FileTimeToSystemTime(&fi.ftCreationTime, &st);

zip_fileinfo info;
info.dosDate = 0;
info.tmz_date.tm_year = st.wYear;
info.tmz_date.tm_mon = st.wMonth;
info.tmz_date.tm_mday = st.wDay;
info.tmz_date.tm_hour = st.wHour;
info.tmz_date.tm_min = st.wMinute;
info.tmz_date.tm_sec = st.wSecond;
info.external_fa = FILE_ATTRIBUTE_NORMAL;
info.internal_fa = FILE_ATTRIBUTE_NORMAL;

int n = zipOpenNewFileInZip( hZip, sDstFileNameA, &info,
NULL, 0, NULL, 0, sDescA, Z_DEFLATED, Z_DEFAULT_COMPRESSION);
if(n!=0)
{
sMsg.Format(_T("Couldn't compress file %s\n"), sDstFileNameA);
TRACE(sMsg);
continue;
}

for(;;)
{
BOOL bRead = ReadFile(hFile, buff, 1024, &dwBytesRead, NULL);
if(!bRead || dwBytesRead==0)
break;

int res = zipWriteInFileInZip(hZip, buff, dwBytesRead);
if(res!=0)
{
zipCloseFileInZip(hZip);
sMsg.Format(_T("Couldn't write to compressed file %s\n"), sDstFileNameA);
TRACE(sMsg);
break;
}

lTotalCompressed += dwBytesRead;
}

zipCloseFileInZip(hZip);
CloseHandle(hFile);
hFile = INVALID_HANDLE_VALUE;
}

if(lTotalSize==lTotalCompressed)
bStatus = TRUE;

cleanup:

if(hZip!=NULL)
zipClose(hZip, NULL);

if(hFile!=INVALID_HANDLE_VALUE)
CloseHandle(hFile);

if(bStatus)
TRACE(_T("Finished compressing files...OK"));
else
TRACE(_T("File compression failed."));

sMsg.Format(_T("Total file size for compression is %I64d"), lTotalSize);

return bStatus;
}

void CtestdlgDlg::OnBnClickedOk()
{
CScreenCapture sc;
DWORD dwFlags = CR_AS_VIRTUAL_SCREEN;

CPoint m_ptCursorPos;
GetCursorPos(&m_ptCursorPos);
std::vector<CString> screenshot_names;

CString m_sErrorReportDirName=_T("C:\\");

if(dwFlags==CR_AS_VIRTUAL_SCREEN){
// Take screenshot of entire desktop
CRect rcScreen;
sc.GetScreenRect(&rcScreen);

BOOL bTakeScreenshot = sc.CaptureScreenRect(rcScreen, m_ptCursorPos,
m_sErrorReportDirName, 0, screenshot_names);
if(bTakeScreenshot==FALSE){
return;
}
}else if(dwFlags==CR_AS_MAIN_WINDOW){     
// Take screenshot of the main window
CRect rcWnd;
GetWindowRect(&rcWnd);
BOOL bTakeScreenshot = sc.CaptureScreenRect(rcWnd, m_ptCursorPos,
m_sErrorReportDirName, 0, screenshot_names);
if(bTakeScreenshot==FALSE){      
return;
}
}else{    
// Invalid flags
ATLASSERT(0);
return;
}

//     vector<CString>vtFiles;
//     vtFiles.push_back(_T("C:\\"));
CompressFileAsZip(screenshot_names,_T("C:\\1.ZIP"));
AfxMessageBox(_T("OK"));
}
```

5.工程链接输入：libpng\lib\libpngd.lib zlib\lib\zlibd.lib minizip\lib\minizipd.lib