---
layout:		post
category:	"cocos"
title:		"Cocos Creator拖动效果"

tags:		[c++]
---





# 拖动物体

我们要实现的效果是，按住并拖动一个小物体，物体跟随手指（鼠标）移动。

[![运行效果](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/ccc-drag-anywhere-1.gif)](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/ccc-drag-anywhere-1.gif)



```ts
// 一行代码实现节点的触摸移动
this.node.on(Node.EventType.TOUCH_MOVE, e => this.node.translate(new Vec3(e.getUIDelta().x, e.getUIDelta().y)))
```

或：

```ts
onEnable() {
    this.node.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
}

onDisable() {
    this.node.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
}

_onTouchMove(touchEvent) {
    const location = touchEvent.getUILocation();    // 获取世界坐标（绝对坐标）
    this.node.setWorldPosition(location.x, location.y, 0);
}
```



# 拖动物体到指定区域

实现的效果是：按住并拖动一个物体，物体跟随手指（鼠标）移动，拖到指定位置放下，如果没有到指定位置，则回到之前位置。

[![运行效果](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/drag-to-target-20201230.gif)](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/drag-to-target-20201230.gif)



## 3.x版本可用

`DragToTarget`：

```ts
import { _decorator, Component, Node, Label, UITransform, Vec2, Vec3 } from 'cc';
import { common } from './Common';
import { ThingInfo } from './ThingInfo';
const { ccclass, property } = _decorator;


/**
注意：在scrollview里无法触发touchend事件
 */
@ccclass
export default class DragToTarget extends Component {

    @property(Label)
    nameLabel: Label = null;

    // 原始位置
    originalPos: Vec3 = null;

    public DragEnd(things: ThingInfo[], touchEvent): [Node, ThingInfo] {
        if (!this.node) { return [null, null]; }
        let targetThing = null;

        if (things.length > 0) {
            for (const thing of things) {
                if (thing.oldThingsNode && thing.oldThingsNode.active==true && this._withinTarget(thing.oldThingsNode, touchEvent)) {
                    targetThing = thing;
                    break;
                }
            }
        }

        if (!targetThing) {
            this.Fallback(); // 回去
            common.audioController.playSound('Common/audios/wrong');
            return [null, null];
        } else {
            common.audioController.playSound('Common/audios/right');
            return [this.node, targetThing];
        }
    }

    // 退回原始位置
    private Fallback() {
        this.node.setPosition(this.originalPos);
    }

    start() {
        this.originalPos = new Vec3(this.node.position);
    }

    onEnable() {
        this.node.on(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        //this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        //this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    _onTouchMove(touchEvent) {
        common.currentDraggingNode = this.node;
        const location = touchEvent.getUILocation();    // 获取世界坐标（绝对坐标）
        this.node.setWorldPosition(location.x, location.y, 0);
        //console.log('touch move , getUILocation: ', location, touchEvent.getLocation());
    }

    _onTouchEnd(touchEvent) {
        console.log('touch end');   // 不会触发
        this.DragEnd(null, touchEvent);
    }

    // 判断触摸事件是否在槽位里
    _withinTarget(targetNode: Node, touchEvent):boolean {
        // 鼠标位置转换为相对于目标节点的位置
        let rect = targetNode.getComponent(UITransform).getBoundingBox();   // 获取目标节点的包围盒，坐标是相对于该节点的父节点的
        let location = touchEvent.getUILocation();  // 获取世界坐标（绝对坐标）
        let v3Pos = new Vec3(location.x, location.y);
        let point = targetNode.parent.getComponent(UITransform).convertToNodeSpaceAR(v3Pos);
        let p = new Vec2(point.x, point.y); // Convert Vec3 to Vec2

        //console.log('location: ' + location, 'point: ' + point, 'rect: ' + rect);
        return rect.contains(p);
    }
}
```

因为在组件`SrollView`里无法触发节点的`TOUCH_END`事件（原因是当拖动的位置超出节点区域时已经触发了`TOUCH_CANCEL`），因此需要在 `SrollView` 里处理`TOUCH_END`事件：

```ts
override start() {
    this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this, true);
}

OnTouchEnd(touchEvent) {
    if (common.currentDraggingNode) {
        let dragItem = common.currentDraggingNode.getComponent(DragToTarget);
        if (dragItem != null) {
            let [srcNode, dstThing] = dragItem.DragEnd(this.thingsList, touchEvent);
            this.DispatchEvent(srcNode, dstThing);
        }

        // 拖放结束，清空当前拖动节点
        common.currentDraggingNode = null;
    }
}
```

`Common`：

```ts
// 全局变量/通用配置
@ccclass
export class Common {
    // 当前正在拖动的节点
    public currentDraggingNode: Node = null;
}
export let common: Common = new Common();
```

`ThingInfo`：

```ts
import { _decorator, Node } from 'cc';

export interface ThingInfo {
    oldThingsName: string;      // 旧物体名称
    oldThingsNode?: Node;       // 旧物体节点

    newThingsName: string;      // 新物体名称
    newThingsNode?: Node;       // 新物体节点

    audioPath: string;          // 音频路径
    speakText?: string;         // 说话内容
}
```



## 老版本

新建脚本**DragToTarget.ts**，挂到预制体上。

```ts
const { ccclass, property } = cc._decorator;
@ccclass
export default class DragToTarget extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Node)
    targetOfDragList: cc.Node[] = [];

    _oldPos = null; // 上一个位置

    start() {
        this._oldPos = this.node.position;
    }

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
    }

    // update (dt) {}

    _onTouchMove(touchEvent) {
        let location = touchEvent.getLocation();
        this.node.position = this.node.parent.convertToNodeSpaceAR(location); // 确定位置
    }

    _onTouchEnd(touchEvent) {
        if (this.targetOfDragList.length === 0) {
            return; // 没有目标位置
        }
        let inTarget = false;
        for (const targetNode of this.targetOfDragList) {
            if (this._withinTarget(targetNode, touchEvent)) {
                inTarget = true;
                break;
            }
        }
        if (!inTarget) {
            this.node.position = this._oldPos; // 回去
        }
    }

    // 判断触摸事件是否在槽位里
    _withinTarget(targetNode: cc.Node, touchEvent) {
        let rect = targetNode.getBoundingBox();
        let location = touchEvent.getLocation();
        let point = targetNode.parent.convertToNodeSpaceAR(location);
        return rect.contains(point);
    }
}

TS
```


思路与之前的拖动类似。在最后`TOUCH_END`的时候，判断自己是否在目标区域内。如果不在则返回上一个坐标。



在场景中使用：

```ts
import DragToTarget from "./DragToTarget";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DragToControl extends cc.Component {

    @property(cc.Prefab)
    drag_to_item: cc.Prefab = null;

    @property(cc.Node)
    dragTargets: cc.Node[] = [];

    itemNum = 1;

    start() {
        this.createItem();
    }

    // update (dt) {}

    createItem() {
        let d = cc.instantiate(this.drag_to_item);
        this.node.addChild(d);
        let dragTo = d.getComponent(DragToTarget);
        dragTo.targetOfDragList = this.dragTargets; // 设置目的地
        dragTo.nameLabel.string = '' + this.itemNum++;
    }
}

TS
```



# 参考

- [一行代码实现节点的触摸移动](https://forum.cocos.org/t/topic/150282)
- [如何实现拖动物体](https://forum.cocos.org/t/topic/150876)
- [Cocos Creator 拖动效果](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/)
- [Cocos Creator 拖动去指定区域](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/)