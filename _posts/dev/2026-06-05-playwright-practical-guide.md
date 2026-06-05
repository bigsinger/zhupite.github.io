---
layout: post
title: Playwright 实战指南 — 从入门到 Web 自动化测试
categories: [dev]
description: 基于 AlbumDownloader 项目实际使用经验整理的 Playwright 完整实战指南，涵盖安装配置、元素定位、Browser Context、网络拦截 Mock、CDP 直连、Chrome 扩展配合、反爬虫对抗、测试框架集成等全部核心能力
keywords: Playwright, Web 自动化, Chrome 扩展, CDP, 反爬虫, 测试框架
tags:
  - Playwright
  - Web 自动化
  - Chrome 扩展
  - CDP
  - 反爬虫
---

# Playwright 实战指南

> 从入门到 Web 自动化测试 — 基于 AlbumDownloader 项目的实际使用经验

---

## 一、Playwright 是什么

Playwright 是微软开发的开源 Web 自动化框架（Apache-2.0 协议），GitHub ⭐70,000+。

### 核心能力

| 能力 | 说明 |
|------|------|
| **多浏览器** | Chromium、Firefox、WebKit（Safari）三引擎统一 API |
| **多语言** | TypeScript/JavaScript、Python、Java、C# |
| **自动等待** | 定位元素时自动等待到可操作，无需手动 sleep |
| **网络拦截** | mock API、修改请求/响应、等待特定请求 |
| **无头/有头** | 支持 headless（无界面）和 headed（有界面）模式 |
| **截图/录屏** | 全页截图、元素截图、操作视频录制 |
| **跨域处理** | 自带 Cookie/Storage 管理，支持多 Context 隔离 |
| **CDP 直连** | 可连接已有浏览器（`connect_over_cdp`） |

### 与 Puppeteer 的区别

| 对比项 | Playwright | Puppeteer |
|--------|-----------|-----------|
| 浏览器支持 | Chromium + Firefox + WebKit | 仅 Chromium |
| 语言支持 | TS/JS/Python/Java/C# | 仅 TS/JS |
| 自动等待 | ✅ 原生内置 | ❌ 需手动 |
| 网络拦截 | ✅ 完整 API | ✅ 完整 API |
| 移动端模拟 | ✅ 内置设备模拟 | ✅ 需额外配置 |
| 性能 | ✅ 略优（并行架构） | ✅ 成熟稳定 |
| 维护方 | 微软（活跃） | Google（维护） |

---

## 二、安装

### 2.1 使用 npm（推荐项目级）

```bash
# 在项目目录中
npm init -y
npm install playwright

# 安装浏览器（Chromium + Firefox + WebKit）
npx playwright install

# 或仅安装 Chromium（最快）
npx playwright install chromium

# 安装后验证
npx playwright --version
```

### 2.2 使用 Python

```bash
pip install playwright
playwright install           # 安装所有浏览器
playwright install chromium  # 仅 Chromium
```

### 2.3 在 Windows 上的注意事项

- **安装路径**：浏览器二进制文件默认下载到 `%USERPROFILE%\AppData\Local\ms-playwright\`
- **Windows 防火墙**：首次启动浏览器时可能会弹出防火墙提示，允许即可
- **中文输入法**：`page.type()` 在中文输入法开启时可能异常，建议用 `page.fill()` 替代

### 2.4 验证安装

```bash
# TypeScript
npx playwright test --help

# 运行内置 demo
npx playwright test example.spec.ts

# Python
python -c "from playwright.sync_api import sync_playwright; print('OK')"
```

---

## 三、基础使用

### 3.1 启动浏览器与页面

#### TypeScript

```typescript
import { chromium } from 'playwright';

// 启动浏览器
const browser = await chromium.launch({
  headless: false,  // false = 有界面，true = 无头
  slowMo: 100,      // 操作间延迟（毫秒），调试时好用
});

// 创建页面
const page = await browser.newPage();

// 导航
await page.goto('https://example.com');

// ... 执行操作 ...

// 关闭
await browser.close();
```

#### Python

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto('https://example.com')
    # ... 操作 ...
    browser.close()
```

### 3.2 导航与等待

