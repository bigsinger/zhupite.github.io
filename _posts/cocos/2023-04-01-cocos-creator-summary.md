﻿---
layout:		post
category:	"cocos"
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
- 预加载：`director.preloadScene`



## 音效

[AudioSource 组件参考](https://docs.cocos.com/creator/manual/zh/audio-system/audiosource.html)

- 播放长音乐：play
- 播放短音效：playOneShot

```js
// 播放音效, filename: 文件名，例如：click（相对于resources/audio的路径）
playSound(filename) {
    resources.load("audio/" + filename, AudioClip, (err, audio) => {
        this.backgroud.playOneShot(audio);
    })
}

// 加载音效：烟花
resources.load('audio/fireworks', AudioClip, (err, audio) => { if (err) { console.log("load audio error"); error(err.message || err); return; } this.clipFireworks = audio; })

// 加载背景音乐
resources.load('audio/bg', AudioClip, (err, audio) => {
    this.backgroud.clip = audio;
    this.backgroud.loop = true;
    this.backgroud.play();
})
```



封装 `AudioHelper` 脚本，添加到场景的任意一个节点上（可以是根节点），然后为该节点添加组件：`AudioSource` ，然后把音频资源拖放到该组件的`Clip`上（可以勾选`Loop`进行循环播放），再把该`AudioSource` 组件拖放到`AudioHelper`的`Backgroud`属性上。

```ts
// AudioHelper.ts

import { AudioClip, AudioSource, Component, _decorator, resources, error, assetManager } from 'cc';
import { common } from './Common';
const { ccclass, property } = _decorator;


@ccclass
export class AudioHelper extends Component {
    // 背景音乐
    @property(AudioSource)
    public backgroud: AudioSource = null!;

    protected onLoad(): void {
        common.audioHelper = this;
    }

    // 初始化音频源
    public InitAudioSource(audioPath: string, onComplete?: ((err: Error | null, audioSource: AudioSource) => void) | null) {
        if (this.backgroud == null || this.backgroud.clip == null) {
            // 如果不通过UI绑定的方式，通过代码异步初始化
            if (audioPath) {
                resources.load(audioPath, AudioClip, (err, audio) => {
                    if (err) {
                        console.log("load audio error"); error(err.message || err);
                    }else {
                        this.backgroud = new AudioSource();
                        this.backgroud.clip = audio;
                        this.backgroud.loop = true;
                        this.backgroud.playOnAwake = true; // 如果需要在加载时自动播放
                    }
                    onComplete && onComplete(err, this.backgroud);
                });
            }
        }
    }

    // 播放音效, filename: 文件名，例如：click（相对于resources的路径）
    playSound(filename) {
        if (this.backgroud) {
            resources.load(filename, AudioClip, (err, audio) => {
                if (err) { console.log("load audio error"); error(err.message || err); return; }
                this.backgroud.playOneShot(audio);
            })
        }
    }

    // 播放音乐
    playBGM() {
        this.backgroud.play();
    }

    // 暂停音乐
    pauseBGM() {
        this.backgroud.pause();
    }

    // 停止音乐
    stopBGM() {
        this.backgroud.stop();
    }
}
```

简化使用的代码（无须在编辑器中操作）：

```ts
override start() {
    // 初始化背景音乐
    if (common.AudioHelper == null) { common.audioHelper = new AudioHelper(); }
    common.audioHelper.InitAudioSource('Common/audios/bgm', (err, audioSource) => {
        // 播放开场白
        if (!err && audioSource) { 
            common.audioHelper.playSound('Common/audios/xxx');
        }
    });
}
```



## 动画

```js
const node:Node = find('Canvas/nodeName');
const ani = node.getComponent(Animation);
ani.play();
```



切换龙骨动画：

```ts
import { dragonBones } from 'cc';

// 切换骨骼动画
ChangeDragonBonesAnim(name: string, animationName: string) {
    let node = find(name);
    if (!node) { console.error('not found: ' + name); return; }

    let dragonDisplay = node.getComponent(dragonBones.ArmatureDisplay);
    if (dragonDisplay) {
        dragonDisplay.playAnimation(animationName, 0);
    }
}
```



## 动作

- [缓动系统](https://docs.cocos.com/creator/manual/zh/tween/)
- [Cocos Creator动作系统和缓动系统总结详解](https://zhuanlan.zhihu.com/p/667936820)

```ts
tween(this.node).delay(3).hide().start();		// 3s 后隐藏


_tweenSpeakUI: any = null;
this._tweenSpeakUI?.stop();
this.node.active = true;
this._tweenSpeakUI = tween(this.node).delay(3).call(() => {
    this.node.active = false;
}).start();
```



```ts
// 说话：显示对话框，3秒后消失。如果对话框消失前再次调用，则重新计时。
_tweenSpeakUI: any = null;
SpeakText(text: string, times: number = 3) {
    if (this.speakLabel && text) {
        this._tweenSpeakUI?.stop();
        this.speakLabel.string = text;
        this.speakLabel.node.parent.active = true;
        this._tweenSpeakUI = tween(this.speakLabel.node.parent).delay(times).call(() => {
            this.speakLabel.node.parent.active = false;
        }).start();
    }
}
```



## 坐标

参考官网文档：[坐标系和变换 · Cocos Creator](https://docs.cocos.com/creator/3.2/manual/zh/content-workflow/transform.html)

**坐标系**：

- **屏幕坐标系**：顾名思义，就是看着显示器，按照人眼的阅读习惯的顺序，从左到右从上到下。所有原生编程的坐标都是用这个，例如Android、iOS、Windows的原生代码的开发，均使用该坐标系。
- **笛卡尔坐标系**：就是我们上学的时候，学习数学用的坐标系，左下角为原点，向右X变大，向上Y变大。又称为：左手坐标系、`OpenGL`坐标系。`Cocos`系列均使用该坐标系，一般默认就是指该坐标系。



**世界坐标：**

- **世界坐标**：又叫全局坐标，它不是坐标系，是一个绝对概念，即该坐标是全局范围的一个**绝对坐标**值。是游戏世界里的绝对坐标。可以简单理解为：**游戏世界坐标**。
- **本地坐标**：是一个**相对坐标**，是相当于其父节点的坐标。是游戏世界里的相对坐标。



- **屏幕坐标：** 它是考虑到屏幕分辨率的坐标，可以简单理解为：**屏幕分辨率坐标**（注意，仍然是笛卡尔坐标系，而非屏幕坐标系）。其实处理这个屏幕坐标意义不大，因为都是在游戏世界，建议直接从游戏世界里的坐标进行操作处理。这个非常容易误解。



在`Cocos Creator`的鼠标事件中：

- `touchEvent.getUILocation()` 获取的是笛卡尔坐标系下的世界坐标（全局坐标）。
- `touchEvent.getLocation()`  获取的是鼠标的屏幕坐标（并不是屏幕坐标系，仍然是笛卡尔坐标系），是结合了屏幕分辨率后的坐标，可以简单理解为：屏幕分辨率坐标（笛卡尔坐标系）。该坐标可以使用函数 `screenToWorld `转换为游戏世界坐标。



cocos提供了API在世界坐标和本地坐标之间相互转换：

```typescript
let location = touchEvent.getUILocation();  		// 获取世界坐标，注意不要用getLocation
let position = new Vec3(location.x, location.y);
let point = node.getComponent(UITransform).convertToNodeSpaceAR(position); // 转换为相对节点的本地坐标
```



## 本地存储

```js
this.soundEffectSwitch = sys.localStorage.getItem("soundEffectSwitch") == "1" ? 1 : 0;
sys.localStorage.setItem("soundEffectSwitch", this.soundEffectSwitch.toString());
```

## JSON

[JSON 资源 - Cocos Creator 3.8 手册](https://docs.cocos.com/creator/manual/zh/asset/json.html)

```ts
resources.load('gameGiftJson', (err: any, res: JsonAsset) => {
    if (err) { error(err.message || err); return; }
    const jsonData: object = res.json!;     // 获取到 Json 数据
})


resources.load('Level1/things', (err: any, res: JsonAsset) => {
    if (err) { error(err.message || err); return; }
    const items: object[] = res.json! as object[];   // 获取到 Json 数据
    if (!items) { return; }

    items.forEach(item => {
        let oldName = item["old"];
        let newName = item["new"];
        let audio = item["audio"];
        let text = Common.FindSubStr(audio, '_', '_') || audio;

        this.thingsList.push({
            oldThingsName: oldName, 
            newThingsName: newName, 
            audioPath: audio, 
            speakText : text,
            oldThingsNode : find('bgs/scrollview/' + oldName),
            newThingsNode :find('bgs/scrollview/' + newName),
        });
    });
    //console.log(this.thingsList.length, this.thingsList);
})
```



# 碎图/图集

- [Cocos Creator 图集 (TexturePacker、自动图集功能 、压缩纹理、压缩插件)](https://www.jianshu.com/p/f8f1e830d112)
- [How to create and use sprite sheets with CocosCreator 3.x](https://www.codeandweb.com/texturepacker/tutorials/how-to-create-and-usesprite-sheets-with-cocoscreator)
- 



# 三方工具

- 瓦片地图编辑：Tiled Map Editor
- 合图工具：[TexturePacker](https://www.codeandweb.com/texturepacker)
- 碎图工具：[TextureUnpacker](https://www.onlinedown.net/soft/1114992.htm)



# 常见问题

- [警告: WebGL 1.0 平台不支持非 2 次贴图的 Repeat 过滤模式，运行时会自动改为 Clamp 模式，这会使材质的 tilingOfiset 等属性完全失效](https://forum.cocos.org/t/topic/144127/2)，解决：在「属性检查器」中修改「类型」为`sprite-frame` ，然后保存即可。
- 