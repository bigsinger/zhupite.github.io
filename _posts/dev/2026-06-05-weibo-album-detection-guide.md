---
layout: post
title: 微博相册探测与图片下载 — 从 API 逆向到 Chrome 扩展落地
categories: [dev]
description: 详解 AlbumDownloader Chrome 扩展的微博相册探测与下载完整技术实现：四层 UID 获取策略、新版 getImageWall/getAlbumDetail API 调用与翻页、旧版 JSONP 降级与三层解析、PID 到图片 URL 转换、Service Worker 跨域 CDN 下载的 credentials 踩坑、DNR Referer 规则配置、完整数据流与排查路线图
keywords: 微博相册, Chrome 扩展, API 逆向, 图片下载, Service Worker, MV3, DNR
tags:
  - Chrome 扩展
  - API 逆向
  - 图片下载
  - 微博
  - MV3
---

## 前言

微博相册（`weibo.com/n/{name}?tabtype=album`）没有一个直接的"一键下载全部"按钮。如果你想备份某个用户的所有相册图片，目前唯一的办法就是写自动化脚本。

本文从技术实现角度，详细拆解一个 Chrome 扩展（AlbumDownloader）如何完成**相册探测 → 图片列表 → 图片下载**全链路的完整实现。核心挑战在于：

1. 微博 SPA 页面不直接在 HTML 中暴露 UID 和 API 地址，需要多层探测策略
2. 存在新/旧两套 API 体系，需要优雅降级
3. 跨域 CDN 图片下载的 credentials 设置稍有不慎就全盘失败

---

## 一、整体架构

扩展采用标准的 Chrome MV3 架构，分为两个执行上下文：content script（页面上下文）做探测，Service Worker（扩展后台）做下载。

```
┌─────────────────────────────────────────────────────────┐
│                    浏览器页面上运行                        │
│  content script (weibo adapter)                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. 探测相册 → 发消息给 popup                     │   │
│  │ 2. 用户勾选照片 → 点击下载                       │   │
│  └─────────────────────────────────────────────────┘   │
│                        │                                 │
│                        ▼                                 │
│  Service Worker (background)                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 3. 收到下载任务                                   │   │
│  │ 4. fetch + blob → data URL → 浏览器下载           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**关键分工原则**：
- **content script**（页面上下文）做**探测**：调用微博同源 API（可携带 cookies）
- **Service Worker**（扩展后台）做**下载**：fetch 跨域 CDN 图片，转为 data URL 后再下载

---

## 二、探测相册（detectAlbums）

### 第一步：获取用户 UID

新版微博 SPA 页面 `weibo.com/n/{name}?tabtype=album` **不嵌入任何 UID 到 HTML**，必须通过 API 获取。

**探测优先级**（从高到低，四层兜底）：

| # | 方法 | API / 路径 | 示例 |
|---|------|-----------|------|
| 1️⃣ | **新 API（SPA 主路径）** | `GET /ajax/profile/info?screen_name={name}` | 从 URL 提取 nickname → API 请求 → `data.user.id` |
| 2️⃣ | URL 正则 | 从路径提取 | `weibo.com/u/2352174263` → 直接拿到 |
| 3️⃣ | HTML 变量 | 搜索页面内嵌数据 | `$CONFIG.oid`, `owner_uid` 等 |
| 4️⃣ | DOM 属性 | 搜索元素 | `meta[name="uid"]`, `[data-uid]`, 头像 URL 正则 |

核心代码如下：

```typescript
// 核心代码（weibo.ts → extractUid）
private async fetchUidByScreenName(name: string): Promise<string> {
  const url = `https://weibo.com/ajax/profile/info?screen_name=${encodeURIComponent(name)}`;
  const resp = await fetch(url, { credentials: 'include' });
  const json = await resp.json();
  return String(json.data.user.id);  // 返回 "2352174263"
}
```

> `credentials: 'include'` — 同源 API 需要携带微博登录态 cookies

### 第二步：获取相册列表

拿到 UID 后，通过新版 `getImageWall` API 获取用户相册列表（与页面「相册」tab 完全一致）：

```
GET https://weibo.com/ajax/profile/getImageWall
  ?uid=2352174263
  &sinceid=0
  &has_album=true
