﻿---
layout:        post
category:    "cocos"
title:        "Cocos Creator使用汇总备查"

tags:        [c++]
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
- 右键选中空白区域可以拖动。
- 创建精灵：
  1. 直接拖放图片进去即可。
  2. 在层级管理器中右键`创建2D-精灵`，然后拖放图片到其右侧的属性中。
- 为节点挂载脚本，在层级管理器中选中节点，然后拖放资源管理器中的脚本文件到节点的属性面板里即可。
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
- 创建龙骨动画：为节点添加组件：`dragonbones.ArmatureDisplay`，拖放龙骨动画的`dbbin`文件到`Dragon Asset`，拖放龙骨动画的json文件到 `Dragon Atlas Asset` 。 选择`Armature` 和 `Animation` 。
- `Tiledmap`（瓦块地图）：

# API

## 场景

[加载和切换场景](https://docs.cocos.com/creator/manual/zh/scripting/scene-managing.html)

- 加载和切换场景：`director.loadScene`
- 预加载：`director.preloadScene`

## 生命周期

[生命周期回调 Cocos Creator 手册](https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html)

- `onLoad` 回调会在节点首次激活时触发，onLoad 总是会在任何 start 方法调用前执行，这能用于安排脚本的初始化顺序。通常我们会在 `onLoad` 阶段去做一些初始化相关的操作。
- `start` 回调函数会在组件第一次激活前，也就是第一次执行 `update` 之前触发。
- `onDestroy`。当组件或者所在节点调用了 `destroy()`，则会调用 `onDestroy` 回调，并在当帧结束时统一回收组件。

## 节点

[Cocos Creator 3.8 手册 - 渲染排序规则](https://docs.cocos.com/creator/manual/zh/ui-system/components/engine/priority.html) 可以通过设置节点的 `siblingIndex` 来改变节点在父节点下的顺序，从而改变渲染顺序。

## 音效

[AudioSource 组件参考](https://docs.cocos.com/creator/manual/zh/audio-system/audiosource.html)

播放长音乐：play

播放短音效：playOneShot

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
    if (common.audioHelper == null) { common.audioHelper = new AudioHelper(); }
    common.audioHelper.InitAudioSource('Common/audios/bgm', (err, audioSource) => {
        // 播放开场白
        if (!err && audioSource) { 
            common.audioHelper.playSound('Common/audios/xxx');
        }
    });
}
```

另外贴一个简单版的音效和背景音乐播放类，需要在编辑器中做资源绑定。

```ts
import { AudioClip, AudioSource, Component, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AudioPlayer")
export class AudioPlayer extends Component {
    @property(AudioSource) private soundSource: AudioSource;
    @property(AudioSource) private musicSource: AudioSource;

    public init(soundVolume: number, musicVolume: number): void {
        this.setSoundVolume(soundVolume);
        this.setMusicVolume(musicVolume);
    }

    public get SoundVolume(): number {
        return this.soundSource.volume;
    }

    public get MusicVolume(): number {
        return this.musicSource.volume;
    }

    public setSoundVolume(volume: number): void {
        this.soundSource.volume = volume;
    }

    public setMusicVolume(volume: number): void {
        this.musicSource.volume = volume;
    }

    public playSound(clip: AudioClip): void {
        this.soundSource.playOneShot(clip);
    }

    public playMusic(clip: AudioClip): void {
        this.musicSource.stop();
        this.musicSource.clip = clip;
        this.musicSource.play();
    }
}
```

在具体的业务逻辑处理中，可以增加一个适配器`GameAudioAdapter`，用来管理音效资源。

```ts
import { _decorator, Component, Node, AudioClip } from "cc";
import { AppRoot } from "../../AppRoot/AppRoot";
import { AudioPlayer } from "../../Services/AudioPlayer/AudioPlayer";
const { ccclass, property } = _decorator;

@ccclass("GameAudioAdapter")
export class GameAudioAdapter extends Component {
    @property(AudioClip) private music: AudioClip;
    @property(AudioClip) private enemyHit: AudioClip;
    @property(AudioClip) private playerHit: AudioClip;
    @property(AudioClip) private playerDeath: AudioClip;
    @property(AudioClip) private weaponSwing: AudioClip;
    @property(AudioClip) private xpPickup: AudioClip;
    @property(AudioClip) private goldPickup: AudioClip;
    @property(AudioClip) private healthPotionPickup: AudioClip;
    @property(AudioClip) private magnetPickup: AudioClip;
    @property(AudioClip) private chestPickup: AudioClip;
    @property(AudioClip) private levelUp: AudioClip;
    @property(AudioClip) private horizontalProjectileLaunch: AudioClip;
    @property(AudioClip) private diagonalProjectileLaunch: AudioClip;
    @property(AudioClip) private haloProjectileLaunch: AudioClip;

    private audioPlayer: AudioPlayer;
    private player: Player;

    public init(
        player: Player,
        enemyManager: EnemyManager,
        itemManager: ItemManager,
        horizontalLauncher: WaveProjectileLauncher,
        diagonalLauncher: WaveProjectileLauncher,
        haloLauncher: HaloProjectileLauncher
    ): void {
        AppRoot.Instance.AudioPlayer.playMusic(this.music);

        this.audioPlayer = AppRoot.Instance.AudioPlayer;
        this.player = player;

        player.Weapon.WeaponStrikeEvent.on(() => this.audioPlayer.playSound(this.weaponSwing), this);
        player.Level.LevelUpEvent.on(() => this.audioPlayer.playSound(this.levelUp), this);
        player.Health.HealthPointsChangeEvent.on(this.tryPlayPlayerHitSound, this);

        enemyManager.EnemyAddedEvent.on(this.addEnemyListeners, this);
        enemyManager.EnemyRemovedEvent.on(this.removeEnemyListeners, this);

        itemManager.PickupEvent.on(this.playPickupItemSound, this);

        horizontalLauncher.ProjectileLaunchedEvent.on(() => this.audioPlayer.playSound(this.horizontalProjectileLaunch), this);
        diagonalLauncher.ProjectileLaunchedEvent.on(() => this.audioPlayer.playSound(this.diagonalProjectileLaunch), this);
        haloLauncher.ProjectilesLaunchedEvent.on(() => this.audioPlayer.playSound(this.haloProjectileLaunch), this);
    }

    private addEnemyListeners(enemy: Enemy): void {
        enemy.Health.HealthPointsChangeEvent.on(this.playEnemyHitSound, this);
    }

    private removeEnemyListeners(enemy: Enemy): void {
        enemy.Health.HealthPointsChangeEvent.off(this.playEnemyHitSound);
    }

    private tryPlayPlayerHitSound(healthChange: number): void {
        if (healthChange < 0) {
            this.audioPlayer.playSound(this.playerHit);
        }

        if (!this.player.Health.IsAlive) {
            this.audioPlayer.playSound(this.playerDeath);
        }
    }

    private playEnemyHitSound(): void {
        this.audioPlayer.playSound(this.enemyHit);
    }

    private playPickupItemSound(itemType: ItemType): void {
        let clipToPlay: AudioClip;
        switch (itemType) {
            case ItemType.XP:
                clipToPlay = this.xpPickup;
                break;
            case ItemType.Gold:
                clipToPlay = this.goldPickup;
                break;
            case ItemType.HealthPotion:
                clipToPlay = this.healthPotionPickup;
                break;
            case ItemType.Magnet:
                clipToPlay = this.magnetPickup;
                break;
            case ItemType.Chest:
                clipToPlay = this.chestPickup;
                break;
            default:
                break;
        }

        this.audioPlayer.playSound(clipToPlay);
    }
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

- [Cocos Creator 2.3 - ArmatureDisplay](https://docs.cocos.com/creator/2.3/api/zh/classes/ArmatureDisplay.html#dragonbones.eventobject.loopcomplete)
- [如果播放完一个动画回调一个函数，或者说怎么知道动画播放完了 - Creator 2.x - Cocos中文社区](https://forum.cocos.org/t/topic/47184/2)
- [基于 CocosCreator 3.4.0 版本创建的**龙骨动画指定帧播放**工程](https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.6.x-release/demo/Creator3.6.0_2D_DragonBonesSpecifiedFrame)
- [从服务器远程加载 DragonBones](https://docs.cocos.com/creator/2.4/manual/zh/getting-started/faq.html)

**Spine动画**

- [基于 CocosCreator 3.4.0 版本创建的**Spine动画指定帧播放**工程](https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.6.x-release/demo/Creator3.6.0_2D_SpineSpecifiedFrame)
- [从服务器远程加载 Spine](https://docs.cocos.com/creator/2.4/manual/zh/getting-started/faq.html)

## 动作

- [缓动系统](https://docs.cocos.com/creator/manual/zh/tween/)、[easing](https://docs.cocos.com/creator/api/zh/namespace/easing)
- [缓动函数速查表](https://github.com/ai/easings.net )（效果演示）： https://easings.net/
- 更多的内置 Easing 类型，详情可参考 API [TweenEasing](https://docs.cocos.com/creator/3.0/api/zh/modules/tween.html#tweeneasing)。
- [Cocos Creator 常用动画](https://juejin.cn/post/7203512643238772795)

```ts
var action = cc.fadeIn(1.0);//渐显
var action = cc.fadeOut(1.0);//渐隐效果
var action = cc.tintTo(2, 255, 0, 255);//修改颜色到指定值
var action = cc.fadeTo(1.0, 0);//修改透明度到指定值
```

```ts
tween(this.node).delay(3).hide().start();        // 3s 后隐藏


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

```ts
tween(btn.node).to(0.3, {scale: new Vec3(1, 1 , 1)}).start();
```

```ts
// 渐显效果的实现：在一秒内，透明度从0变为255
node.opacity = 0;
cc.tween(node)
  .to(1, {opacity: 255})
  .start();
```

Tween 提供了一个简单灵活的方法来创建 action。 相对于 Cocos 传统的 cc.Action，cc.Tween 在创建动画上要灵活非常多：

- 支持以链式结构的方式创建一个动画序列。
- 支持对任意对象的任意属性进行缓动，不再局限于节点上的属性，而 cc.Action 添加一个属性的支持时还需要添加一个新的 action 类型。
- 支持与 cc.Action 混用。
- 支持设置 easing 或者 progress 函数。

```ts
cc.tween(node)
  .to(1, {scale: 2, position: cc.v3(100, 100, 100)})
  .call(() => { console.log('This is a callback'); })
  .by(1, {scale: 3, position: cc.v3(200, 200, 200)}, {easing: 'sineOutIn'})
  .run(cc.find('Canvas/cocos'));
```

`cc.tween`是异步的，即执行动画的同时，也会接着执行下面的代码，当有些代码需要在动画执行完毕后再执行时，需要用上`.call()`。

```ts
private scaleBtn() {
    this.picNode.stopAllActions();
    this._resetPosition();
    cc.tween(this.picNode)
        .to(1, { scale: 2 })
        .to(1, { position: cc.v2(300, 0) })        // 
        .by(1, { position: cc.v2(0, 50) })        // by是相对
        .call(() => {
        this.picNode.scale = 0.5;
    })
        .start();
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
let location = touchEvent.getUILocation();          // 获取世界坐标，注意不要用getLocation
let position = new Vec3(location.x, location.y);
let point = node.getComponent(UITransform).convertToNodeSpaceAR(position); // 转换为相对节点的本地坐标
```

现在新版本可以直接使用节点的`worldPosition`属性来获取或设置世界坐标了，就不用转来转去啦，非常方便。

## 本地存储

```js
this.soundEffectSwitch = sys.localStorage.getItem("soundEffectSwitch") == "1" ? 1 : 0;
sys.localStorage.setItem("soundEffectSwitch", this.soundEffectSwitch.toString());
```

```ts
import { sys } from "cc";
import { UserData } from "../Game/Data/UserData";

export class SaveSystem {
    private userDataIdentifier = "user-dse";
    public save(userData: UserData): void {
        sys.localStorage.setItem(this.userDataIdentifier, JSON.stringify(userData));
    }

    public load(): UserData {
        const data: string = sys.localStorage.getItem(this.userDataIdentifier);

        if (!data) return new UserData();

        try {
            // TODO: the data can be corrupted if we introduce a new field in UserData
            return <UserData>JSON.parse(data);
        } catch (error) {
            return new UserData();
        }
    }
}
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

# 组件

## 布局

- Layout：[自动布局容器](https://docs.cocos.com/creator/manual/zh/ui-system/components/engine/auto-layout.html)
- [制作动态生成内容的列表](https://docs.cocos.com/creator/manual/zh/ui-system/components/engine/list-with-data.html)
- [基于CocosCreator的List（列表）组件。支持虚拟列表、循环列表、不定宽/高、选择模式、滑动模式等。](https://github.com/gh-kL/cocoscreator-list?tab=readme-ov-file)

## 自适应宽高的Label

参考：https://github.com/bigsinger/Farm/tree/master/AutoSizeLabel

```
nodeDialogA
    nodeDialog
        nodeLabel
```

- nodeDialogA（可以不用这个节点）
  - anchor：0,0 
- nodeDialog
  - anchor：0,1
  - 添加：sprite并设置背景图；
  - 添加：Layout type为HORIZONTAL ResizeMode为CONTAINER，设置下Padding
  - 添加：Layout type为VERTICAL ResizeMode为CONTAINER，设置下Padding
- nodeLabel
  - anchor：0.5,0.5
  - Label的Overflow为None

## ScrollView

- 可同时水平滚动和竖直滚动：同时勾选 Horizontal 和 Vertical 。

- 不需要滚动条：先在属性中删除：Horizontal Scroll Bar 和 Vertical Scroll Bar，再在编辑器中删除bar子节点。

- 去除滚动惯性、加速度：不勾选Inertia 。

- 去除反弹效果：不勾选 Elastic 。

- 子节点view 为显示区域，也为设计和显示区域（最早叫mask，现在叫view更妥一些）。content为内容区域，按照实际内容大小来设计，再怎么大都没关系。

- 设计技巧：scrollview和bgs大小保持一致。view为显示区域，尺寸大小设计为去掉top bottom后的中间部分。设置：Content 为一个真实内容的根节点，content按照实际内容大小来，再怎么大都没关系。考虑到topbar和bottombar的情况，可以如下设计：
  
  ```
  方案1：
  root
    |-Camera
    |-topbar
    |-bgs
    |-bottombar
  
  1、root作为根节点需要添加一个sprite用来铺设背景图，大小尺寸应该和手机分辨率保持一致，保证铺满。
  2、topbar作为顶部工具栏区域
  3、bgs作为scrollview的位置占位，这样就无须考虑上中下的渲染顺序及遮盖问题了，动态运行时只需要创建scrollview并添加到bgs的子节点即可。并设置：scrollview的大小 = scrollview的view的大小 = bgs的大小，这三个大小保持一致。
  4、bottombar作为底部工具栏区域
  ```
  
  方案2：
  root
    |-Camera
    |-topbar
    |-sv
  
        |-view
          |-content
  
    |-bottombar
  
  1、root作为根节点需要添加一个sprite用来铺设背景图，大小尺寸应该和手机分辨率保持一致，保证铺满。
  2、对sv组件删除sprite组件，保证透明效果。
  3、运行时获取root/sv/view/content节点，命名为scrollview，后面父节点名为scrollview的均在此下添加子节点。
  
  方案3（推荐）：
  scrollview
    |-Camera
    |-topbar
    |-view
  
       |-content
  
    |-bottombar
  
  scrollview直接作为根节点，不再删除sprite，为其设置背景图；

```
# 代码汇总

## 示例教程

- [Cocos Creator 3.8 手册 - 示例与教程](https://docs.cocos.com/creator/manual/zh/cases-and-tutorials/)
- [Cocos Creator Shader Effect 系列 - 4 - 老照片特效 - 简书](https://www.jianshu.com/p/711a54ff2fa0)
- [cocos creator游戏之弹窗动画的实现 - 简忆博客](https://www.tpxhm.com/fdetail/947.html)
- [Cocos Creator 资源合集](http://lixxix.com/posts/cocos_creator_remind/)
- [Shader Effect Demo（边学边写）](https://github.com/zhitaocai/CocosCreator-Shader-Effect-Demo)
- [DataBoard监控一切的数据看板 Creator 2.x - Cocos中文社区](https://forum.cocos.org/t/topic/148404)
- https://gitee.com/szrpf
- [一个CocosCreator实用组件EffectBar，炫酷的特效进度条区](https://forum.cocos.org/t/topic/148658)
- [基于 CocosCreator 3.4.0 版本创建的 **列表视图扩展** 工程](https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.6.x-release/demo/Creator3.6.0_2D_ListViewExtension)
- 粒子特效（非cocos项目，可以参考效果）：https://github.com/tsparticles/tsparticles，例如：[五彩纸屑confetti](https://particles.js.org/samples/index.html#Wobble)
- UI效果：https://cyberdex.github.io/pixi-game-ui/
- 小游戏合集：https://github.com/potato47/so-many-games



## 全局管理

可以使用一个`AppRoot.ts`作为全局管理器，把它绑定到根节点即可，后面统一使用该类来访问其他对象。

```ts
export class AppRoot extends Component {
  @property(AudioPlayer) private audio: AudioPlayer;
  @property(JsonAsset) private settingsAsset: JsonAsset;

  private static instance: AppRoot;

  // 外部调用该接口函数
  public static get Instance(): AppRoot {
      return this.instance;
  }

  // 初始化操作
     public onLoad()  {
      if (AppRoot.Instance == null) {
          AppRoot.instance = this;
          director.addPersistRootNode(this.node);
          this.init();
      } else {
          this.node.destroy();
      }
  }
}
```

## 资源加载

[入门一定要会的几种资源加载](https://forum.cocos.org/t/creator3d/98389)

## 精灵

[精灵帧资源（SpriteFrame）  Cocos Creator 3.8 手册](https://docs.cocos.com/creator/manual/zh/asset/sprite-frame.html)

[动态加载 resources  Cocos Creator 3.8 手册](https://docs.cocos.com/creator/manual/zh/asset/dynamic-load-resources.html)

```ts
var spriteFrame = common.cropAtlas.getSpriteFrame('abcxyz');

const url = this.gameLevels[idx].LevelIcon;
resources.load(url, ImageAsset, (err: any, imageAsset) => {
    const sprite = this.getComponent(Sprite);
    sprite.spriteFrame = SpriteFrame.createWithImage(imageAsset);
});
```

```tsx
// 加载 SpriteFrame，image 是 ImageAsset，spriteFrame 是 image/spriteFrame，texture 是 image/texture
resources.load("test_assets/image/spriteFrame", SpriteFrame, (err, spriteFrame) => {
    this.node.getComponent(Sprite).spriteFrame = spriteFrame;
});

// 加载 texture
resources.load("test_assets/image/texture", Texture2D, (err: any, texture: Texture2D) => {
    const spriteFrame = new SpriteFrame();
    spriteFrame.texture = texture;
    this.node.getComponent(Sprite).spriteFrame = spriteFrame;
});
```

```tsx
// 加载 SpriteAtlas（图集），并且获取其中的一个 SpriteFrame
// 注意 atlas 资源文件（plist）通常会和一个同名的图片文件（png）放在一个目录下, 所以需要在第二个参数指定资源类型
resources.load("test_assets/sheep", SpriteAtlas, (err, atlas) => {
    const frame = atlas.getSpriteFrame('sheep_down_0');
    sprite.spriteFrame = frame;
});
```

## 加载ZIP资源

[cocos creator 加载与读取zip包 - 知乎](https://zhuanlan.zhihu.com/p/392192673)

[1.JSZip入坑教程-新手指南 - Creator 2.x - Cocos中文社区](https://forum.cocos.org/t/1-jszip/93127?u=15732633043)

[【插件】Cocos Creator JSZip压缩](https://www.cnblogs.com/gamedaybyday/p/13567043.html)

[jszip GitHub](https://github.com/Stuk/jszip)

1. 从 https://stuk.github.io/jszip/ 下载`jszip`库（使用示例：[How to use JSZip](https://stuk.github.io/jszip/documentation/examples.html)），解压缩使用`dist` 目录下的：`jszip.js` 使用。
2. 在资源目录 `assets`下创建`libs`文件夹（与`resources`平级），将上述`js`文件复制到该文件夹下，然后设置属性，勾选：**导入为插件**。还要复制声明文件`jszip.d.ts` 到下面，猜测可能是`index.d.ts`改名的，主要用在vscode里编写代码的时候不会出现语法错误，方便有智能提示，也就是开发阶段使用的。不带不影响动态运行效果。
3. 资源文件压缩为`zip`格式，微信平台需要将文件后缀改为`bin`，才能以二进制模式读取文件。
4. 代码：

```tsx
import { _decorator, Component, assetManager, resources, BufferAsset, LabelComponent, Label, Texture2D, SpriteFrame, Sprite, ImageAsset } from 'cc';

// 新版不支持这种导入方式，如果有 jszip.d.ts 文件，则不需要显式导入。
import JSZip = require('./libs/jszip.min.js')

const { ccclass, property } = _decorator;


@ccclass('MainScene')
export class MainScene extends Component {

    @property(LabelComponent)
    jsonContentLbl: LabelComponent = null!;

    @property(Sprite)
    sp: Sprite = null!;

    start() {
        this.loadZip("data").then((file: ArrayBuffer) => {
            this.readZipFile(file);
        })
            .catch((err) => {
                console.log(err);
            });
    }

    private loadZip(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resources.load(url, BufferAsset, (err, asset) => {
                if (err) return reject(err);
                resolve(asset.buffer());
            })
        });
    }

    private async readZipFile(file: any) {
        //解析zip包
        const data = await JSZip.loadAsync(file);
        console.log(data);

        //解析json文件
        data.file("data/a.json").async("text").then((content: string) => {
            this.jsonContentLbl.string = content;
        })

        //解析图片文件
        data.file("data/Dungeon.png").async("base64").then((buf: string) => {
            let img = new Image();
            img.src = 'data:image/png;base64,' + buf;

            let texture = new Texture2D();

            img.onload = () => {
                texture.reset({
                    width: img.width,
                    height: img.height
                })
                texture.uploadData(img, 0, 0);
                texture.loaded = true;

                let spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                this.sp.spriteFrame = spriteFrame;
            }
        });
    }
}
```

参考Demo：

- [cocos creator 3.x 加载与读取zip文件](https://gitee.com/superfinger/cocoscrator-load-zip-demo)
- https://gitee.com/carlosyzy/creator3d_jszip

## 事件回调

参考：Cocos Creator事件回调

## 对话框

## 碰撞

## 延时

```ts
export async function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## 数学函数

```ts
// 数组打乱（洗牌）
export function shuffle<T>(array: T[]): T[] {
    const shuffledArray: T[] = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
}

// 此函数用于将输入的数字四舍五入到小数点后一位。
export function roundToOneDecimal(num: number): number {
    return Math.round(num * 10) / 10;
}

// 此函数用于生成一个随机的正数或负数，结果只有1或-1两种可能。
export function randomPositiveOrNegative(): number {
    return Math.random() < 0.5 ? 1 : -1;
}

/**
 * 功能描述：此函数用于根据笛卡尔坐标系中的x和y值计算出相应的角度（度）。
 * @param x 笛卡尔坐标系中的x坐标值。
 * @param y 笛卡尔坐标系中的y坐标值。
 * @returns 返回一个角度值，表示从正x轴到由(x, y)指向的向量的角度，结果在0到360度之间。
 */
export function getDegreeAngleFromDirection(x: number, y: number): number {
    const radianAngle = Math.atan2(y, x);
    const angle = (radianAngle / Math.PI) * 180;

    return angle < 0 ? angle + 360 : angle;
}
```

## 带点击音效的按钮

```ts
import { _decorator, Component, Node, NodeEventType } from "cc";
import { ISignal } from "../../EventSystem/ISignal";
import { Signal } from "../../EventSystem/Signal";
const { ccclass, property } = _decorator;

@ccclass("UIButton")
export class UIButton extends Component {
    private interactedEvent = new Signal<UIButton>();

    public start(): void {
        this.node.on(Node.EventType.TOUCH_START, this.interact, this);
    }

    public get InteractedEvent(): ISignal<UIButton> {
        return this.interactedEvent;
    }

    private interact(): void {
        console.log("interact");
        this.interactedEvent.trigger(this);
    }
}
```

```ts
import { Component, _decorator } from "cc";
import { AppRoot } from "../AppRoot/AppRoot";
import { UIButton } from "../Services/UI/Button/UIButton";
const { ccclass, property } = _decorator;

@ccclass("UIButtonAudioPlayer")
export class UIButtonAudioPlayer extends Component {
    @property(UIButton) private button: UIButton;
    public start(): void {
        this.button.InteractedEvent.on(this.playButtonClick, this);
    }

    private playButtonClick(): void {
        const audioClip = AppRoot.Instance.GameAssets.AudioAssets.buttonClick;
        AppRoot.Instance.AudioPlayer.playSound(audioClip);
    }
}
```

# 构建发布

- 菜单「文件」-「偏好设置」-「程序管理器」
  - 微信开发者工具：从这里下载并安装：[微信开发者工具（小游戏版 Minigame Build）](https://developers.weixin.qq.com/minigame/dev/devtools/download.html)，然后选择安装好的`exe`文件。
- 菜单「项目」-「构建发布」，「发布平台」选择「微信小游戏」，在最后填上正确的`Appid`。

## 设置Bundle

编辑器中选择某个目录，勾选「配置为Bundle」，点击「目标平台」旁边的「编辑」按钮，在弹出的「项目设置-Bundle配置」中切换到「小游戏」选项卡，在下面的「统一配置」中勾选「远程包」，压缩类型选择「合并依赖」。



## Build构建

- Platform 勾选：WeChat Mini Game

- Main Bundle Config：zip

- Resource Server：**服务器地址**，如果是本地测试可以设置为：`http://127.0.0.1:8080/`



## 测试

- 开启本地测试服务器：`python -m http.server 8080 --bind 127.0.0.1`  

- 把上述步骤构建`build`目录下的`remote`目录整个移动到本地测试服务器根目录下。

- 微信开发工具选择「`小游戏`」选项卡，导入build下的工程目录，类型要选择「`小游戏`」。如果工具自动切换回小程序，说明有缓存导致的工具识别错误，可以在微信开发者工具的工具栏中点击清缓存-全部清除，然后重新导入，如果仍然不能解决，可以卸载重装工具。

- 打开微信开发者工具，点击顶部菜单栏：详情（或项目配置） -> 本地设置，启用 “`不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书`”，否则无法访问本地服务。



## 功能裁剪

「项目设置-功能裁剪」里面根据工程的实际情况去除一些不需要的，例如：

- Tiled地图

- Spine动画

- Dragon Bones



切换「2D物理系统」为「内置2D物理系统」



**勾选：**

- 动画 - 骨骼动画。



# 三方库

- [获取 npm 包](https://docs.cocos.com/creator/manual/zh/scripting/modules/config.html)：npm 包管理工具 `npm` 附带在 Node.js 发行版中，安装 Node.js 之后即可使用。
- [使用 NPM 上的库](https://docs.cocos.com/creator/manual/zh/editor/npm.html#%E4%BD%BF%E7%94%A8-npm-%E4%B8%8A%E7%9A%84%E5%BA%93)

```js
import JSZip from 'jszip/dist/jszip.min.js'; // 扩展名是需要的并且需要用 `min.js` 版本
```

[Cocos Creator之如何使用第三方类库](https://developer.moduyun.com/article/5d9b3029-7df0-11ee-b225-6c92bf60bba4.html)

# 碎图/图集

- [Cocos Creator 图集 (TexturePacker、自动图集功能 、压缩纹理、压缩插件)](https://www.jianshu.com/p/f8f1e830d112)
- [How to create and use sprite sheets with CocosCreator 3.x](https://www.codeandweb.com/texturepacker/tutorials/how-to-create-and-usesprite-sheets-with-cocoscreator)
- 

# 三方工具

- 瓦片地图编辑：[Tiled Map Editor](https://www.mapeditor.org/)，GitHub地址：https://github.com/mapeditor/tiled
- 合图工具：[FreeTexturePacker](http://free-tex-packer.com/)（免费推荐） [TexturePacker](https://www.codeandweb.com/texturepacker)（收费）
- 碎图工具：[开源一个基于Unity的Plist解析工具——TextureUnpacker](https://blog.csdn.net/NRatel/article/details/85009462) （[github地址](https://github.com/NRatel/TextureUnpacker)，成品下载地址[TextureUnpacker_x86_64（v1.0）](https://download.csdn.net/download/nratel/10853196)）
- JavaScript代码混淆：https://obfuscator.io/ （[GitHub](https://github.com/javascript-obfuscator/javascript-obfuscator)） 使用教程：[微信小程序代码混淆（代码被扒盗用上架，如何保证代码安全](https://cloud.tencent.com/developer/article/2345810)
- 配色提取：[Rickrack: Generate harmonious colors freely.](https://github.com/eigenmiao/Rickrack)

# 常见问题

- [警告: WebGL 1.0 平台不支持非 2 次贴图的 Repeat 过滤模式，运行时会自动改为 Clamp 模式，这会使材质的 tilingOfiset 等属性完全失效](https://forum.cocos.org/t/topic/144127/2)，解决：在「属性检查器」中修改「类型」为`sprite-frame` ，然后保存即可。  全局解决：打开「文件」-「偏好设置」-「资源数据库」-「默认资源导入类型配置」-「图片」的类型选择 `sprite-frame`，默认是`texture`。
- 

# 参考资料

- [Cocos Creator 官网手册](https://docs.cocos.com/creator/manual/zh/)
- [Cocos中文社区](https://forum.cocos.org)
- [Cocos资料大全](https://tidys.github.io/#/dev/index)  [Cocos 资料大全](https://fusijie.github.io/Cocos-Resource/index.html)