```typescript
// 基本导航
await page.goto('https://example.com');
await page.goto('https://example.com', { waitUntil: 'networkidle' });

// 导航等待选项
// 'load'       — load 事件触发（默认）
// 'domcontentloaded' — DOM 解析完成
// 'networkidle' — 网络空闲（500ms 无请求）
// 'commit'     — 收到响应头

// 后退/前进
await page.goBack();
await page.goForward();

// 刷新
await page.reload();

// 等待特定 URL
await page.waitForURL('**/login**');
```

### 3.3 截图

```typescript
// 全页截图
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// 元素截图
const element = page.locator('.main-content');
await element.screenshot({ path: 'element.png' });

// 指定区域
await page.screenshot({
  path: 'clip.png',
  clip: { x: 100, y: 100, width: 500, height: 300 }
});
```

---

## 四、元素定位（Locator 系统）

Playwright 推荐使用 `locator()` API 定位元素，支持自动等待和重试。

### 4.1 定位策略

| 策略 | 示例 | 说明 |
|------|------|------|
| **文本** | `page.getByText('登录')` | 按可见文本匹配 |
| **角色** | `page.getByRole('button', { name: '提交' })` | 按 ARIA 角色+名称 |
| **标签** | `page.locator('button')` | CSS 选择器 |
| **占位符** | `page.getByPlaceholder('请输入密码')` | input placeholder |
| **标题** | `page.getByTitle('关闭')` | title 属性 |
| **alt 文本** | `page.getByAltText('logo')` | img alt 属性 |
| **标签关联** | `page.getByLabel('用户名')` | label for / aria-labelledby |
| **测试 ID** | `page.getByTestId('submit-btn')` | `data-testid` 属性 |

### 4.2 组合定位

```typescript
// 链式定位
const table = page.locator('table.data-table');
const row = table.locator('tr').filter({ hasText: '完成' });
const cell = row.locator('td').nth(2);

// 过滤
page.locator('li').filter({ hasText: '待办' });
page.locator('button').filter({ has: page.locator('.icon-download') });

// 包含文本
page.locator('text=确认删除');
page.locator('button:has-text("确认")');
```

### 4.3 操作

```typescript
// 点击
await button.click();
await button.click({ force: true });       // 强制点击（绕过可操作性检查）
await button.click({ timeout: 5000 });      // 自定义超时

// 输入
await input.fill('Hello World');             // 清空后输入（推荐，更快）
await input.type('Hello', { delay: 50 });    // 模拟键盘输入（较慢）

// 选择
await select.selectOption('option-value');

// 勾选
await checkbox.check();
await checkbox.uncheck();

// 键盘
await page.keyboard.press('Enter');
await page.keyboard.press('Control+A');

// Hover
await element.hover();
```

### 4.4 自动等待规则

Playwright 定位元素的默认超时是 30 秒。在 30 秒内，系统会**自动重试**直到元素满足以下所有条件：

1. **元素附着**到 DOM
2. **可见**：非 `display:none`、非 `visibility:hidden`、在视口内
3. **稳定**：位置不再变化（两次 `getBoundingClientRect` 相同）
4. **可接收事件**：未被其他元素遮挡
5. **已启用**：非 `disabled`

> **这才是 Playwright 最核心的优势** — 不需要写 `sleep(1000)` 等页面加载。

---

## 五、Browser Context 与多页管理

### 5.1 Browser Context

每个 Context 相当于一个**独立的浏览器会话**，隔离 Cookie、Storage、缓存：

```typescript
const browser = await chromium.launch();

// 创建两个隔离的会话
const ctx1 = await browser.newContext();
const ctx2 = await browser.newContext();

// 每个 Context 有自己的页面
const page1 = await ctx1.newPage();
const page2 = await ctx2.newPage();

// Context 间数据完全隔离
await page1.goto('https://example.com/login');
// ctx2 完全不共享 ctx1 的登录态
```

### 5.2 模拟环境

```typescript
// 移动端模拟
const iphone = devices['iPhone 13 Pro'];
const ctx = await browser.newContext({
  ...iphone,
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai'
});

// 地理位置模拟
await browser.newContext({
  geolocation: { longitude: 120.15, latitude: 30.28 },
  permissions: ['geolocation']
});

// 用户代理
await browser.newContext({
  userAgent: 'Mozilla/5.0 ... Chrome/120.0.0.0'
});
```

