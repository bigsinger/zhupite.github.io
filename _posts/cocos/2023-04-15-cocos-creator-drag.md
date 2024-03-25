---
layout:		post
category:	"cocos"
title:		"Cocos Creator拖动效果"

tags:		[c++]
---


# 拖动物体

我们要实现的效果是，按住并拖动一个小物体，物体跟随手指（鼠标）移动。

[![运行效果](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/ccc-drag-anywhere-1.gif)](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/ccc-drag-anywhere-1.gif)



代码**DragToAnywhere.ts**

```typescript
@ccclass
export default class DragToAnywhere extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    start () {
        
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
        // 放下
    }
}

```



把**DragToAnywhere.ts**挂在预制体上。在场景中创建预制体对象。

```typescript
let node1 = cc.instantiate(this.drag_item);
this.node.addChild(node1);
node1.x = 100;
node1.y = 100;
node1.getComponent(DragToAnywhere).label.string = '水星';

TS
```



# 拖动物体到指定区域

实现的效果是：按住并拖动一个物体，物体跟随手指（鼠标）移动，拖到指定位置放下，如果没有到指定位置，则回到之前位置。

[![运行效果](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/drag-to-target-20201230.gif)](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/drag-to-target-20201230.gif)



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

- [如何实现拖动物体](https://forum.cocos.org/t/topic/150876)
- [Cocos Creator 拖动效果](https://rustfisher.com/2020/12/28/CocosCreator/ccc-drag-anywhere/)
- [Cocos Creator 拖动去指定区域](https://rustfisher.com/2020/12/30/CocosCreator/ccc-drag-to-target/)