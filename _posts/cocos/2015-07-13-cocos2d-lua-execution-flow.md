---
layout:		post
category:	"lua"
title:		"cocos2d-Lua的运行流程与场景"
tags:		[lua,cocos,cocos2d]
---
- Content
{:toc}
很早的时候，用过COCOS_CODE_IDE写过一个基于Lua脚本的cocos工程，是基于IDEA的，代码看起来和写起来都非常赏心悦目，于是翻去找笔记，了解到是COCOS_CODE_IDE，于是打算重新认识下。 


 网上了解到COCOS_CODE_IDE已经没了，上次用的版本是2.0beta版本。

 1.x的版本都是基于eclipse的，肯定是不敢苟同的，2.0beta版本是基于IDEA的，下载地址见《cocos2dx入门》“Cocos Code IDE”一节。但是这个版本也不行了，至于为什么不行，可以过一下。参见：[如何从COCOS_CODE_IDE过渡到用AndroidStudio开发cocos的？](https://blog.csdn.net/asmcvc/article/details/72847064)



以下仅记录了使用COCOS_CODE_IDE创建的demo游戏的启动流程，仅作学习研究。目前的cocos开发已经不可能再用COCOS_CODE_IDE了。现在的cocos开发主流推荐是用cocos creator（以JavaScript为主要开发语言，主要用来开发H5小游戏的），lua和c++开发的话用cocos2dx（截止2020年12月，目前的版本为4.0，但已经不是官方的核心主推了）。



# main

打开工程根目录下的配置文件config.json：

```lua
{
"init_cfg": {
"isLandscape": true,
"isWindowTop": false,
"name": "redDefense",
"width": 1920,
"height": 1080,
"entry": "src/main.lua",
"consolePort": 6050,
"uploadPort": 6060,
"debugPort": 10000,
"forwardConsolePort": 10089,
"forwardUploadPort": 10091
},
"simulator_screen_size": [
    {
"title": "iPhone 3Gs (480x320)",
"width": 480,
"height": 320
},
    {
"title": "iPhone 4 (960x640)",
"width": 960,
"height": 640
},
    {
"title": "iPhone 5 (1136x640)",
"width": 1136,
"height": 640
},
    {
"title": "iPad (1024x768)",
"width": 1024,
"height": 768
},
    {
"title": "iPad Retina (2048x1536)",
"width": 2048,
"height": 1536
},
    {
"title": "Android (800x480)",
"width": 800,
"height": 480
},
    {
"title": "Android (854x480)",
"width": 854,
"height": 480
},
    {
"title": "Android (1280x720)",
"width": 1280,
"height": 720
},
    {
"title": "Android (1920x1080)",
"width": 1920,
"height": 1080
}
  ]
}
```

可以看到 "entry": "src/main.lua",也就是说入口文件是main.lua，进而打开main.lua：

```lua
cc.FileUtils:getInstance():setPopupNotify(false)
cc.FileUtils:getInstance():addSearchPath("src/")
cc.FileUtils:getInstance():addSearchPath("res/")

require "config"
require "cocos.init"

local function main()
require("app.MyApp"):create():run()
end

local status, msg = xpcall(main, __G__TRACKBACK__)
if not status then
print(msg)
end
```

执行main函数，main函数里加载MyApp创建并运行，进而打开MyApp.lua：

```lua
local MyApp = class("MyApp", cc.load("mvc").AppBase)

function MyApp:onCreate()
math.randomseed(os.time())
end

return MyApp
```

这里就有点看头，MyApp仅仅是继承自AppBase，onCreate函数只是初始化了下随机数种子，也就意味着更多的操作在AppBase中，我们打开分析：

```lua
local AppBase = class("AppBase")

function AppBase:ctor(configs)
self.configs_ = {
viewsRoot  = "app.views",
modelsRoot = "app.models",
defaultSceneName = "MainScene",
    }

for k, v in pairs(configs or {}) do
self.configs_[k] = v
end

    if type(self.configs_.viewsRoot) ~= "table" then
self.configs_.viewsRoot = {self.configs_.viewsRoot}
end
    if type(self.configs_.modelsRoot) ~= "table" then
self.configs_.modelsRoot = {self.configs_.modelsRoot}
end

    if DEBUG > 1 then
dump(self.configs_, "AppBase configs")
end

    if CC_SHOW_FPS then
cc.Director:getInstance():setDisplayStats(true)
end

-- event
self:onCreate()
end

function AppBase:run(initSceneName)
initSceneName = initSceneName or self.configs_.defaultSceneName
self:enterScene(initSceneName)
end

function AppBase:enterScene(sceneName, transition, time, more)
local view = self:createView(sceneName)
view:showWithScene(transition, time, more)
return view
end

function AppBase:createView(name)
for _, root in ipairs(self.configs_.viewsRoot) do
        local packageName = string.format("%s.%s", root, name)
local status, view = xpcall(function()
return require(packageName)
end, function(msg)
if not string.find(msg, string.format("'%s' not found:", packageName)) then
print("load view error: ", msg)
end
        end)
local t = type(view)
if status and (t == "table" or t == "userdata") then
return view:create(self, name)
end
    end
error(string.format("AppBase:createView() - not found view \"%s\" in search paths \"%s\"",
name, table.concat(self.configs_.viewsRoot, ",")), 0)
end

function AppBase:onCreate()
end

return AppBase
```

在前面的分析中知道main.lua是执行的是App的run函数，作为基类的AppBase，当然也要被调用run函数，因此直接看run函数：主要是创建并进入场景initSceneName，如果run的参数没有指定开始的场景则使用默认场景defaultSceneName，默认场景在构造函数的时候被初始化为MainScene，也就是说场景默认将从MainScene开始。

如果给run指定了场景名(字符串)，那么项目启动后会直接进入该场景，这点有个好处是如果要调试设计某场景可以直接从这个场景进入，不必从其他场景进入了。也就是在main.lua中这么调用即可：

```lua
local function main()
require("app.MyApp"):create():run('PlayScene')
end
```

那么项目启动后会直接进入PlayScene场景，而不再是默认的MainScene场景。

我们现在不做改动，仍然接着默认流程分析， MainScene为主场景， 创建并显示一张背景图，创建显示一个“Play”按钮，按钮的点击事件是进入PlayScene场景。

**local** MainScene = class ( **"MainScene"** , cc . load ( **"mvc"** ). ViewBase )



```lua
function MainScene:onCreate()
-- add background image
display.newSprite("MainSceneBg.jpg")
        :move(display.center)
        :addTo(self)

-- add play button
local playButton = cc.MenuItemImage:create("PlayButton.png", "PlayButton.png")
        :onClicked(function()
self:getApp():enterScene("PlayScene")
end)
cc.Menu:create(playButton)
        :move(display.cx, display.cy - 200)
        :addTo(self)
end

return MainScene
```

------



PlayScene场景：

```lua
local PlayScene = class("PlayScene", cc.load("mvc").ViewBase)

local GameView = import(".GameView")

function PlayScene:onCreate()
-- create game view and add it to stage
self.gameView_ = GameView:create()
        :addEventListener(GameView.events.PLAYER_DEAD_EVENT, handler(self, self.onPlayerDead))
        :start()
        :addTo(self)
end

function PlayScene:onPlayerDead(event)
-- add game over text
local text = string.format("You killed %d bugs", self.gameView_:getKills())
cc.Label:createWithSystemFont(text, "Arial", 96)
        :align(display.CENTER, display.center)
        :addTo(self)

-- add exit button
local exitButton = cc.MenuItemImage:create("ExitButton.png", "ExitButton.png")
        :onClicked(function()
self:getApp():enterScene("MainScene")
end)
cc.Menu:create(exitButton)
        :move(display.cx, display.cy - 200)
        :addTo(self)
end

return PlayScene
```

PlayScene场景创建游戏逻辑视图GameView并调用start函数开始游戏，绑定了一个游戏结束的事件，这个事件会在GameView中在触发游戏结束逻辑时发生，PlayScene由于绑定了该事件，则会在游戏结束时调用其绑定的回调事件，以显示战绩和分数，显示一个退出按钮，退出按钮事件为进入MainScene场景。

至此，场景的切换已经很清晰了，那么主要的游戏逻辑便是在GameView中了。

打开工程根目录下的配置文件config.json：



```lua
{
"init_cfg": {
"isLandscape": true,
"isWindowTop": false,
"name": "redDefense",
"width": 1920,
"height": 1080,
"entry": "src/main.lua",
"consolePort": 6050,
"uploadPort": 6060,
"debugPort": 10000,
"forwardConsolePort": 10089,
"forwardUploadPort": 10091
},
"simulator_screen_size": [
    {
"title": "iPhone 3Gs (480x320)",
"width": 480,
"height": 320
},
    {
"title": "iPhone 4 (960x640)",
"width": 960,
"height": 640
},
    {
"title": "iPhone 5 (1136x640)",
"width": 1136,
"height": 640
},
    {
"title": "iPad (1024x768)",
"width": 1024,
"height": 768
},
    {
"title": "iPad Retina (2048x1536)",
"width": 2048,
"height": 1536
},
    {
"title": "Android (800x480)",
"width": 800,
"height": 480
},
    {
"title": "Android (854x480)",
"width": 854,
"height": 480
},
    {
"title": "Android (1280x720)",
"width": 1280,
"height": 720
},
    {
"title": "Android (1920x1080)",
"width": 1920,
"height": 1080
}
  ]
}
```

可以看到 **"entry": "src/main.lua"**,也就是说入口文件是main.lua，进而打开main.lua：

```lua
cc.FileUtils:getInstance():setPopupNotify(false)
cc.FileUtils:getInstance():addSearchPath("src/")
cc.FileUtils:getInstance():addSearchPath("res/")

require "config"
require "cocos.init"

local function main()
require("app.MyApp"):create():run()
end

local status, msg = xpcall(main, __G__TRACKBACK__)
if not status then
print(msg)
end
```

执行main函数，main函数里加载MyApp创建并运行，进而打开MyApp.lua：

```lua
local MyApp = class("MyApp", cc.load("mvc").AppBase)

function MyApp:onCreate()
math.randomseed(os.time())
end

return MyApp
```

这里就有点看头，MyApp仅仅是继承自AppBase，onCreate函数只是初始化了下随机数种子，也就意味着更多的操作在AppBase中，我们打开分析：

```lua
local AppBase = class("AppBase")

function AppBase:ctor(configs)
self.configs_ = {
viewsRoot  = "app.views",
modelsRoot = "app.models",
defaultSceneName = "MainScene",
    }

for k, v in pairs(configs or {}) do
self.configs_[k] = v
end

    if type(self.configs_.viewsRoot) ~= "table" then
self.configs_.viewsRoot = {self.configs_.viewsRoot}
end
    if type(self.configs_.modelsRoot) ~= "table" then
self.configs_.modelsRoot = {self.configs_.modelsRoot}
end

    if DEBUG > 1 then
dump(self.configs_, "AppBase configs")
end

    if CC_SHOW_FPS then
cc.Director:getInstance():setDisplayStats(true)
end

-- event
self:onCreate()
end

function AppBase:run(initSceneName)
initSceneName = initSceneName or self.configs_.defaultSceneName
self:enterScene(initSceneName)
end

function AppBase:enterScene(sceneName, transition, time, more)
local view = self:createView(sceneName)
view:showWithScene(transition, time, more)
return view
end

function AppBase:createView(name)
for _, root in ipairs(self.configs_.viewsRoot) do
        local packageName = string.format("%s.%s", root, name)
local status, view = xpcall(function()
return require(packageName)
end, function(msg)
if not string.find(msg, string.format("'%s' not found:", packageName)) then
print("load view error: ", msg)
end
        end)
local t = type(view)
if status and (t == "table" or t == "userdata") then
return view:create(self, name)
end
    end
error(string.format("AppBase:createView() - not found view \"%s\" in search paths \"%s\"",
name, table.concat(self.configs_.viewsRoot, ",")), 0)
end

function AppBase:onCreate()
end

return AppBase
```

在前面的分析中知道main.lua是执行的是App的run函数，作为基类的AppBase，当然也要被调用run函数，因此直接看run函数：主要是创建并进入场景initSceneName，如果run的参数没有指定开始的场景则使用默认场景defaultSceneName，默认场景在构造函数的时候被初始化为MainScene，也就是说场景默认将从MainScene开始。

如果给run指定了场景名(字符串)，那么项目启动后会直接进入该场景，这点有个好处是如果要调试设计某场景可以直接从这个场景进入，不必从其他场景进入了。也就是在main.lua中这么调用即可：

```lua
local function main()
	require("app.MyApp"):create():run('PlayScene')
end
```

那么项目启动后会直接进入PlayScene场景，而不再是默认的MainScene场景。

我们现在不做改动，仍然接着默认流程分析， MainScene为主场景， 创建并显示一张背景图，创建显示一个“Play”按钮，按钮的点击事件是进入PlayScene场景。

**local** MainScene = class ( **"MainScene"** , cc . load ( **"mvc"** ). ViewBase )



```lua
function MainScene:onCreate()
-- add background image
display.newSprite("MainSceneBg.jpg")
        :move(display.center)
        :addTo(self)

-- add play button
local playButton = cc.MenuItemImage:create("PlayButton.png", "PlayButton.png")
        :onClicked(function()
self:getApp():enterScene("PlayScene")
end)
cc.Menu:create(playButton)
        :move(display.cx, display.cy - 200)
        :addTo(self)
end

return MainScene
```

------



PlayScene场景：

```lua
local PlayScene = class("PlayScene", cc.load("mvc").ViewBase)

local GameView = import(".GameView")

function PlayScene:onCreate()
-- create game view and add it to stage
self.gameView_ = GameView:create()
        :addEventListener(GameView.events.PLAYER_DEAD_EVENT, handler(self, self.onPlayerDead))
        :start()
        :addTo(self)
end

function PlayScene:onPlayerDead(event)
-- add game over text
local text = string.format("You killed %d bugs", self.gameView_:getKills())
cc.Label:createWithSystemFont(text, "Arial", 96)
        :align(display.CENTER, display.center)
        :addTo(self)

-- add exit button
local exitButton = cc.MenuItemImage:create("ExitButton.png", "ExitButton.png")
        :onClicked(function()
self:getApp():enterScene("MainScene")
end)
cc.Menu:create(exitButton)
        :move(display.cx, display.cy - 200)
        :addTo(self)
end

return PlayScene
```

PlayScene场景创建游戏逻辑视图GameView并调用start函数开始游戏，绑定了一个游戏结束的事件，这个事件会在GameView中在触发游戏结束逻辑时发生，PlayScene由于绑定了该事件，则会在游戏结束时调用其绑定的回调事件，以显示战绩和分数，显示一个退出按钮，退出按钮事件为进入MainScene场景。

至此，场景的切换已经很清晰了，那么主要的游戏逻辑便是在GameView中了。





# GameView

接上， PlayScene场景创建游戏逻辑视图GameView并调用start函数开始游戏：

```lua
-- GameView is a combination of view and controller
local GameView = class("GameView", cc.load("mvc").ViewBase)

local BugBase   = import("..models.BugBase")
local BugAnt    = import("..models.BugAnt")
local BugSpider = import("..models.BugSpider")

local BugSprite = import(".BugSprite")
local DeadBugSprite = import(".DeadBugSprite")

GameView.HOLE_POSITION = cc.p(display.cx - 30, display.cy - 75)
GameView.INIT_LIVES = 99999
GameView.ADD_BUG_INTERVAL_MIN = 1
GameView.ADD_BUG_INTERVAL_MAX = 3

GameView.IMAGE_FILENAMES = {}
GameView.IMAGE_FILENAMES[BugBase.BUG_TYPE_ANT] = "BugAnt.png"
GameView.IMAGE_FILENAMES[BugBase.BUG_TYPE_SPIDER] = "BugSpider.png"

GameView.BUG_ANIMATION_TIMES = {}
GameView.BUG_ANIMATION_TIMES[BugBase.BUG_TYPE_ANT] = 0.15
GameView.BUG_ANIMATION_TIMES[BugBase.BUG_TYPE_SPIDER] = 0.1

GameView.ZORDER_BUG = 100
GameView.ZORDER_DEAD_BUG = 50

GameView.events = {
PLAYER_DEAD_EVENT = "PLAYER_DEAD_EVENT",
}

function GameView:start()
self:scheduleUpdate(handler(self, self.step))
return self
end

function GameView:stop()
self:unscheduleUpdate()
return self
end

function GameView:step(dt)
if self.lives_ <= 0 then return end

self.addBugInterval_ = self.addBugInterval_ - dt
if self.addBugInterval_ <= 0 then
self.addBugInterval_ = math.random(GameView.ADD_BUG_INTERVAL_MIN, GameView.ADD_BUG_INTERVAL_MAX)
self:addBug()
end

    for _, bug in pairs(self.bugs_) do
bug:step(dt)
if bug:getModel():getDist() <= 0 then
self:bugEnterHole(bug)
end
    end

    return self
end

function GameView:getLives()
return self.lives_
end

function GameView:getKills()
return self.kills_
end

function GameView:addBug()
local bugType = BugBase.BUG_TYPE_ANT
if math.random(1, 2) % 2 == 0 then
bugType = BugBase.BUG_TYPE_SPIDER
end

    local bugModel
if bugType == BugBase.BUG_TYPE_ANT then
bugModel = BugAnt:create()
else
bugModel = BugSpider:create()
end

    local bug = BugSprite:create(GameView.IMAGE_FILENAMES[bugType], bugModel)
        :start(GameView.HOLE_POSITION)
        :addTo(self.bugsNode_, GameView.ZORDER_BUG)

self.bugs_[bug] = bug
return self
end

function GameView:bugEnterHole(bug)
self.bugs_[bug] = nil

bug:fadeOut({time = 0.5, removeSelf = true})
        :scaleTo({time = 0.5, scale = 0.3})
        :rotateTo({time = 0.5, rotation = math.random(360, 720)})

self.lives_ = self.lives_ - 1
self.livesLabel_:setString(self.lives_)
audio.playSound("BugEnterHole.wav")

if self.lives_ <= 0 then
self:dispatchEvent({name = GameView.events.PLAYER_DEAD_EVENT})
end

    return self
end

function GameView:bugDead(bug)
local imageFilename = GameView.IMAGE_FILENAMES[bug:getModel():getType()]
DeadBugSprite:create(imageFilename)
        :fadeOut({time = 2.0, delay = 0.5, removeSelf = true})
        :move(bug:getPosition())
        :rotate(bug:getRotation() + 120)
        :addTo(self.bugsNode_, GameView.ZORDER_DEAD_BUG)

self.bugs_[bug] = nil
bug:removeSelf()

self.kills_ = self.kills_ + 1
audio.playSound("BugDead.wav")

return self
end

function GameView:onCreate()
self.lives_ = GameView.INIT_LIVES
self.kills_ = 0
self.bugs_ = {}
self.addBugInterval_ = 0

-- add touch layer
display.newLayer()
        :onTouch(handler(self, self.onTouch))
        :addTo(self)

-- add background image
display.newSprite("PlaySceneBg.jpg")
        :move(display.center)
        :addTo(self)

-- add bugs node
self.bugsNode_ = display.newNode():addTo(self)

-- add lives icon and label
display.newSprite("Star.png")
        :move(display.left + 50, display.top - 50)
        :addTo(self)
self.livesLabel_ = cc.Label:createWithSystemFont(self.lives_, "Arial", 32)
        :move(display.left + 90, display.top - 50)
        :addTo(self)

-- create animation for bugs
for bugType, filename in pairs(GameView.IMAGE_FILENAMES) do
-- load image
local texture = display.loadImage(filename)
local frameWidth = texture:getPixelsWide() / 3
local frameHeight = texture:getPixelsHigh()

-- create sprite frame based on image
local frames = {}
for i = 0, 1 do
            local frame = display.newSpriteFrame(texture, cc.rect(frameWidth * i, 0, frameWidth, frameHeight))
frames[#frames + 1] = frame
end

-- create animation
local animation = display.newAnimation(frames, GameView.BUG_ANIMATION_TIMES[bugType])
-- caching animation
display.setAnimationCache(filename, animation)
end

-- bind the "event" component
cc.bind(self, "event")
end

function GameView:onTouch(event)
if event.name ~= "began" then return end
    local x, y = event.x, event.y
for _, bug in pairs(self.bugs_) do
        if bug:getModel():checkTouch(x, y) then
self:bugDead(bug)
end
    end
end

function GameView:onCleanup()
self:removeAllEventListeners()
end

return GameView
```

start调用scheduleUpdate开启一个定时器，绑定每帧刷新时的回调函数：step，回调函数的参数为逝去的时间，step每次随机一两秒的数字，然后每次减去帧的逝去时间，当为0时调用addBug添加虫子，其实意义就是每隔一两秒添加一个虫子。并判断所有虫子的坐标是否在中心洞中，如果是调用bugEnterHole，该函数播放虫子进洞效果动画和音效，减少血量值，当血量小于等于0时分发游戏结束事件。

关于虫子的操作稍后再看，继续看GameView，onCreate中初始化血量，杀死虫子数等数据，setAnimationCache初始化虫子的播放动画。创建点击回调onTouch，当点击的坐标命中到某虫子时表示杀死该虫子。

添加虫子：

```lua
function GameView:addBug()
local bugType = BugBase.BUG_TYPE_ANT
if math.random(1, 2) % 2 == 0 then
bugType = BugBase.BUG_TYPE_SPIDER
end

    local bugModel
if bugType == BugBase.BUG_TYPE_ANT then
bugModel = BugAnt:create()
else
bugModel = BugSpider:create()
end

    local bug = BugSprite:create(GameView.IMAGE_FILENAMES[bugType], bugModel)
        :start(GameView.HOLE_POSITION)
        :addTo(self.bugsNode_, GameView.ZORDER_BUG)

self.bugs_[bug] = bug
return self
end
```

蚂蚁和蜘蛛均派生自BugBase，随机产生蚂蚁和蜘蛛，创建虫子对象后再创建虫子精灵调用start开始移动虫子并播放虫子移动时候的动画，下一节主要讲解虫子对象和虫子精灵。



# 精灵

我们作个比方，场景好比舞台的一幕，models下的类相当于剧本中的角色（注意只是剧本中的），是死的，并没有被演活，那么精灵就好比一个个地演员，把角色演活。

因此虫子类仅仅是类，虫子精灵负责按照虫子类描述的特性执行其动作。

但是这个demo项目在这方面处理得相当蹩脚，且容我整理后再梳理清楚。这一节主要是优化GameView和虫子类以及虫子精灵的分工。

逻辑层应当只负责宏观的逻辑执行，它最好不要去涉及到具体某些类或对象的初始化逻辑，特别是“角色”众多时应该用类来统一管理，然后派生类各自实现自己不同的地方，逻辑层只负责调用它们的公共接口或函数即可。 遵循这个原则，最后把虫子基类、蚂蚁类、蜘蛛类优化为如下（原始代码不再作分析，因为太混乱，难以梳理）：

虫子基类：

```lua
local BugBase = class("BugBase")

function BugBase:ctor()
self.name = nil
self.imageFileName = nil
self.position_ = cc.p(0, 0)
self.rotation_ = 0
self.dist_ = 0
self.destination_ = cc.p(0, 0)
self.speed_ = 1
self.touchRange_ = 0
self.animationTimes_ = nil
end

function BugBase:getName()
if self.name==nil then
printError('uninit name')
end
    return self.name
end

function BugBase:getImageFileName()
if self.imageFileName==nil then
printError('uninit imageFileName')
end
    return self.imageFileName
end

function BugBase:getPosition()
return self.position_
end

function BugBase:getRotation()
return self.rotation_
end

function BugBase:getDist()
return self.dist_
end

function BugBase:getAnimationTimes()
if self.animationTimes_==nil then
printError('uninit animationTimes_')
end
    return self.animationTimes_
end

function BugBase:setDestination(destination)
self.destination_ = clone(destination)
self.dist_ = math.random(display.width / 2 + 100, display.width / 2 + 200)

local rotation = math.random(0, 360)
self.position_ = self:calcPosition(rotation, self.dist_, destination)
self.rotation_ = rotation - 180
return self
end

local fixedDeltaTime = 1.0 / 60.0
function BugBase:step(dt)
self.dist_ = self.dist_ - self.speed_ * (dt / fixedDeltaTime)
self.position_ = self:calcPosition(self.rotation_ + 180, self.dist_, self.destination_)
return self
end

function BugBase:calcPosition(rotation, dist, destination)
local radians = rotation * math.pi / 180
return cc.p(destination.x + math.cos(radians) * dist,
                destination.y - math.sin(radians) * dist)
end

function BugBase:checkTouch(x, y)
local dx, dy = x - self.position_.x, y - self.position_.y
local offset = math.sqrt(dx * dx + dy * dy)
return offset <= self.touchRange_
end

return BugBase
```



优化之处：

去掉了虫子类型，有了派生类干嘛还用枚举来区分不同的类？神经病一样，典型的C语言思想，没有把类好好利用好。

增加了私有变量：name（虽然源码里面没有使用，但是看起来会舒服清晰很多），imageFileName（用于指示该类的图片资源），animationTimes_（动画延迟时间），并分别为它们设定了对应的get函数。

蚂蚁类：

```lua
local BugBase = import(".BugBase")

local BugAnt = class("BugAnt", BugBase)

function BugAnt:ctor()
BugAnt.super.ctor(self)
self.name = 'BugAnt'
self.imageFileName = 'BugAnt.png'
self.speed_ = 1.0
self.touchRange_ = 70
self.animationTimes_ = 0.15
end

return BugAnt
```

蜘蛛类：

```lua
local BugBase = import(".BugBase")

local BugSpider = class("BugSpider", BugBase)

function BugSpider:ctor()
BugSpider.super.ctor(self)
self.name = 'BugSpider'
self.imageFileName = 'BugSpider.png'
self.speed_ = 1.5
self.touchRange_ = 50
self.animationTimes_ = 0.1
end

return BugSpider
```

派生类各自在自己的构造函数中初始化自己的数据，什么？担心会忘记设置？因此在基类的构造函数中把这几个私有变量初始化为nil，并在对应的get函数中进行判断，如果没有被初始化过则输出错误信息，基类的作用就是为派生类制造规范的行为准则，一切就这么简单方便！



接下来是虫子精灵和虫子死亡精灵：

```lua
虫子精灵：
local BugSprite = class("BugSprite", function(bugObj)
local imageFileName = bugObj:getImageFileName()
local texture = display.getImage(imageFileName)
if texture==nil then
texture = display.loadImage(imageFileName)
end
    local frameWidth = texture:getPixelsWide() / 3
local frameHeight = texture:getPixelsHigh()

local spriteFrame = display.newSpriteFrame(texture, cc.rect(0, 0, frameWidth, frameHeight))
local sprite = display.newSprite(spriteFrame)
sprite.animationName_ = imageFileName
    sprite.frameWidth_ = frameWidth
    sprite.frameHeight_ = frameHeight

--判断动画是否已经缓存，如果没有则创建
if display.getAnimationCache(sprite.animationName_)==nil then
-- create sprite frame based on image
local frames = {}
for i = 0, 1 do
            local frame = display.newSpriteFrame(texture, cc.rect(frameWidth * i, 0, frameWidth, frameHeight))
frames[#frames + 1] = frame
end

-- create animation
local animation = display.newAnimation(frames, bugObj:getAnimationTimes())
-- caching animation
display.setAnimationCache(sprite.animationName_, animation)
end

    return sprite
end)

function BugSprite:ctor(bugObj)
self.model_ = bugObj
end

function BugSprite:getModel()
return self.model_
end

function BugSprite:start(destination)
self.model_:setDestination(destination)
self:updatePosition()
self:playAnimationForever(display.getAnimationCache(self.animationName_))
return self
end

function BugSprite:step(dt)
self.model_:step(dt)
self:updatePosition()
return self
end

function BugSprite:updatePosition()
self:move(self.model_:getPosition())
        :rotate(self.model_:getRotation())
end

return BugSprite
```

虫子死亡精灵：

```lua
local DeadBugSprite = class("DeadBugSprite", function(bugObj)
local texture = display.getImage(bugObj:getImageFileName())
local frameWidth = texture:getPixelsWide() / 3
local frameHeight = texture:getPixelsHigh()
local spriteFrame = display.newSpriteFrame(texture, cc.rect(frameWidth * 2, 0, frameWidth, frameHeight))
return display.newSprite(spriteFrame)
end)

return DeadBugSprite
```

这里一并分析说明，原始的逻辑是GameView里面告诉虫子精灵和死亡虫子精灵初始化的资源文件在哪里并如何初始化，神经病一样！正确的做法是：演员自己去看剧本，自行初始化自己的资源，因此这里优化后的虫子精灵只需通过虫子基类的get函数来获取对应的资源进行初始化即可。

这里需要注意的是：

```lua
local imageFileName = bugObj:getImageFileName()
local texture = display.getImage(imageFileName)
if texture==nil then
texture = display.loadImage(imageFileName)
end
```

一开始是getImage是为nil的，只需要调用loadImage加载一次即可，后面的精灵对象便可以使用getImage获取了。死亡虫子精灵获取资源时也应该这样，但是由于死亡虫子精灵和虫子精灵使用的资源是同一个图片，因此前面加载过了这里就可以直接使用了，这里对资源的操作暂时不做修改了。



死亡虫子精灵和虫子精灵的类初始化函数（暂时这么叫吧，以便于区分后面的构造函数）由原来的接受资源文件名改为直接接受虫子对象，然后通过get函数来获取它们具体的资源文件名，这样清晰多了。那么GameView的初始化就变得相当简单了，我们看看原来GameView是如何添加虫子和虫子精灵的：

```lua
function GameView:addBug()
local bugType = BugBase.BUG_TYPE_ANT
if math.random(1, 2) % 2 == 0 then
bugType = BugBase.BUG_TYPE_SPIDER
end

    local bugModel
if bugType == BugBase.BUG_TYPE_ANT then
bugModel = BugAnt:create()
else
bugModel = BugSpider:create()
end

    local bug = BugSprite:create(GameView.IMAGE_FILENAMES[bugType], bugModel)
    :start(GameView.HOLE_POSITION)
    :addTo(self.bugsNode_, GameView.ZORDER_BUG)

self.bugs_[bug] = bug
return self
end
```



再看看优化后的：

```lua
function GameView:addBug()
local bugClass = {BugAnt, BugSpider}
local index = math.random(1, #bugClass)
local bugObj = bugClass[index]:create()

local bug = BugSprite:create(bugObj)
        :start(GameView.HOLE_POSITION)
        :addTo(self.bugsNode_, GameView.ZORDER_BUG)

self.bugs_[bug] = bug
return self
end
```

打个比方，好比现在这一幕剧情需要一群群众演员，导演的要求是这些群众演员随机出现即可，只需要演员各自扮演好即可。这里，有多少虫子类就添加多少个，这里就是蚂蚁和蜘蛛，把它们放在一个数组里，然后随机选取一个让虫子精灵表演，虫子精灵由于已经被我们优化为了只接受一个虫子对象，它内部会调用虫子的get函数获取资源信息进行初始化，也就是演员各自表演好自己的角色。 优化去掉了GameView的onCreate函数中对资源的初始化过程：

```lua
-- create animation for bugs
for bugType, filename in pairs(GameView.IMAGE_FILENAMES) do
-- load image
local texture = display.loadImage(filename)
local frameWidth = texture:getPixelsWide() / 3
local frameHeight = texture:getPixelsHigh()

-- create sprite frame based on image
local frames = {}
for i = 0, 1 do
        local frame = display.newSpriteFrame(texture, cc.rect(frameWidth * i, 0, frameWidth, frameHeight))
frames[#frames + 1] = frame
end

-- create animation
local animation = display.newAnimation(frames, GameView.BUG_ANIMATION_TIMES[bugType])
-- caching animation
display.setAnimationCache(filename, animation)
end
```



上面一段代码直接删除，还可以删除的部分：

```lua
local BugBase   = import("..models.BugBase")

GameView.IMAGE_FILENAMES = {}
GameView.IMAGE_FILENAMES[BugBase.BUG_TYPE_ANT] = "BugAnt.png"
GameView.IMAGE_FILENAMES[BugBase.BUG_TYPE_SPIDER] = "BugSpider.png"

GameView.BUG_ANIMATION_TIMES = {}
GameView.BUG_ANIMATION_TIMES[BugBase.BUG_TYPE_ANT] = 0.15
GameView.BUG_ANIMATION_TIMES[BugBase.BUG_TYPE_SPIDER] = 0.1
```

经过以上梳理，现在的逻辑和流程清晰多了。