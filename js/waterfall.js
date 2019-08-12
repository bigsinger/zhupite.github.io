/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

  /**
     * 内容JSON
     */
  var demoContent = [
    {
      demo_link: 'https://github.com/bigsinger/smartrun',
      img_link: 'https://github.com/bigsinger/smartrun/raw/master/images/shotcuts.png',
      code_link: 'https://github.com/bigsinger/smartrun',
      title: 'smartrun-快速启动',
      core_tech: 'C#',
      description: 'Windows下的效率工具，包含：快捷方式和工具管理，截图，提醒等功能'
    }, {
      demo_link: 'https://github.com/bigsinger/APKmenuTOOL',
      img_link: 'https://github.com/bigsinger/APKmenuTOOL/raw/master/screenshot.png',
      code_link: 'https://github.com/bigsinger/APKmenuTOOL',
      title: 'APKmenuTOOL-安卓右键工具',
      core_tech: 'Android Python C++',
      description: '一款集合复制路径，Dex转Jar，Manifest和AXML查看，APK相关信息提取、优化、签名、反编译、回编译，手机信息查看、屏幕截图等功能的综合型工具，同时本工具拥有自定义插件功能，方便使用者对本工具的功能进行扩充。'
    }, {
      demo_link: 'https://github.com/bigsinger/CustomContextMenu',
      img_link: 'https://github.com/bigsinger/CustomContextMenu/raw/master/doc/screenshot2.png',
      code_link: 'https://github.com/bigsinger/CustomContextMenu',
      title: 'CustomContextMenu-',
      core_tech: 'C# Python',
      description: '自定义系统右键菜单工具，可配置任意常用右键功能。'
    }, {
      demo_link: 'http://repo.xposed.info/module/com.bigsing.changer',
      img_link: 'https://github.com/bigsinger/AndroidIdChanger/raw/master/screenshot/1.png',
      code_link: 'https://github.com/bigsinger/AndroidIdChanger',
      title: 'AndroidIdChanger-安卓改机工具',
      core_tech: 'Android Xposed',
      description: '查看并修改安卓手机设备信息：IMEI、AndroidID、Wifi Mac、SerialNum、Wifi SSID、手机号、Bluetooth Mac、Google Ad Id、Wifi BSSID、IMSI、Sim卡状态、运营商信息、机器型号、制造商、品牌、系统版本、CPU_ABI、CPU_ABI2、SDK、BuildID、分辨率、IP等。'
    }
  ];

  contentInit(demoContent) //内容初始化
  waitImgsLoad() //等待图片加载，并执行布局初始化
}());

/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
  // var htmlArr = [];
  // for (var i = 0; i < content.length; i++) {
  //     htmlArr.push('<div class="grid-item">')
  //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
  //     htmlArr.push('<img src="'+content[i].img_link+'">')
  //     htmlArr.push('</a>')
  //     htmlArr.push('<h3 class="demo-title">')
  //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
  //     htmlArr.push('</h3>')
  //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
  //     htmlArr.push('<p>'+content[i].description)
  //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
  //     htmlArr.push('</p>')
  //     htmlArr.push('</div>')
  // }
  // var htmlStr = htmlArr.join('')
  var htmlStr = ''
  for (var i = 0; i < content.length; i++) {
    htmlStr += '<div class="grid-item">' + '   <a class="a-img" href="' + content[i].demo_link + '">' + '       <img src="' + content[i].img_link + '">' + '   </a>' + '   <h3 class="demo-title">' + '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' + '   </h3>' + '   <p>主要技术：' + content[i].core_tech + '</p>' + '   <p>' + content[i].description + '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' + '   </p>' + '</div>'
  }
  var grid = document.querySelector('.grid')
  grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
  var imgs = document.querySelectorAll('.grid img')
  var totalImgs = imgs.length
  var count = 0
  //console.log(imgs)
  for (var i = 0; i < totalImgs; i++) {
    if (imgs[i].complete) {
      //console.log('complete');
      count++
    } else {
      imgs[i].onload = function() {
        // alert('onload')
        count++
        //console.log('onload' + count)
        if (count == totalImgs) {
          //console.log('onload---bbbbbbbb')
          initGrid()
        }
      }
    }
  }
  if (count == totalImgs) {
    //console.log('---bbbbbbbb')
    initGrid()
  }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
  var msnry = new Masonry('.grid', {
    // options
    itemSelector: '.grid-item',
    columnWidth: 250,
    isFitWidth: true,
    gutter: 20
  })
}
