---
layout: post
categories: [tool]
title: "OpenSCA-cli：用开源的方式做开源风险治理"
tags: [开源, SCA, 软件成分分析, SBOM, 供应链安全, Go, 安全工具]
description: "OpenSCA-cli 是一个开源的软件成分分析（SCA）工具，用 Go 编写，支持 Java/JS/Python/Rust/Golang 等 8 种语言的依赖解析和漏洞检测。提供 CLI、Docker、IDE 插件多种集成方式，输出 JSON/HTML/SBOM 等多格式报告。"
---

## OpenSCA-cli 是什么

**OpenSCA-cli** 是一个开源的软件成分分析（SCA）工具，由数字供应链安全公司 Xmirror（北京安普诺信息技术有限公司）开发并开源维护。

它的核心工作很简单：**扫描你项目的第三方依赖，告诉你用了什么、有什么漏洞、许可证是否合规。**

口号也很直接——"用开源的方式做开源风险治理"。

> 项目地址：[https://github.com/XmirrorSecurity/OpenSCA-cli](https://github.com/XmirrorSecurity/OpenSCA-cli)
>
> 官网：[https://opensca.xmirror.cn](https://opensca.xmirror.cn)

## 为什么需要 SCA

现代软件项目中，自己写的代码通常只占很小一部分。剩下的都是第三方组件——框架、库、工具包，以及它们的依赖的依赖。

以一个典型的 Spring Boot 项目为例：你手写了几千行业务代码，但 `pom.xml` 里可能引入了上百个间接依赖。这些依赖中的任何一个出现高危漏洞，你的项目就处于风险之中。

Log4j（CVE-2021-44228）就是最典型的案例——漏洞不在你的代码里，在你的依赖里。

SCA 工具的作用，就是把这一团依赖关系理清楚，找出已知漏洞，检查许可证合规性。

## 检测能力一览

OpenSCA-cli 目前支持 8 种语言的依赖解析：

| 语言 | 包管理器 | 解析文件 |
|------|---------|---------|
| Java | Maven | `pom.xml` |
| Java | Gradle | `.gradle` `.gradle.kts` |
| JavaScript | npm | `package-lock.json` `package.json` `yarn.lock` |
| PHP | Composer | `composer.json` `composer.lock` |
| Ruby | gem | `gemfile.lock` |
| Go | gomod | `go.mod` `go.sum` `Gopkg.toml` `Gopkg.lock` |
| Rust | cargo | `Cargo.lock` |
| Erlang | Rebar | `rebar.lock` |
| Python | Pip | `Pipfile` `Pipfile.lock` `setup.py` `requirements.txt` `requirements.in` |

覆盖了当前主流的语言生态。对 Java 和 JavaScript 的支持最为成熟（Maven + Gradle、npm + yarn 双锁定文件）。

## 安装方式

OpenSCA-cli 支持 Windows、Linux、macOS，x86_64 和 arm64 双架构。提供了四种安装方式：

**从 Releases 下载**：直接去 GitHub 下载对应平台的压缩包，解压即用，无需配置环境变量。

**一键安装脚本**（Mac/Linux）：
```shell
curl -sSL https://raw.githubusercontent.com/XmirrorSecurity/OpenSCA-cli/master/scripts/install.sh | sh
```

**Homebrew**：
```shell
brew install opensca-cli
```

**Docker**：
```shell
docker run -ti --rm -v ${PWD}:/src opensca/opensca-cli
```

## 使用方式

基本用法非常简洁：

```shell
opensca-cli -path ${project_path} -config ${config.json} -out output.html -token ${token}
```

几个要点：
- `-path` 指定项目目录，OpenSCA 会自动识别项目类型并解析依赖
- `-out` 指定输出文件，后缀决定了报告格式
- `-config` 指定配置文件，可配置漏洞库来源、忽略路径等
- `-token` 接入云漏洞库服务的凭证

如果已经写好配置文件，直接执行 `opensca-cli` 即可（会自动在多个默认路径查找配置）。

## 报告格式

OpenSCA 在输出格式上的支持相当全面——既覆盖了传统安全报告的格式需求，也支持了多种 SBOM 标准格式：

**检测报告**：JSON、XML、HTML、SQLite、CSV、SARIF

**SBOM 清单**：SPDX、CycloneDX（CDX）、SWID、DSDX、BOMSW

SARIF 格式的支持意味着它可以和 GitHub Code Scanning 等平台集成。SBOM 多种格式的支持则让它在供应链透明化方面更实用——你可以生成 SPDX 格式给客户，同时生成 CycloneDX 格式给内部的漏洞管理系统。

## 漏洞库

OpenSCA 的漏洞检测能力来自两个层面：

**云漏洞库服务**（默认）：兼容 NVD、CNVD、CNNVD 等官方漏洞源，联网即可使用。SaaS 版本支持资产管理、风险全局管理。

**本地漏洞库**：支持 JSON、MySQL、SQLite 三种存储方式。对于离线环境或内部专有漏洞库的场景，可以自行配置。

本地漏洞库的格式也很清晰——每条漏洞记录包含 vendor、product、version 范围、CVE 编号、CWE 编号、漏洞描述、修复建议等字段。版本范围支持区间表示法（如 `[2.0-beta9,2.12.2)||[2.13.0,2.15.0)`），可以精确描述漏洞影响范围。

## 配置文件与忽略规则

配置文件中有一个值得注意的特性：**忽略路径规则**。规则语法兼容 `.gitignore` 写法，支持目录匹配、通配符和 `!` 反选。

```json
{
  "optional": {
    "ignore": [
      "JarCollection/",
      "*.jar",
      "!libs/keep.jar"
    ]
  }
}
```

这在扫描大型项目时很实用——你不需要把整个项目都交给 SCA 扫描，指定忽略目录可以大幅提升扫描速度。

## 谁在用

OpenSCA 在国内开源 SCA 领域有一定的影响力：

- IDE 插件覆盖 JetBrains 和 VSCode 两大生态
- 支持作为流水线脚本集成到 CI/CD 流程
- Docker 镜像在 Docker Hub 上有持续的下载量
- 曾获得多项国内外技术创新奖项

## 一点评价

OpenSCA-cli 是国内开源 SCA 工具中值得关注的一个。有几点值得记录：

1. **Go 语言实现，零依赖部署**。单二进制文件，下载即用，对 CI/CD 集成非常友好
2. **输出格式覆盖全面**。从 HTML 报告到 SPDX SBOM，兼顾了开发者和合规审计的需求
3. **多云漏洞库支持**。默认走云端，也支持完全离线部署，对军工、金融等敏感环境比较实用
4. **中英文双语社区支持**。有国内 Gitee/Gitcode 镜像，解决了网络可达性问题

如果你正在做软件供应链安全建设，或者只是想知道自己的项目引入了哪些"隐形"的依赖风险，OpenSCA-cli 是一个值得放入工具箱的选择。

---

**参考链接：**
- GitHub 仓库：[https://github.com/XmirrorSecurity/OpenSCA-cli](https://github.com/XmirrorSecurity/OpenSCA-cli)
- 官网：[https://opensca.xmirror.cn](https://opensca.xmirror.cn)
- Docker Hub：[https://hub.docker.com/r/opensca/opensca-cli](https://hub.docker.com/r/opensca/opensca-cli)
- JetBrains 插件：[OpenSCA XCheck](https://plugins.jetbrains.com/plugin/18246-opensca-xcheck)
- VSCode 插件：[xmirror.opensca](https://marketplace.visualstudio.com/items?itemName=xmirror.opensca)
