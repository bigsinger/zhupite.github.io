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

    // 获取待分析数据的文件路径
    public abstract string getDataFilePath();

    // Manually define the columns and their types
    protected abstract void defineColumnType(DataTable dt, int columnCount);

    // 读取csv记录到datatable
    public DataTable readData(string csvFile) {
        if (File.Exists(csvFile) == false) { return null; }
        DataTable dt = new DataTable();

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
                    row[columnIndex] = csv.GetField(column.DataType, columnIndex);
                    columnIndex++;
                }

                dt.Rows.Add(row);
            }
        }

        return dt;
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
    public List<string> getAllClassifies(DataTable dt, int columnIndex) {
        if (!classifies.TryGetValue(columnIndex, out List<string> list)) {
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
        if (!mAllYears.TryGetValue(columnIndex, out List<int> allYears)) {
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

`BaseStatisticsHelper`

这里有个比较强的可扩展功能，就是可以随意变更列的索引来实现对不同维度的数据分析。

```c#
using System.Data;
using BootstrapBlazor.Components;

namespace BIChart;

public class BaseStatisticsHelper {
    protected BICsvBaseTable dataHelper;
    protected DataTable dataTable = null;

    protected void loadDataTable(BICsvBaseTable table) {
        dataHelper = table;
        dataTable = table.readData(table.getDataFilePath());
    }

    /// <summary>
    /// 如果需要重新生成数据源时，请在派生类里实现该函数并调用生成数据源的方法。
    /// </summary>
    /// <returns></returns>
    public virtual Task freshData() { return Task.CompletedTask; }


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
    public async Task<(ChartDataSource, ChartDataSource, ChartDataSource)> initAmountData(string title, int columnIndexDate, int columnIndexFix, List<string> targetNames, int columnIndexTarget, int columnIndexValue) {
        if (targetNames == null || targetNames.Count == 0) { return (null, null, null); }

        var years = dataHelper.getAllYears(dataTable, columnIndexDate, Constant.keepRecentYearsCount);

        // 获取某列的所有分类
        List<string> classifies = dataHelper.getAllClassifies(dataTable, columnIndexTarget);

        DateRangeIterator dateIterator = new(Settings.Instance.statisticsTimeUnit, years);
        Dictionary<string, List<double>> amountDic = new();     //金额
        Dictionary<string, List<int>> countDic = new();         //订单数量
        Dictionary<string, List<double>> aovDic = new();        //订单单价

        List<double> amountList = new();                        //总金额数据列表
        List<int> countList = new();                            //总订单数量数据列表
        List<double> aovList = new();                           //总订单单价数据列表


        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            int itemCount = 0;
            double totalAmount = 0.0;
            var items = BICommonUtil.getTotalValueOfClassifies(dataTable, columnIndexDate, date1, date2, columnIndexFix, targetNames, columnIndexTarget, columnIndexValue, out itemCount, out totalAmount);

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


        // 金额的数据源
        var ds = new ChartDataSource();
        ds.Options.Title = "总额 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = amountList.Cast<object>() });
        foreach (var item in amountDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }
        var amountDataSource = ds;


        // 订单数量的数据源
        ds = new ChartDataSource();
        ds.Options.Title = "数量 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = countList.Cast<object>() });
        foreach (var item in countDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }
        var itemCountDataSource = ds;


        // 订单单价的数据源
        ds = new ChartDataSource();
        ds.Options.Title = "平均 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "总计", Data = aovList.Cast<object>() });
        foreach (var item in aovDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }
        var aovDataSource = ds;


        return (amountDataSource, itemCountDataSource, aovDataSource);
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
    public async Task<ChartDataSource> initRatioData(string title, int columnIndexDate, int columnIndexFix, List<string> targetNames, int columnIndexTarget, int columnIndexValue) {
        if (targetNames == null || targetNames.Count == 0) { return null; }

        var years = dataHelper.getAllYears(dataTable, columnIndexDate, Constant.keepRecentYearsCount);

        // 获取某列的所有分类
        List<string> classifies = dataHelper.getAllClassifies(dataTable, columnIndexTarget);

        DateRangeIterator dateIterator = new(Settings.Instance.statisticsTimeUnit, years);
        Dictionary<string, List<double>> amountDic = new();    //金额
        Dictionary<string, List<int>> countDic = new();        //订单数量
        Dictionary<string, List<double>> aovDic = new();       //订单单价

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            int itemCount = 0;
            double totalAmount = 0.0;
            var items = BICommonUtil.getTotalValueOfClassifies(dataTable, columnIndexDate, date1, date2, columnIndexFix, targetNames, columnIndexTarget, columnIndexValue, out itemCount, out totalAmount);

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

        // 金额占比走势的数据源
        var ds = new ChartDataSource();
        ds.Options.Title = "占比走势 - " + title ?? "";
        ds.Labels = dateIterator.getTimeLabels();
        foreach (var item in amountDic) {
            ds.Data.Add(new ChartDataset { Label = item.Key, Data = item.Value.Cast<object>() });
        }
        return ds;
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
    public async Task<ChartDataSource> initPieData(string title, int columnIndexDate, int columnIndexToMatch, List<string> targetNames, int columnIndexTarget, int columnIndexValue) {
        if (targetNames == null || targetNames.Count == 0) { return null; }

        DateOnly startDateTime = Settings.Instance.startDateTime;
        DateOnly endDateTime = Settings.Instance.endDateTime;

        int itemCount = 0;
        double totalAmount = 0.0;
        var items = BICommonUtil.getTotalValueOfClassifies(dataTable, columnIndexDate, startDateTime, endDateTime, columnIndexToMatch, targetNames, columnIndexTarget, columnIndexValue, out itemCount, out totalAmount);
        var orderDic = items.OrderByDescending(pair => pair.Value.Value).ToDictionary(pair => pair.Key, pair => pair.Value);
        var list = orderDic.Select(kv => kv.Value.Value).ToList();
        list = list.ConvertAll(x => Math.Round(x / totalAmount * 100, 2));

        var ds = new ChartDataSource();
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Labels = orderDic.Keys;
        ds.Data.Add(new ChartDataset { Data = list.Cast<object>() });
        return ds;
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
    public async Task<ChartDataSource> initMultiColumnData(string title, int columnIndexDate, int columnIndexToMatch, List<string> targetNames, List<int> columns) {
        var years = dataHelper.getAllYears(dataTable, columnIndexDate, Constant.keepRecentYearsCount);
        DateRangeIterator dateIterator = new(Settings.Instance.statisticsTimeUnit, years);

        Dictionary<int, List<double>> result = new();

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            foreach (var column in columns) {
                result.TryGetValue(column, out var list);
                if (list == null) {
                    list = new();
                    result[column] = list;
                }
                list.Add(BICommonUtil.reformatDouble(BICommonUtil.getTotalValue(dataTable, columnIndexDate, date1, date2, columnIndexToMatch, targetNames, column)));
            }
        }

        var ds = new ChartDataSource();
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Labels = dateIterator.getTimeLabels();
        foreach (var column in columns) {
            ds.Data.Add(new ChartDataset { Label = dataHelper.getColumnName(column), Data = result[column].Cast<object>() });
        }
        return ds;
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
    public async Task<ChartDataSource> initProfitData(string title, int columnIndexDate, int columnIndexToMatch, List<string> targetNames, int columnIndexOfIncome, int columnIndexOfCor, int columnIndexOfCost) {
        var years = dataHelper.getAllYears(dataTable, columnIndexDate, Constant.keepRecentYearsCount);
        DateRangeIterator dateIterator = new(Settings.Instance.statisticsTimeUnit, years);

        List<double> dryProfitRateList = new();
        List<double> grossProfitRateList = new();

        while (dateIterator.getNextSegment(out string label, out DateOnly date1, out DateOnly date2)) {
            double dryProfitRate = 0;
            double grossProfitRate = 0;

            double cor = BICommonUtil.getTotalValue(dataTable, columnIndexDate, date1, date2, columnIndexToMatch, targetNames, columnIndexOfCor);
            double cost = BICommonUtil.getTotalValue(dataTable, columnIndexDate, date1, date2, columnIndexToMatch, targetNames, columnIndexOfCost);
            double income = BICommonUtil.getTotalValue(dataTable, columnIndexDate, date1, date2, columnIndexToMatch, targetNames, columnIndexOfIncome);

            if (income > 0.1) {
                dryProfitRate = Math.Round((income - cost) / income * 100, 2);
                grossProfitRate = Math.Round((income - cor) / income * 100, 2);
                if (dryProfitRate > 999.0f) { dryProfitRate = 999.0f; }             // 避免计算结果超大，导致无法渲染
                if (grossProfitRate > 999.0f) { grossProfitRate = 999.0f; }         // 避免计算结果超大，导致无法渲染
            }
            dryProfitRateList.Add(dryProfitRate);
            grossProfitRateList.Add(grossProfitRate);
        }

        var ds = new ChartDataSource();
        if (!string.IsNullOrEmpty(title)) { ds.Options.Title = title; }
        ds.Labels = dateIterator.getTimeLabels();
        ds.Data.Add(new ChartDataset { Label = "利润率", Data = dryProfitRateList.Cast<object>() });
        ds.Data.Add(new ChartDataset { Label = "毛利率", Data = grossProfitRateList.Cast<object>() });
        return ds;
    }

}
```



## 业务实现

假如手头有一个新的表格需要分析，怎么做呢？

1. 导出为`CSV`格式文件，并把文件存放在`wwwroot`目录下（其他文件目录应该也可以，不过没试过）。

2. 创建一个派生自`BICsvBaseTable`的类，用来简单描述该数据表。简单到什么程度？只需要做三块：

   1. 声明一些表格列头的索引数值常量，可以不用全部声明完，只需要声明实际需要的即可。

   2. 实现`getDataFilePath`函数，主要是告知`CSV`文件路径的。

   3. 实现`defineColumnType`函数，主要是对某些列进行类型指定，用以提高速度的，后面读取数据的时候就不用额外做转换操作了。

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

3. 创建一个派生自`BaseStatisticsHelper`的助手类，用来从数据表解析出数据源，解析数据源的基本函数代码已经在基类里写好了，只需要用合适的参数去调用即可，由于不同的数据表列是不同的，所以可以在助手类这一层指定。

```c#
using BootstrapBlazor.Components;

namespace BIChart;

public class OrderHelper : BaseStatisticsHelper {
   private static OrderHelper mInstance = null;
   public static OrderHelper Instance {
	   get {
		   if (mInstance == null) {
			   mInstance = new();
			   mInstance.loadDataTable(new BIOrdersTable());
		   }
		   return mInstance;
	   }
   }

   public ChartDataSource? amountDataSource;       // 累计数额的数据源
   public ChartDataSource? itemCountDataSource;    // 数量的数据源
   public ChartDataSource? aovDataSource;          // 均值的数据源

   public ChartDataSource? pieDataSource;          // 占比饼图的数据源
   public ChartDataSource? ratioDataSource;        // 占比走势的数据源

   public override async Task freshData() {
	   (amountDataSource, itemCountDataSource, aovDataSource) = await InitData(Settings.Instance.targetName, BIOrdersTable.columnIndexDate, BIOrdersTable.columnIndexTargetName, new() { Settings.Instance.targetName }, Settings.Instance.columnIndexTarget, BIOrdersTable.columnIndexValue);
	   pieDataSource = await initPieData(Settings.Instance.targetName, BIOrdersTable.columnIndexDate, BIOrdersTable.columnIndexTargetName, new() { Settings.Instance.targetName }, Settings.Instance.columnIndexTarget, BIOrdersTable.columnIndexValue);
	   ratioDataSource = await initRatioData(Settings.Instance.targetName, BIOrdersTable.columnIndexDate, BIOrdersTable.columnIndexTargetName, new() { Settings.Instance.targetName }, Settings.Instance.columnIndexTarget, BIOrdersTable.columnIndexValue);
   }
}
```

4. 创建一个页面组件，用来展示各种图表，这里使用了第三方的图表：[BootstrapBlazor.Chart](https://www.blazor.zone/charts/index)，类似代码如下：

```c#
@page "/pageName"

@implements IDisposable
@using Microsoft.Extensions.Logging;
@inject GlobalEventService GlobalEventService


<PageTitle>@title</PageTitle>
<h3>@title - 数额走势</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(OrderHelper.Instance.amountDataSource)' @ref="BarChart1" />

<h3>@title - 占比情况</h3>
<Chart ChartType="ChartType.Pie" OnInitAsync='() => Task.FromResult(OrderHelper.Instance.pieDataSource)' @ref="PieChart" />

<h3>@title - 占比走势</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(OrderHelper.Instance.ratioDataSource)' @ref="BarChart2" />

<h3>@title - xx数量</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(OrderHelper.Instance.itemCountDataSource)' @ref="BarChart3" />

<h3>@title - xx均值</h3>
<Chart ChartType="ChartType.Line" OnInitAsync='() => Task.FromResult(OrderHelper.Instance.aovDataSource)' @ref="BarChart4" />

@code {
   private string title = "统计xxx的";

   private Chart BarChart1 { get; set; }
   private Chart PieChart { get; set; }
   private Chart BarChart2 { get; set; }
   private Chart BarChart3 { get; set; }
   private Chart BarChart4 { get; set; }

   protected override async Task OnInitializedAsync() {
	   GlobalEventService.ButtonClicked += OnButtonClicked;
	   Settings.Instance.columnIndexTarget = BIOrdersTable.columnIndexType;
	   await OrderHelper.Instance.freshData();
	   await base.OnInitializedAsync();
   }

   private async void OnButtonClicked(object sender, EventArgs e) {
	   Settings.Instance.columnIndexTarget = BIOrdersTable.columnIndexType;
	   await OrderHelper.Instance.freshData();
	   await BarChart1.Reload();
	   await PieChart.Reload();
	   await BarChart2.Reload();
	   await BarChart3.Reload();
	   await BarChart4.Reload();
   }

   public void Dispose() {
	   GlobalEventService.ButtonClicked -= OnButtonClicked;
   }
}
```

5. 添加到导航栏即可。

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
- 实现了自动更新URL，自动拼接上使用者选择的参数，而且当使用者直接使用带参数的URL访问时，控件能自动更新且查询时会使用参数。
- 



# 安装的三方库

- [BootstrapBlazor](https://www.blazor.zone/introduction)
- [BootstrapBlazor.Chart](https://www.blazor.zone/charts/index)
- [CsvHelper](https://github.com/JoshClose/CsvHelper)
