---
layout:		post
category:	"python"
title:		"Python操作CSV文件"
tags:		[python]
---
- Content
{:toc}



```python
new_rows = []
headers = None
with open(csv_file_name, encoding='utf-8') as f: 
    f_csv = csv.reader(f)
    headers = next(f_csv)
    for r in f_csv:
        uid = r[0].strip()
        new_rows.append(r)

# 清洗后的数据保存
with open(new_csv_file_name, 'w', encoding='utf-8') as f:
    f_csv = csv.writer(f, lineterminator='\n')
    f_csv.writerow(headers)
    f_csv.writerows(new_rows)

```
防止多余一个空行，须添加一个关键字参数lineterminator='\n'

读取时为了不索引序号，也可以使用命名元组：
```python
with open(csv_file_name, encoding='utf-8') as f:
    f_csv = csv.reader(f)
    headers = next(f_csv)
    Row = namedtuple('Row', headers)
    print(Row)
    for r in f_csv:
        count_all += 1
        row = Row(*r)
        uid = row.UID
```

# 关联
- [Python文件操作](./python-file.html)