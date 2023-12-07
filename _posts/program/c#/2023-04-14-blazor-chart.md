---
layout:		post
category:	"program"
title:		"C#之Blazor开发CSV数据图表分析项目"

tags:		[c#,blazor,net,chart]
---
- Content
{:toc}




# 使用说明

- 当表格里没有表示数额的列时，则数额计算按照条数计算，也即数额等于数量。
- 统计分析划分为**贡献分析**和**优势分析**，又分别有数额分析和数量分析，数额可以理解为营业额，数量可以理解为订单数，均值可以理解为客单价。详细说明见下文。
- 所有数据如果有小数，默认保留小数点后两位有效数字。
- 数额的单位默认为：万。



## 贡献分析

**贡献分析**主要用于分析维度Y在维度X上的贡献情况，例如某团队某销售对某产品的营业额分析。其下又有数额分析，数量分析，均值分析。

- **数额分析**：数额排名/数额占比排名（单位：%）、数额占比走势（单位：%）、数额走势（单位：万）、数额同比（单位：%）、数额环比（单位：%）；
- **数量分析**：数量排名/数量占比排名（单位：%）、数量占比走势（单位：%）、数量走势（单位：个）、数量同比（单位：%）、数量环比（单位：%）；
- **均值分析**：均值排名（单位：万）、均值走势（单位：万）、均值同比（单位：%）、均值环比（单位：%）；



## 优势分析

**优势分析**主要用于分析维度Y在维度X上的优势情况，例如某团队某销售更擅长销售什么产品、统计成功率、失败率等。其下又有数额分析，数量分析。

- **数额分析**：自身数额占比排名（单位：%）、自身数额占比走势（单位：%）、数额占比同比（单位：%）、数额占比环比（单位：%）；
- **数量分析**：数量占比排名（单位：%）、数量占比走势（单位：%）、数量占比同比（单位：%）、数量占比环比（单位：%）；




	

---

分割线：以下是初版及设计开发思路。

---

# 背景

业务需要经常性盘点数据，内部系统看着不太方便而且速度很慢，有些功能也没有，于是想动手实现。为了备忘，做一些记录，方便下次改动时可以快速熟悉代码。



说一下整体感受和结论：

- `C#`做数据图表速度飞快，目前测试使用的数据量大概在两万条，相比内部系统快了好多倍，基本上是秒间就出结果了，而内部系统还要刷新等待好几秒。而且，我是在个人工作电脑上跑的，内部系统是在服务器上的，个人电脑性能不如内部系统服务器性能。
- 代码是真的简洁，但是代码的难度也比较大，好在有了`ChatGPT`可以直接问它要代码贴进来，编写速度可以极大提高。如果没有`ChatGPT`我恐怕要写好久才能完成。
- 灵活性非常高，比较建议直接使用`DataTable`分析。没有使用数据库，直接从内部系统上导出数据为`CSV`格式，然后读取到`DataTable`分析。
- 很好很强大，整体速度是真的快，很丝滑。
- 再次感谢`ChatGPT`，实在是太好用了。



# 代码设计

## 层级结构

基础表（数据源） - 助手类（功能） - 页面展现（UI）



## 基础表

`BICsvBaseTable`，在基础表里面做了一些异常判断，如果列名标注有误，会给出错误提示，方便排查问题。

```c#
using System.Data;
using System.Globalization;
using System.Reflection;
using BIChart;
using BIChart.CSVTable;
using CsvHelper;

public abstract class BICsvBaseTable {
    private DataTable dataTable = new();

    // 获取待分析数据的文件路径
    public abstract string? getDataFilePath();

    // 表示日期的默认列索引
    public int defaultDateColumnIndex { get; set; } = -1;

    // 表示数值的默认列索引
    public int defaultValueColumnIndex { get; set; } = -1;

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
                        field.SetValue(null, -1);   // 初始化为-1，表示未初始化
                        fields.Add(new(field, attribute));
                    }
                }
            }
        }

        for (int columnIndex = 0; columnIndex < columnNames.Length; columnIndex++) {
            dt.Columns.Add(new DataColumn(columnNames[columnIndex], findColumnType(columnIndex, columnNames[columnIndex], fields)));
        }
    }

    // 获取需要分析的列，并检查是否有未初始化的列
    protected void defineSelectingColumns() {
        columnsToSelect = new();

        foreach (var field in fields) {
            if (field.Value is TableColumnAttribute attribute) {
                int? columnIndex = (int?)field.Key.GetValue(null);
                if (columnIndex == null) {
                    throw new Exception("存在未初始化的列null，请检查列名是否正确：" + attribute.Name);
                } else {
                    if (columnIndex == -1) {
                        throw new Exception("存在未初始化的列-1，请检查列名是否正确：" + attribute.Name);
                    }
                    if (attribute.CanSelect) {
                        columnsToSelect.Add((int)columnIndex);
                    }
                }
            }
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

    // 自动探测数值列和日期列
    private void autoDetectDefaultColumnIndex(DataTable dt) {
        // 如果日期列或数值列未初始化过，需要自动探测
        if (defaultDateColumnIndex == -1 || defaultValueColumnIndex == -1) {
            foreach (DataColumn column in dt.Columns) {
                if (column.DataType == typeof(DateOnly)) {
                    if (defaultDateColumnIndex == -1) { defaultDateColumnIndex = column.Ordinal; }
                } else if (column.DataType == typeof(double)) {
                    if (defaultValueColumnIndex == -1) { defaultValueColumnIndex = column.Ordinal; }
                }
            }
        }

        if (defaultDateColumnIndex == -1 || defaultValueColumnIndex == -1) {
            throw new Exception("未探测到默认的日期列和数值列");
        }
    }

    // 提供给UI可以选择分析的列索引列表，在派生类的构造函数中初始化该值即可。
    protected List<int>? columnsToSelect = null;
    public List<int>? getColumnsToSelect() {
        return columnsToSelect;
    }
    public Dictionary<int, string> getColumnsToSelectEx() {
        Dictionary<int, string> res = new();
        if (columnsToSelect != null) {
            foreach (var index in columnsToSelect) {
                res.Add(index, getColumnName(index));
            }
        }
        return res;
    }


    // 规范化分类：把Axx 规范化为A，如果匹配不到是用原来的名称还是统一归类为Other
    protected bool putLeftoverToOthers = false;
    protected Dictionary<int, Dictionary<string, string>>? normalClassifiesDic;

    /// <summary>
    /// 规范化分类。例如：把Axx或xxA规范化为A，如果匹配不到是用原来的名称还是统一归类为Other，由putLeftoverToOthers决定。
    /// 需要规范化的表格请派生本类，并在构造函数中初始化配置：putLeftoverToOthers  normalClassifiesDic
    /// </summary>
    /// <param name="row">某一行</param>
    /// <param name="columnIndex">某一列</param>
    /// <param name="obj">从CSV读取出的原始内容，也就是即将被规范化的内容</param>
    /// <returns></returns>
    private object? normalizeClassify(DataRow row, int columnIndex, object? obj) {
        if (normalClassifiesDic == null || normalClassifiesDic.Count == 0 || normalClassifiesDic.TryGetValue(columnIndex, out Dictionary<string, string>? nameMap) == false) { return obj; }
        if (obj is string) {
            string? name = obj as string;
            string? newName = null;
            if (name != null) {
                nameMap?.TryGetValue(name, out newName);
            }
            if (newName == null && putLeftoverToOthers) {
                newName = "Other";
            }
            return newName;
        } else {
            return obj;
        }
    }

    /// <summary>
    /// 适合批量重新规范化的情况，目前遇不到。目前在读取表格的时候同时就规范化了，参见：normalizeClassify 的使用
    /// </summary>
    protected void normalizeClassifies() {
        if (normalClassifiesDic == null)
            return;

        foreach (DataRow row in dataTable.Rows) {
            foreach (var dic in normalClassifiesDic) {
                int columnIndex = dic.Key;
                var nameMap = dic.Value;
                string? name = row[columnIndex].ToString();

                if (string.IsNullOrEmpty(name)) {
                    if (putLeftoverToOthers) {
                        row[columnIndex] = "Other";
                    } else {
                        continue;
                    }
                } else {
                    if (nameMap.TryGetValue(name, out string? newName)) {
                        row[columnIndex] = newName;
                    } else if (putLeftoverToOthers) {
                        row[columnIndex] = "Other";
                    }
                }
            }
        }
    }

    // 缓存列头信息的字符串列表
    private string[] columnNames;

    /// <summary>
    /// 获取列头名称
    /// </summary>
    /// <param name="columnIndex">待获取列头名称的列索引(0based)</param>
    /// <returns></returns>
    public string getColumnName(int columnIndex) {
        if (columnNames != null && columnIndex >= 0 && columnIndex < columnNames.Length) {
            return columnNames[columnIndex];
        }
        return string.Empty;
    }


    // 缓存分类的字典，计算过的就不用再计算了，提高速度。某列的所有分类列表
    protected Dictionary<int, List<string>> classifies = new();

    // 获取某列的全部的分类
    public List<string> getAllClassifies(int columnIndex) {
        if (!classifies.TryGetValue(columnIndex, out List<string>? list)) {
            list = BICommonUtil.getAllClassifiesInner(dataTable, columnIndex);
            classifies[columnIndex] = list;
        }
        return list;
    }


    // 缓存分类的字典，计算过的就不用再计算了，提高速度。某列的所有分类列表
    protected Dictionary<int, List<int>> mAllYears = new();

    // 获取全部的年份
    // recentCount 用来限制数量，0为不限制。其他代表只保留最近几年的数据
    public List<int> getAllYears(DataTable dt, int columnIndex, int keepCount) {
        if (!mAllYears.TryGetValue(columnIndex, out List<int>? allYears)) {
            allYears = BICommonUtil.getAllYearsInner(dt, columnIndex);
            mAllYears[columnIndex] = allYears;
        }

        if (keepCount > 0 && allYears.Count > keepCount) {
            allYears.RemoveRange(0, allYears.Count - keepCount);
        }
        return allYears;
    }
}
```

## 注解类

其实在C#里叫特性，但是我更喜欢注解这个词，贴切！使用`TableColumnAttribute`来给列做标注，见后面的业务实现部分。

```c#
namespace BIChart.CSVTable;

/*
 用来标注指定表格列的名称和数据类型
 */
[AttributeUsage(AttributeTargets.Field)]
public class TableColumnAttribute : Attribute {
    // 指示该列的名称
    private string name;

    // 指示该列的数据类型
    private Type dataType = typeof(string);

    // 指示是否可以展示分析
    private bool canSelect = false;

    public TableColumnAttribute(string name) {
        this.name = name;
    }

    public TableColumnAttribute(string name, bool canSelect) {
        this.name = name;
        this.canSelect = canSelect;
    }

    public TableColumnAttribute(string name, Type dataType) {
        this.name = name;
        this.dataType = dataType;
    }

    public TableColumnAttribute(string name, Type dataType, bool canSelect) {
        this.name = name;
        this.dataType = dataType;
        this.canSelect = canSelect;
    }

    public string Name { get { return name; } }
    public Type DataType { get { return dataType; } }
    public bool CanSelect { get { return canSelect; } }
}
```



## 助手类

有两个助手类，一个是有通用统计分析能力的助手类`CommonStatisticsHelper`，一个是有通用页面处理能力的助手类`PageBaseHelper`。

`CommonStatisticsHelper`这里有个比较强的可扩展功能，就是可以随意变更列的索引来实现对不同维度的数据分析。

```c#
using System.Data;
using BootstrapBlazor.Components;

namespace BIChart;

public class CommonStatisticsHelper {
    public BICsvBaseTable dataHelper;

    private DataTable _dt = new();


    public ChartDataSource? amountDataSource;       // 累计数额的数据源
    public ChartDataSource? itemCountDataSource;    // 订单数的数据源
    public ChartDataSource? aovDataSource;          // 客单价的数据源

    public ChartDataSource? pieDataSource;          // 占比饼图的数据源
    public ChartDataSource? ratioDataSource;        // 占比走势的数据源

    public CommonStatisticsHelper(BICsvBaseTable table) {
        this.changeDataTable(table);
    }

    public bool changeDataTable(BICsvBaseTable table) {
        dataHelper = table;
        string? filePath = table.getDataFilePath();
        _dt = table.readData(filePath);
        if (_dt == null) {
            throw new Exception("数据表打开失败，请检查文件是否存在，是否被占用，格式是否有误。文件：" + filePath);
        }
        return _dt != null;
    }

    /// <summary>
    /// 如果需要重新生成数据源时，请在派生类里实现该函数并调用生成数据源的方法。
    /// </summary>
    /// <returns></returns>
    public async Task freshData(Settings settings) {
        string title = string.Join(',', settings.dim1Classifies);
        (amountDataSource, itemCountDataSource, aovDataSource) = await initAmountData(title, settings);
        pieDataSource = await initPieData(title, settings);
        ratioDataSource = await initRatioData(title, settings);
    }


    /// <summary>
    /// 计算某列分类 数值走势
    /// </summary>
    /// <param name="title">数据源的标题，可以为空</param>
    /// <param name="columnIndexDate">指明日期所在的列序号</param>
    /// <param name="columnIndexFix">指明需要匹配字符串的列序号</param>
    /// <param name="targetNames">指明需要匹配的字符串列表（匹配逻辑为：字符串相等）</param>
    /// <param name="columnIndexTarget">需要计算占比的列索引</param>
    /// <param name="columnIndexValue">需要汇总数据总额的列索引</param>
    /// <returns>数额 个数 均值</returns>
    public Task<(ChartDataSource, ChartDataSource, ChartDataSource)> initAmountData(string? title, Settings settings) {
        ChartDataSource amountDataSource = new();
        ChartDataSource itemCountDataSource = new();
        ChartDataSource aovDataSource = new();
        if (settings.dimXColumnIndex < 0) {
            return Task.FromResult<(ChartDataSource, ChartDataSource, ChartDataSource)>((amountDataSource, itemCountDataSource, aovDataSource));
        }

        var years = dataHelper.getAllYears(_dt, settings.columnIndexDate, Constant.keepRecentYearsCount);

        // 获取某列的所有分类
        List<string> classifies = dataHelper.getAllClassifies(_dt, settings.dimXColumnIndex);

        DateRangeIterator dateIterator = new(settings.statisticsTimeUnit, years);
        Dictionary<string, List<double>> amountDic = new();     //金额
        Dictionary<string, List<int>> countDic = new();         //订单数量
        Dictionary<string, List<double>> aovDic = new();        //订单单价

        List<double> amountList = new();                        //总金额数据列表
        List<int> countList = new();                            //总订单数量数据列表
        List<double> aovList = new();                           //总订单单价数据列表


        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            int itemCount = 0;
            double totalAmount = 0.0;
            var items = BICommonUtil.getTotalValueOfClassifies(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, settings.dimXColumnIndex, settings.columnIndexValue, out itemCount, out totalAmount);

            // 转换为万单位
            foreach (var key in items.Keys.ToList()) { items[key].Value = BICommonUtil.reformatDouble(items[key].Value); }

            BICommonUtil.mergeTimeRangeValues(ref amountDic, ref countDic, ref aovDic, ref classifies, ref items);

            totalAmount = BICommonUtil.reformatDouble(totalAmount); // 转换为万单位
            amountList.Add(totalAmount);
            countList.Add(itemCount);
            if (itemCount != 0) {
                aovList.Add(totalAmount / itemCount);
            } else {
                aovList.Add(0);
            }
        }


        if (string.IsNullOrEmpty(title) && settings.dim1Classifies?.Count > 0) {
            title = string.Join(',', settings.dim1Classifies);
        }


        // 金额的数据源
        var ds = amountDataSource;
        ds.Options.Title = "总额 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = amountList.Cast<object>() });
        foreach (var item in amountDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }


        // 订单数量的数据源
        ds = itemCountDataSource;
        ds.Options.Title = "数量 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = countList.Cast<object>() });
        foreach (var item in countDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }


        // 订单单价的数据源
        ds = aovDataSource;
        ds.Options.Title = "平均 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = aovList.Cast<object>() });
        foreach (var item in aovDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }


        return Task.FromResult<(ChartDataSource, ChartDataSource, ChartDataSource)>((amountDataSource, itemCountDataSource, aovDataSource));
    }

    /// <summary>
    /// 计算某列分类 占比走势
    /// </summary>
    /// <param name="title">数据源的标题，可以为空</param>
    /// <param name="columnIndexDate">指明日期所在的列序号</param>
    /// <param name="columnIndexFix">指明需要匹配字符串的列序号</param>
    /// <param name="targetNames">指明需要匹配的字符串列表（匹配逻辑为：字符串相等）</param>
    /// <param name="columnIndexTarget">需要计算占比的列索引</param>
    /// <param name="columnIndexValue">需要汇总数据总额的列索引</param>
    /// <returns></returns>
    public Task<ChartDataSource> initRatioData(string? title, Settings settings) {
        ChartDataSource dataSource = new();
        if (settings.dimXColumnIndex < 0) { return Task.FromResult(dataSource); }

        var years = dataHelper.getAllYears(_dt, settings.columnIndexDate, Constant.keepRecentYearsCount);

        // 获取某列的所有分类
        List<string> classifies = dataHelper.getAllClassifies(_dt, settings.dimXColumnIndex);

        DateRangeIterator dateIterator = new(settings.statisticsTimeUnit, years);
        Dictionary<string, List<double>> amountDic = new();    //金额
        Dictionary<string, List<int>> countDic = new();        //订单数量
        Dictionary<string, List<double>> aovDic = new();       //订单单价

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            int itemCount = 0;
            double totalAmount = 0.0;
            var items = BICommonUtil.getTotalValueOfClassifies(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, settings.dimXColumnIndex, settings.columnIndexValue, out itemCount, out totalAmount);

            // 计算出占比
            foreach (var key in items.Keys.ToList()) {
                if (totalAmount > 0.1) {
                    items[key].Value = Math.Round(items[key].Value / totalAmount * 100, 2);
                } else {
                    items[key].Value = 0;
                }
            }

            BICommonUtil.mergeTimeRangeValues(ref amountDic, ref countDic, ref aovDic, ref classifies, ref items);
        }


        if (string.IsNullOrEmpty(title) && settings.dim1Classifies?.Count > 0) {
            title = string.Join(',', settings.dim1Classifies);
        }


        // 金额占比走势的数据源
        var ds = dataSource;
        ds.Options.Title = "占比走势 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        foreach (var item in amountDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }
        return Task.FromResult(dataSource);
    }

    /// <summary>
    /// 获取分布饼图的数据
    /// </summary>
    /// <param name="title">数据源的标题，可以为空</param>
    /// <param name="columnIndexDate">指明日期所在的列序号</param>
    /// <param name="columnIndexToMatch">指明需要匹配字符串的列序号</param>
    /// <param name="targetNames">指明需要匹配的字符串列表（匹配逻辑为：字符串相等）</param>
    /// <param name="columnIndexTarget">需要计算饼图占比的列索引</param>
    /// <param name="columnIndexValue">需要汇总数据总额的列索引</param>
    /// <returns></returns>
    public Task<ChartDataSource> initPieData(string? title, Settings settings) {
        ChartDataSource dataSource = new();
        if (settings.dimXColumnIndex < 0) { return Task.FromResult(dataSource); }

        DateOnly startDateTime = settings.startDateTime;
        DateOnly endDateTime = settings.endDateTime;

        int itemCount = 0;
        double totalAmount = 0.0;
        var items = BICommonUtil.getTotalValueOfClassifies(_dt, settings.columnIndexDate, startDateTime, endDateTime, settings.dim1ColumnIndex, settings.dim1Classifies, settings.dimXColumnIndex, settings.columnIndexValue, out itemCount, out totalAmount);
        var orderDic = items.OrderByDescending(pair => pair.Value.Value).ToDictionary(pair => pair.Key, pair => pair.Value);
        var list = orderDic.Select(kv => kv.Value.Value).ToList();
        list = list.ConvertAll(x => Math.Round(x / totalAmount * 100, 2));


        if (string.IsNullOrEmpty(title) && settings.dim1Classifies?.Count > 0) {
            title = string.Join(',', settings.dim1Classifies);
        }


        var ds = dataSource;
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Options.ShowXLine = false;
        ds.Options.ShowYLine = false;
        ds.Options.ShowXScales = false;
        ds.Options.ShowYScales = false;
        ds.Options.LegendPosition = ChartLegendPosition.Right;
        ds.Labels = orderDic.Keys;
        ds.Data.Add(new ChartDataset { Data = list.Cast<object>() });
        return Task.FromResult(dataSource);
    }



    /// <summary>
    /// 统计某个/多个产品的某N个列的数额情况。适合场景：
    /// 成本分析，例如成本有多个的时候
    /// </summary>
    /// <param name="title">数据源的标题，可以为空</param>
    /// <param name="columnIndexDate">指明日期所在的列序号</param>
    /// <param name="columnIndexToMatch">指明需要匹配字符串的列序号</param>
    /// <param name="targetNames">指明需要匹配的字符串列表（匹配逻辑为：字符串相等）</param>
    /// <param name="columns">指明需要统计数值的列序号列表。例如COR RD 总成本 总收入</param>
    /// <returns></returns>
    public Task<ChartDataSource> initMultiColumnData(string? title, Settings settings, List<int> columns) {
        var years = dataHelper.getAllYears(_dt, settings.columnIndexDate, Constant.keepRecentYearsCount);
        DateRangeIterator dateIterator = new(settings.statisticsTimeUnit, years);

        Dictionary<int, List<double>> result = new();

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            foreach (var column in columns) {
                result.TryGetValue(column, out var list);
                if (list == null) {
                    list = new();
                    result[column] = list;
                }
                list.Add(BICommonUtil.reformatDouble(BICommonUtil.getTotalValue(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, column)));
            }
        }


        if (string.IsNullOrEmpty(title) && settings.dim1Classifies?.Count > 0) {
            title = string.Join(',', settings.dim1Classifies);
        }


        var ds = new ChartDataSource();
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Labels = dateIterator.getTimeLabels();
        foreach (var column in columns) {
            ds.Data.Add(new ChartDataset { Label = dataHelper.getColumnName(column), Data = result[column].Cast<object>() });
        }
        return Task.FromResult(ds);
    }


    /// <summary>
    /// 计算某产品利润率和毛利率数据源
    /// </summary>
    /// <param name="title">数据源的标题，可以为空</param>
    /// <param name="columnIndexDate">指明日期所在的列序号</param>
    /// <param name="columnIndexToMatch">指明需要匹配字符串的列序号</param>
    /// <param name="targetNames">指明需要匹配的字符串列表（匹配逻辑为：字符串相等）</param>
    /// <param name="columnIndexOfIncome">收入所在的列索引</param>
    /// <param name="columnIndexOfCor">COR所在的列索引</param>
    /// <param name="columnIndexOfCost">总成本所在的列索引</param>
    /// <returns></returns>
    public Task<ChartDataSource> initProfitData(string? title, Settings settings, int columnIndexOfIncome, int columnIndexOfCor, int columnIndexOfCost) {
        var years = dataHelper.getAllYears(_dt, settings.columnIndexDate, Constant.keepRecentYearsCount);
        DateRangeIterator dateIterator = new(settings.statisticsTimeUnit, years);

        List<double> dryProfitRateList = new();
        List<double> grossProfitRateList = new();

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            double dryProfitRate = 0;
            double grossProfitRate = 0;

            double cor = BICommonUtil.getTotalValue(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, columnIndexOfCor);
            double cost = BICommonUtil.getTotalValue(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, columnIndexOfCost);
            double income = BICommonUtil.getTotalValue(_dt, settings.columnIndexDate, date1, date2, settings.dim1ColumnIndex, settings.dim1Classifies, columnIndexOfIncome);

            if (income > 0.1) {
                dryProfitRate = Math.Round((income - cost) / income * 100, 2);
                grossProfitRate = Math.Round((income - cor) / income * 100, 2);
                if (dryProfitRate > 999.0f) { dryProfitRate = 999.0f; }             // 避免计算结果超大，导致无法渲染
                if (grossProfitRate > 999.0f) { grossProfitRate = 999.0f; }         // 避免计算结果超大，导致无法渲染
            }
            dryProfitRateList.Add(dryProfitRate);
            grossProfitRateList.Add(grossProfitRate);
        }


        if (string.IsNullOrEmpty(title) && settings.dim1Classifies?.Count > 0) {
            title = string.Join(',', settings.dim1Classifies);
        }


        var ds = new ChartDataSource();
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "利润率", Data = dryProfitRateList.Cast<object>() });
        ds.Data.Add(new ChartDataset { Label = "毛利率", Data = grossProfitRateList.Cast<object>() });
        return Task.FromResult(ds);
    }

}
```



`PageBaseHelper`如下：

实现了对用户选择的参数的记录功能，下次打开会自动配置。

```c#
using Blazored.LocalStorage;
using Microsoft.AspNetCore.Components;


namespace BIChart.Helper;
public abstract class PageBaseHelper : ComponentBase, IDisposable {
    public BICsvBaseTable dataTableHelper;
    public CommonStatisticsHelper helper;

    [Inject]
    protected ILocalStorageService LocalStorage { get; set; }

    [Inject]
    protected GlobalEventService GlobalEventService { get; set; }

    [Inject]
    protected Settings settings { get; set; }

    /// <summary>
    /// 页面名称，用来分别缓存不同页面的配置
    /// </summary>
    /// <returns></returns>
    protected abstract string getPageName();

    /// <summary>
    /// 使用哪个数据表
    /// </summary>
    /// <returns></returns>
    protected abstract BICsvBaseTable whichDataTable();

    /// <summary>
    /// 合法化settings配置选项
    /// </summary>
    protected abstract void onValidateSettings();

    /// <summary>
    /// 通知刷新图表
    /// </summary>
    /// <returns></returns>
    protected abstract Task onChartDataSourceChanged();

    protected override async Task OnInitializedAsync() {
        dataTableHelper = this.whichDataTable();
        helper = new(dataTableHelper);
        settings.changeDataTableHelper(helper);
        bool ok = await loadConfig();
        if (ok) {
            // todo 可以做下安全检查，以免读取的配置文件有误
        } else {
            onValidateSettings();
        }
        GlobalEventService.OnDataTableChanged();
        await helper.freshData(settings);

        GlobalEventService.QueryBtnClicked += OnQueryBtnClicked;
        await base.OnInitializedAsync();
    }
    protected async void OnQueryBtnClicked(object? sender, EventArgs e) {
        onValidateSettings();

        await saveConfig();
        await helper.freshData(settings);
        await onChartDataSourceChanged();
    }

    public void Dispose() {
        GlobalEventService.QueryBtnClicked -= OnQueryBtnClicked;
    }

    private async Task<bool> loadConfig() {
        // 从本地存储中读取配置
        return settings.Deserialize(await LocalStorage.GetItemAsStringAsync(this.getPageName()));
    }

    private async Task saveConfig() {
        // 将配置保存到本地存储中
        await LocalStorage.SetItemAsStringAsync(this.getPageName(), settings.Serialize());
    }
}
```



## 前端设计

通用的控件在`MainLayout.razor`里，属于全局范围。页面顶部设计一个公共的区域，用来让使用者选择参数。这个是从`blazor`原本的`About`区域扩展的，主要包含了时间范围的选择、列表选择、时间周期单位选择等。

```c#
@inherits LayoutComponentBase
@inject NavigationManager navigationManager
@inject GlobalEventService GlobalEventService
@using System.Text.Json;
@using Blazored.LocalStorage
@inject ILocalStorageService LocalStorage
@inject Settings settings
@implements IDisposable


<PageTitle>BIChart</PageTitle>

<div class="page">
    <div class="sidebar">
        <NavMenu />
    </div>

    <main>
        <div class="top-row px-4">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-auto">时间范围：</div>
                    <div class="col-auto"><DateTimeRange @bind-Value="@dateRange" ShowSidebar="true" SidebarItems=@SidebarItems /></div>
                    <div class="col-auto">分析：</div>
                    <div class="col-auto">
                        <select @bind="dim1ColumnIndex" @bind:event="oninput" @onchange="onSelectedDim1Index">
                            @foreach (var option in optionsOfDim1) {
                                <option value="@option.Key">@option.Value</option>
                            }
                        </select>
                    </div>
                    <div class="col-auto">
                        <MultiSelect Items="@optionsOfDim1Name" @bind-Value="@dim1Classifies" />
                    </div>
                    <div class="col-auto">在：</div>
                    <div class="col-auto">
                        <select @bind="dimXColumnIndex" @bind:event="oninput">
                            @foreach (var option in optionsOfDim1) {
                                <option value="@option.Key">@option.Value</option>
                            }
                        </select>
                    </div>
                    @if (selectDisabled) {
                        <div class="col-auto"><Spinner /></div>
                    }
                    <div class="col-auto">的数据表现。统计周期：</div>
                    <div class="col-auto">
                        <select @bind="timeUnit" @bind:event="oninput" disabled="@selectDisabled">
                            @foreach (var option in BICommonUtil.periodLists) {
                                <option text="@option.Key">@option.Key</option>
                            }
                        </select>
                    </div>
                    <div class="col-auto"><Button OnClick="@onQueryBtnClick" Color="Color.Primary">查询</Button></div>
                </div>
            </div>
        </div>

        <article class="content px-4">
            @Body
        </article>
    </main>
</div>


@code{
        // URL参数：维度1的列索引序号
        [Parameter]
        [SupplyParameterFromQuery(Name = "dim1ColumnIndex")]
        public int dim1ColumnIndex { set; get; }

        // URL参数：维度1的子分类，用户多选
        [Parameter]
        [SupplyParameterFromQuery(Name = "dim1Classifies")]
        public string dim1Classifies { set; get; } = string.Empty;

        // URL参数：维度X的列索引序号
        [Parameter]
        [SupplyParameterFromQuery(Name = "dimXColumnIndex")]
        public int dimXColumnIndex { set; get; }

        // URL参数：统计时间单位
        [Parameter]
        [SupplyParameterFromQuery(Name = "timeUnit")]
        public string timeUnit { get; set; } = string.Empty;


    private Dictionary<int, string> optionsOfDim1 = new();
    private List<SelectedItem> optionsOfDim1Name = new();

    private bool selectDisabled = false;

    protected override async Task OnInitializedAsync() {
        await base.OnInitializedAsync();
        GlobalEventService.DataTableChanged += onDataTableChanged;
    }

    /// <summary>
    /// 当页面切换时所用的数据表格也会变化，UI上的选项要随做调整
    /// </summary>
    /// <param name="sender"></param>
    /// <param name="e"></param>
    private async void onDataTableChanged(object? sender, EventArgs e) {
        // 调整可选项
        optionsOfDim1 = settings.getDataTableHelper().dataHelper.getColumnsToSelectEx();
        updateDataFromSettings();
        await InvokeAsync(StateHasChanged);
    }

    /// <summary>
    /// 当切换维度1的列表选择的时候的处理事件
    /// </summary>
    /// <param name="e"></param>
    private void onSelectedDim1Index(ChangeEventArgs e) {
        //dim1ColumnIndex = e.Value;
        settings.dim1ColumnIndex = dim1ColumnIndex;
        dim1Classifies = string.Empty;                  // 切换选项后要置空
        updateSelectOptions(dim1ColumnIndex);
    }

    /// <summary>
    /// 根据切换的列获取出所有的分类
    /// </summary>
    private void updateSelectOptions(int columnIndex) {
        optionsOfDim1Name = settings.getDataTableHelper().dataHelper.getAllClassifies(null, columnIndex).Select(i => new SelectedItem(i, i)).ToList();
    }

    /// <summary>
    /// 开始查询
    /// </summary>
    /// <param name="e"></param>
    /// <returns></returns>
    private async Task onQueryBtnClick(MouseEventArgs e) {
        settings.dim1ColumnIndex = dim1ColumnIndex;
        if (string.IsNullOrEmpty(dim1Classifies)) {
            settings.dim1Classifies.Clear();
        }else {
            settings.dim1Classifies = dim1Classifies.Split(',').ToList();
        }
        settings.dimXColumnIndex = dimXColumnIndex;
        settings.statisticsTimeUnit = timeUnit;
        settings.setDateTimeRange(dateRange.Start, dateRange.End);

        Dictionary<string, string> args = new() {
            { "dim1ColumnIndex", dim1ColumnIndex.ToString()},
            { "dim1Classifies", dim1Classifies},
            { "dimXColumnIndex", dimXColumnIndex.ToString()},
            { "timeUnit", timeUnit},
        };

        if (dateRange.Start!=DateTime.MinValue) {
            args.Add("startTime", dateRange.Start.ToString("yyyy-MM-dd"));
        }
        if (dateRange.End != DateTime.MinValue) {
            args.Add("endTime", dateRange.End.ToString("yyyy-MM-dd"));
        }
        BICommonUtil.updateUrlArgs(navigationManager, args);
        GlobalEventService.OnQueryBtnClicked();
    }

    private void updateData() {
        int temp = 0;
        string? s;

        s = BICommonUtil.getUrlArg(navigationManager, "dim1ColumnIndex");
        if (string.IsNullOrEmpty(s)) {
            dim1ColumnIndex = settings.dim1ColumnIndex;
        }else {
            Int32.TryParse(s, out temp);
            dim1ColumnIndex = temp;
        }
        updateSelectOptions(dim1ColumnIndex);

        s = BICommonUtil.getUrlArg(navigationManager, "dim1Classifies");
        if (!string.IsNullOrEmpty(s)) {
            dim1Classifies = s;
        }else {
            dim1Classifies = string.Join(',', settings.dim1Classifies);
        }

        s = BICommonUtil.getUrlArg(navigationManager, "dimXColumnIndex");
        if (string.IsNullOrEmpty(s)) {
            dimXColumnIndex = settings.dimXColumnIndex;
        } else {
            Int32.TryParse(s, out temp);
            dimXColumnIndex = temp;
        }

        timeUnit = BICommonUtil.getUrlArg(navigationManager, "timeUnit") ?? settings.statisticsTimeUnit;

        DateTime time;
        TimeOnly timeOnly = new (0, 0);
        s = BICommonUtil.getUrlArg(navigationManager, "startTime");
        if (!string.IsNullOrEmpty(s)) {
            DateTime.TryParse(s, out time);
            dateRange.Start = time;
        }else {
            dateRange.Start = settings.startDateTime.ToDateTime(timeOnly);
        }
        s = BICommonUtil.getUrlArg(navigationManager, "endTime");
        if (!string.IsNullOrEmpty(s)) {
            DateTime.TryParse(s, out time);
            dateRange.End = time;
        } else {
            dateRange.End = settings.endDateTime.ToDateTime(timeOnly);
        }
    }

    // 从用户配置更新UI数据
    private void updateDataFromSettings() {
        dim1ColumnIndex = settings.dim1ColumnIndex;
        dim1Classifies = string.Join(',', settings.dim1Classifies);
        dimXColumnIndex = settings.dimXColumnIndex;
        timeUnit = settings.statisticsTimeUnit;
        updateSelectOptions(dim1ColumnIndex);
    }

    public void Dispose() {
        GlobalEventService.DataTableChanged -= onDataTableChanged;
    }


    // 时间选择范围控件
    private DateTimeRangeValue dateRange { get; set; } = new();
    private static IEnumerable<DateTimeRangeSidebarItem> SidebarItems => GetSidebarItems();

    private static IEnumerable<DateTimeRangeSidebarItem> GetSidebarItems() {
        var now = DateTime.Now;
        var thisYear = now.Year;
        var lastYear = thisYear - 1;

        // 计算本年和去年的季度
        int currentQuarter = (now.Month + 2) / 3;
        DateTime startOfCurrentQuarter = new DateTime(now.Year, (currentQuarter - 1) * 3 + 1, 1);
        DateTime endOfCurrentQuarter = startOfCurrentQuarter.AddMonths(3).AddDays(-1);

        DateTime startOfLastQuarter = startOfCurrentQuarter.AddMonths(-3);
        DateTime endOfLastQuarter = startOfCurrentQuarter.AddDays(-1);

        DateTime startOfLastYearSameQuarter = startOfCurrentQuarter.AddYears(-1);
        DateTime endOfLastYearSameQuarter = endOfCurrentQuarter.AddYears(-1);

        return new List<DateTimeRangeSidebarItem> {
            new DateTimeRangeSidebarItem { Text = "近一年", StartDateTime = now.AddYears(-1), EndDateTime = now },
            new DateTimeRangeSidebarItem { Text = "去年", StartDateTime = new DateTime(lastYear, 1, 1), EndDateTime = new DateTime(lastYear, 12, 31) },
            new DateTimeRangeSidebarItem { Text = "去年 Q1", StartDateTime = new DateTime(lastYear, 1, 1), EndDateTime = new DateTime(lastYear, 3, 31) },
            new DateTimeRangeSidebarItem { Text = "去年 Q2", StartDateTime = new DateTime(lastYear, 4, 1), EndDateTime = new DateTime(lastYear, 6, 30) },
            new DateTimeRangeSidebarItem { Text = "去年 Q3", StartDateTime = new DateTime(lastYear, 7, 1), EndDateTime = new DateTime(lastYear, 9, 30) },
            new DateTimeRangeSidebarItem { Text = "去年 Q4", StartDateTime = new DateTime(lastYear, 10, 1), EndDateTime = new DateTime(lastYear, 12, 31) },
            new DateTimeRangeSidebarItem { Text = "本年", StartDateTime = new DateTime(thisYear, 1, 1), EndDateTime = new DateTime(thisYear, 12, 31) },
            new DateTimeRangeSidebarItem { Text = "本年 Q1", StartDateTime = new DateTime(thisYear, 1, 1), EndDateTime = new DateTime(thisYear, 3, 31) },
            new DateTimeRangeSidebarItem { Text = "本年 Q2", StartDateTime = new DateTime(thisYear, 4, 1), EndDateTime = new DateTime(thisYear, 6, 30) },
            new DateTimeRangeSidebarItem { Text = "本年 Q3", StartDateTime = new DateTime(thisYear, 7, 1), EndDateTime = new DateTime(thisYear, 9, 30) },
            new DateTimeRangeSidebarItem { Text = "本年 Q4", StartDateTime = new DateTime(thisYear, 10, 1), EndDateTime = new DateTime(thisYear, 12, 31) },
            new DateTimeRangeSidebarItem { Text = "本年至今", StartDateTime = new DateTime(thisYear, 1, 1), EndDateTime = now },
            new DateTimeRangeSidebarItem { Text = "本季度", StartDateTime = startOfCurrentQuarter, EndDateTime = endOfCurrentQuarter },
            new DateTimeRangeSidebarItem { Text = "本季度至今", StartDateTime = startOfCurrentQuarter, EndDateTime = now },
            new DateTimeRangeSidebarItem { Text = "上季度", StartDateTime = startOfLastQuarter, EndDateTime = endOfLastQuarter },
            new DateTimeRangeSidebarItem { Text = "去年同季度", StartDateTime = startOfLastYearSameQuarter, EndDateTime = endOfLastYearSameQuarter }
        };
    }

}
```



## 业务实现

假如手头有一个新的表格需要分析，怎么做呢？

1. 导出为`CSV`格式文件，并把文件存放在`Data`目录下（其他文件目录也可以，通过相对路径定位）。

2. 创建一个派生自`BICsvBaseTable`的类，用来简单描述该数据表。简单到什么程度？只需要两步：

   1. 声明一些表格列头的静态变量，可以不用全部声明，只需要声明实际需要的即可，且无须考虑顺序。用特性类`TableColumnAttribute`进行注解，标注对应的列名、数据格式、是否需要展示分析。
   1. 实现`getDataFilePath`函数，主要是告知`CSV`文件路径的。

```c#
using System.Data;

namespace BIChart;

// 订单详情csv解析辅助类
public class BIOrdersTable : BICsvBaseTable {
  	[TableColumnAttribute(name: "时间", dataType: typeof(DateOnly))]
    public static int columnIndexDate;

    [TableColumnAttribute(name: "数额", dataType: typeof(double))]
    public static int columnIndexValue;

    [TableColumnAttribute(name: "类型", canSelect: true)]
    public static int columnIndexType;

    //…… 此处省略多个列头的索引声明

    // 获取某个月份的经营收入表格的全文件路径
    public override string? getDataFilePath() {
        string filePath = star.paths.findRecentOneFile(Path.Combine(Constant.RootDirName, "订单明细"), ".csv");
        return filePath;
    }
}
```

​      

3. 创建一个页面组件，用来展示各种图表，这里使用了第三方的图表：[BootstrapBlazor.Chart](https://www.blazor.zone/charts/index)，类似代码如下：

```c#
@page "/pageName"

@using BIChart.Helper;
@inherits PageBaseHelper
@inject Settings settings


<PageTitle>@title</PageTitle>
<h3>@title - 数额走势</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(helper.amountDataSource)' @ref="BarChart1" />

<h3>@title - 占比情况</h3>
<Chart ChartType="ChartType.Pie" OnInitAsync='() => Task.FromResult(helper.pieDataSource)' @ref="PieChart" />

<h3>@title - 占比走势</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(helper.ratioDataSource)' @ref="BarChart2" />

<h3>@title - xx数量</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(helper.itemCountDataSource)' @ref="BarChart3" />

<h3>@title - xx单价</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(helper.aovDataSource)' @ref="BarChart4" />


@code{
	private string title = "xxx统计分析";                // 图表标题

	private Chart PieChart = new();
	private Chart BarChart1 = new();
	private Chart BarChart2 = new();
	private Chart BarChart3 = new();
	private Chart BarChart4 = new();


	protected override string getPageName() { return "pageName"; }

	/// 使用哪个数据表
	protected override BICsvBaseTable whichDataTable() {
		if (this.dataTableHelper is null) { this.dataTableHelper = new BIOrdersTable(); }  // 用哪个助手类来解析
		return this.dataTableHelper;
	}

	/// 合法化settings配置选项
	protected override void onValidateSettings() {
		if (settings.dim1ColumnIndex == -1) { settings.dim1ColumnIndex = BIOrdersTable.columnIndexChildProductName; }
		if (settings.dimXColumnIndex == -1) { settings.dimXColumnIndex = settings.dim1ColumnIndex; }
		if (string.IsNullOrEmpty(settings.statisticsTimeUnit)) { settings.statisticsTimeUnit = Constant.periodNameOfQuarter; }
		settings.columnIndexDate = BIOrdersTable.columnIndexPayDate;
		settings.columnIndexValue = BIOrdersTable.columnIndexPayMoney;
	}

	/// 图表数据源发生变化，重新加载一下
	protected override async Task onChartDataSourceChanged() {
		await PieChart.Reload();
		await BarChart1.Reload();
		await BarChart2.Reload();
		await BarChart3.Reload();
		await BarChart4.Reload();
	}
}
```

4. 添加到导航栏即可。

```html
<div class="nav-item px-3">
   <CustomNavLink class="nav-link" href="pageName">
	   <span class="oi oi-person" aria-hidden="true"></span> 统计xxx的
   </CustomNavLink>
</div>
```



# 易用性设计

- 页面顶部设计一个公共的区域，用来让使用者选择参数。这个是从`blazor`原本的`About`区域扩展的，主要包含了时间范围的选择、列表选择、时间周期单位选择等。
- 实现了对用户选择的参数的记录功能，下次打开会自动选择。
- 实现了自动更新URL，自动拼接上使用者选择的参数，而且当使用者直接使用带参数的URL访问时，控件能自动更新且查询时会使用参数。但是项目并没有利用URL做参数解析，而是直接使用了缓存的本地存储中的用户配置。有兴趣的可以自行研究拓展。
- 使用注解特性`TableColumnAttribute`来方便标注表格的列，可以不用全部声明，只需要声明实际需要的即可，且无须考虑顺序。标注对应的列名、数据格式、是否需要展示分析。
- 在基础表里面做了一些异常判断，如果列名标注有误，会给出错误提示，方便排查问题。



# 安装的三方库

- [BootstrapBlazor](https://www.blazor.zone/introduction)
- [BootstrapBlazor.Chart](https://www.blazor.zone/charts/index)
- [CsvHelper](https://github.com/JoshClose/CsvHelper)
- [Blazored.LocalStorage](https://github.com/Blazored/LocalStorage)
