---
layout:		post
category:	"program"
title:		"通过为VSCode配置schema和用户代码片段提高编辑json的效率"

tags:		[gradle]
---
- Content
{:toc}


# 参考

- [JSON editing in Visual Studio Code](https://code.visualstudio.com/docs/languages/json)
- [基于JSON Schema的JSON智能提示](http://www.ayqy.net/blog/vscode-json-validation/)



# 快捷键

- 触发建议：  `Ctrl+Space`，与搜狗输入法冲突，建议把快捷键修改下。
- 快速导航： `Ctrl+Shift+O` 
- 格式化：`Shift+Alt+F`

# schema

为`vscode`配置`settings.json`（菜单：文件 - 首选项 - 设置）：

```json
{
    "security.workspace.trust.untrustedFiles": "open",
    "editor.fontSize": 18,
    "json.schemas": [ {
        "fileMatch": [ "/abcxyz.json" ],
        "url": "file:///F:/xxx/yyy/schema.json"
    }
                    ]
}
```

使用`defaultSnippets`属性可为给定 JSON 对象指定任意数量的片段。`default`字段可用于 JSON 自动补全（VS Code 默认支持），能够满足一般情况。对于更复杂的补全提示，可通过扩展字段`defaultSnippets`来完成。

```json
{
  "type": "array",
  "title": "Keybindings configuration",
  "items": {
    "type": "object",
    "required": ["key"],
    "defaultSnippets": [
      {
        "label": "该自动完成的提示信息，一般填该项",
        "description": "描述信息，一般可以不填",
        "body": { "key": "$1", "command": "$2", "when": "$3" }
      }
    ],
    "properties": {
      "key": {
        "type": "string"
      }
    }
  }
}
```

- `label`并将`description`显示在完成选择对话框中。如果未提供标签，则片段的字符串化对象表示将显示为标签。
- `body`是当用户选择完成时被字符串化并插入的 JSON 对象。[片段语法](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax)可用于字符串文字内以定义制表位、占位符和变量。如果字符串以 开头`^`，则字符串内容将按原样插入，而不是字符串化。您可以使用它来指定数字和布尔值的片段。

请注意，这`defaultSnippets`不是 JSON 模式规范的一部分，而是 VS Code 特定的模式扩展。



schema配置文件生效似乎需要一定的时间（未测试），一般重新打开可以生效。`defaultSnippets`的使用体验不是很好，需要按下冒号（:）后才会有提示，这就需要输入完字段才行。优势是body里面的代码片段不需要使用转义字符，比较直观。综合下来，比较推荐后面的「配置用户代码片段」。

# 配置用户代码片段

菜单：文件 - 首选项 - 配置用户代码片段，选择JSON，会打开`json.json`文件进行编辑。如果有编辑好的，可以直接替换掉`C:\Users\用户名\AppData\Roaming\Code\User\snippets\json.json`文件。