### 5.3 Cookie 管理

```typescript
// 获取所有 Cookie
const cookies = await context.cookies();

// 添加 Cookie（如注入登录态）
await context.addCookies([
  {
    name: 'session',
    value: 'your-session-token',
    domain: '.example.com',
    path: '/'
  }
]);

// 清除 Cookie
await context.clearCookies();

// 持久化（保存认证状态）
await context.storageState({ path: 'auth.json' });

// 恢复认证状态
const ctx = await browser.newContext({ storageState: 'auth.json' });
```

---

## 六、网络拦截与 Mock

### 6.1 拦截请求

```typescript
// 拦截并打印所有请求
page.on('request', request => {
  console.log(`>> ${request.method()} ${request.url()}`);
});

page.on('response', response => {
  console.log(`<< ${response.status()} ${response.url()}`);
});

// 等待特定请求完成
const [response] = await Promise.all([
  page.waitForResponse(resp => resp.url().includes('/api/data')),
  page.click('#load-data-btn')
]);
const data = await response.json();
```

### 6.2 Mock API

```typescript
// 拦截并返回 mock 数据
await page.route('**/api/user', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 1, name: 'Mock User' })
  });
});

// 修改请求（如添加 Referer）
await page.route('**/*.jpg', async route => {
  const headers = {
    ...route.request().headers(),
    'Referer': 'https://weibo.com/'
  };
  await route.continue({ headers });
});

// 阻塞特定请求（如图片）
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
```

### 6.3 等待特定 API 数据

```typescript
// ⭐ 模式：等待 API 返回后再操作
const [apiResponse] = await Promise.all([
  page.waitForResponse(response =>
    response.url().includes('/ajax/profile/getImageWall')
  ),
  page.click('#load-albums')     // 触发 API 调用
]);
const albums = await apiResponse.json();
console.log('相册列表:', albums);
```

---

## 七、CDP 直连 — 连接已有浏览器

### 7.1 场景

当需要操作**用户已经在使用的浏览器**（已有登录态、已打开页面），而不是新启动浏览器时。

### 7.2 启动 Chrome 调试模式

```bash
# 关闭所有 Chrome 进程
taskkill /F /IM chrome.exe

# 以调试模式启动（Windows）
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 \
  --restore-last-session

# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222

# Linux
google-chrome --remote-debugging-port=9222
```

### 7.3 Connect Over CDP

```typescript
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://localhost:9222');

// 获取已有页面
const context = browser.contexts()[0];
const pages = context.pages();
console.log(`已有 ${pages.length} 个标签页`);

// 也可创建新标签页
const page = await browser.newPage();
await page.goto('https://example.com');
// 注意：新页面在用户浏览器中直接打开
```

### 7.4 获取所有标签页

```bash
# 查看所有打开的页面
curl http://localhost:9222/json | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, d in enumerate(data):
    print(f'[{i}] {d[\"title\"][:60]}')
    print(f'    {d[\"url\"][:80]}')
"
```

### 7.5 限制与注意事项

| 限制 | 说明 |
|------|------|
| **需要预先启动** | Chrome 必须以 `--remote-debugging-port` 启动 |
| **首次会关窗口** | 用 `taskkill` 关闭 Chrome 后再重启，所有标签页会自动恢复 |
| **安全问题** | 9222 端口默认只监听 localhost，远程访问可能有安全风险 |
| **内容脚本** | CDP 连接的页面中，Chrome 扩展的 content script 仍然运行 |

> **项目经验**：在 AlbumDownloader 项目中，我们用 CDP 直连用户已有的 Chrome 来获取内网页面内容（网易内网文章），以及验证扩展在真实浏览器中的行为。注意直接 `npx playwright test` 方式运行会被微博等网站的反爬机制拦截。

---

## 八、与 Chrome 扩展配合使用

### 8.1 加载未打包扩展

```typescript
const path = require('path');

const browser = await chromium.launch({
  headless: false,
  args: [
    `--disable-extensions-except=${path.resolve('./dist')}`,
    `--load-extension=${path.resolve('./dist')}`,
  ],
});
```

### 8.2 处理扩展页面

