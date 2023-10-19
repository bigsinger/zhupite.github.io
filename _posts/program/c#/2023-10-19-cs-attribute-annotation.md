---
layout:		post
category:	"program"
title:		"C#自定义特性（注解）及使用"

tags:		[c#,attribute,annotation]
---
- Content
{:toc}


C#的特性`Attribute`，可以理解为Java里面的注解`Annotation`。其实这个在汉语翻译里面非常不好，如果搜索C#的特性，那大部分的结果是关于C#语言本身特性的介绍。也不能用**属性**这个词，**属性**在C#里是`property`，是跟成员变量相关。个人觉得**注解**这个词翻译得相当好，有**注释解释**之意，单从字节理解就很直观。

闲话不说，下面看自定义特性怎么用。

```csharp
using System;

// 自定义特性
[AttributeUsage(AttributeTargets.Field)]
public class MyAttribute : Attribute {
    private string name;
    private int value;

    public MyAttribute(string name, int value) {
        this.name = name;
        this.value = value;
    }

    public string Name { get { return name; } }
    public int Value { get { return value; } }
}


// 使用自定义特性
public class MyClass {
    [MyAttribute(name: "foo", value: 42)]		// 也可以简写为 My
    public static int MyStaticInt;

    [My("bar", 99)]								// 可以简写为 My
    public static string MyStaticString;
}

public class Program {
    public static void Main() {
        Type type = typeof(MyClass);
        foreach (var field in type.GetFields()) {
            if (field.IsStatic) {
                var attribute = Attribute.GetCustomAttribute(field, typeof(MyAttribute)) as MyAttribute;
                if (attribute != null) {
                    Console.WriteLine($"{field.Name}: Name={attribute.Name}, Value={attribute.Value}");
                    // 根据特性自动初始化成员变量
                    if(attribute.Name=="xxx") {
                    	field.Key.SetValue(null, 123);
                    }
                }
            }
        }
    }
}
```



再看一个具体的应用示例，该自定义特性`TableColumnAttribute`是为了给表格的列做注解（注释解释）。

```csharp
namespace BIChart.CSVTable;

/*
 用来标注指定表格列的名称和数据类型
 */
[AttributeUsage(AttributeTargets.Field)]
public class TableColumnAttribute : Attribute {
    private string name;
    private Type dataType = typeof(string);
    private bool canSelect = false;

    public TableColumnAttribute(string name) {
        this.name = name;
    }

    public TableColumnAttribute(string name, Type dataType) {
        this.name = name;
        this.dataType = dataType;
    }

    public string Name { get { return name; } }
    public Type DataType { get { return dataType; } }
}
```

使用时，只需要给`CSV`表格做关键几个列的注解即可：

```csharp
using BIChart.CSVTable;

namespace BIChart;
public class BIIncomeTable : BICsvBaseTable {
    [TableColumnAttribute(name: "产品名")]
    public static int columnIndexProduct;

    [TableColumnAttribute(name: "时间", dataType: typeof(DateOnly))]
    public static int columnIndexDate;

    [TableColumnAttribute(name: "营收", dataType: typeof(double))]
    public static int columnIndexFeeValue;

    public override string? getDataFilePath() {
        string filePath = star.paths.findRecentOneFile(Path.Combine(Constant.RootDirName, "产品营收分析"), ".csv");
        return filePath;
    }

    // 指定需要分析的列
    protected override void defineSelectingColumns() {
        columnsToSelect = new(){
            columnIndexProduct,
        };
    }
}
```

在基类`BICsvBaseTable`里做统一的识别和初始化工作：

```csharp
public abstract class BICsvBaseTable {
    // 存储表格列属性的列表
    protected List<KeyValuePair<FieldInfo, Attribute>> fields = new();


    // 根据列名找到对应的列类型
    private Type findColumnType(int columnIndex, string columnName, List<KeyValuePair<FieldInfo, Attribute>> fields) {
        foreach (var field in fields) {
            if (field.Value is TableColumnAttribute attribute) {
                if (attribute.Name == columnName) {
                    field.Key.SetValue(null, columnIndex);
                    return attribute.DataType;
                }
            }
        }
        return typeof(string);
    }

    // Manually define the columns and their types
    protected void defineColumnType(DataTable dt, string[] columnNames) {
        // 初始化表格列属性的列表
        if (this.fields.Count == 0) {
            Type type = this.GetType();
            foreach (var field in type.GetFields()) {
                if (field.IsStatic) {
                    var attribute = Attribute.GetCustomAttribute(field, typeof(TableColumnAttribute)) as TableColumnAttribute;
                    if (attribute != null) {
                        fields.Add(new(field, attribute));
                    }
                }
            }
        }

        for (int columnIndex = 0; columnIndex < columnNames.Length; columnIndex++) {
            dt.Columns.Add(new DataColumn(columnNames[columnIndex], findColumnType(columnIndex, columnNames[columnIndex], fields)));
        }
    }

    // 读取csv记录到datatable
    public DataTable readData(string? csvFile) {
        DataTable dt = new DataTable();
        if (File.Exists(csvFile) == false) { return dt; }

        using (var reader = new StreamReader(csvFile))
        using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture)) {
            csv.Read();
            var rawRecord = csv.Context.Parser.RawRecord;
            this.columnNames = rawRecord.Split(',', StringSplitOptions.TrimEntries);  // 列头一般不会有逗号
            csv.ReadHeader();

            // Manually define the columns and their types
            defineColumnType(dt, this.columnNames);

            // 指定需要分析的列
            defineSelectingColumns();

            // 根据列头定义自动获取出默认的日期列和数值列
            autoDetectDefaultColumnIndex(dt);

            // Read the CSV records and add them to the DataTable
            while (csv.Read()) {
                int columnIndex = 0;
                DataRow row = dt.NewRow();

                foreach (DataColumn column in dt.Columns) {
                    row[columnIndex] = normalizeClassify(row, columnIndex, csv.GetField(column.DataType, columnIndex));
                    columnIndex++;
                }

                dt.Rows.Add(row);
            }
        }

        dataTable = dt;
        return dt;
    }
}
```



后续如果要新增对其他表格数据的分析，只需要参考`BIIncomeTable`即可，把需要分析的列做好注解（不用全部列），也不用去数列的序号，只需要指定列名称即可。这样的好处是，以后数据源表格的列发生变化，可以很快识别并更新掉，比数列序号简单快捷得多。
