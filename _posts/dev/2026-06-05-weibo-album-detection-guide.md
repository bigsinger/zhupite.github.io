---
layout: post
title: 微博相册探测与图片下载 — 从 API 逆向到 Chrome 扩展落地
categories: [dev]
description: 详解 AlbumDownloader Chrome 扩展的微博相册探测技术：四层 UID 获取策略、新版 getImageWall/getAlbumDetail API 调用、PID→图片 URL 转换、跨域 CDN 下载的 credentials 踩坑与解决方案
keywords: 微博相册, Chrome 扩展, API 逆向, 图片下载, Service Worker, 微博爬虫
tags:
  - Chrome 扩展
  - API 逆向
  - 图片下载
  - 微博
  - MV3
---

## 前言

微博相册（`weibo.com/n/{name}?tabtype=album`）没有一个直接的"一键下载全部"按钮。如果你想备份某个用户的所有相册图片，目前唯一的办法就是写自动化脚本。

本文从技术实现角度，详细拆解一个 Chrome 扩展（AlbumDownloader）是如何完成**相册探测 → 图片列表 → 图片下载**全链路的。核心挑战在于：

1. 微博 SPA 页面不直接在 HTML 中暴露 UID 和 API 地址
2. 存在新/旧两套 API 体系，需要优雅降级
3. 跨域 CDN 图片下载的 credentials 设置稍有不慎就全盘失败

---

## 一、整体架构

扩展采用标准的 Chrome MV3 架构，分为两个执行上下文：

```
┌─ 页面上下文（content script） ─────────────────┐
│  1. 探测相册 → 发消息给 popup                   │
│  2. 用户勾选照片 → 点击下载                     │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
┌─ Service Worker（background） ─────────────────┐
│  3. 收到下载任务                                │
│  4. fetch + blob → data URL → 浏览器下载        │
└────────────────────────────────────────────────┘
```

**分工原则**：
- **content script** 做探测——调用微博同源 API（可携带登录态 cookies）
- **Service Worker** 做下载——fetch 跨域 CDN 图片，转为 data URL 后再下载

---

## 二、探测相册 — 获取 UID 的四层策略

新版微博 SPA 页面 `weibo.com/n/{name}?tabtype=album` **不嵌入任何 UID 到 HTML**，必须通过 API 获取。

探测优先级从高到低，四层兜底：

| # | 方法 | 说明 |
|---|------|------|
| 1️⃣ | **新 API（SPA 主路径）** | `GET /ajax/profile/info?screen_name={name}` → `data.user.id` |
| 2️⃣ | URL 正则 | `weibo.com/u/2352174263` → 直接提取 |
| 3️⃣ | HTML 变量 | `$CONFIG.oid`、`owner_uid` 等页面内嵌数据 |
| 4️⃣ | DOM 属性 | `meta[name="uid"]`、头像 URL 正则估算 |

```typescript
private async fetchUidByScreenName(name: string): Promise<string> {
  const url = `https://weibo.com/ajax/profile/info?screen_name=${encodeURIComponent(name)}`;
  const resp = await fetch(url, { credentials: 'include' });
  const json = await resp.json();
  return String(json.data.user.id);
}
```

> `credentials: 'include'` 是关键——同源 API 需要携带微博登录态 cookies。

---

## 三、获取相册列表

拿到 UID 后，通过 `getImageWall` API 获取用户相册列表（与页面「相册」tab 数据完全一致）：

```
GET https://weibo.com/ajax/profile/getImageWall
  ?uid=2352174263
  &sinceid=0
  &has_album=true
```

一般返回 **3 个相册**：自拍、原创、头像。

> ⚠️ **坑：`has_album=true` 忘不得** — 不加这个参数，API 只返回图片墙（`photo_wall`），没有 `album_list`。这是一个**静默失败**——无报错、无异常，只是返回空数组。

> ⚠️ **坑：`containerid` 合法性判断** — 不是所有数字字段都能当 album id。需要检查是否包含 `profile_album`（新版特征）、是否纯数字（旧版）、或是否以 `231826` 开头（微博标准 prefix）。

**降级路径**：新 API 失败时，走旧版 `photo.weibo.com/albums/get_all?uid={uid}`（JSONP 格式，需 background 转发）。

---

## 四、获取相册内图片

### 新版 API（主路径）

```
GET https://weibo.com/ajax/profile/getAlbumDetail
  ?containerid=2318262352174263...profile_album...
  &since_id=0
```

响应包含 `list[]`（照片列表）和 `since_id`（分页游标）。非 0 时继续请求下一页，最多 50 页。

### 旧版 API（降级）

```
GET https://photo.weibo.com/photos/get_all
  ?uid=2352174263
  &album_id=123456789
  &count=30&page=1&type=24
