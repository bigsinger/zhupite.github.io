---
layout:		post
category:	"program"
title:		"Windows64位下系统文件提示找不到"
tags:		[c++]
---

```C
HBITMAP LoadImageFromResource(UINT nResourceId, LPCTSTR pszResourceName/* = "PNG"*/)  
{  
    HBITMAP hBitmap = NULL;  
    HINSTANCE hInstance = AfxGetResourceHandle();  
    HRSRC hRsrc = ::FindResource (hInstance, MAKEINTRESOURCE(nResourceId), pszResourceName); // type  
    if ( hRsrc==NULL ){  
        return hBitmap;  
    }  
  
    // load resource into memory  
    DWORD len = SizeofResource(hInstance, hRsrc);  
    BYTE* lpRsrc = (BYTE*)LoadResource(hInstance, hRsrc);  
    if ( lpRsrc==NULL ){  
        return hBitmap;  
    }  
  
    // Allocate global memory on which to create stream  
    HGLOBAL m_hMem = GlobalAlloc(GMEM_FIXED, len);  
    BYTE* pmem = (BYTE*)GlobalLock(m_hMem);  
    memcpy(pmem,lpRsrc,len);  
    IStream* pstm;  
    CreateStreamOnHGlobal(m_hMem,FALSE,&pstm);  
  
    // load from stream  
    CImage image;  
    image.Load(pstm);  
    hBitmap = image.Detach();  
    // free/release stuff  
    GlobalUnlock(m_hMem);  
    pstm->Release();  
    FreeResource(lpRsrc);  
  
    return hBitmap;  
}  
  
HBITMAP hBmpPreview = NULL;  
hBmpPreview = LoadImageFromResource(IDR_PNG_PICTURE);  
::SetMenuItemBitmaps(psub->m_hMenu, ID_MENU_PREVIEW_IMAGE, MF_BYCOMMAND, hBmpPreview, hBmpPreview);  
```