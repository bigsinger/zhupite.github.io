---
layout:		post
category:	"program"
title:		"自动配置JetBrains家族IDE的破解文件"
tags:		[goland,pycharm,idea,webstorm]
---
- Content
{:toc}

JetBrains家族的IDE非常好用，几乎每个语言都会有一个对应的IDE，而且确实很强大，诸如IDEA胜于eclipse。虽说有免费的sublime和vscode可以用，但是对比使用下来远不如JetBrains家族的IDE。除个别版本以外，很多版本需要付费，不是不支持正版，个人开发者实在无力支付。然而每次手动配置破解文件又太繁琐，于是写个Python脚本自动化配置一下，方便许多。

```python
# coding: utf-8

import os
import sys
import glob
import shutil
from star.InstallPathHelper import InstallPathHelper


'''
自动复制破解jar包到JetBrains IDE目录下（需要破解那个就输入哪个IDE的关键词，见变量：IDE_NAME），并自动修改.vmoptions文件。
重新运行软件后，激活时选择：Activate、License server，输入：http://jetbrains-license-server
'''

# 获取路径的父目录，末尾不带\
def getparent(filepath):
    if not filepath:
        return None
    lsPath = os.path.split(filepath)
    if lsPath[1]:
        return lsPath[0]
    lsPath = os.path.split(lsPath[0])
    return lsPath[0]


# 返回当前脚本所在目录的全路径，末尾不带\
def getthispath():
    path = sys.path[0]
    if os.path.isdir(path):
        return path
    elif os.path.isfile(path):
        return os.path.split(path)[0]


IDE_NAME = 'PyCharm 2019.2.1'


def main():
    crack_jar_name = None
    src_crack_jar = None
    this_path = getthispath()

    print('[1]auto get crack jar file')
    for src_crack_jar in glob.glob(this_path + '\\*.jar'):
        _, crack_jar_name = os.path.split(src_crack_jar)
        break
    if not crack_jar_name:
        print('not found crack jar file')
        return

    src_crack_jar = os.path.join(this_path, crack_jar_name)
    print('crack jar file: ' + crack_jar_name)

    print('[2]auto get JetBrains IDE install path')
    helper = InstallPathHelper(IDE_NAME)
    file_path = helper.get_path()
    ide_dir = getparent(file_path)
    dst_crack_jar = os.path.join(ide_dir, crack_jar_name)

    print('[3]copy crack jar file')
    shutil.copy(src=src_crack_jar, dst=dst_crack_jar)

    print('[4]auto edit *.vmoptions files')
    javaagent = '\n-javaagent:' + dst_crack_jar + '\n'
    for file_path in glob.glob(ide_dir + '\\*.vmoptions'):
        print(file_path)
        backup_file = file_path + '_backup'
        shutil.copy(src=file_path, dst=backup_file)
        with open(file_path, 'a+') as f:
            f.write(javaagent)

    print('[5]open JetBrains IDE install path')
    os.system('start explorer ' + ide_dir)
    print('done')


if __name__ == '__main__':
    main()
```