```

> ⚠️ **坑：JSONP 解析的 3 层降级** — 旧版 API 返回值格式**没有标准**，同一接口可能返回纯 JSON、`callback({...})` JSONP、或 `var data={...}` 变量赋值。需要依次尝试 4 种解析策略。

> ⚠️ **坑：`type` 参数决定内容** — `type=3` 对应"微博配图"（时间线图片），`type=24` 对应普通相册。传错了返回空列表，且 HTTP 状态码是 200（隐式失败）。判别逻辑：`const type = album.name === '微博配图' ? 3 : 24;`

### 去重

新/旧版 API 翻页时可能返回重复图片。翻页结束后做一次 Set 去重（以 `originUrl` 为 key），防止同一张图在下载列表中重复出现。

---

## 五、PID → 图片 URL

微博图片的原始 URL 格式为：

```
https://wx{N}.sinaimg.cn/large/{pid}.jpg
```

N 值（CDN 服务器编号 1~4）通过对 pid 做简单哈希得到：

```typescript
const serverNum = (simpleHash(pid) & 3) + 1;
const ext = pid.includes('gif') ? 'gif' : 'jpg';
return `https://wx${serverNum}.sinaimg.cn/${size}/${pid}.${ext}`;
```

此外，所有非 large 尺寸的 URL（缩略图/中等图等）统一归一化为 large 格式：

```typescript
url.replace(/\/thumbnail|square|mw\d+|orj\d+|small|bmiddle|woriginal)\//i, '/large/');
```

---

## 六、下载图片 — 最关键的踩坑

### 两条策略

| 策略 | 路径 | 说明 |
|------|------|------|
| **STRATEGY_B（主路径）** | fetch → blob → data URL → chrome.downloads | 可控性高，可设 Referer 头 |
| **STRATEGY_A（备用）** | chrome.downloads.download 直连 | 依赖 DNR 规则自动加 Referer |

### 核心教训：credentials 值

这是整个项目**最关键的踩坑**：

| credentials 值 | 跨域 CDN 请求结果 |
|:---:|---|
| `'include'` ❌ | 发送 cookies → 触发 CORS credentials 检查 → CDN 的 `Access-Control-Allow-Origin: https://weibo.com` 不匹配扩展 origin → **浏览器丢弃响应体，blob.size = 0** |
| `'same-origin'` ✅ | 不发 cookies → 不触发 CORS 检查 → **CDN 正常返回图片** |

**原因**：Extension Service Worker 的 origin 是 `chrome-extension://xxx`，与 CDN 配置的 CORS 白名单 `https://weibo.com` 不匹配。图片是公开资源，不需要 cookies，用 `same-origin` 即可。

### DNR 规则作为兜底

作为 STRATEGY_A 的备方案，静态规则自动为 CDN 请求添加 Referer 和 Origin 头：

```json
{
  "id": 3,
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
  │   → >0: 正常
  │
  ├─② 检查 PID → URL 格式是否可浏览器直接打开
  │
  ├─③ 检查 DNR 规则是否已加载（chrome://extensions）
  │
  └─④ STRATEGY_A 直连 → CDN 是否被盗链保护？
```

---

## 七、完整数据流

```
用户页面 → Content Script → Popup → Service Worker → 微博 API / CDN

① 用户加载相册页
② CS 探测 UID（4 层策略）→ 获取相册列表 → 通知 Popup
③ 用户展开相册 → CS 翻页拉取全部照片 PID → 转为完整 URL
④ 用户勾选 → 点击下载 → Popup 创建下载任务 → 发 SW
⑤ SW fetch 图片（credentials: 'same-origin'）→ blob → data URL → 下载
```

---

## 文件位置

| 文件 | 作用 |
|------|------|
| `src/content/adapters/sites/weibo.ts` | 微博适配器（637 行，全部探测逻辑） |
| `src/background/downloader.ts` | 下载管理器（fetch → blob → dataURL） |
| `src/shared/utils.ts` | `blobToDataUrl()` 等工具函数 |
| `src/popup/store.ts` | 照片列表 → DownloadTask 转换 |
| `public/rules/sinaimg-referer.json` | DNR 规则：sinaimg.cn 加 Referer |

---

## 总结

通过这个项目，可以总结出几条 Chrome 扩展开发中的通用经验：

1. **4 层降级策略**是应对 SPA 页面探测的标配——不要假设 HTML 里有你想要的数据
2. **隐式失败比显式报错更可怕**——`has_album` 忘传、`type` 传错返回的 HTTP 200 但空数据，这类问题debug 起来极其耗时
3. **Service Worker 无页面 cookie**，跨域请求的 `credentials` 设置要格外谨慎。对公开资源，`'same-origin'` 比 `'include'` 安全
4. **JSONP 解析不要只写一种格式**——国内大厂旧 API 的返回格式五花八门，多一层降级就少一个 bug

> 测试链接：`https://weibo.com/n/冲浪桃浦万?tabtype=album`（UID: 2352174263）
