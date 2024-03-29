---
layout:		post
category:	"cocos"
title:		"Cocos Creator信号处理事件回调"

tags:		[c++]
---
- Content
{:toc}


`ISignal` ：

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ISignal<T = void> {
    on(handler: (data?: T) => void, thisArg: any): void;
    off(handler: (data?: T) => void): void;
}
```

`Signal` ：

```ts
// Need to capture *this*
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISignal } from "./ISignal";

export class Signal<T = void> implements ISignal<T> {
    private handlers: ((data: T) => void)[] = [];
    private thisArgs: any[] = [];

    public on(handler: (data: T) => void, thisArg: any): void {
        this.handlers.push(handler);
        this.thisArgs.push(thisArg);
    }
    public off(handler: (data: T) => void): void {
        const index: number = this.handlers.indexOf(handler);
        this.handlers.splice(index, 1);
        this.thisArgs.splice(index, 1);
    }

    public trigger(data: T): void {
        // protect from trigger >> off
        const handlers: ((data: T) => void)[] = [...this.handlers];
        const thisArgs: any[] = [...this.thisArgs];

        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(thisArgs[i], data);
        }
    }
}
```

在具体的业务代码中，如何使用呢？参考以下示例用法。



# 使用场景

## 交互事件

点击按钮触发一系列操作：

定义一个`UIButton`类，其实该类也可以放基础库里面。

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

在菜单场景的ts里面使用该类：

```ts
export class Menu extends Component {
	@property(UIButton) private playBtn: UIButton;  
    
	public async start() {
		this.playBtn.InteractedEvent.on(this.startGame, this);	// 一定要传递一个this参数
    }
    
    // 点击playBtn时的回调函数
    private startGame(): void {
        AppRoot.Instance.ScreenFader.playOpen();
        GameRunner.Instance.playGame();
    }
}
```

在菜单场景中，可以添加组件的绑定，这样当点击按钮时便会调用添加的回调函数。



## 经验升级

```ts
import { ISignal } from "../../Services/EventSystem/ISignal";
import { Signal } from "../../Services/EventSystem/Signal";

export class UnitLevel {
    private xp = 0;

    private currentLevel = 0;
    private levelUpEvent: Signal<number> = new Signal<number>();
    private xpAddedEvent: Signal<number> = new Signal<number>();

    public constructor(private requiredXPs: number[], private xpMultiplier: number) {}

    public addXp(points: number): void {
        this.xp += points * this.xpMultiplier;
        this.xpAddedEvent.trigger(this.xp);
        this.tryLevelUp();
    }

    public get XP(): number {
        return this.xp;
    }

    public get RequiredXP(): number {
        return this.requiredXPs[this.currentLevel];
    }

    public get LevelUpEvent(): ISignal<number> {
        return this.levelUpEvent;
    }

    public get XpAddedEvent(): ISignal<number> {
        return this.xpAddedEvent;
    }

    private tryLevelUp(): void {
        if (this.requiredXPs.length <= this.currentLevel) return;
        if (this.xp < this.requiredXPs[this.currentLevel]) return;

        this.xp -= this.requiredXPs[this.currentLevel];
        this.currentLevel++;

        this.levelUpEvent.trigger(this.currentLevel);

        this.tryLevelUp();
    }
}
```



```ts
private playerLevel: UnitLevel;

this.playerLevel.XpAddedEvent.on(this.updateProgressBar, this);
this.playerLevel.LevelUpEvent.on(this.updateProgressBar, this);

private updateProgressBar(): void {
    this.xpBar.progress = this.playerLevel.XP / this.playerLevel.RequiredXP;
}
```

当在其他逻辑中为角色等级添加经验调用`addXp`函数时，便会调用添加的回调`updateProgressBar`函数，方便更新UI信息。



参考：

- [割草游戏 Slash-The-Hordes: Rougelite game, made in Cocos Creator](https://github.com/MartinKral/Slash-The-Hordes)