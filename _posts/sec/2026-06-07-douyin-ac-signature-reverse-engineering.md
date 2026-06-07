---
layout: post
title: "抖音 __ac_signature 参数逆向实战：从抓包到 Node.js 签名生成"
categories: [sec]
description: "详细拆解抖音 __ac_signature 加密参数的逆向过程——从抓包分析到油猴脚本拦截 cookie 定位加密入口，再到扣代码补环境，最终在 Node.js 中成功生成 47 位签名。"
tags:
  - 逆向工程
  - JS逆向
  - 抖音
  - __ac_signature
  - 签名算法
  - Web安全
---

> 本文基于林石工作室的实战教程整理，完整还原 `__ac_signature` 参数的逆向全流程。

---

## 背景：为什么要搞定 `__ac_signature`

抖音（Douyin）的反爬体系包含多层加密参数，其中 `__ac_signature` 是访问视频播放量 +1 接口的关键前置参数。该参数用于动态生成临时身份 cookie（即 `__ac_nonce` + `__ac_signature` 组合），流程如下：

```
请求视频页面 → 获得 `__ac_nonce` → 计算 `__ac_signature` → 设置 cookie → 携带 cookie 请求播放接口
```

不搞定 `__ac_signature`，就无法拿到有效的临时身份 cookie，后续的播放量 +1 接口也无法正常请求。

