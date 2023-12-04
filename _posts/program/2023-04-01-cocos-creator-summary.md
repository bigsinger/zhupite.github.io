---
layout:		post
category:	"program"
title:		"Cocos Creator使用汇总备查"

tags:		[c++]
---
- Content
{:toc}
- 下载：[Cocos Creator - 高效轻量的跨平台3D/2D图形引擎](https://www.cocos.com/creator)
- 文档：[Cocos Creator 用户手册](https://docs.cocos.com/creator/manual/zh/)
- 视频：[Cocos Creator 官方 YouTube 频道](https://www.youtube.com/c/CocosCreator/videos)
- 资源：[awesome-CocosCreator: Cocos Creator 游戏资源合集](https://github.com/Leo501/awesome-CocosCreator)



# Cocos Creator编辑器相关

- 资源文件的存放结构：
  1. 原始素材存放在`assets\resources`目录下，可以分类存放；
  2. `typescript`脚本文件存放在`assets\ts`目录下；
  3. 编辑器中制作的资源存放`assets`目录下分类存储，例如`assets\prefab`下存放预制体文件，`assets\animation`下存放制作的动画文件；
- 右键选中空白区域可以拖动
- 创建精灵：
  1. 直接拖放图片进去即可
  2. 在层级管理器中右键创建2D-精灵，然后拖放图片到其右侧的属性中
- 为节点挂载脚本，在层级管理器中选中节点，然后拖放资源管理器中的脚本文件到节点右侧的属性面板里即可。
- 创建预制体：精灵修改好后再拖回到资源管理器中即可。后面使用直接拖放预制体到层级管理器。
- 创建点击缩放效果：添加组件 - `Button` - `Transition` - `Scale`，使用默认参数即可。
- 使用文本组件：添加空节点 - 添加`Label `
- 创建逐帧动画：创建精灵 - 添加组件Animation - 进入动画编辑器 - 添加一个`SpriteFrame`轨道 - 拖放图片序列。
  1. 在层级管理器中创建一个新的 Sprite 节点或选择已有的 Sprite 节点。这将作为动画的基本显示对象。
  2. 在右侧的属性检查器中，点击 "Add Component" 按钮，然后搜索 "Animation" 并添加 Animation 组件到选中的节点。
  3. 选中带有 Animation 组件的节点，然后在属性检查器中找到 Animation 组件。
  4. 点击 Animation 组件中的 "Create a new animation clip" 按钮，为动画片段指定一个名字并保存。新创建的动画片段将自动添加到 Animation 组件的 Clips 列表中。
  5. 打开动画编辑器：点击 Creator 编辑器顶部的 "Animation" 按钮，或者按快捷键 Ctrl/Cmd + 6。
  6. 在动画编辑器的左侧，确保当前选中的动画片段是您刚刚创建的片段。
  7. 在资源管理器中，选中您的图片序列资源，将它们拖放到动画编辑器的轨道区域。Creator 将自动为这些图片创建一个新的 SpriteFrame 轨道，以及对应的关键帧。
  8. 您可以通过调整关键帧之间的时间间隔来改变动画播放的速度。点击并拖动关键帧，将其移动到所需的时间位置。
  9. 如果需要，您可以在动画编辑器中预览动画。点击编辑器底部的播放按钮或按空格键来播放/暂停动画。
  10. 保存您的动画片段。点击动画编辑器右上角的 "Save" 按钮，或按 Ctrl/Cmd + S。
- `Tiledmap`（瓦块地图）：



# API

## 场景

[加载和切换场景](https://docs.cocos.com/creator/manual/zh/scripting/scene-managing.html)

- 加载和切换场景：`director.loadScene`
- 预加载：`director.preloadScene



## 音效

[AudioSource 组件参考](https://docs.cocos.com/creator/manual/zh/audio-system/audiosource.html)

- 播放长音乐：play
- 播放短音效：playOneShot



## 动作

- [缓动系统](https://docs.cocos.com/creator/manual/zh/tween/)
- [Cocos Creator动作系统和缓动系统总结详解](https://zhuanlan.zhihu.com/p/667936820)

# 碎图/图集

- [Cocos Creator 图集 (TexturePacker、自动图集功能 、压缩纹理、压缩插件)](https://www.jianshu.com/p/f8f1e830d112)
- [How to create and use sprite sheets with CocosCreator 3.x](https://www.codeandweb.com/texturepacker/tutorials/how-to-create-and-usesprite-sheets-with-cocoscreator)
- 



# 三方工具

- 瓦片地图编辑：Tiled Map Editor
- 合图工具：[TexturePacker](https://www.codeandweb.com/texturepacker)
- 碎图工具：[TextureUnpacker](https://www.onlinedown.net/soft/1114992.htm)