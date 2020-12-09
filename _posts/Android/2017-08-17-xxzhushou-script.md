---
layout:		post
category:	"android"
title:		"叉叉助手脚本开发"
tags:		[android]
---


## 官网资料
- [叉叉开发者首页](http://dev.xxzhushou.cn/userIndex.html)：下载安装叉叉集成开发环境、叉叉开发助手(安卓版)
- [手机游戏脚本\_手游脚本库\_最新脚本大全](http://www.xxzhushou.cn/script/)
- [如何搭建开发环境](http://dev.xxzhushou.cn/faq.html#29_35)
- [叉叉小精灵\_制作脚本独立APP\_叉叉助手官网制作脚本独立APP\_叉叉小精灵官网](http://xjl.xxzhushou.cn/)
- [叉叉脚本开发手册](https://www.zybuluo.com/xxzhushou/note/266705)

- [取色器使用说明](https://www.zybuluo.com/xxzhushou/note/266705#取色器使用说明)
- 三方Lua增强库：[boyliang/lua\_badboy: Some useful tools for lua](https://github.com/boyliang/lua_badboy)

- 

## 搭建开发环境
IDE不能通过USB调试的方式（AndroidStudio类似的方式），必须让手机设备与IDE所在电脑同属在一个局域网中，很不方便。

脚本导出目录：/sdcard/xsp，也即导出的脚本可以直接复制到该目录下，叉叉助手手机版就可以识别使用。




```Lua

toast("欢迎")
ver = getEngineVersion()
sysLog(string.format('当前版本号: %s', ver))
sysLog("id: "..getUserID())
sysLog("id: "..getScriptID())


local bb = require("badboy")
local strutils = bb.getStrUtils()
local str = 'i am a badboy'
--十六进制编码转换、SHA1计算、MD5计算
local hex = str:tohex() -- 等同于 strutils.toHex(str)
local sha1 = str:sha1() -- 等同于 strutils.SHA1(str)
local md5 = str:md5() -- 等同于 strutils.md5(str)
sysLog('hex:' .. hex)
sysLog('sha1:' .. sha1)
sysLog('md5:' .. md5)


--local bb = require("badboy")
--bb.loadluasocket()
--local http = bb.http
--http.PROXY = 'http://127.0.0.1:8888' --代理服务器地址
--local result, code = http.request('http://www.baidu.com')
--dialog(result or tostring(code), 0)

--local bb = require("badboy")
--local json = bb.getJSON()
--bb.loaduilib()
--local rootview = RootView:create({style = ViewStyle.CUSTOME})
--local page = Page:create("page")
--page.text = "Page1"
--local page2 = Page:create("page2")
--page2.text = "Page2"
--local label = Label:create("Label", {color = "255, 255, 0"})
--label.text = "I love XX"
--local image = Image:create("image")
--image.src = "bg.png"
--local edit = Edit:create("edit", {prompt = "提示"})
--edit.align = TextAlign.LEFT
--local radiogroup = RadioGroup:create("radiogroup")
--radiogroup:setList('男', '女', '嬲', '奻')
--radiogroup:setSelect(3)
--local checkboxgroup = CheckBoxGroup:create('checkboxgroup')
--checkboxgroup:setList('XX', 'OO', 'AA', 'BB')
--checkboxgroup:setSelects(2, 3)
--rootview:addView(page)    --把page添加到rootview
--rootview:addView(page2)
--page:addView(label)       --把label添加到page
---- page:addView(label)    --label的id重复，这里会报错
--page:addView(image)       --把image添加到page
--page:addView(checkboxgroup)
--page:addView(radiogroup)
--page:removeView(label1)   --从page中删除label
--uijson = json.encode(rootview)
--showUI(uijson)


buyState,validTime,res=getUserCredit()
if buyState ~= 0 then
	sysLog("您是付费用户")
end

ver = getOSType()
if ver == "android" then
    sysLog("安卓系统")
elseif ver == "iOS" then
    sysLog("苹果系统")
end


ret = getScreenDirection()
if ret == 0 then
  sysLog("当前屏幕方向为竖屏")
elseif ret == 1 then
  ver = getOSType()
  if ver == "iOS" then
    sysLog("当前屏幕方向为横屏，HOME键在右")
  elseif ver == "android" then
    sysLog("当前屏幕方向为横屏")
  end
elseif ret == 2 then 
  sysLog("当前屏幕方向为横屏，HOME键在左")
elseif ret == -1 then
  sysLog("当前屏幕方向Unknow")
end

ver = isPrivateMode()
if ver == 0 then
  sysLog("当前为免越狱/免ROOT环境")
elseif ver == 1 then 
  sysLog("当前为越狱/root环境")
end


width,height = getScreenSize()
sysLog('屏幕分辨率: '..width..' x '..height)
sysLog('mTime:' .. mTime())
sysLog("NetTime:" .. getNetTime())
pressHomeKey()

appid = 'com.bigsing.hooktest'

flag = appIsRunning(appid)
if flag == 0 then
		sysLog('启动APP')
    runApp(appid)
		while flag == 0 do
			mSleep(1000)
			flag = appIsRunning(appid)
			sysLog('检测APP是否启动：'..flag)
		end
else
	flag = isFrontApp(appid)
	if flag == 0 then
		runApp(appid)
	end
	
	while flag==0 do
		mSleep(1000)
		flag = isFrontApp(appid)
	end
end


init(appid, 0)

touchDown(1, 587,304)
touchUp(1, 587,304)
mSleep(1000)


x, y = findColor({0, 0, 1079, 1799}, 
"0|0|0x4c4d4d,1|0|0x393a3a,2|0|0x393a3a,3|0|0x797979,4|0|0xd5d6d6,4|1|0xabacac,4|2|0x4d4e4e,4|3|0x1d1d1d,5|3|0x848585,6|4|0xb9baba",
90, 0, 0, 0)
if x > -1 then
sysLog('找图坐标：'..x..' '..y)
	touchDown(1, x, y)
	touchUp(1, x, y)
else
	sysLog('没找到')
end




--ret,results = showUI('ui.json')

--dialog("请点击屏幕一次", 0);
--x,y = catchTouchPoint();
--mSleep(1000);
--dialog("x:"..x.." y:"..y, 0);
```
