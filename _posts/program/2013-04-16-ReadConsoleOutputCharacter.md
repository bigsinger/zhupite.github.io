---
layout:		post
category:	"program"
title:		"ReadConsoleOutputCharacter"
tags:		[]
---
- Content
{:toc}

API函数ReadConsoleOutputCharacter，能从控制台缓冲区中读出文字并保存到变量中。但是网上关于这个API函数的资料甚少，仅有声明代码。翻阅外国网站，有给出例子，居然例子也有错误，实在害人不浅。本教程能教会你如何正确的使用ReadConsoleOutputCharacter这个API函数。

ReadConsoleOutputCharacter的参数为：
```c
ReadConsoleOutputCharacter(
	HANDLE hConsoleOutput,
	LPTSTR lpCharacter,
	DWORD nLength,
	COORD dwReadCoord,
	LPDWORD lpNumbersOfCharsRead
)
```

参数详解：

HANDLE hConsoleOutput：

类型为HANDLE，控制台的输出句柄，可以通过API函数GetStdHandle获得

LPTSTR lpCharacter：

char型的指针，用于函数输出读出的文字。注意声明的时候，欲读出5个字符，则声明为char texts[4]

DWORD nLength：
DWORD型，需要读出的文字长度。大于当前行的部分将跳到下一行继续读（不读出回车符及换行符）

COORD dwReadCoord：

COORD型，读出文字的起始坐标

LPDWORD：

DWORD型的指针，用于函数输出读出文字的长度

例：从(0,0)处读出5个字符：
```c
HANDLE hOut=GetStdHandle(STD_OUTPUT_HANDLE);
COORD rcd={0,0};
char texts[4];
DWORD read;
ReadConsoleOutputCharacter(hOut,texts,5,rcd,&read);
```

```c
void ReadConsoleText()
{
	CString strTemp;
	CString strText;
	TCHAR szClassName[MAX_PATH] = {0};
	COORD rcd = {0,0};
	TCHAR szText[MAX_PATH] = {0};
	DWORD dwReadWrite = 0;
	DWORD dwProcessId = 0;
	HWND hWnd = NULL;

	hWnd = GetTopWindow(NULL);
	while ( hWnd!=NULL ){
		if ( ::IsWindowVisible(hWnd)==FALSE ) {
			hWnd = ::GetNextWindow(hWnd,GW_HWNDNEXT);
			continue;
		}

		GetClassName(hWnd,szClassName,MAX_PATH);
		if ( _tcsstr(szClassName,_T("ConsoleWindowClass"))==NULL ) {
			hWnd = ::GetNextWindow(hWnd,GW_HWNDNEXT);
			continue;
		}

		GetWindowThreadProcessId(hWnd,&dwProcessId);
		BOOL bOK = AttachConsole(dwProcessId);
		//freopen("conout$", "w+t", stdout); 
		//freopen("CONIN$","r+t",stdin);  
		//std::cout<<"\n123456";
		//printf("\n789456\n");
		//fclose(stdout);
		//fclose(stdin);

		HANDLE hOut = GetStdHandle(STD_OUTPUT_HANDLE);

		for ( int i = 0; ; ++i ) {
			rcd.X = 0;
			rcd.Y = i;
			ReadConsoleOutputCharacter(hOut,szText,30,rcd,&dwReadWrite);
			if ( dwReadWrite==0 ) {
				break;
			}

			strTemp = szText;
			strText += strTemp.Trim();
		}//endfor

		FreeConsole();
		hWnd = ::GetNextWindow(hWnd,GW_HWNDNEXT);
	}
}
```