```typescript
// 获取扩展的背景页面（Service Worker）
const backgroundUrl = 'chrome-extension://your-extension-id/background.html';
const context = browser.contexts()[0];
const bgPage = await context.newPage();
await bgPage.goto(backgroundUrl);

// 或者监听扩展的日志
page.on('console', msg => {
  if (msg.text().includes('[AlbumDownloader]')) {
    console.log('扩展日志:', msg.text());
  }
});
```

### 8.3 连接已有扩展

```typescript
// 通过 CDP 连接已有 Chrome（扩展已安装）
const browser = await chromium.connectOverCDP('http://localhost:9222');

// 获取扩展的 Service Worker 控制台
for (const ctx of browser.contexts()) {
  for (const p of ctx.pages()) {
    const url = p.url();
    if (url.startsWith('chrome-extension://')) {
      console.log('扩展页面:', url);
    }
  }
}
```

---

## 九、测试框架集成

### 9.1 作为测试运行器

```bash
# 安装 Playwright Test
npm init playwright@latest

# 运行所有测试
npx playwright test

# 运行特定文件
npx playwright test tests/weibo.spec.ts

# 有界面运行（调试用）
npx playwright test --headed

# 显示测试报告
npx playwright show-report
```

### 9.2 与 Vitest 集成

```typescript
// weibo-adapter.test.ts
import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

test('should detect weibo albums from API', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Mock API
  await page.route('**/ajax/profile/info?screen_name=**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: 1,
        data: { user: { id: 2352174263 } }
      })
    });
  });

  // Mock 相册 API
  await page.route('**/ajax/profile/getImageWall**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: 1,
        data: {
          album_list: [
            { containerid: '231826...', pic_title: '自拍', pic_count: 128 },
            { containerid: '231826...', pic_title: '原创', pic_count: 256 },
          ]
        }
      })
    });
  });

  await page.goto('https://weibo.com/n/testuser?tabtype=album');
  // ... 验证扩展行为 ...
  await browser.close();
});
```

### 9.3 测试报告

Playwright Test 自动生成 HTML 报告，包含：
- 成功/失败/跳过统计
- 每个测试的截图（失败时自动截）
- 执行时间线
- 追踪信息（Trace Viewer）

```bash
npx playwright show-report
```

---

## 十、反爬虫对抗实践

### 10.1 常见反爬机制

| 机制 | 检测方式 | Playwright 应对 |
|------|---------|---------------|
| **WebDriver 检测** | `navigator.webdriver` | Playwright 默认不暴露 |
| **User-Agent** | 检查浏览器标识 | `browser.newContext({ userAgent })` 覆盖 |
| **IP 频率限制** | 单位时间请求数超限 | 控制操作间隔、代理池 |
| **行为验证** | 鼠标轨迹/操作模式 | 非 headless 模式 + human-like 鼠标 |
| **CDN 防盗链** | 检查 Referer/Origin | 请求拦截添加 Referer 头 |
| **验证码** | 图灵测试 | 人工介入 / OCR 服务 |

### 10.2 降低被检测的技巧

```typescript
// 1. 非无头模式（headed 有界面模式）
const browser = await chromium.launch({ headless: false });

// 2. 模拟真人操作
await page.mouse.move(100, 200);  // 移动鼠标
await page.waitForTimeout(500);   // 停顿（仅在需要时用）
await page.mouse.click(100, 200);

// 3. 自定义 User-Agent
await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
});

// 4. 设置 Cookie/Storage（模拟已登录状态）
await context.addCookies([/* ... */]);

// 5. 随机操作间隔（避免固定频率）
const delay = () => new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
```

### 10.3 Playwright 被拦截后的替代方案

> **项目教训**：用 Playwright 直接 `page.goto()` 打开微博相册页会被反爬拦截，返回空白页或验证码页。替代方案：

| 方案 | 适用场景 | 说明 |
|------|---------|------|
| **CDP 直连** | 用户已有浏览器和登录态 | 通过 `connectOverCDP` 连接用户正在使用的 Chrome |
| **Chrome 扩展** | 需要长驻页面操作 | 扩展的 content script 在页面原生环境中执行，不走 WebDriver |
| **真实浏览器安装** | 开发测试 | 直接把 unpacked extension 加载到 Chrome，手动操作验证 |

