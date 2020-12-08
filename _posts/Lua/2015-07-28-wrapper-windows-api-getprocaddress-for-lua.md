---
layout:		post
category:	"lua"
title:		"封装GetProcAddress让Lua调用Windows API"
tags:		[lua]
---
- Content
{:toc}
参考了云风的方法，修复了一点bug。



```c
DWORD myLoadLibrary(const char *lpFileName)
{
    HMODULE h = GetModuleHandleA(lpFileName);
    if ( h==NULL ){
        h = LoadLibraryA(lpFileName);
    }

    return (DWORD)h;
}

static int CallApi(lua_State* L)
{
    int n = lua_gettop(L);
    FARPROC fc=(FARPROC)lua_touserdata(L,lua_upvalueindex(1));
    if ( fc==NULL ){
        lua_pushinteger(L,0);
        return 1;
    }

    DWORD dwRet = 0;
    DWORD dwParam = 0;

    for (int i=0;i<n;i++) {
        switch (lua_type(L,i+1) ) {
        case LUA_TNIL:
            __asm{
                push 0;
            }
            break;
        case LUA_TNUMBER:
            dwParam=(DWORD)lua_tointeger(L,i+1);
            __asm{
                push dwParam;
            }
            break;
        case LUA_TBOOLEAN:
            dwParam=(DWORD)lua_toboolean(L,i+1);
            __asm{
                push dwParam;
            }
            break;
        case LUA_TSTRING:
            dwParam=(DWORD)lua_tostring(L,i+1);
            __asm{
                push dwParam;
            }
            break;
        case LUA_TLIGHTUSERDATA:
            dwParam=(DWORD)lua_touserdata(L,i+1);
            __asm{
                push dwParam;
            }
            break;
        default:
            lua_pushstring(L,"unknown argument type");
            lua_error(L);
            break;
        }
    }
    __asm{
        call fc;
        mov dwRet,eax;
    }
    
    lua_pushinteger(L,dwRet);
    return 1;
}

int myGetProcAddress(lua_State* L)
{
    FARPROC func = NULL;
    DWORD dwModule = 0;
    string strFuncName;

    int n = lua_gettop(L);
    if ( n>1 ){
        if ( lua_isnumber(L,-2) ){
            dwModule = lua_tonumber(L,-2);
        }
        if ( lua_isstring(L,-1) ){
            strFuncName = lua_tostring(L,-1);
        }

        func = GetProcAddress((HMODULE)dwModule,strFuncName.c_str());
    }

    lua_pushlightuserdata(L,func);
    lua_pushcclosure(L,CallApi,1);
    return 1;
}
```

