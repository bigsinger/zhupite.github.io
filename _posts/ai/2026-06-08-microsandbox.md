---
layout: post
title: "MicroSandbox — 为 AI Agent 打造的微型沙箱"
date: 2026-06-08 00:00:00 +0800
categories: [ai]
tags: [Rust, sandbox, AI, agent, microVM, 开源项目]
description: "MicroSandbox 是一个基于 microVM 技术的轻量级沙箱解决方案，专为 AI Agent 设计，可在毫秒级启动隔离环境，支持本地优先部署。"
---

# MicroSandbox — 为 AI Agent 打造的微型沙箱

## 工具简介

**MicroSandbox**（[GitHub](https://github.com/superradcompany/microsandbox)）是由 superradcompany 开发的开源项目，使用 **Rust** 语言编写，当前拥有 **6450** 颗星。它为 AI Agent 提供了**本地优先、基于 microVM 的可编程沙箱环境**，让每个 Agent 拥有自己的安全隔离的"计算机"。

## 核心特性

- **硬件级隔离**：基于 microVM 技术，提供真正的硬件级沙箱隔离
- **毫秒级启动**：平均启动时间低于 100 毫秒
- **嵌入式设计**：可直接在代码中启动 VM，无需单独部署服务器
- **本地优先**：运行在本地机器上，无需云端依赖
- **无驻留守护进程**：用完即销毁，不留后台进程
- **密钥安全**：采用不可被利用的安全设计，防止机密泄露
- **跨平台支持**：支持 Linux、macOS、Windows

## 技术栈

- **语言**：Rust（核心）、TypeScript（SDK）
- **技术**：microVM、虚拟化、容器化
- **协议**：MCP（Model Context Protocol）
- **许可证**：Apache-2.0

## 适用场景

- AI Agent 的代码执行沙箱
- 多租户隔离环境
- 安全的第三方代码运行
- 开发测试环境快速搭建