---

## 十一、项目实战经验

### 11.1 AlbumDownloader 项目中的 Playwright 应用

| 用途 | 方式 | 是否成功 |
|------|------|---------|
| 获取内网页面内容 | CDP 直连用户 Chrome | ✅ |
| 自动化测试 Weibo 适配器 | Playwright 直接启动浏览器 | ❌（被反爬拦截） |
| 验证扩展下载逻辑 | 用户手动在 Chrome 加载扩展 | ✅（手动操作） |
| Web 自动化框架调研 | 全局框架对比 | ✅（纳入文档） |

### 11.2 具体代码片段 — CDP 直连

```bash
# 步骤 1：关闭用户 Chrome 并以调试模式重启
taskkill /F /IM chrome.exe
"C:\Program Files\Google\Chrome\Application\chrome.exe" \
  --remote-debugging-port=9222 --restore-last-session

# 步骤 2：连接并获取页面
python3 -c "
import json, urllib.request
tabs = json.loads(urllib.request.urlopen('http://localhost:9222/json').read())
for t in tabs:
    print(f'[{t[\"id\"][:20]}] {t[\"title\"][:60]}')
    print(f'    {t[\"url\"][:80]}')
"
```

```typescript
// 步骤 3：用 Playwright 操作
const browser = await chromium.connectOverCDP('http://localhost:9222');
const pages = browser.contexts()[0].pages();
const targetPage = pages.find(p => p.url().includes('netease.com'));
const content = await targetPage.evaluate(() =>
  document.querySelector('article')?.innerText || 'not found'
);
```

### 11.3 踩坑总结

| 坑 | 说明 | 解决方案 |
|----|------|---------|
| **微博/淘宝反爬** | 直接 Playwright `page.goto()` 被拦截 | 改用 CDP 直连用户真实浏览器 |
| **无头模式更易被检测** | `headless: true` 时反爬检测率极高 | 用 `headless: false` |
| **中文输入异常** | `page.type()` 在中文输入法下异常 | 用 `page.fill()` 替代 |
| **扩展 Service Worker** | `page.waitForURL()` 不匹配 `chrome-extension://` | 用 `browser.contexts()` 遍历 |
| **CDP 端口 9222 被占用** | 之前启动的调试进程未关闭 | 先 `taskkill` 清除 |
| **Chrome 版本不匹配** | Playwright 下载的 Chromium 与系统版本不同 | 用 `channel: 'chrome'` 使用系统安装的浏览器 |

---

## 十二、调试技巧

```bash
# 1. 使用 PWDEBUG 环境变量（DevTools 模式）
PWDEBUG=1 npx playwright test

# 2. 慢速运行（看清每一步）
const browser = await chromium.launch({ slowMo: 500 });

# 3. 录制操作脚本
npx playwright codegen https://example.com

# 4. 保留浏览器（调试不关闭）
const browser = await chromium.launch({ headless: false });
await page.pause();  // 在此暂停，手动检查

# 5. Trace Viewer（记录完整操作回放）
npx playwright test --trace on
npx playwright show-trace trace.zip

# 6. 截图比较
await expect(page).toHaveScreenshot('homepage.png');
```

---

## 十三、快速参考

### 安装速查

```bash
# 方式	命令
npm 	npm install playwright
npx 	npx playwright install chromium
Python 	pip install playwright && playwright install
```

### 常用命令

```bash
# 命令	说明
npx playwright test	运行所有测试
npx playwright test --headed	有界面运行
npx playwright show-report	查看测试报告
npx playwright codegen	录制操作脚本
npx playwright test --debug	调试模式
```

### 最佳实践总结

1. **优先用 `locator` API**，而不是 `$()`，自动等待省去 sleep
2. **用 `page.fill()`** 而不是 `page.type()`，更快更稳定
3. **用 `Promise.all` 模式**等待 API 和点击同时完成
4. **不要用固定 `waitForTimeout`**，用 `waitForSelector`、`waitForResponse` 替代
5. **每个测试创建独立 Context**，避免状态污染
6. **失败截图默认开启**，用 `show-report` 查看
7. **对强反爬站点**，放弃 Playwright 纯自动化，改用 CDP 直连或浏览器扩展
