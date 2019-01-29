---
layout:		post
category:	"program"
title:		"获取其他程序中CListCtrl控件中的信息"
tags:		[c++]
---
- Content
{:toc}


如获取任务管理器的进程列表信息：

![](http://hiphotos.baidu.com/asmcvc/pic/item/23b28124d356be204d088d17.jpg)


```cpp
void CGetUserListDlg::OnBnClickedButton2() {
	CListCtrl lstCtrl;
	CHeaderCtrl *pHeader;
	CString strText;
	DWORD PID;
	HANDLE hProcess;
	int iItem = 0;
	LVITEM lvitem;
	LV_COLUMN lvColumn;
	char ItemBuf[512], *pItemOrColumn, *pBuffer;

	while (m_lstCopyed.DeleteColumn(0));
	m_lstCopyed.DeleteAllItems();

	if (m_btnShoot.m_hHandle) {
		lstCtrl.m_hWnd = m_btnShoot.m_hHandle;
		GetWindowThreadProcessId(m_btnShoot.m_hHandle, &PID);
		hProcess = OpenProcess(PROCESS_ALL_ACCESS, false, PID);
		if (!hProcess)
			MessageBox("获取进程句柄操作失败！", "错误！", NULL);
		else {
			pItemOrColumn = (char*)VirtualAllocEx(hProcess, NULL, max(sizeof(LVITEM), sizeof(LV_COLUMN)), MEM_COMMIT, PAGE_READWRITE);
			pBuffer = (char*)VirtualAllocEx(hProcess, NULL, 512, MEM_COMMIT, PAGE_READWRITE);
			if ((!pItemOrColumn) || (!pBuffer))
				MessageBox("无法分配内存！", "错误！", NULL);
			else {
				//获取列数
				pHeader = lstCtrl.GetHeaderCtrl();
				int nColumnCnt = pHeader->GetItemCount();

				//获取列信息
				lvColumn.mask = LVCF_TEXT;
				lvColumn.cchTextMax = 512;
				lvColumn.pszText = pBuffer;
				lvColumn.iSubItem = 0;
				WriteProcessMemory(hProcess, pItemOrColumn, &lvColumn, sizeof(LV_COLUMN), NULL);
				for (int i = 0; i < nColumnCnt; i++) {
					::SendMessage(lstCtrl.m_hWnd, LVM_GETCOLUMN, (WPARAM)i, (LPARAM)pItemOrColumn);
					ReadProcessMemory(hProcess, pBuffer, ItemBuf, 512, NULL);
					m_lstCopyed.InsertColumn(i, ItemBuf);
					m_lstCopyed.SetColumnWidth(i, 80);
				}

				//获取行信息
				memset(&lvitem, 0, sizeof(LVITEM));
				lvitem.pszText = pBuffer;
				lvitem.cchTextMax = 512;
				for (int i = 0; i < lstCtrl.GetItemCount(); i++) {
					m_lstCopyed.InsertItem(m_lstCopyed.GetItemCount(), NULL);
					lvitem.iItem = i;
					for (int nSubItem = 0; nSubItem < nColumnCnt; nSubItem++) {
						lvitem.iSubItem = nSubItem;
						WriteProcessMemory(hProcess, pItemOrColumn, &lvitem, sizeof(LVITEM), NULL);
						::SendMessage(lstCtrl.m_hWnd, LVM_GETITEMTEXT, (WPARAM)i, (LPARAM)pItemOrColumn);
						ReadProcessMemory(hProcess, pBuffer, ItemBuf, 512, NULL);
						m_lstCopyed.SetItemText(i, nSubItem, ItemBuf);
					}
				}
				//释放内存 
				CloseHandle(hProcess);
				VirtualFreeEx(hProcess, pItemOrColumn, 0, MEM_RELEASE);
				VirtualFreeEx(hProcess, pBuffer, 0, MEM_RELEASE);
				lstCtrl.m_hWnd = NULL;
			}
		}
	}
}
```