```

响应格式：

```json
{
  ok: 1,
  data: {
    album_list: [
      {
        containerid: "2318262352174263...profile_album...",
        pic_title: "自拍",
        pic: "https://wx1.sinaimg.cn/...jpg",
        pic_count: 128
      },
      { ... "原创" ... },
      { ... "头像" ... }
    ]
  }
}
```

一般返回 **3 个相册**：自拍、原创、头像。

> 💥 **坑：`has_album=true` 参数忘不得** — 如果不加 `&has_album=true`，getImageWall API 返回的 `data` 中只有 `{ photo_wall: [...] }`（图片墙列表），**没有 `album_list` 字段**。相册探测直接返回空，但不会有任何报错（日志会显示「无相册列表」），是容易忽略的静默失败。

> 💥 **坑：`containerid` 合法性判断** — 不是所有带数字的字段都能当 album id。`looksLikeAlbumId()` 函数检查 3 个条件（任一满足即可）：
>   - 是否包含 `profile_album` → 新版 SPA containerid 特征
>   - 是否纯数字 → 旧版 album_id
>   - 是否以 `231826` 开头 → 微博标准 containerid 前缀
>   - 三个都不满足则跳过该记录，防止无效数据污染相册列表

**降级路径**：如果新 API 失败，使用旧版 `photo.weibo.com/albums/get_all?uid={uid}`（JSONP 格式，需 background 转发）。

---

## 三、获取相册内图片（detectPhotos）

### 新版 API（主路径）

```
GET https://weibo.com/ajax/profile/getAlbumDetail
  ?containerid=2318262352174263...profile_album...
  &since_id=0
```

响应格式：

```json
{
  ok: 1,
  data: {
    list: [
      { pid: "008kvnKyly1i1vp8org4fj337...", ... },
      { pid: "008kvnKyly1i1vp8pexhk234..." }
    ],
    since_id: "1728201600000"
  }
}
```

**分页逻辑**：每次响应带 `since_id`，非 0 时继续请求下一页，最多 50 页。

### 旧版 API（降级）

当新版 API 不可用时走降级路径：

```
GET https://photo.weibo.com/photos/get_all
  ?uid=2352174263
  &album_id=123456789
  &count=30&page=1&type=24
```

JSONP 格式，需要 `fetchText()` 经 content script 转发。

> 💥 **坑：JSONP 解析的 3 层降级** — 旧版 `photo.weibo.com` API 的返回格式**没有标准**，同一接口可能返回：
>   - 纯 JSON（少数）
>   - `callback({...})` 包裹的 JSONP（最常见）
>   - `var data={...}` 或 `var photos=[...]` 变量赋值
>
> `parseJSONP()` 内部依次尝试以下解析策略：
>   1. 直接 `JSON.parse()` → 纯 JSON
>   2. 正则提取 `callback(...)` → JSONP
>   3. 去掉 `var data=`, `var info=`, `var photos=` 前缀 → 变量赋值
>   4. 全部失败 → 返回原始字符串（兜底，由调用方处理）

> 💥 **坑：旧版 API 的 `type` 参数** — `photos/get_all` 的 `type` 参数决定了返回内容：
>   - `type=3` → 对应"微博配图"相册（微博时间线上的图片）
>   - `type=24` → 对应普通相册（自拍/原创/头像等）
>   - 传错了返回空列表，但 HTTP 状态码是 200（隐式失败）
>
> 判别逻辑：`const type = album.name === '微博配图' ? 3 : 24;`

### PID 提取

每条照片记录中，从以下字段按优先级提取 pid：

1. `item.pics[].pid` → 新版 nested 格式
2. `item.pic_ids[]` → 字符串数组
3. `item.pid` → 直接字段

### 翻页去重

> 💥 **坑：翻页返回重复图片** — 新/旧版 API 翻页时都可能返回同一张图（图片被多个相册引用，或越界重复）。`detectPhotos()` 中翻页结束后调用 `this.deduplicate(photos)`，按 `originUrl` 做 Set 去重，防止同一张图在下载任务列表中重复出现。

---

## 四、PID → 图片 URL

### URL 格式

| PID 特征 | 构造 URL |
|----------|---------|
| 任意长度 | `https://wx{N}.sinaimg.cn/large/{pid}.jpg` |

