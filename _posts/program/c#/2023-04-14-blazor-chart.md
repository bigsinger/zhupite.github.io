---
layout:		post
category:	"program"
title:		"C#之Blazor开发数据图表分析项目"

tags:		[c#,blazor,net,chart]
---
- Content
{:toc}


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

`BICsvBaseTable`

```c#
using System.Data;
using System.Globalization;
using BIChart;
using CsvHelper;

public abstract class BICsvBaseTable {
    private DataTable dataTable = new();

    // 获取待分析数据的文件路径
    public abstract string? getDataFilePath();

    // Manually define the columns and their types
    protected abstract void defineColumnType(DataTable dt, int columnCount);

    // 读取csv记录到datatable
    public DataTable readData(string? csvFile) {
        DataTable dt = new DataTable();
        if (File.Exists(csvFile) == false) { return dt; }

        using (var reader = new StreamReader(csvFile))
        using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture)) {
            csv.Read();
            var rawRecord = csv.Context.Parser.RawRecord;
            this.columnNames = rawRecord.Split(',');  // 列头一般不会有逗号
            csv.ReadHeader();

            // Manually define the columns and their types
            defineColumnType(dt, this.columnNames.Length);

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
        if (normalClassifiesDic == null || normalClassifiesDic.Count == 0) { return obj; }
        if (obj is string) {
            string? name = obj as string;
            string? newName = null;
            if (name != null) {
                normalClassifiesDic.TryGetValue(columnIndex, out Dictionary<string, string>? nameMap);
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
        if (normalClassifiesDic == null) return;

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
    private string[]? columnNames;

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
    public List<string> getAllClassifies(DataTable? dt, int columnIndex) {
        if (dt == null) { dt = dataTable; }
        if (!classifies.TryGetValue(columnIndex, out List<string>? list)) {
            list = BICommonUtil.getAllClassifiesInner(dt, columnIndex);
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

2. 创建一个派生自`BICsvBaseTable`的类，用来简单描述该数据表。简单到什么程度？只需要做三块：

   1. 声明一些表格列头的索引数值常量，可以不用全部声明完，只需要声明实际需要的即可。
2. 实现`getDataFilePath`函数，主要是告知`CSV`文件路径的。
   3. 实现`defineColumnType`函数，主要是对某些列进行类型指定，用以提高速度的，后面读取数据的时候就不用额外做转换操作了。
3. 实现构造函数并初始化`columnsToSelect`，用来告知哪些列是可以选择的。

```c#
using System.Data;

namespace BIChart;

// 订单详情csv解析辅助类
public class BIOrdersTable : BICsvBaseTable {
  // CSV的列意义
  public const int columnIndexDate = 0;                   	//时间
  public const int columnIndexValue = 5;                  	//数额
  public const int columnIndexType = 6;                   	//类型
	//…… 此处省略多个列头的索引声明

	public BIOrdersTable() {
        this.columnsToSelect = new(){
            columnIndexType,
            //……
        };
    }

  public override string getDataFilePath() {
	  string csvFile = Path.Combine(Constant.RootDirName, "xxx数据", "", string.Format("{0:00}.csv", 1));
	  return csvFile;
  }

  // Manually define the columns and their types
  protected override void defineColumnType(DataTable dt, int columnCount) {
	  DataColumn col;
	  for (int columnIndex = 0; columnIndex < columnCount; columnIndex++) {
		  if (columnIndex == columnIndexDate) {
			  col = new DataColumn("", typeof(DateOnly));
		  } else if (columnIndex == columnIndexValue) {
			  col = new DataColumn("", typeof(double));
		  } else {
			  col = new DataColumn("", typeof(string));
		  }
		  dt.Columns.Add(col);
	  }
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



# 安装的三方库

- [BootstrapBlazor](https://www.blazor.zone/introduction)
- [BootstrapBlazor.Chart](https://www.blazor.zone/charts/index)
- [CsvHelper](https://github.com/JoshClose/CsvHelper)
- [Blazored.LocalStorage](https://github.com/Blazored/LocalStorage)
