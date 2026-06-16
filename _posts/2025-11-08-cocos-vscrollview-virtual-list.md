---
layout: post
title: "VScrollView：一个让 Cocos Creator 虚拟列表"零心智负担"的开源组件"
categories: [tool]
tags: [cocos-creator, virtual-list, vscrollview, open-source, UI-component]
description: "VScrollView 是开源的 Cocos Creator 虚拟列表组件，核心设计目标是用起来没有心智负担。两个文件即用，预制体拖入场景，绑定数据回调即可。支持等高/不等高、横向/纵向、Grid、聊天列表、嵌套列表等场景，自动分层 DC 优化。"
---

在 Cocos Creator 中实现高性能的滚动列表，几乎是每个游戏开发都会遇到的场景。尤其是需要展示大量数据时，没有虚拟列表的列表组件能让手机发烫、帧率暴跌。

论坛用户 **soida（ssice）** 开源了一个名为 **VScrollView** 的滚动组件 + 虚拟列表，核心设计目标是一句话：

> **使用起来没有心智负担、开箱即用。**

## 项目概览

| 项目 | 内容 |
|------|------|
| 名称 | VScrollView |
| 作者 | soida（ssice） |
| 许可 | 开源免费 |
| 适用引擎 | Cocos Creator **≥3.8.7**（全功能） |
| 低版本兼容 | 3.8.0-3.8.6 可用，无分层 DC 优化 |
| 代码量 | 2 个源码文件，**拷贝即可使用** |
| GitHub | [soidaken/VScrollView](https://github.com/soidaken/VScrollView) |
| 2.4.x 版本 | [soidaken/VScrollView24x](https://github.com/soidaken/VScrollView24x) |
| 在线预览 | [Demo 地址](https://soidaken.github.io/VSCrollView_SamplesPreView/) |

## 适用场景

VScrollView 覆盖了项目中绝大多数列表相关的 UI 场景：

- ✅ 普通纵向/横向列表
- ✅ 等高/不等高混合（动态聊天列表）
- ✅ 背包 Grid 网格布局
- ✅ 嵌套列表（列表中的列表）
- ✅ 结果奖励列表（自动居中布局）
- ✅ 子项点击展开
- ✅ 可以关闭虚拟列表，仅用滚动组件，获得类似 APP 原生的自然惯性滚动效果

## 功能特色

### 1. 自动分层 DC 优化

这是 VScrollView 比较有特色的功能。如果你使用的是 Cocos Creator **3.8.x 带 Sorting2D 组件的版本**，组件会自动为列表项做分层 Draw Call 优化，**且不影响子项的节点树**。开发者只需要关注业务逻辑，不需要操心渲染性能。

### 2. 可视区域回调

VScrollView 提供了精细的**可视区域回调**，让动画和统计逻辑有清晰的触发时机：

| 回调 | 触发时机 | 典型用途 |
|------|---------|---------|
| `renderItemFn` | 子项渲染时 | 填充数据 |
| `onItemClickFn` | 子项被点击时 | 交互响应 |
| `onItemEdgeEnterFn` | 子项刚进入可视区边缘 | **入场动效** |
| `onItemFullEnterFn` | 子项完全进入可视区 | **曝光统计** |

`onItemEdgeEnterFn` 特别适合做列表项的出场动画——比如子项进入时从 0 放大到 1，比列表整体一次性出现要生动得多。

### 3. 全部功能一览

- **虚拟列表**：只渲染可视区域内的节点，大量数据无压力
- **滚动组件**：开箱即用，无需手动搭建节点结构
- **自动分层**：Sorting2D 自动 DC 优化（3.8.7+）
- **不等高支持**：每个子项高度可以不同
- **多项布局**：横向 / 纵向 / Grid 网格
- **嵌套场景**：列表内嵌列表
- **点击展开**：列表项点击展开详情
- **居中布局**：结果/奖励自动居中
- **入场动画**：子项进入可视区时自动触发
- **API 操作**：滚动到指定项、刷新指定项、滚动到底部等

## 如何使用

VScrollView 的使用非常简单，**不需要手动搭建节点结构**：

### 第一步：拖入预制体

从 `assets/vscrollview` 目录下选择对应的预制体：

- `VSListTemplate_V.prefab` — **纵向**列表
- `VSListTemplate_H.prefab` — **横向**列表

直接拖入场景任意父节点下即可。

### 第二步：挂载脚本，绑定回调

```ts
@property(VirtualScrollView)
vlist: VirtualScrollView | null = null;

private data: Array<{ title: string; time: string }> = [];

onLoad() {
  // 准备数据
  this.data = Array.from({ length: 50 }, (_, i) => ({
    title: `重要通知${i + 1}`,
    time: `2025.10.${i + 1}`,
  }));

  if (!this.vlist) return;

  // 绑定渲染回调
  this.vlist.renderItemFn = (itemNode, index) => {
    const item = this.data[index];
    itemNode.getChildByName('title')!.getComponent(Label)!.string = item.title;
    itemNode.getChildByName('time')!.getComponent(Label)!.string = item.time;
  };

  // 绑定点击回调
  this.vlist.onItemClickFn = (_itemNode, index) => {
    const item = this.data[index];
    console.log(`click item ${index + 1}: ${item.title}`);
  };

  // 入场动效
  this.vlist.onItemEdgeEnterFn = (itemNode, index) => {
    Tween.stopAllByTarget(itemNode);
    itemNode.setScale(0, 0, 1);
    tween(itemNode)
      .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
      .start();
  };

  // 完全进入可视区
  this.vlist.onItemFullEnterFn = (itemNode, index) => {
    console.log(`item ${index + 1} fully visible`);
  };

  // 刷新列表
  this.vlist.refreshList(this.data);
}
```

### 第三步：其他常用操作

```ts
// 刷新指定位置的子项
this.vlist.refreshIndex(1);

// 滚动到指定索引（带动画）
this.vlist.scrollToIndex(10, true);

// 滚动到底部（带动画）
this.vlist.scrollToBottom(true);
```

## 组件在 Cocos Creator 中的配置

在预制体的 `VScrollView` 组件面板上，可以配置数据和滚动参数：

| 参数 | 说明 |
|------|------|
| 滚动方向 | 纵向 / 横向 |
| 虚拟列表开关 | 开启后只渲染可视区域内的子项 |
| 子项尺寸 | 等高模式或动态计算 |
| 间距 | 子项之间的间隔 |
| 惯性 | 松手后的惯性滚动效果 |

具体参数可以拖入预制体后查看 Inspector 面板。

## 和其他方案的区别

市面上的 Cocos 滚动列表方案不少，VScrollView 的几个差异化点：

- **2 个文件搞定**：没有复杂的依赖链，拷贝即用
- **预制体直接拖**：不需要手动搭建节点树
- **自动分层优化**：Sorting2D 自动解决 DC 问题，不需要手动调整子项层级
- **可视区域回调**：入场动效和曝光统计有专属回调，不用自己计算可见性
- **心智负担低**：作者的原话——"花 2 小时和 AI 一起弄完测试完的"，设计上追求直觉化

## 小结

VScrollView 不是一个"大而全"的框架，而是一个**务实的小工具**。它没有复杂的配置项、不需要理解底层原理、不绑定任何设计模式——拖进去、绑数据、完事。

对于 Cocos Creator 开发者来说，如果你正在为列表性能发愁，或者觉得现有的虚拟列表组件用着不够顺手，值得试试这个。

---

**参考资料**

1. [Cocos 论坛原文：我宣布,这是使用起来毫无心智负担的滚动虚拟列表](https://forum.cocos.org/t/topic/171307)
2. [GitHub: soidaken/VScrollView](https://github.com/soidaken/VScrollView) — Cocos Creator 3.8.x 版
3. [GitHub: soidaken/VScrollView24x](https://github.com/soidaken/VScrollView24x) — Cocos Creator 2.4.x 版
4. [在线 Demo 预览](https://soidaken.github.io/VSCrollView_SamplesPreView/)
5. 联系作者：v: soida3 / QQ 群: 1044961417 / mail: flashfin@foxmail.com