```
例:
  pid = "008kvnKyly1i1vp8org4fj337p3...qv.jpg"
  URL = "https://wx4.sinaimg.cn/large/008kvnKyly1i1vp8org4fj337p3...qv.jpg"
```

**N 值计算**：`simpleHash(pid) & 3 + 1`（1~4 之间）

```typescript
private pidToImageUrl(pid: string, size = 'large'): string {
  const serverNum = (this.simpleHash(pid) & 3) + 1;
  const ext = pid.includes('gif') ? 'gif' : 'jpg';
  return `https://wx${serverNum}.sinaimg.cn/${size}/${pid}.${ext}`;
}
```

> **坑**：旧版本曾按 `pid.length >= 25` 区分新旧格式，但新版 API 返回的短 PID 也可能需要 wx 前缀。**现已统一用 wx 格式**。

### 其他 URL 格式归一化

```typescript
// 将缩略图/中等图等所有尺寸统一转为 large
private normalizeWeiboImageUrl(url: string): string {
  return url
    .replace(/^http:/i, 'https:')
    .replace(/\/(thumbnail|square|mw\d+|orj\d+|small|bmiddle|woriginal)\//i, '/large/');
}
```

---

## 五、下载图片

### 核心流程

```
用户勾选 → 点击下载
    │
    ▼
popup 创建 DownloadTask[]
    │
    ▼
Service Worker 收到任务
    │
    ├─ STRATEGY_B（主路径）:
    │   fetch(task.url, { headers, credentials: 'same-origin' })
    │   → response.blob()
    │   → blobToDataUrl(blob)  // FileReader 转 base64
    │   → chrome.downloads.download({ url: dataUrl, filename })
    │
    └─ STRATEGY_A（备用）:
        chrome.downloads.download({ url: task.url, filename })
        → 依赖 DNR 规则自动添加 Referer 头
```

### 关键：`credentials: 'same-origin'`

这是**最关键的教训**：

| credentials 值 | 跨域 CDN 请求 | 结果 |
|:---:|---|---|
| `'include'` ❌ | 发送 cookies → 触发 CORS credentials 检查 | CDN 的 `Access-Control-Allow-Origin: https://weibo.com` 不匹配扩展 origin → **浏览器丢弃响应体，blob.size = 0** |
| `'same-origin'` ✅ | 不发 cookies → 不触发 CORS credentials 检查 | CDN 正常返回图片 ✅ |

**解释**：
- Extension Service Worker 的 origin 是 `chrome-extension://xxx`
- 跨域 CDN `sinaimg.cn` 的响应头是 `Access-Control-Allow-Origin: https://weibo.com`
- 用 `credentials: 'include'` 时浏览器要求精确匹配，不匹配则丢弃响应体
- 图片是公开资源，不需要 cookies，所以用 `same-origin` 安全

### 请求头

```typescript
const headers = {
  'Referer': task.referer,      // 微博页面 URL，让 CDN 放行
  'Origin': new URL(task.referer).origin,  // https://weibo.com
  'User-Agent': navigator.userAgent
};
```

### DNR（declarativeNetRequest）规则

作为 STRATEGY_A 的备方案，静态规则自动为 CDN 请求添加头：

`sinaimg-referer.json`（`public/rules/`）：

```json
{
  "id": 3,
  "priority": 1,
  "condition": {
    "urlFilter": "*.sinaimg.cn",
    "resourceTypes": ["image", "xmlhttprequest"]
  },
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      { "header": "Referer", "value": "https://weibo.com/" },
      { "header": "Origin", "value": "https://weibo.com" }
    ]
  }
}
```

### 下载排查路线图

```
探测成功但下载为空
  │
  ├─① 检查 blob.size
  │   → =0: credentials 问题（应改为 'same-origin'）
  │   → >0: 正常，继续
  │
  ├─② 检查 PID → URL 格式
  │   → URL 是否可直接浏览器打开？
  │
  ├─③ 检查 DNR 规则是否加载
  │   → chrome://extensions → 查看 activeRules
  │
  └─④ STRATEGY_A 直连下载
      → CDN 是否被盗链保护？
```

---

## 六、完整数据流图

```mermaid
sequenceDiagram
    participant User as 用户页面
    participant CS as Content Script
    participant POP as Popup
    participant SW as Service Worker
    participant API as 微博API
    participant CDN as sinaimg.cn

    User->>CS: 加载 weibo.com/n/xxx?tabtype=album
    CS->>API: fetch(/ajax/profile/info?screen_name=xxx)
    API-->>CS: { data.user.id: "2352174263" }
    CS->>API: fetch(getImageWall?uid=2352174263)
    API-->>CS: { album_list: [自拍, 原创, 头像] }
    CS->>POP: sendMessage(相册列表)

    User->>POP: 展开"自拍"相册
    POP->>CS: requestPhotos(相册ID)
    CS->>API: fetch(getAlbumDetail?containerid=xxx)
    API-->>CS: { list: [{pid}, {pid}, ...] }
    CS->>CS: pidToImageUrl → 完整URL
    CS->>POP: sendMessage(照片列表)

    User->>POP: 勾选照片 → 点击下载
    POP->>SW: sendMessage(START_DOWNLOAD, tasks)
    SW->>CDN: fetch(url, {Referer, 'same-origin'})
    CDN-->>SW: Response(blob)
    SW->>SW: blobToDataUrl → data:image/jpeg;base64,...
    SW->>SW: chrome.downloads.download({url: dataUrl, filename})
```

---

## 七、文件位置

| 文件 | 作用 |
|------|------|
| `src/content/adapters/sites/weibo.ts` | 微博适配器（637行，探测逻辑全部在此） |
| `src/background/downloader.ts` | 下载管理器（fetch→blob→dataURL 逻辑） |
| `src/shared/utils.ts` | `blobToDataUrl()` 等工具函数 |
| `src/popup/store.ts` | 照片列表 → DownloadTask 转换 |
| `public/rules/sinaimg-referer.json` | DNR 规则：sinaimg.cn 加 Referer 头 |
| `public/rules/yupoo-referer.json` | DNR 规则：yupoo 加 Referer 头 |

---

## 八、测试链接

- 相册页：`https://weibo.com/n/冲浪桃浦万?tabtype=album`
- 用户信息 API：`https://weibo.com/ajax/profile/info?screen_name=冲浪桃浦万`
- 验证 UID：`2352174263`

---

## 总结

通过这个项目，可以总结出几条 Chrome 扩展开发中的通用经验：

1. **4 层降级策略**是应对 SPA 页面探测的标配——不要假设 HTML 里有你想要的数据
2. **隐式失败比显式报错更可怕**——`has_album` 忘传、`type` 传错返回的 HTTP 200 但空数据，这类问题 debug 起来极其耗时
3. **Service Worker 无页面 cookie**，跨域请求的 `credentials` 设置要格外谨慎。对公开资源，`'same-origin'` 比 `'include'` 安全
4. **JSONP 解析不要只写一种格式**——国内大厂旧 API 的返回格式五花八门，多一层降级就少一个 bug
