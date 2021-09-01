---
layout:		post
category:	"soft"
title:		"DIY解决老电脑的性能问题"

tags:		[diy,电脑性能]
---
- Content
{:toc}
**关键词**：diy电脑，电脑性能，组装电脑，加装内存条，显卡问题，加装固态硬盘



# 问题

- 电脑运行一段时间屏幕会白屏、黑屏、竖条纹屏、花屏等。
- 电脑性能慢



# 信息收集

年代久远，产品说明和保修卡什么的也找不到了，登录电商APP查看购买记录呢，发现是之前很早的一个账号购买的，也无法找回了，只能通过拆机查看硬件信息，然后结合硬件信息反查机型了。



最终找到应该是这个型号：[Specs DELL XPS 8700 DDR3-SDRAM i5-4440 Desktop 4th gen Intel® Core™ i5 4 GB 1000 GB HDD Windows 8.1 PC Black PCs/Workstations (8700-D358)](https://icecat.biz/en/p/dell/8700-d358/xps-pcs-workstations-8700-32507161.html)




也即：**Dell XPS 8700-D358**，找到中文信息参考：[【戴尔Studio XPS 8700 XPS8700-D358参数】DELL Studio XPS 8700 XPS8700-D358台式电脑参数_规格_性能_功能  ZOL中关村在线](https://detail.zol.com.cn/368/367165/param.shtml)

| 基本参数   |                                                              |
| :--------- | ------------------------------------------------------------ |
| 产品类型   | 家用电脑，游戏电脑                                           |
| 操作系统   | [Windows 8.1 64bit（64位简体中文版）](https://detail.zol.com.cn/desktop_pc/p26046/) |
| 主板芯片组 | Intel Z87                                                    |



| 处理器      |                                                              |
| :---------- | ------------------------------------------------------------ |
| CPU系列     | 英特尔 酷睿i5 4代系列                                        |
| CPU型号     | Intel 酷睿i5 4440                                            |
| CPU频率     | 3100GHz                                                      |
| 最高睿频    | 3300GHz                                                      |
| 总线规格    | DMI 5 GT/s                                                   |
| 缓存        | 6MB                                                          |
| 核心代号    | Haswell                                                      |
| 核心/线程数 | [四核心/四线程](https://detail.zol.com.cn/desktop_pc/s6909/) |
| 制程工艺    | 22nm                                                         |



| 存储设备 |                                                              |
| :------- | ------------------------------------------------------------ |
| 内存容量 | [8GB](https://detail.zol.com.cn/desktop_pc/s6449/)           |
| 内存类型 | [DDR3 1600MHz](https://detail.zol.com.cn/desktop_pc/p22208/) |
| 内存插槽 | 4个DiMM插槽                                                  |
| 硬盘容量 | [1TB](https://detail.zol.com.cn/desktop_pc/s2710/)           |
| 硬盘描述 | 7200转                                                       |
| 光驱类型 | [DVD刻录机](https://detail.zol.com.cn/desktop_pc/p2876/)     |



| 显卡/声卡 |                                                    |
| :-------- | -------------------------------------------------- |
| 显卡类型  | 独立显卡                                           |
| 显卡芯片  | AMD Radeon R9 270                                  |
| 显存容量  | [2GB](https://detail.zol.com.cn/desktop_pc/s6917/) |
| DirectX   | DirectX 11                                         |



| 网络通信 |                      |
| :------- | -------------------- |
| 无线网卡 | 802.11 b/g/n无线网卡 |
| 有线网卡 | 1000Mbps以太网卡     |



| I/O接口  |                                                              |
| :------- | ------------------------------------------------------------ |
| 数据接口 | 2×USB2.0+2×USB3.0；1×19合1读卡器；1×耳机输出接口；1×麦克风输入接口 |
| 视频接口 | 2×USB2.0+4×USB3.0；1×HDMI；1×DisplayPort；1×RJ45（网络接口）；6×插孔 |
| 扩展插槽 | 1×PCIe x16 3×PCIe x1 2×SATA 2 2×SATA 3 1×Mini-PCIe           |



| 其它参数 |                                            |
| :------- | ------------------------------------------ |
| 电源     | 100V-240V 460W 自适应交流电源供应器        |
| 机箱类型 | 微塔式                                     |
| 机箱尺寸 | 406.8×444×185mmmm                          |
| 机箱重量 | 13.8kg                                     |
| 随机附件 | 标准键盘，标准鼠标，McAfee防病毒软件15个月 |
| 其它特点 | 电缆锁机箱安全插槽，蓝牙4.0                |



# 过程

- 重新购买机器发现不理想
- 先恢复系统到初始Win8.1
- 清理机箱
- 因为黑屏导致硬盘解压失败
- 安全模式：下箭头，delete， F8，单独F8还进不去。
- 使用分区助手迁移系统到固态硬盘，参考：[如何把Windows系统从老硬盘迁移到新硬盘？](https://7dapi7.smartapps.baidu.com/pages/article/article?eid=63f236282a74080209ab3d76)
- BIOS设置从固态硬盘启动系统
  - 1st Boot Device;2nd Boot Device；3th Boot Device)，分别代表着“第一项启动、第二项启动、第三项启动”
  - 
- 排查死机问题：卸载显卡驱动，使用「Microsoft 基本显示适配器」，[Windows 10 上的 Microsoft 基本显示适配器](https://support.microsoft.com/zh-cn/windows/windows-10-%E4%B8%8A%E7%9A%84-microsoft-%E5%9F%BA%E6%9C%AC%E6%98%BE%E7%A4%BA%E9%80%82%E9%85%8D%E5%99%A8-fd1c777c-d4d5-f05a-edb1-0dc7031fd677)
- 禁止系统自动更新显卡驱动：[怎么禁止系统自动更新显卡驱动程序？](https://7dapi7.smartapps.baidu.com/pages/article/article?eid=90808022d1caa4bc91c80f8d)
- 无用的磁盘驱动器



分别试过Dell以及AMD官网提供的「AMD Radeon R9 270」的显卡驱动，安装后仍然会死机。

- [AMD Radeon™ R9 270 Drivers & Support](https://www.amd.com/zh-hans/support/graphics/amd-radeon-r9-series/amd-radeon-r9-200-series/amd-radeon-r9-270)
- [AMD Radeon R9 270 显卡驱动程序 | 驱动程序详情 | Dell 中国](https://www.dell.com/support/home/zh-cn/drivers/driversdetails?driverid=c6gn4)

驱动精灵和鲁大师检测出来的稳定版或公版显卡驱动，也均不行。







# 总结



