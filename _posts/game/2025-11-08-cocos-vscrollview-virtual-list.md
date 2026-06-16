---
layout: post
title: "VScrollView：一个让CocosCreator虚拟列表"零心智负担"的开源组件""
categories: [game]
tags: 
	- cocos-creator
	- virtual-list
	- vscrollview
description: "VScrollView 是一个 258 Star 的开源 Cocos Creator 虚拟列表组件。核心源码 VScrollView.ts 共 2616 行，内置 NodePool 池化、5 种滚动风格、刷新加载、多模板支持，自动 Sorting2D 分层 DC 优化。"
---

**项目地址**：[github.com/soidaken/VScrollView](https://github.com/soidaken/VScrollView) | 258 ★

在 Cocos Creator 论坛上，用户 **soida（ssice）** 发布了一个新开的滚动列表组件 VScrollView。帖子标题的口气不小——"我宣布，这是使用起来毫无心智负担的滚动虚拟列表"。

但看完全部源码和功能之后，确实有底气说这个话。

## 项目结构

```
VScrollView/
├── assets/vscrollview/
│   ├── VScrollView.ts          ← 核心组件（2616 行）
│   ├── VScrollViewItem.ts      ← 子项组件（点击/长按/排序）
│   ├── VSListTemplate_V.prefab ← 纵向预制体
│   ├── VSListTemplate_H.prefab ← 横向预制体
│   └── samples/                ← 示例场景
├── package.json
├── tsconfig.json
├── engine-mangle-config.json
└── README.md
```

**两个源码文件**：`VScrollView.ts`（2616 行）和 `VScrollViewItem.ts`，其余是预制体和配置。没有第三方依赖，拷贝即可用。

> 作者原话：这个项目花了 2 小时和 AI 一起弄完测试完的，完全没耗费什么成本。

## 支持版本

| 引擎版本 | 状态 | 说明 |
|---------|------|------|
| **≥3.8.7** | ✅ 全功能 | 含 Sorting2D 自动分层 DC 优化 |
| 3.8.0 ~ 3.8.6 | ⚠️ 可用 | 无分层 DC 优化 |
| 2.4.x | 🚧 另仓 | [VScrollView24x](https://github.com/soidaken/VScrollView24x)，无分层优化 |

## 架构设计

### 核心类：VirtualScrollView

VScrollView.ts 是一个 Cocos Creator 组件类（`@ccclass('VirtualScrollView')`），菜单路径 `2D/VirtualScrollView(虚拟滚动列表)`。

**核心架构采用预制体 + 节点池方案**：

```
VirtualScrollView
├── 容器节点（content） → 列表内容挂载点
├── InternalNodePool    → 节点池（按模板类型分池）
├── 滚动引擎            → 惯性 / 弹性 / 分页
├── 虚拟列表引擎         → 可视区裁剪 / 回收复用
└── Sorting2D 管理器     → 自动分层 DC 优化
```

### 节点池（InternalNodePool）

内置的节点池系统，按模板类型分池管理：

```ts
class InternalNodePool {
  private pools: Map<number, Node[]> = new Map();
  
  get(typeIndex: number): Node    // 从池中获取或实例化
  put(node: Node, typeIndex: number) // 回收到池中
  clear()                         // 清空所有池
  getStats()                      // 获取各池统计
}
```

支持两种创建模式：
- **Prefab 模式**（默认）：通过预制体实例化
- **Node 模式**：直接复制已有节点模板

## 功能全览

VScrollView 的功能在 Cocos Creator 的同类组件中算是非常丰富的：

### 1. 五种滚动风格

源码中定义了 `ScrollStyle` 枚举：

| 风格 | 特点 |
|------|------|
| `APPLE` | 苹果式惯性，阻尼适中有弹性 |
| `ANDROID` | 安卓式惯性，摩擦略大 |
| `LIGHT` | 轻惯性，适合快速列表 |
| `HEAVY` | 重惯性，滑动手感沉 |
| `CUSTOM` | 自定义阻尼和弹性参数 |

### 2. 虚拟列表引擎

点击 Inspector 面板上的"启用虚拟列表"开关即可开启。开启后只渲染**可视区内**的子项节点，超出部分回收复用。支持：

- ✅ **等高/不等高**：通过 `GetItemHeightFn` 回调动态返回每项高度
- ✅ **横向/纵向**：通过 `ScrollDirection` 切换
- ✅ **Grid 网格布局**：背包、道具等网格场景
- ✅ **多模板类型**：通过 `GetItemTypeIndexFn` 为不同索引指定不同模板

### 3. 下拉刷新 + 上拉加载

| 状态 | 枚举值 | 说明 |
|------|--------|------|
| `IDLE` | 0 | 空闲 |
| `PULLING` | 1 | 正在拉动 |
| `READY` | 2 | 达到阈值，松手触发 |
| `REFRESHING` / `LOADING` | 3 | 正在刷新/加载 |
| `COMPLETE` | 4 | 完成 |
| `NO_MORE` | 5 | 无更多数据（仅加载） |

通过 `onRefreshStateChange` 和 `onLoadMoreStateChange` 回调监听状态变化。

### 4. 分层 Draw Call 优化

在 3.8.7+ 版本中，VScrollViewItem 组件会为子项下的 **每个 Label 组件** 分配独立的 `sortingOrder`，避免不同子项的文字间交替导致合批断裂：

```ts
public onSortLayer() {
  let orderNumber = 1;
  const labels = this.node.getComponentsInChildren(Label);
  for (let i = 0; i < labels.length; i++) {
    changeUISortingLayer(labels[i].node, 0, orderNumber);
    // 每个 Label 独占一个 sortingOrder
  }
}
```

### 5. 完整的回调体系

```ts
// 渲染指定索引的 UI 内容
renderItemFn: (node, index) => void

// 点击 / 长按
onItemClickFn: (node, index) => void
onItemLongPressFn: (node, index) => void

// 可视区域感知
onItemEdgeEnterFn: (node, index, context) => void   // 刚进入可视区
onItemFullEnterFn: (node, index, context) => void    // 完全进入

// 动态尺寸 + 多模板
getItemHeightFn: (index) => number
getItemTypeIndexFn: (index) => number

// 刷新 + 加载更多
onRefreshStateChange: (state, offset) => void
onLoadMoreStateChange: (state, offset) => void

// 分页切换
onPageChange: (pageIndex) => void
```

每个回调的 `context` 参数包含 `isInitialBatch`（是否初始批次）、`appearOrder`（出现顺序）、`isReused`（是否为复用节点），方便做精细化控制。

## 如何使用

### 安装

直接从 GitHub 下载或克隆：

```bash
git clone https://github.com/soidaken/VScrollView.git
```

然后将 `assets/vscrollview` 目录复制到你的 Cocos Creator 项目的 `assets` 下即可。

### 快速开始

**第一步**：从 `assets/vscrollview` 拖入预制体

- `VSListTemplate_V.prefab` — 纵向列表
- `VSListTemplate_H.prefab` — 横向列表

**第二步**：绑脚本

```ts
@property(VirtualScrollView)
vlist: VirtualScrollView | null = null;

private data: Array<{ title: string; time: string }> = [];

onLoad() {
  this.data = Array.from({ length: 1000 }, (_, i) => ({
    title: `通知${i + 1}`,
    time: `2025.10.${i + 1}`,
  }));

  if (!this.vlist) return;

  // 渲染
  this.vlist.renderItemFn = (itemNode, index) => {
    const item = this.data[index];
    itemNode.getChildByName('title')!.getComponent(Label)!.string = item.title;
    itemNode.getChildByName('time')!.getComponent(Label)!.string = item.time;
  };

  // 点击
  this.vlist.onItemClickFn = (_node, index) => {
    console.log(`click: ${index}`);
  };

  // 入场动画
  this.vlist.onItemEdgeEnterFn = (node, index, ctx) => {
    if (ctx.isInitialBatch) return; // 初始批次不做动画
    node.setScale(0, 0, 1);
    tween(node).to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
  };

  // 刷新列表
  this.vlist.refreshList(this.data);
}
```

**第三步**：常用 API

```ts
// 滚动到指定项（带动画）
this.vlist.scrollToIndex(10, true);

// 刷新指定项
this.vlist.refreshIndex(1);

// 滚动到顶部/底部
this.vlist.scrollToTop(true);
this.vlist.scrollToBottom(true);

// 获取当前子项数量
const count = this.vlist.getItemCount();
```

### 多模板类型示例

如果需要列表中不同类型（比如聊天列表中的文本消息和图片消息），可以实现 `GetItemTypeIndexFn`：

```ts
this.vlist.getItemTypeIndexFn = (index) => {
  const item = this.data[index];
  return item.type === 'text' ? 0 : 1;
};

this.vlist.renderItemFn = (node, index) => {
  const item = this.data[index];
  if (item.type === 'text') {
    // 渲染文本消息
  } else {
    // 渲染图片消息
  }
};
```

需要将两种类型的预制体都赋值到组件的 `ItemPrefabs` 数组中。

## 在线 Demo

作者提供了一个在线预览页面：

👉 **[在线 Demo 地址](https://soidaken.github.io/VSCrollView_SamplesPreView/)**

可以直观感受滚动惯性效果、分层优化后的渲染性能，以及各种布局模式。

## 小结

VScrollView 不是那种"大而全"的 UI 框架——它只做一件事，但做得很到位。

从源码结构来看，**2616 行的 VScrollView.ts** 包含了一个完整的虚拟列表所需的一切：节点池、滚动引擎、刷新加载、多模板、DC 优化、惯性系统。对于一个 2 小时完成的 MVP 来说，这个功能的完整度相当难得。目前 258 个 Star 的社区认可度也说明它不是空有噱头。

对于 Cocos Creator 开发者来说，如果你需要一个免费的、开源的高性能虚拟列表组件，VScrollView 值得加入工具箱。

---

**参考资料**

1. [GitHub: soidaken/VScrollView](https://github.com/soidaken/VScrollView)
2. [Cocos 论坛原帖](https://forum.cocos.org/t/topic/171307)
3. [在线 Demo](https://soidaken.github.io/VSCrollView_SamplesPreView/)
4. [GitHub: VScrollView24x（2.4.x 版本）](https://github.com/soidaken/VScrollView24x)
5. 联系作者：v: soida3 / QQ 群: 1044961417
