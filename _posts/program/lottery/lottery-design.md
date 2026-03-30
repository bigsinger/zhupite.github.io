# 抽奖网页程序开发设计文档

## 项目概述

### 项目名称
GitHub Pages 抽奖网页程序

### 项目目标
开发一个简单易用的抽奖网页程序，使用 GitHub Pages 部署，支持用户自定义配置，使用本地存储技术保存配置。

### 技术栈
- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas API
- LocalStorage API

### 部署方式
GitHub Pages

## 功能需求

### 1. 核心功能
- 转盘抽奖
- 设置按钮
- 本地存储配置
- 中奖人员名单配置
- 黑白名单配置
- 中奖概率配置
- 预制图标选择
- 抽奖标题修改
- 使用说明

### 2. 详细功能说明

#### 2.1 转盘抽奖
- 使用 Canvas 绘制转盘
- 支持动态配置奖项
- 支持图片和颜色背景
- 支持中奖概率配置
- 支持黑白名单过滤

#### 2.2 设置按钮
- 点击设置按钮打开设置面板
- 设置面板包含所有配置选项
- 支持保存和取消操作

#### 2.3 本地存储配置
- 使用 LocalStorage API 保存配置
- 配置永久有效
- 下次打开时自动加载配置

#### 2.4 中奖人员名单配置
- 支持添加/删除中奖人员
- 支持导入/导出名单
- 支持批量操作

#### 2.5 黑白名单配置
- 支持配置黑名单（排除的人员）
- 支持配置白名单（仅包含的人员）
- 支持启用/禁用黑白名单

#### 2.6 中奖概率配置
- 支持为每个奖项配置权重
- 支持均等概率
- 支持自定义概率

#### 2.7 预制图标选择
- 预制常用图标（红包、礼物、星星等）
- 支持自定义图标上传
- 默认使用颜色背景

#### 2.8 抽奖标题修改
- 支持修改抽奖标题
- 支持保存标题配置

#### 2.9 使用说明
- 在网页上提供使用说明
- 包含功能介绍和操作指南

## 技术设计

### 1. 文件结构
```
lottery/
├── 2026-03-30-lottery.md          # GitHub Pages 主文件
├── css/
│   └── lottery.css                # 样式文件
├── js/
│   ├── lottery.js                  # 主逻辑文件
│   ├── turntable.js                # 转盘逻辑
│   └── config.js                   # 配置管理
└── images/
    └── icons/                      # 预制图标
        ├── redpacket.png
        ├── gift.png
        ├── star.png
        └── ...
```

### 2. 数据结构

#### 2.1 配置数据结构
```javascript
{
  title: "抽奖",
  prizes: [
    {
      id: 1,
      text: "一等奖",
      img: "images/icons/gift.png",
      color: "#FF6B6B",
      weight: 1
    },
    {
      id: 2,
      text: "二等奖",
      color: "#4ECDC4",
      weight: 2
    }
  ],
  whitelist: ["张三", "李四"],
  blacklist: ["王五"],
  useWhitelist: false,
  useBlacklist: false
}
```

#### 2.2 本地存储键名
- `lottery_config`: 抽奖配置
- `lottery_history`: 抽奖历史记录

### 3. 核心算法

#### 3.1 中奖概率算法
```javascript
function getPrizeByWeight(prizes) {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }

  return prizes[prizes.length - 1];
}
```

#### 3.2 黑白名单过滤
```javascript
function filterPrizes(prizes, whitelist, blacklist, useWhitelist, useBlacklist) {
  if (useWhitelist && whitelist.length > 0) {
    return prizes.filter(prize => whitelist.includes(prize.text));
  }

  if (useBlacklist && blacklist.length > 0) {
    return prizes.filter(prize => !blacklist.includes(prize.text));
  }

  return prizes;
}
```

### 4. 界面设计

#### 4.1 主界面
- 顶部：抽奖标题
- 中间：转盘
- 底部：抽奖按钮、设置按钮、使用说明按钮

#### 4.2 设置面板
- 标题设置
- 奖项配置
- 黑白名单配置
- 概率配置
- 保存/取消按钮

#### 4.3 使用说明
- 功能介绍
- 操作指南
- 常见问题

## 开发计划

### 阶段一：基础框架搭建
1. 创建文件结构
2. 编写 HTML 结构
3. 编写 CSS 样式
4. 编写 JavaScript 基础逻辑

### 阶段二：转盘功能实现
1. 实现 Canvas 转盘绘制
2. 实现转盘旋转动画
3. 实现中奖逻辑
4. 实现中奖概率算法

### 阶段三：配置功能实现
1. 实现设置面板
2. 实现本地存储
3. 实现奖项配置
4. 实现黑白名单配置
5. 实现概率配置

### 阶段四：图标和样式优化
1. 预制图标
2. 颜色背景
3. 响应式设计
4. 动画效果

### 阶段五：使用说明和测试
1. 编写使用说明
2. 功能测试
3. 兼容性测试
4. 性能优化

## 预制图标列表

1. 红包 (redpacket.png)
2. 礼物 (gift.png)
3. 星星 (star.png)
4. 奖杯 (trophy.png)
5. 钻石 (diamond.png)
6. 金币 (coin.png)
7. 爱心 (heart.png)
8. 笑脸 (smile.png)

## 注意事项

1. 所有代码必须兼容 GitHub Pages
2. 不能使用复杂框架
3. 必须使用本地存储技术
4. 配置必须永久有效
5. 必须提供使用说明
6. 必须支持响应式设计

## 参考资料

- [GB-canvas-turntable](https://github.com/bigsinger/GB-canvas-turntable)
- [Canvas API](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [LocalStorage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)

## 版本历史

- v1.0.0 (2026-03-30): 初始版本
