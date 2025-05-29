---

layout:        post
category:    "sec"
title:        "ida-pro-mcp+vscode+cline+deepseek"

tags:        []
---

- Content
  {:toc}



[mrexodia/ida-pro-mcp: MCP Server for IDA Pro.](https://github.com/mrexodia/ida-pro-mcp)



安装`ida-pro-mcp`：

```bash
pip install --upgrade git+https://github.com/mrexodia/ida-pro-mcp
ida-pro-mcp --install
```



vscode安装插件`Cline`：

1. 安装好后在vscode侧边栏就会出现`Cline`小人头像的图标，点进去，点设置配置下大模型，选择DeepSeek，输入API-KEY，选择模型。切换到act模式。再点`MCP Servers`（小柜子图标）- Installed - Configure MCP Servers，在打开的json文件里配置如下内容（注意两个文件路径替换为你自己的）：
   
   ```json
   {
     "mcpServers": {
       "github.com/mrexodia/ida-pro-mcp": {
         "autoApprove": [
           "check_connection",
           "get_metadata",
           "get_function_by_name",
           "get_function_by_address",
           "get_current_address",
           "get_current_function",
           "convert_number",
           "list_functions",
           "list_strings",
           "search_strings",
           "decompile_function",
           "disassemble_function",
           "get_xrefs_to",
           "get_entry_points",
           "set_comment",
           "rename_local_variable",
           "rename_global_variable",
           "set_global_variable_type",
           "rename_function",
           "set_function_prototype",
           "declare_c_type",
           "set_local_variable_type"
         ],
         "disabled": false,
         "timeout": 1800,
         "command": "D:/pyenv/pyenv-win/versions/3.13.2/python.exe",
         "args": [
           "D:/pyenv/pyenv-win/versions/3.13.2/Lib/site-packages/ida_pro_mcp/server.py"
         ],
         "transportType": "stdio"
       }
     }
   }
   ```

2. IDA打开后加载某个文件，点击菜单：Edit - plugins - MCP，此时会在输出栏输出：
   
   ```bash
   [MCP] Server started at http://localhost:13337
   ```

3. 然后就可以开始交互式分析了。
   
   ```
   你需要进一步需要进一步分析或操作该文件,这是一个密码验证题，输入一个字符串，程序验证对错，输入错误的password错误会报错“Incorrect password!”，需要输入正确的password通过验证。你现在需要通过分析得到正确的password，你可以使用MCP工具检索信息，这个分析过程按照以下策略：
   你的工作路径是C:\Users\test\Desktop\，重点关注的文件是entry_language.elf.id0、entry_language.elf.id1、entry_language.elf.id2、entry_language.elf.nam、entry_language.elf.til
   检查反编译的情况，并把你的发现添加到反编译的代码注释中
   将变量重命名为更合理的名称
   如果有必要，修改变量和参数类型（尤其是指针和数组类型）
   修改函数名，使其更具描述性
   如果需要更多的细节，反汇编函数，并把你的发现并添加到代码注释中
   永远不要自行改变数据类型。 如果需要，使用convert_number MCP工具！
   不要尝试暴力破解，而是从反汇编和简单的python脚本中获得一切解决方案
   创建一个report.md文件，在report.md文件中添加你的发现和你解决问题的步骤
   找到这个密码验证题的解决思路后，提示用户找到了正确的password，并说出password的正确值
   ```

4. 


