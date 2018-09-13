---
layout:		post
category:	"program"
title:		"tesseract初探"
tags:		[]
---
- Content
{:toc}

http://code.google.com/p/tesseract-ocr/downloads/list

下载tesseract-2.04.tar.gz 和tesseract-2.04.exe.tar.gz ，分别解压。
其中前者是源代码，里面有两张图片phototest.tif和eurotext.tif，
后者是编译好的程序，可以直接使用的。

1。识别测试
选取phototest.tif进行识别，需要tessdata，下载tesseract-2.00.eng.tar.gz复制到tesseract-2.04.exe目录下
新建批处理：tesseract.exe phototest.tif output，并运行会输出文件output.txt，
据说文本内容的识别率是100%，不过我没有一一核实。

2。训练
假设图片样本为scan.tif（图片要二值化，就是非黑即白的，且tif文件不能是压缩的）
新建tessdata目录，可以将tesseract-2.00.eng.tar.gz解压的tessdata文件下的内容复制一份。
新建批处理：tesseract.exe scan.tif scan batch.nochop makebox，运行会输出文件scan.txt，
修改识别错误的文字，并改名为scan.box.

新建批处理：
tesseract scan.tif junk nobatch box.train
training\mftraining scan.tr
training\cnTraining scan.tr
training\unicharset_extractor scan.box

运行后会输出若干个文件，把它们复制到tessdata目录替换原来的文件即可。
生成出来的文件就是训练出来的数据，下次就可以用这些数据进行识别了。