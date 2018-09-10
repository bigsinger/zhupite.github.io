---
layout:		post
category:	"python"
title:		"Python数据库"
tags:		[python]
---
- Content
{:toc}


# 常见数据库
- MySQL，生产环境MariaDB用的挺多，属于MySQL的分支
- PostgreSQL
- sqlite

```python
import pymysql

connect = pymysql.connect(host='ip', port=8000, user='username', passwd='password', db='dbname', charset='utf8')
cursor = connect.cursor()
cursor.execute(sql_str)
connect.commit()
cursor.close()
```

# ORM
现在有很多不同的数据库系统，并且其中的大部分系统都包含Python 接口，能够使你更好地利用它们的功能。而这些系统唯一的缺点是需要你了解 SQL。如果你是一个更愿意操纵 Python 对象而不是 SQL 查询的程序员，并且仍然希望使用关系数据库作为你的数据后端，那么你可能更倾向于使用 ORM。

这些 ORM 系统的作者将纯 SQL 语句进行了抽象化处理，将其实现为 Python 中的对象，这样你只操作这些对象就能完成与生成 SQL 语句相同的任务。一些系统也允许一定的灵活性，可以让你执行几行 SQL 语句，但是大多数情况下，都应该避免普通的SQL 语句。

数据库表被神奇地转化为 Python 类，其中的数据列作为属性，而数据库操作则会作为方法。让你的应用支持 ORM 与标准数据库适配器有些相似。由于 ORM 需要代替你执行很多工作，因此一些事情变得更加复杂，或者需要比直接使用适配器更多的代码行。不过，值得欣慰的是，你的这一点额外工作可以获得更高的生产率。

ORM的使用可以参见**Django**，此处不再赘述。

# 非关系数据库
Web 和社交服务的流行趋势会导致产生大量的数据，并且/或者数据产生的速率可能要比关系数据库能够处理得更快。可以想象 Facebook 或 Twitter 生成的大量数据。比如， Facebook游戏或者 Twitter 流数据处理应用的开发者可能会在应用中以每小时数百万行（或对象）的速率向持久化存储中进行写入。这个可扩展性问题最终造就了非关系数据库或者 NoSQL 数据库的创建、爆炸性增长以及部署。

有很多此类数据库可以进行选择，不过它们的类型并不完全相同。单就非关系数据库而言，就有对象数据库、键-值对存储、文档存储（或者数据存储）、图形数据库、表格数据库、列/可扩展记录/宽列数据库、多值数据库等很多种类。本章结尾会给出一些链接来帮助你对 NoSQL 进行进一步研究。在本书写作时，有一个非常流行的文档存储非关系数据库叫做 **MongoDB**。

尽管 Python 中有很多 MongoDB 驱动程序，不过其中最正式的一个是 **pymongo**。