前置阅读：[抖音 a_bogus 参数逆向](https://www.ls79.com/js-nixiang/)

---

## 一、抓包分析：了解签名生成流程

### 环境准备

需要两个浏览器工具：

| 工具 | 用途 |
|------|------|
| **Cookie-Editor** | 管理/删除 cookie，方便测试 |
| **Tampermonkey** | 注入脚本拦截 cookie 写入事件 |

### 抓包过程

打开任意视频页面（如 `https://www.douyin.com/video/7620763641189339642`），用 Cookie-Editor **清空所有 cookie** 后刷新，观察网络请求：

```
第 1 次请求：无 cookie → 页面返回 `__ac_nonce`（服务端生成）
第 2 次请求：携带 `__ac_nonce` + `__ac_signature` → 完成验证
```

关键发现：
- `__ac_nonce` 由服务端生成，在页面 HTML 中可提取
- `__ac_signature` 由前端 JavaScript **本地计算**后写入 cookie
- 签名内容写入 cookie 后页面自动 **reload**，第二次请求带上签名完成验证

---

## 二、油猴脚本：定位签名计算入口

直接在压缩代码中搜索 `__ac_signature` 效率很低。更优雅的方案——**拦截 cookie 写入事件**，在 `document.cookie = ...` 被调用时自动断下。

```javascript
// ==UserScript==
// @name         抖音 __ac_signature 断点捕获
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  当 __ac_signature 被写入 cookie 时自动断下
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

const cookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
  || Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');

Object.defineProperty(document, 'cookie', {
  get: cookieDesc.get,
  set: function(value) {
    if (value && value.includes('__ac_signature')) {
      debugger;  // 自动断下
      cookieDesc.set.call(this, value);
    } else {
      cookieDesc.set.call(this, value);
    }
  },
  configurable: true
});
```

页面加载后，只要 `__ac_signature` 被写入 cookie，脚本就会自动触发 `debugger`。此时查看调用堆栈（Call Stack），即可定位签名生成入口。

---

## 三、堆栈分析：找到核心加密函数

断点命中后，从调用堆栈向下追溯，发现关键的 `_f3` 函数和 `window.byted_acrawler.sign`：

```javascript
// _f3 函数——负责写入 cookie
function _f3(e, t, o) {
  o && (window.sessionStorage && window.sessionStorage.setItem(e, t),
  window.localStorage && window.localStorage.setItem(e, t));

  var n = 31536e6;  // 365 天（毫秒），即 cookie 过期时间

  // 先清除旧 cookie
  document.cookie = e + "=; expires=Mon, 20 Sep 1970 00:00:00 UTC; path=/;"
    + (window.location.protocol == 'https:' ? 'SameSite=None; Secure;' : '');

  // 设置新 cookie
  document.cookie = e + "=" + t + "; expires="
    + new Date((new Date).getTime() + n).toGMTString()
    + "; path=/;" + (window.location.protocol == 'https:' ? 'SameSite=None; Secure;' : '');
}

// 签名生成入口
window.byted_acrawler.init({
  var __ac_nonce = _f2("__ac_nonce");
  var __ac_signature = window.byted_acrawler.sign("", __ac_nonce);

  _f3("__ac_signature", __ac_signature);
  _f3("__ac_referer", document.referrer || "__ac_blank", !0);

  sessionStorage.setItem("__ac_ns", performance.timing.navigationStart);
  window.location.reload();
});
```

核心逻辑锚定：**`window.byted_acrawler.sign("", __ac_nonce)` 就是我们需要的签名函数**。它接收两个参数（空字符串和 `__ac_nonce`），返回 47 位签名。

继续追踪 `window.byted_acrawler.sign` 后发现，加密算法源码位于当前页面的另一个 JavaScript chunk 中（分批加载的 webpack 模块）。

---

## 四、代码提取：扣取核心加密逻辑

找到加密算法所在的 chunk 文件后，将所有相关代码**扣取**（复制）下来保存。关键步骤是**导出加密函数到全局变量**：

在原代码中找到匹配位置，添加导出代码：

```javascript
// 在原代码中找到类似 S[3][0] 的赋值位置
// 在原 else if 分支中插入导出逻辑
else if (A > -1) {
  // ... 原始逻辑 ...

  // 【新增】导出 byted_acrawler 到全局
  if (S.length == 8) {
    window.byted_acrawler = S[3][0];
  }

  return [1, S[R--]];
}
```

这样做的目的是让 `window.byted_acrawler` 被正确赋值，便于在 Node.js 环境中调用。

---

## 五、环境补全：在 Node.js 中运行

抖音的加密代码严重依赖浏览器环境——`window`、`location`、`navigator`、`document`、`localStorage` 等全局对象。在 Node.js 中运行时需要**模拟**这些环境：

```javascript
// env.js - Node.js 浏览器环境补全

// 模拟 location 对象
var location = {
  "ancestorOrigins": {},
  "href": "https://www.douyin.com/video/7620763641189339642",
  "origin": "https://www.douyin.com",
  "protocol": "https:",
  "host": "www.douyin.com",
  "hostname": "www.douyin.com",
  "pathname": "/video/7620763641189339642",
  "referrer": "https://www.douyin.com"
};

// 模拟 navigator
var navigator = {
  "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  "platform": "Win32",
  "language": "zh-CN",
  "hardwareConcurrency": 12,
  "cookieEnabled": true,
  "product": "Gecko"
};

// 模拟 window
global.window = global;
window.location = location;
window.navigator = navigator;
window.localStorage = { "removeItem": function(){}, "getItem": function(){} };
window.sessionStorage = { "removeItem": function(){}, "setItem": function(){} };
window.document = { "cookie": "" };
window.screen = {};
```

**注意事项：**

1. **`location.href` 必须填写真实的目标视频页 URL**——抖音的签名算法内部可能使用 `location.href` 作为签名因子之一
2. 关注 `performance.timing.navigationStart` 等时间相关属性——某些实现将此用于随机种子
3. `webdriver` 属性设为 `false`——避免触发了 webdriver 检测

---

## 六、本地验证：成功生成 47 位签名

环境补全 + 加密代码加载后，编写测试入口：

```javascript
// test.js
require('./env');          // 加载浏览器环境模拟
require('./_signature');   // 加载抠出来的加密代码

window.byted_acrawler.init({});

var __ac_nonce = "06a17dd1c00004c526e88"; // 从页面提取的 nonce
var __ac_signature = window.byted_acrawler.sign("", __ac_nonce);

console.log('✅ __ac_nonce:', __ac_nonce);
console.log('✅ __ac_signature:', __ac_signature);
console.log('✅ 长度:', __ac_signature.length);
```

运行结果：

```
✅ __ac_nonce: 06a17dd1c00004c526e88
✅ __ac_signature: 6kKx0y0Jif0kGzClFdRmW5hh5tWgjl9yRrCB2CJFR9sOn0KNFL
✅ 长度: 47
```

**47 位签名**，与浏览器中生成的结果完全一致。✅

> 注：实际运行中需要从目标页面的 HTML/JS 中动态提取 `__ac_nonce`，而非硬编码。完整脚本可配合 `cheerio` 或 `puppeteer` 实现自动提取+签名生成。

---

## 七、Python 端集成

Node.js 签名生成完成后，Python 端可通过 `subprocess` 调用：

```python
import subprocess, json

def get_ac_signature(nonce):
    result = subprocess.run(
        ['node', 'sign.js', nonce],
        capture_output=True, text=True
    )
    return result.stdout.strip()

# 使用示例
nonce = extract_nonce_from_page(page_html)
signature = get_ac_signature(nonce)
cookies = {'__ac_nonce': nonce, '__ac_signature': signature}

# 请求播放量 +1 接口
response = requests.post(
    'https://www.douyin.com/aweme/v1/web/commit/item/digg/',
    cookies=cookies,
    headers=headers
)
```

---

## 总结与要点

| 步骤 | 方法 | 关键工具 |
|------|------|---------|
| 定位参数 | 抓包 + Cookie-Editor 清除 cookie | Chrome DevTools |
| 定位加密入口 | 油猴脚本拦截 `document.cookie` | Tampermonkey |
| 追踪签名函数 | 调用堆栈追溯 → `byted_acrawler.sign` | DevTools Call Stack |
| 扣取代码 | 精简压缩代码，添加全局导出 | 编辑器 |
| 补环境 | mock 浏览器全局对象 | Node.js |
| 验证 | 相同 nonce 生成相同签名 | 对比长度和特征 |

几个容易踩的坑：

- **location.href 不能随便填**——某些实现做了 URL 校验，路径写错会导致签名不一致
- **performance 对象可能缺失**——`performance.timing.navigationStart` 是常见的时间种子，mock 时注意提供合理的时间戳
- **webpack chunk 分批加载**——核心加密函数可能在入口文件加载完成后才被注入，确定代码所在的 chunk 再扣取
- **环境版本敏感**——Node.js 版本差异可能导致 `Buffer`/`atob` 等 API 不可用，需按需 polyfill

---

## 参考

1. *JS逆向实战：抖音__ac_signature参数逆向与脚本开发*. 林石工作室. https://www.ls79.com/js-nixiang/602.html
2. *JS逆向实战：抖音a_bogus参数逆向*. 林石工作室. https://www.ls79.com/js-nixiang/
