---
layout:		post
category:	"python"
title:		"Python常用代码片段收集"
tags:		[python]
---
- Content
{:toc}

# 日志
```python
def initlogging(logFile = u"log.txt", toFile = False):
    '''
    示例：
    star.initlogging()
    logging.debug(u"%s %d", u"哈", 1)
    '''
    if toFile is False:
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(levelname)-6s %(filename)20s:%(lineno)-4d  %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            stream=sys.stdout,
        )
    else:
        logging.basicConfig(
            level=logging.DEBUG,
            format='%(asctime)s %(levelname)-6s %(filename)20s:%(lineno)-4d  %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S',
            filename=logFile,
            filemode='a',
        )
```
# 常量
常量最好都放一个文件里，便于后期维护，否则杂乱地分散在不同的脚本文件中很难找。给一个模板：
```python
# coding:utf-8

class Constant:
    @staticmethod
    def test():
        pass
# xxxx
Constant.VER = "1.0"
```

使用时：
```python
from Constant import Constant

print Constant.VER
```

# 参数解析
请不要自行封装解析函数，现有的三方库完全可以满足需求，没有必须重复造轮子（自己实现可能不太稳定，也很有可能存在BUG），推荐使用：
```python
# coding: utf-8
import argparse
'''
argparse.ArgumentParser在解析参数失败时不是抛出异常，而是直接错误退出。
这里重载掉error函数，抛出异常，使得外层可以捕获该异常并输出参数帮助。
'''

class ArgumentParserError(Exception): pass

class MyArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        raise ArgumentParserError(message)
```

使用时：
```python
args = None
    parser = MyArgumentParser(description="自动打包发布工具参数说明")
    parser.add_argument('key', help="Redis key where items are stored")
    parser.add_argument('--file', required=True, help='设置xxx文件路径')
    parser.add_argument('--ver', help='设置版本号')
    parser.add_argument('--timeout', type=int, default=5)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--progress_every', type=int, default=100)
    parser.add_argument('-v', '--verbose', action='store_true')
    try:
        args = parser.parse_args()
    except Exception, e:
        parser.print_help()
        return False
    file = args.file
```

当不明所以的人参数使用错误时输出帮助信息：
```python
usage: Main.py [-h] --file FILE [--ver VER] [--timeout TIMEOUT]
               [--limit LIMIT] [--progress_every PROGRESS_EVERY] [-v]
               key

自动打包发布工具参数说明

positional arguments:
  key                   Redis key where items are stored

optional arguments:
  -h, --help            show this help message and exit
  --file FILE           设置xxx文件路径
  --ver VER             设置版本号
  --timeout TIMEOUT
  --limit LIMIT
  --progress_every PROGRESS_EVERY
  -v, --verbose
```

# 配置文件configparser
参考：[13\.10 读取配置文件 — python3\-cookbook 3\.0\.0 文档](https://python3-cookbook.readthedocs.io/zh_CN/latest/c13/p10_read_configuration_files.html)
```python
import configparser

config = configparser.ConfigParser()
config.read(config_file, encoding='utf-8')
config_dic["package"] = self.get_ini_value(config, "Common", "package")
config_dic["retrycount"] = self.get_ini_value(config, "Common", "retrycount", 3)

# 从ini中读取字符串配置
@staticmethod
def get_ini_value(config, section, option, default_value=None):
    s = None
    try:
        s = config.get(section, option)
    except:
        s = default_value
    return s
```
# 路径管理器
路径分隔符用os.sep，不要用写死的斜杠字符或反斜杠字符。

路径拼接可以用os.path.join，少用加号（+）拼接。但是os.path.join函数似乎并不完美，第一个参数最好末尾不带斜杠，而第二个参数的第一个字符也不能是斜杠，例如 **os.path.join(self._this_path, '/test')** 可能会得到一个不存在的路径。

不过在Python3里，路径的操作增加了pathlib 的库，路径拼接可以这么用：
```python
path_pure = pathlib.PurePath('xxxx')
path_pure = path_pure / 'python' / 'hello.py'  # 拼接路径
```

我发现在很多项目里面会使用三方的tool，如何使用这些工具的路径？给一个参考：
```python
#coding:utf-8

import os
import Utils


class _PathManager:
    def __init__(self):
        self._this_path = Utils.getthispath()

    # XXX的路径
    def get_test_proj_path(self):
        return os.path.join(self._this_path, '.../testxxxxx')

    # XXX的路径
    def get_dx_path(self):
        return os.path.join(self._this_path, 'tools/dx.jar')

    # XXX的路径
    def get_wrapper_path(self):
        return os.path.join(self._this_path, r'bin/tool1.jar')

    # proguardLib路径
    def get_proguard_path(self):
        return os.path.join(self._this_path, 'tools/proguard5.2.1/lib/proguard.jar')

    # xxxxjar包的路径
    def get_cipher_path(self):
        return os.path.join(self._this_path, 'tools/packer.jar')

PathManager = _PathManager()
```

使用时：
```python
from PathManager import *

PathManager.get_test_proj_path()
```

# 脚本模板
打开菜单File > Settting，找到Editor > File and Code Templates，Python Script添加：
```python
# coding: utf-8

import os
import sys
import traceback

DEBUG = True


def main(params):
    return True


if __name__ == '__main__':
    ret = False
    try:
        if DEBUG:
            ret = main([__file__, '', ''])	# 这里在调试状态下可以随意填参数，方便排查问题
        else:
            ret = main(sys.argv)
        if ret is False:
            print("failed")
    except:
        print(traceback.format_exc())
        os.system('pause')
```
# 打开网页
以下代码会使用默认浏览器打开网页：
```python
import webbrowser
webbrowser.open('http://www.python.org')
```
# 终止程序并给出错误信息
```python
import sys
sys.stderr.write('It failed!\n')
raise SystemExit(1)
```

# 实现接口效果
可以利用类的重载来实现一个简单的效果，例如基类有一个get_name函数，要求派生类必须各自设置自己的名称，基类不允许被调用，也即**实现类似接口的效果**。那么可以这样实现:
```python
class ITask:
    def __init__(self):
        self.onInit()
        pass

    def __del__(self):
        # logging.info("释放资源：" + self.getName())
        pass

    def getName(self):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None

    def onInit(self):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None

    def work(self, param):
        start_time = time.time()
        logging.info("开始执行: [%s]", self.getName())
        self.onBeforeWork(param)
        self.onWork(param)
        self.onAfterWork(param)
        end_time = time.time()
        logging.info("执行完成: [%s] 耗时: %.2f s", self.getName(), end_time -  start_time)

    def release(self):
        self.onRelease()

    def onBeforeWork(self, param):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None

    def onWork(self, param):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None

    def onAfterWork(self, param):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None

    def onRelease(self):
        logging.error(self.getName() + '派生类未实现函数' + get_crrent_fnction_name())
        assert None
```
如果派生类忘记实现强制要求的函数，则运行时会触发断言，这样就相当于显示提醒设计者必须为派生类实现相应函数。

这个方法我在[FlowPy](https://github.com/bigsinger/FlowPy)中有使用，参见：https://github.com/bigsinger/FlowPy/blob/master/FlowPy/Flow/ITask.py

更高级的用法可以参见[元编程](./python-meta.html)：强制派生类的重载函数与基类保持一致
 
# 快捷键
- 历史粘贴板	Ctrl + Shift + V
- 任意搜索	两次Shift
- 打开最近历史文件	Ctrl + E
- 格式化代码	Ctrl + Alt + L 或使用菜单Code-Reformat Code
- 代码片段 Live template


