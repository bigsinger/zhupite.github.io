---
layout:		post
category:	"lua"
title:		"exe与dll同时使用Lua的一个内存崩溃异常"
tags:		[lua]
---
- Content
{:toc}
长时间运行后，出现以下崩溃：

```
ntdll.dll!77b95a6c()
[下面的框架可能不正确和/或缺失，没有为 ntdll.dll 加载符号]
ntdll.dll!77b61dab()
ntdll.dll!77b267e6()
kernel32.dll!76ccc4d4()
msvcr90d.dll!_free_base(void * pBlock=0x0046c9e8)  行109 + 0x13 字节    C
luaExecutorD.exe!l_alloc(void * ud=0x00000000, void * ptr=0x0046c9e8, unsigned int osize=32, unsigned int nsize=0)  行631 + 0x9 字节    C
star.dll!luaM_realloc_(lua_State * L=0x001c55a0, void * block=0x0046c9e8, unsigned int osize=32, unsigned int nsize=0)  行79 + 0x1d 字节    C
>    star.dll!luaH_free(lua_State * L=0x001c55a0, Table * t=0x019c2340)  行376 + 0x24 字节    C
star.dll!freeobj(lua_State * L=0x001c55a0, GCObject * o=0x019c2340)  行383 + 0xd 字节    C
star.dll!sweeplist(lua_State * L=0x001c55a0, GCObject * * p=0x02dd4e40, unsigned int count=17)  行424 + 0xd 字节    C
star.dll!singlestep(lua_State * L=0x001c55a0)  行583 + 0x12 字节    C
star.dll!luaC_step(lua_State * L=0x001c55a0)  行617 + 0x9 字节    C
star.dll!lua_pushlstring(lua_State * L=0x001c55a0, constchar * s=0x02bb5d40, unsigned int len=76841)  行447 + 0x1d 字节    C
star.dll!gethtml(lua_State * L=0x001c55a0)  行186 + 0x1b 字节    C++
luaExecutorD.exe!luaD_precall(lua_State * L=0x001c55a0, lua_TValue * func=0x019878e8, int nresults=1)  行320 + 0x16 字节    C
luaExecutorD.exe!luaV_execute(lua_State * L=0x001c55a0, int nexeccalls=3)  行591 + 0x14 字节    C
luaExecutorD.exe!luaD_call(lua_State * L=0x001c55a0, lua_TValue * func=0x001c5868, int nResults=-1)  行378 + 0xb 字节    C
luaExecutorD.exe!f_call(lua_State * L=0x001c55a0, void * ud=0x0012fc80)  行800 + 0x16 字节    C
luaExecutorD.exe!luaD_rawrunprotected(lua_State * L=0x001c55a0, void (lua_State *, void *)* f=0x00433d70, void * ud=0x0012fc80)  行118 + 0x1f 字节    C
luaExecutorD.exe!luaD_pcall(lua_State * L=0x001c55a0, void (lua_State *, void *)* func=0x00433d70, void * u=0x0012fc80, int old_top=16, int ef=0)  行464 + 0x11 字节    C
luaExecutorD.exe!lua_pcall(lua_State * L=0x001c55a0, int nargs=0, int nresults=-1, int errfunc=0)  行821 + 0x20 字节    C
luaExecutorD.exe!RunLuaFile(constchar * lpszLuaFile=0x001da4a8, const std::vector<ATL::CStringT<char,ATL::StrTraitATL<char,ATL::ChTraitsCRT<char> > >,std::allocator<ATL::CStringT<char,ATL::StrTraitATL<char,ATL::ChTraitsCRT<char> > > > > & args=[0]())  行45 + 0x23 字节    C++
luaExecutorD.exe!main(int argc=2, char * * argv=0x001c54f0)  行94 + 0x12 字节    C++
luaExecutorD.exe!__tmainCRTStartup()  行586 + 0x19 字节    C
luaExecutorD.exe!mainCRTStartup()  行403    C
```

我们看下luaH_free：
void luaH_free ( lua_State * L , Table * t ) {

```c
if (t->node != dummynode)
    luaM_freearray(L, t->node, sizenode(t), Node);
    luaM_freearray(L, t->array, t->sizearray, TValue);
    luaM_free(L, t);
}
```

崩溃发生时使用vs附加上去调试，定位到luaH_free函数并查看t->node的值发现是dummynode_：

![img](https://img-blog.csdn.net/20150721192550195)



lua源码中：

```c
 #define dummynode (&dummynode_)
```

也就是说t->node==dummynode，却仍然调用了内存释放的逻辑，何解？

原因是exe使用了一个dll，而这个exe和dll都分别静态链接了lua库，导致存在两个dummynode，也即一个在exe中的一个在dll中的。

参考链接： http://www.douban.com/note/98782461/

一般情况下不会遇到这个崩溃，长时间运行时会触发垃圾回收，因此上面的问题便显现出来了，这个问题还真不好排查啊。

Lua的使用关系前后变化如图：

![img](https://img-blog.csdn.net/20150721192605274)