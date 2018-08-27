---
layout:		post
category:	"android"
title:		"Xposed源码学习之XposedInstaller"
tags:		[hook,xposed]
---
- Content
{:toc}


## 从XposedInstaller开始
XposedInstaller仅为一个安装器，主要是用户操作界面。核心代码在assets目录下、arm和x86目录下，这些才是比较核心的东西。当然这里分析还是一步步来，由简入难。

安装后运行：
/data/data/de.robv.android.xposed.installer/bin目录下：
XposedBridge.jar.newversion
app_process

安装框架后替换/system/bin/app_process，原始app_process备份为：app_process.orig


们就直接拿源码与xposed中的app_main.cpp进行对比。
源码地址：/frameworks/base/cmds/app_process/app_main.cpp

## XposedInstaller（1）从manifest开始XposedApp
分析最简单的开始方式就是从manifest入手，找到application为：XposedApp，主启动类为：WelcomeActivity。
这一节先从XposedApp开始分析，后一节分析WelcomeActivity。

XposedApp实现了ActivityLifecycleCallbacks接口，主要用以在activity的生命周期发生变化时能收到相应的通知。
主要是在onCreate中进行一些初始化操作，一些封装的函数和实现方法比较值得学习和借鉴。

创建并设置文件权限：FileUtils.setPermissions
```java
private void createDirectories() {
    mkdirAndChmod("bin", 00771);
    mkdirAndChmod("conf", 00771);
    mkdirAndChmod("log", 00771);
}

private void mkdirAndChmod(String dir, int permissions) {
    dir = BASE_DIR + dir;
    new File(dir).mkdir();
    FileUtils.setPermissions(dir, permissions, -1, -1);
}
```

在主线程中运行线程：
```java
public static void runOnUiThread(Runnable action) {
    if (Thread.currentThread() != mUiThread) {
        mMainHandler.post(action);
    } else {
        action.run();
    }
}
```
mUiThread在onCreate中初始化为主线程：mUiThread = Thread.currentThread();
后面判断当前线程是否是主线程，如果不是的话调用post方式，在子线程中利用主线程的Handler的post()方法，更改UI这个在子线程中sendMessage()原理和形式都很类似，具体参考：Handler详解系列(五)——Handler的post()方法详解

静态函数getActiveXposedVersion提供了类似“接口”的功能，在动态运行时由XposedBridge进行hook掉返回当前xposed的版本号。

```java
checkCallingOrSelfPermission(Manifest.permission.INTERNET) != PackageManager.PERMISSION_GRANTED
```
判断自己或者其它调用者是否有 permission 权限 。

setProgressBarIndeterminateVisibility显示不带进度的进度条，具体示例参考：[android学习笔记32：标题栏进度条 \- CSDN博客](https://blog.csdn.net/hn307165411/article/details/7180534)


## XposedInstaller（2）从manifest开始WelcomeActivity
上一节分析了XposedApp，这一节继续分析WelcomeActivity。

WelcomeActivity继承自XposedBaseActivity，并实现了两个接口类：ModuleListener, RepoListener，主要用以接受一些通知。
XposedBaseActivity作为该项目的基础类，实现了一些样式风格的功能，代码不是很多，主要功能还是在ThemeUtil和NavUtil中，后面再分析。

WelcomeActivity界面：略

布局设计确实一个TextView加一个ListView，其中框架、模块、下载、设置、日志、关于均为ListView的一个Item。
```xml
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="6dp"
    tools:context=".WelcomeActivity" >

    <TextView
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginBottom="8dp"
        android:gravity="center"
        android:text="@string/welcome"
        android:textSize="18sp" />

    <ListView
        android:id="@+id/welcome_list"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:clipToPadding="false"
        android:divider="@null"
        android:dividerHeight="0dp" >
    </ListView>

</LinearLayout>
```

Item的设计比较直观:
```java
class WelcomeItem {
    public final String title;
    public final String description;

    protected WelcomeItem(int titleResId, int descriptionResId) {
        this.title = getString(titleResId);
        this.description = getString(descriptionResId);
    }

    @Override
    public String toString() {
        return title;
    }
}
```

添加Item也比较直观：
```java
mAdapter = new WelcomeAdapter(this);
// TODO add proper description texts and load them from resources, add icons, make it more fancy, ...
mAdapter.add(new WelcomeItem(R.string.tabInstall, R.string.tabInstallDescription));
mAdapter.add(new WelcomeItem(R.string.tabModules, R.string.tabModulesDescription));
mAdapter.add(new WelcomeItem(R.string.tabDownload, R.string.tabDownloadDescription));
mAdapter.add(new WelcomeItem(R.string.tabSettings, R.string.tabSettingsDescription));
mAdapter.add(new WelcomeItem(R.string.tabLogs, R.string.tabLogsDescription));
mAdapter.add(new WelcomeItem(R.string.tabAbout, R.string.tabAboutDescription));
点击Item的响应代码：
ListView lv = (ListView) findViewById(R.id.welcome_list);
lv.setAdapter(mAdapter);
lv.setOnItemClickListener(new OnItemClickListener() {
    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        Intent intent = new Intent(WelcomeActivity.this, XposedInstallerActivity.class);
        intent.putExtra(XposedInstallerActivity.EXTRA_SECTION, position);
        intent.putExtra(NavUtil.FINISH_ON_UP_NAVIGATION, true);
        startActivity(intent);
        NavUtil.setTransitionSlideEnter(WelcomeActivity.this);
    }
});
```

把选择的Item的position作为参数传递给XposedInstallerActivity并启动，因此后面一节应当分析**XposedInstallerActivity**。
setTransitionSlideEnter作为一种进出效果，后面分析util功能的时候一并细述。

最后添加当前对象到监听列表里去，方便接受通知：
```java
ModuleUtil.getInstance().addListener(this);
mRepoLoader.addListener(this, false);
```

因此还要实现一些监听通知的接口：
```java
@Override
public void onInstalledModulesReloaded(ModuleUtil moduleUtil) {
    notifyDataSetChanged();
}

@Override
public void onSingleInstalledModuleReloaded(ModuleUtil moduleUtil, String packageName, InstalledModule module) {
    notifyDataSetChanged();
}

@Override
public void onRepoReloaded(RepoLoader loader) {
    notifyDataSetChanged();
}
```
主要用于更新ListView。

ListView的Item布局文件并不是一个标题对应一个描述那么简单，其实还隐藏了一些TextView，主要用于显示异常信息的，默认是GONE状态，一旦有异常出现就显示，例如本文开头的图片中的红色字体。
```java
if (position == XposedInstallerActivity.TAB_INSTALL) {
    xposedActive = XposedApp.getActiveXposedVersion() >= InstallerFragment.getJarLatestVersion();
}
view.findViewById(R.id.txtXposedNotActive).setVisibility(!xposedActive ? View.VISIBLE : View.GONE);
```

## XposedInstaller（3）XposedInstallerActivity
XposedInstallerActivity集成自XposedDropdownNavActivity，本身代码较少，重点看下onCreate调用 的selectInitialTab，
上一节我们知道WelcomeActivity在启动XposedDropdownNavActivity时会传入一个EXTRA_SECTION参数，数值为ListView的Item索引。
```java
package de.robv.android.xposed.installer;

import java.util.HashMap;

import android.content.Intent;
import android.os.Bundle;

public class XposedInstallerActivity extends XposedDropdownNavActivity {
    public static final String EXTRA_SECTION = "section";
    public static final String EXTRA_SECTION_LEGACY = "opentab";

    private static final HashMap<String, Integer> TABS;
    static {
        TABS = new HashMap<String, Integer>(TAB_COUNT, 1);
        TABS.put("install", TAB_INSTALL);
        TABS.put("modules", TAB_MODULES);
        TABS.put("download", TAB_DOWNLOAD);
        TABS.put("logs", TAB_LOGS);
        TABS.put("settings", TAB_SETTINGS);
        TABS.put("about", TAB_ABOUT);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        selectInitialTab(getIntent(), savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt("section", getActionBar().getSelectedNavigationIndex());
    }

    private void selectInitialTab(Intent intent, Bundle savedInstanceState) {
        int selectTabIndex = -1;

        Bundle extras = intent.getExtras();
        if (extras != null) {
            Object section = extras.get(EXTRA_SECTION);
            if (section == null)
                section = extras.get(EXTRA_SECTION_LEGACY);

            if (section instanceof Integer) {
                selectTabIndex = (Integer) section;
            } else if (section instanceof String && TABS.containsKey(section)) {
                selectTabIndex = TABS.get(section);
            }
        }

        if (selectTabIndex == -1  && savedInstanceState != null)
            selectTabIndex = savedInstanceState.getInt("section", -1);

        if (selectTabIndex >= 0 && selectTabIndex < TAB_COUNT)
            getActionBar().setSelectedNavigationItem(selectTabIndex);
    }
}
```
取得到合法的索引后，看最后一句：
```java
getActionBar().setSelectedNavigationItem(selectTabIndex)
```
这个会调用ActionBar的onNavigationItemSelected或者回调，具体看看基类：XposedDropdownNavActivity。
XposedDropdownNavActivity在onCreate中通过getActionBar获取ActionBar，然后设置属性以及回调：
```java
final ActionBar bar = getActionBar();
bar.setNavigationMode(ActionBar.NAVIGATION_MODE_LIST);
bar.setDisplayShowTitleEnabled(false);
bar.setDisplayHomeAsUpEnabled(true);
```
设置ActionBar为导航列表模式，图标区域可点击等，更多信息请参考：Android ActionBar使用方法


如何显示的下拉列表的内容呢：
```java
SimpleAdapter adapter = new SimpleAdapter(getActionBar().getThemedContext(),
                navigationItemList,
                android.R.layout.simple_spinner_dropdown_item,
                new String[] { "title" },
                new int[] { android.R.id.text1 });
```
回调：
```java
bar.setListNavigationCallbacks(adapter, new OnNavigationListener() {
    @Override
    public boolean onNavigationItemSelected(int itemPosition, long itemId) {
        if (currentNavItem == itemPosition)
            return true;

        if (navigateViaIntent()) {
            Intent intent = new Intent(XposedDropdownNavActivity.this, XposedInstallerActivity.class);
            intent.putExtra(XposedInstallerActivity.EXTRA_SECTION, itemPosition);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
            return true;
        }

        Map<String, Object> map = navigationItemList.get(itemPosition);
        String fragmentClass = (String) map.get("fragment_class");
        Fragment fragment = Fragment.instantiate(XposedDropdownNavActivity.this, fragmentClass);

        FragmentTransaction tx = getFragmentManager().beginTransaction();
        tx.replace(android.R.id.content, fragment);
        currentNavItem = itemPosition;
        tx.commit();

        getFragmentManager().executePendingTransactions();

        return true;
    }
});
```
也就是在XposedInstallerActivity的getActionBar().setSelectedNavigationItem(selectTabIndex)操作后会触发该回调，并显示Fragment，当然选择下来列表里的每一个项也会触发。这个Fragment是在Map列表里进行索引出来的，在setListNavigationCallbacks前有代码进行初始化：
```java
if (navigationItemList == null) {
    navigationItemList = new ArrayList<Map<String, Object>>();
    navigationItemList.add(makeNavigationItem(getString(R.string.tabInstall), InstallerFragment.class));
    navigationItemList.add(makeNavigationItem(getString(R.string.tabModules), ModulesFragment.class));
    navigationItemList.add(makeNavigationItem(getString(R.string.tabDownload), DownloadFragment.class));
    navigationItemList.add(makeNavigationItem(getString(R.string.tabSettings), SettingsFragment.class));
    navigationItemList.add(makeNavigationItem(getString(R.string.tabLogs), LogsFragment.class));
    navigationItemList.add(makeNavigationItem(getString(R.string.tabAbout), AboutFragment.class));
}
```
到此，逻辑就比较清晰了，选择不同的Item对应不同的类，分别为：
**InstallerFragment、ModulesFragment、DownloadFragment、SettingsFragment、LogsFragment、AboutFragment**，这个我们后面逐个分析。

最后处理菜单消息：
```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    if (item.getItemId() == android.R.id.home) {
        if (!getIntent().getBooleanExtra(NavUtil.FINISH_ON_UP_NAVIGATION, false)) {
            Intent parentIntent = getParentIntent();
            parentIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(parentIntent);
        }
        finish();
        NavUtil.setTransitionSlideLeave(this);
        return true;
    }
    return super.onOptionsItemSelected(item);
}

protected Intent getParentIntent() {
    return new Intent(this, WelcomeActivity.class);
}
```
当点击的是ActionBar的Home图标区时返回到父页面，也就是WelcomeActivity。

## XposedInstaller（4）InstallerFragment
代码有点多，界面部分就不说了，主要说说一些功能性的代码。

checkCompatibility，兼容性检查，实际上是调用了checkAppProcessCompatibility，
```java
private boolean checkAppProcessCompatibility() {
    try {
        if (APP_PROCESS_NAME == null)
            return false;

        File testFile = AssetUtil.writeAssetToCacheFile(APP_PROCESS_NAME, "app_process", 00700);
        if (testFile == null) {
            mCompatibilityErrors.add("could not write app_process to cache");
            return false;
        }

        Process p = Runtime.getRuntime().exec(new String[] { testFile.getAbsolutePath(), "--xposedversion" });

        BufferedReader stdout = new BufferedReader(new InputStreamReader(p.getInputStream()));
        String result = stdout.readLine();
        stdout.close();

        BufferedReader stderr = new BufferedReader(new InputStreamReader(p.getErrorStream()));
        String errorLine;
        while ((errorLine = stderr.readLine()) != null) {
            mCompatibilityErrors.add(errorLine);
        }
        stderr.close();

        p.destroy();

        testFile.delete();
        return result != null && result.startsWith("Xposed version: ");
    } catch (IOException e) {
        mCompatibilityErrors.add(e.getMessage());
        return false;
    }
}
```
其中APP_PROCESS_NAME在之前的代码中有初始化：
```java
private final String BINARIES_FOLDER = AssetUtil.getBinariesFolder();

public static String getBinariesFolder() {
    if (Build.CPU_ABI.startsWith("armeabi")) {
        return "arm/";
    } else if (Build.CPU_ABI.startsWith("x86")) {
        return "x86/";
    } else {
        return null;
    }
}

APP_PROCESS_NAME = BINARIES_FOLDER + "app_process_xposed_sdk15";
```

APP_PROCESS_NAME会根据Build.VERSION.SDK_INT来判断加载app_process_xposed_sdk16还是app_process_xposed_sdk15：
```java
} else if (Build.VERSION.SDK_INT == 15) {
    APP_PROCESS_NAME = BINARIES_FOLDER + "app_process_xposed_sdk15";
    isCompatible = checkCompatibility();

} else if (Build.VERSION.SDK_INT >= 16 && Build.VERSION.SDK_INT <= 19) {
    APP_PROCESS_NAME = BINARIES_FOLDER + "app_process_xposed_sdk16";
    isCompatible = checkCompatibility();

} else if (Build.VERSION.SDK_INT > 19) {
    APP_PROCESS_NAME = BINARIES_FOLDER + "app_process_xposed_sdk16";
```
AssetUtil.writeAssetToCacheFile有几层封装，实现把assets目录下的文件复制到cache目录下并修改相应权限的功能：
```java
public static File writeAssetToCacheFile(String assetName, String fileName, int mode) {
    return writeAssetToFile(assetName, new File(XposedApp.getInstance().getCacheDir(), fileName), mode);
}
public static File writeAssetToFile(String assetName, File targetFile, int mode) {
    return writeAssetToFile(null, assetName, targetFile, mode);
}

public static File writeAssetToFile(AssetManager assets, String assetName, File targetFile, int mode) {
    try {
        if (assets == null)
            assets = XposedApp.getInstance().getAssets();
        InputStream in = assets.open(assetName);
        FileOutputStream out = new FileOutputStream(targetFile);

        byte[] buffer = new byte[1024];
        int len;
        while ((len = in.read(buffer)) > 0){
            out.write(buffer, 0, len);
        }
        in.close();
        out.close();

        FileUtils.setPermissions(targetFile.getAbsolutePath(), mode, -1, -1);

        return targetFile;
    } catch (IOException e) {
        Log.e(XposedApp.TAG, "could not extract asset", e);
        if (targetFile != null)
            targetFile.delete();

        return null;
    }
}
```
也就是说把assets目录下的app_process_xposed_sdk复制为app_process。
```java
Process p = Runtime.getRuntime().exec(new String[] { testFile.getAbsolutePath(), "--xposedversion" });
```

执行app_process，参数为--xposedversion，获取app_process版本号，说明app_process为一个二进制可执行文件。
后面的代码就是读取出标准输出流和标准错误流的内容，从标准输出流中解析若存在“Xposed version: ”说明app_process运行成功。
至此，**checkAppProcessCompatibility的功能就比较清晰了：assets目录下的app_process_xposed_sdk复制为app_process到cache目录下，并传递参数--xposedversion运行，运行成功则说明app_process是兼容的。**

refreshVersions获取版本信息并更新显示，主要调用了getInstalledAppProcessVersion、getLatestAppProcessVersion、getJarInstalledVersion、getJarLatestVersion：
```java
private int getInstalledAppProcessVersion() {
    try {
        return getAppProcessVersion(new FileInputStream("/system/bin/app_process"));
    } catch (IOException e) {
        return 0;
    }
}

private int getLatestAppProcessVersion() {
    if (APP_PROCESS_NAME == null)
        return 0;

    try {
        return getAppProcessVersion(getActivity().getAssets().open(APP_PROCESS_NAME));
    } catch (Exception e) {
        return 0;
    }
}

private int getAppProcessVersion(InputStream is) throws IOException {
    BufferedReader br = new BufferedReader(new InputStreamReader(is));
    String line;
    while ((line = br.readLine()) != null) {
        if (!line.contains("Xposed"))
            continue;
        Matcher m = PATTERN_APP_PROCESS_VERSION.matcher(line);
        if (m.find()) {
            is.close();
            return ModuleUtil.extractIntPart(m.group(1));
        }
    }
    is.close();
    return 0;
}
```
直接读取二进制文件进行解析版本号也实在是够高的，正则匹配表达式：
```java
private static Pattern PATTERN_APP_PROCESS_VERSION = Pattern.compile(".*with Xposed support \\(version (.+)\\).*");
```
我们用UE打开app_process_xposed_sdk，查找Xposed：
图片内容：with Xposed support (verson 58)..ro.build

按照正则表达式的规则应该是获取58。


```java
public static int getJarInstalledVersion() {
    try {
        if (new File(JAR_PATH_NEWVERSION).exists())
            return getJarVersion(new FileInputStream(JAR_PATH_NEWVERSION));
        else
            return getJarVersion(new FileInputStream(JAR_PATH));
    } catch (IOException e) {
        return 0;
    }
}

public static int getJarLatestVersion() {
    if (JAR_LATEST_VERSION == -1) {
        try {
            JAR_LATEST_VERSION = getJarVersion(XposedApp.getInstance().getAssets().open("XposedBridge.jar"));
        } catch (IOException e) {
            JAR_LATEST_VERSION = 0;
        }
    }
    return JAR_LATEST_VERSION;
}

private static int getJarVersion(InputStream is) throws IOException {
    JarInputStream jis = new JarInputStream(is);
    JarEntry entry;
    try {
        while ((entry = jis.getNextJarEntry()) != null) {
            if (!entry.getName().equals("assets/VERSION"))
                continue;

            BufferedReader br = new BufferedReader(new InputStreamReader(jis));
            String version = br.readLine();
            is.close();
            br.close();
            return ModuleUtil.extractIntPart(version);
        }
    } finally {
        try {
            jis.close();
        } catch (Exception e) { }
    }
    return 0;
}
```
JAR_PATH_NEWVERSION的路径：
```xml
public static final String BASE_DIR = "/data/data/de.robv.android.xposed.installer/";
private static final String JAR_PATH = XposedApp.BASE_DIR + "bin/XposedBridge.jar";
private static final String JAR_PATH_NEWVERSION = JAR_PATH + ".newversion";
```

在安装的时候调用install，会把assets目录下的XposedBridge.jar复制到路径为JAR_PATH_NEWVERSION的文件，后面再分析install函数。
getJarVersion实际上是解析XposedBridge.jar包中assets路径下的VERSION文件内容：
图片内容：XposedBridge.zip\assets压缩目录下的VERSION文件内容为54

refreshVersions将版本信息获取到后显示：
就是xposed框架每次激活时显示的app_process为58，XposedBridge.jar为54。

激活部分显示的是当前安装的版本，程序自带部分显示的是APK包中的文件版本，可见上图中app_process安装成功而XposedBridge.jar没有安装成功。

“安装”的click响应代码，实现异步处理，单身由于使用了runOnUiThread可以直接更新UI界面：
```java
if (isCompatible) {
    btnInstall.setOnClickListener(new AsyncClickListener(btnInstall.getText()) {
        @Override
        public void onAsyncClick(View v) {
            final boolean success = install();
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    refreshVersions();
                    if (success)
                       ...
                }
            });
        }
    });
}
```

对话框代码封装的比较易用：
```java
btnReboot.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        areYouSure(R.string.reboot, new AsyncDialogClickListener(btnReboot.getText()) {
            @Override
            public void onAsyncClick(DialogInterface dialog, int which) {
                reboot(null);
            }
        });
    }
});

private void areYouSure(int messageTextId, DialogInterface.OnClickListener yesHandler) {
    new AlertDialog.Builder(getActivity())
    .setTitle(messageTextId)
    .setMessage(R.string.areyousure)
    .setIconAttribute(android.R.attr.alertDialogIcon)
    .setPositiveButton(android.R.string.yes, yesHandler)
    .setNegativeButton(android.R.string.no, null)
    .create()
    .show();
}
```

reboot、softReboot包括install后面再分析。

哪些不兼容的rom：
```java
if (new File("/system/framework/core.jar.jex").exists()) {
    issueName = "Aliyun OS";
    issueLink = "http://forum.xda-developers.com/showpost.php?p=52289793&postcount=5";

} else if (new File("/data/miui/DexspyInstaller.jar").exists() || checkClassExists("miui.dexspy.DexspyInstaller")) {
    issueName = "MIUI/Dexspy";
    issueLink = "http://forum.xda-developers.com/showpost.php?p=52291098&postcount=6";

} else if (mHadSegmentationFault) {
    issueName = "Segmentation fault";
    issueLink = "http://forum.xda-developers.com/showpost.php?p=52292102&postcount=7";

} else if (checkClassExists("com.huawei.android.content.res.ResourcesEx")
        || checkClassExists("android.content.res.NubiaResources")) {
    issueName = "Resources subclass";
    issueLink = "http://forum.xda-developers.com/showpost.php?p=52801382&postcount=8";
}
```

```xml
<string name="install_known_issue">Xposed 与您的 ROM 似乎存在已知的问题 (\"%s\")。安装 Xposed 可能无法正常工作，或是引发一系列问题。点击这里获知详情。</string>
```

其中检查类是否存在的函数checkClassExists：
```java
private static boolean checkClassExists(String className) {
    try {
        Class.forName(className);
        return true;
    } catch (ClassNotFoundException e) {
        return false;
    }
}
```

后面分析一些功能性代码。
startShell获取root权限，具体调用了mRootUtil.startShell()：
```java
/**
 * Starts an interactive shell with root permissions.
 * Does nothing if already running.
 *
 * @return true if root access is available, false otherwise
 */
public synchronized boolean startShell() {
    if (mShell != null) {
        if (mShell.isRunning())
            return true;
        else
            dispose();
    }

    mCallbackThread = new HandlerThread("su callback listener");
    mCallbackThread.start();

    mCommandRunning = true;
    mShell = new Shell.Builder()
        .useSU()
        .setHandler(new Handler(mCallbackThread.getLooper()))
        .setWantSTDERR(true)
        .setWatchdogTimeout(10)
        .open(commandResultListener);

    waitForCommandFinished();

    if (mLastExitCode != OnCommandResultListener.SHELL_RUNNING) {
        dispose();
        return false;
    }

    return true;
}
```

RootUtil使用了三方库eu.chainfire.libsuperuser，源码中使用的jar包是libs目录下的libsuperuser-185868.jar。
这个startShell封装得比较好，可以直接拿来使用。

install函数首先调用startShell获取root权限，读取安装方式，因为xposed提供了三种安装方式：图片，也即：
- 经典（直接写入/system） 默认
- recovery（自动刷zip包）
- recovery（只将zip写入SD卡以手动刷入）


安装界面显示的信息也是函数install输出的：图片略。

经典安装模式：
```java
if (installMode == INSTALL_MODE_NORMAL) {
    // Normal installation
    messages.add(getString(R.string.file_mounting_writable, "/system"));
    if (mRootUtil.executeWithBusybox("mount -o remount,rw /system", messages) != 0) {
        messages.add(getString(R.string.file_mount_writable_failed, "/system"));
        messages.add(getString(R.string.file_trying_to_continue));
    }

    if (new File("/system/bin/app_process.orig").exists()) {
        messages.add(getString(R.string.file_backup_already_exists, "/system/bin/app_process.orig"));
    } else {
        if (mRootUtil.executeWithBusybox("cp -a /system/bin/app_process /system/bin/app_process.orig", messages) != 0) {
            messages.add("");
            messages.add(getString(R.string.file_backup_failed, "/system/bin/app_process"));
            return false;
        } else {
            messages.add(getString(R.string.file_backup_successful, "/system/bin/app_process.orig"));
        }

        mRootUtil.executeWithBusybox("sync", messages);
    }

    messages.add(getString(R.string.file_copying, "app_process"));
    if (mRootUtil.executeWithBusybox("cp -a " + appProcessFile.getAbsolutePath() + " /system/bin/app_process", messages) != 0) {
        messages.add("");
        messages.add(getString(R.string.file_copy_failed, "app_process", "/system/bin"));
        return false;
    }
    if (mRootUtil.executeWithBusybox("chmod 755 /system/bin/app_process", messages) != 0) {
        messages.add("");
        messages.add(getString(R.string.file_set_perms_failed, "/system/bin/app_process"));
        return false;
    }
    if (mRootUtil.executeWithBusybox("chown root:shell /system/bin/app_process", messages) != 0) {
        messages.add("");
        messages.add(getString(R.string.file_set_owner_failed, "/system/bin/app_process"));
        return false;
    }

}
```
重点函数是**executeWithBusybox**，单看使用方法就知道功能是执行命令行用的。

失败发生在文件拷贝上：

```
cp -a  /data/data/de.robv.android.xposed.installer/bin/app_process /system/bin/app_process
cp -a /system/bin/app_process /system/bin/app_process.orig
```

手动敲命令发现错误：permission denied，换用新的引擎
mount命令找到：
```
/dev/loop1 /system ext4 ro
```
是只读的，命令输入：
```
mount -o remount,rw /dev/loop1 /system
```
该命令也显示permission denied。
猜测可能是引擎问题，换用0.9的引擎mount命令找到：
```
/dev/loop0 /system ext4 rw
```
可读写，意味着不用mount，但是直接拷贝提示：No space left on device，估计还是引擎搞鬼。

我们还是继续分析流程吧，INSTALL_MODE_NORMAL安装模式主要是替换app_process，再分析下后面两种安装模式：
```java
} else if (installMode == INSTALL_MODE_RECOVERY_AUTO) {
    if (!prepareAutoFlash(messages, "Xposed-Installer-Recovery.zip"))
        return false;

} else if (installMode == INSTALL_MODE_RECOVERY_MANUAL) {
    if (!prepareManualFlash(messages, "Xposed-Installer-Recovery.zip"))
        return false;
}
```
prepareAutoFlash相当于自动刷包：
```java
private boolean prepareAutoFlash(List<String> messages, String file) {
    if (mRootUtil.execute("ls /cache/recovery", null) != 0) {
        messages.add(getString(R.string.file_creating_directory, "/cache/recovery"));
        if (mRootUtil.executeWithBusybox("mkdir /cache/recovery", messages) != 0) {
            messages.add("");
            messages.add(getString(R.string.file_create_directory_failed, "/cache/recovery"));
            return false;
        }
    }

    messages.add(getString(R.string.file_copying, file));
    File tempFile = AssetUtil.writeAssetToCacheFile(file, 00644);
    if (tempFile == null) {
        messages.add("");
        messages.add(getString(R.string.file_extract_failed, file));
        return false;
    }

    if (mRootUtil.executeWithBusybox("cp -a " + tempFile.getAbsolutePath() + " /cache/recovery/" + file, messages) != 0) {
        messages.add("");
        messages.add(getString(R.string.file_copy_failed, file, "/cache"));
        tempFile.delete();
        return false;
    }

    tempFile.delete();

    messages.add(getString(R.string.file_writing_recovery_command));
    if (mRootUtil.execute("echo \"--update_package=/cache/recovery/" + file + "\n--show_text\" > /cache/recovery/command", messages) != 0) {
        messages.add("");
        messages.add(getString(R.string.file_writing_recovery_command_failed));
        return false;
    }

    return true;
}
```

首先用ls命令执行的成功与否来判断/cache/recovery目录是否存在，不存在则执行root命令创建之，后面把assets目录下的Xposed-Disabler-Recovery.zip释放到临时目录，然后执行root命令再复制到/cache/recovery目录下，最后执行命令：
```
"echo \"--update_package=/cache/recovery/" + file + "\n--show_text\" > /cache/recovery/command"
```
这个命令的写法有点古怪，实际上是把长参数通过echo重定向的方式输出给/cache/recovery/command，意义等同于调用直接调用/cache/recovery/command并传递上面的两个参数。命令执行成功代表刷包成功。


prepareManualFlash手动刷包就比较简单了：
```java
private boolean prepareManualFlash(List<String> messages, String file) {
    messages.add(getString(R.string.file_copying, file));
    if (AssetUtil.writeAssetToSdcardFile(file, 00644) == null) {
        messages.add("");
        messages.add(getString(R.string.file_extract_failed, file));
        return false;
    }

    return true;
}
```
只负责把包释放出来，剩余的你手动去做吧哈哈。


回到install继续分析，如果是经典安装方式最后调用offerReboot请求重启：
```java
private void offerReboot(List<String> messages) {
    messages.add(getString(R.string.file_done));
    messages.add("");
    messages.add(getString(R.string.reboot_confirmation));
    showConfirmDialog(TextUtils.join("\n", messages).trim(),
        new AsyncDialogClickListener(getString(R.string.reboot)) {
            @Override
            protected void onAsyncClick(DialogInterface dialog, int which) {
                reboot(null);
            }
        }, null);
}
```
offerRebootToRecovery则根据是自动刷包还是手动刷包来提示相关操作，并请求重启。


install最后调用AssetUtil.removeBusybox()删除busybox，对应的释放代码：AssetUtil.extractBusybox()，释放的调用时机在RootUtil.executeWithBusybox中，也就是执行前先判断是否有busybox，没有则释放。
```java
public synchronized static void extractBusybox() {
    if (BUSYBOX_FILE.exists())
        return;

    AssetManager assets = null;
    if (isStaticBusyboxAvailable()) {
        try {
            PackageManager pm = XposedApp.getInstance().getPackageManager();
            assets = pm.getResourcesForApplication(mStaticBusyboxInfo.applicationInfo).getAssets();
        } catch (NameNotFoundException e) {
            Log.e(XposedApp.TAG, "could not load assets from " + STATIC_BUSYBOX_PACKAGE, e);
        }
    }

    writeAssetToFile(assets, getBinariesFolder() + "busybox-xposed", BUSYBOX_FILE, 00700);
}
```
校验busybox-xposed签名并释放。


## XposedInstaller（5）ModulesFragment
由于安装的模块是一个列表，ModulesFragment继承自ListFragment方便管理，ListFragment的使用可以参考：[ListFragment 使用ListView and 自定义Adapter \- CSDN博客](https://blog.csdn.net/yuxiaohui78/article/details/20747235)

当有安装的模块被加载时，接受通知并做处理：
```java
@Override
public void onSingleInstalledModuleReloaded(ModuleUtil moduleUtil, String packageName, InstalledModule module) {
    getActivity().runOnUiThread(reloadModules);
}

@Override
public void onInstalledModulesReloaded(ModuleUtil moduleUtil) {
    getActivity().runOnUiThread(reloadModules);
}
```
对模块按名称进行排序：
```java
private Runnable reloadModules = new Runnable() {
    public void run() {
        mAdapter.setNotifyOnChange(false);
        mAdapter.clear();
        mAdapter.addAll(mModuleUtil.getModules().values());
        final Collator col = Collator.getInstance(Locale.getDefault());
        mAdapter.sort(new Comparator<InstalledModule>() {
            @Override
            public int compare(InstalledModule lhs, InstalledModule rhs) {
                return col.compare(lhs.getAppName(), rhs.getAppName());
            }
        });
        mAdapter.notifyDataSetChanged();
    }
};
```

长按item项的菜单选择：
```java
@Override
public boolean onContextItemSelected(MenuItem item) {
    InstalledModule module = getItemFromContextMenuInfo(item.getMenuInfo());
    if (module == null)
        return false;

    switch (item.getItemId()) {
        case R.id.menu_launch:
            startActivity(getSettingsIntent(module.packageName));
            return true;

        case R.id.menu_download_updates:
            Intent detailsIntent = new Intent(getActivity(), DownloadDetailsActivity.class);
            detailsIntent.setData(Uri.fromParts("package", module.packageName, null));
            startActivity(detailsIntent);
            return true;

        case R.id.menu_support:
            NavUtil.startURL(getActivity(), RepoDb.getModuleSupport(module.packageName));
            return true;

        case R.id.menu_play_store:
            Intent i = new Intent(android.content.Intent.ACTION_VIEW);
            i.setData(Uri.parse(String.format(PLAY_STORE_LINK, module.packageName)));
            i.setPackage(PLAY_STORE_PACKAGE);
            try {
                startActivity(i);
            } catch (ActivityNotFoundException e) {
                i.setPackage(null);
                startActivity(i);
            }
            return true;

        case R.id.menu_app_info:
            startActivity(new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", module.packageName, null)));
            return true;

        case R.id.menu_uninstall:
            startActivity(new Intent(Intent.ACTION_UNINSTALL_PACKAGE,
                Uri.fromParts("package", module.packageName, null)));
            return true;
    }

    return false;
}
```
分别是：运行app，下载更新、获取支持、访问appstore，程序信息、卸载。
其中运行app功能，getSettingsIntent用以获取指定包名的启动Intent：
```java
private Intent getSettingsIntent(String packageName) {
    // taken from ApplicationPackageManager.getLaunchIntentForPackage(String)
    // first looks for an Xposed-specific category, falls back to getLaunchIntentForPackage
    PackageManager pm = getActivity().getPackageManager();

    Intent intentToResolve = new Intent(Intent.ACTION_MAIN);
    intentToResolve.addCategory(SETTINGS_CATEGORY);
    intentToResolve.setPackage(packageName);
    List<ResolveInfo> ris = pm.queryIntentActivities(intentToResolve, 0);

    if (ris == null || ris.size() <= 0) {
        return pm.getLaunchIntentForPackage(packageName);
    }

    Intent intent = new Intent(intentToResolve);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    intent.setClassName(ris.get(0).activityInfo.packageName, ris.get(0).activityInfo.name);
    return intent;
}
```

下载更新创建路径“package:包名”启动DownloadDetailsActivity。
获取支持：通过包名查询出url然后打开访问：
```java
public static void startURL(Context context, Uri uri) {
    Intent intent = new Intent(Intent.ACTION_VIEW, uri);
    intent.putExtra(Browser.EXTRA_APPLICATION_ID, context.getPackageName());

    if ("http".equals(uri.getScheme()) && "repo.xposed.info".equals(uri.getHost())) {
        Intent browser = new Intent(Intent.ACTION_VIEW, EXAMPLE_URI);
        ComponentName browserApp = browser.resolveActivity(context.getPackageManager());
        intent.setComponent(browserApp);
    }

    context.startActivity(intent);
}

public static void startURL(Context context, String url) {
    startURL(context, parseURL(url));
}
```
访问appstore的方式直接访问https://play.google.com/store/apps/details?id=包名

程序信息直接通过打开系统设置来显示：
```java
startActivity(new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
     Uri.fromParts("package", module.packageName, null)));
```

卸载程序也是直接调用系统的卸载：
```java
startActivity(new Intent(Intent.ACTION_UNINSTALL_PACKAGE,
     Uri.fromParts("package", module.packageName, null)));
```

## XposedInstaller（6）DownloadFragment
下载模块里显示可以下载使用的xposed模块列表,点击任意一项可以查看详细信息，实际上打开的是下载页面.

```java
lv.setOnItemClickListener(new OnItemClickListener() {
    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        Cursor cursor = (Cursor) mAdapter.getItem(position);
        String packageName = cursor.getString(OverviewColumnsIndexes.PKGNAME);

        Intent detailsIntent = new Intent(getActivity(), DownloadDetailsActivity.class);
        detailsIntent.setData(Uri.fromParts("package", packageName, null));
        detailsIntent.putExtra(NavUtil.FINISH_ON_UP_NAVIGATION, true);
        startActivity(detailsIntent);
        NavUtil.setTransitionSlideEnter(getActivity());
    }
});
```
选择版本号进行下载.

模块的数据来源：
```java
mAdapter.setFilterQueryProvider(new FilterQueryProvider() {
    @Override
    public Cursor runQuery(CharSequence constraint) {
        // TODO Instead of this workaround, show a "downloads disabled" message
        if (XposedApp.getInstance().areDownloadsEnabled())
            return RepoDb.queryModuleOverview(mSortingOrder, constraint);
        else
            return null;
    }
});
```
菜单项重新加载：mRepoLoader.triggerReload(true);

主要数据源操作代码在RepoLoader和RepoDb类中

## XposedInstaller（7）SettingsFragment
SettingsFragment继承自PreferenceFragment，这个作为配置选项实现起来比较简单，布局文件：
```xml
<?xml version="1.0" encoding="utf-8"?>
<PreferenceScreen xmlns:android="http://schemas.android.com/apk/res/android" >

    <PreferenceCategory
        android:key="group_installation"
        android:title="@string/settings_group_installation" >
        <de.robv.android.xposed.installer.widget.IntegerListPreference
            android:key="install_mode"
            android:title="@string/settings_install_mode"
            android:summary="%s"
            android:entries="@array/install_mode_texts"
            android:entryValues="@array/install_mode_values"
            android:defaultValue="0" />
    </PreferenceCategory>

    <PreferenceCategory
        android:key="group_download"
        android:title="@string/settings_group_download" >
        <CheckBoxPreference
            android:defaultValue="true"
            android:key="enable_downloads"
            android:summary="@string/settings_enable_downloads_summary"
            android:title="@string/settings_enable_downloads" />
        <de.robv.android.xposed.installer.widget.ListPreferenceSummaryFix
            android:key="release_type_global"
            android:title="@string/settings_release_type"
            android:summary="%s"
            android:entries="@array/release_type_texts"
            android:entryValues="@array/release_type_values"
            android:defaultValue="stable" />
    </PreferenceCategory>

    <PreferenceCategory
        android:key="group_app"
        android:title="@string/settings_group_app" >
        <de.robv.android.xposed.installer.widget.IntegerListPreference
            android:key="theme"
            android:title="@string/settings_theme"
            android:summary="%s"
            android:entries="@array/theme_texts"
            android:entryValues="@array/theme_values"
            android:defaultValue="0" />
    </PreferenceCategory>

    <PreferenceCategory
        android:key="group_experimental"
        android:title="@string/settings_group_experimental" >
        <CheckBoxPreference
            android:defaultValue="false"
            android:key="disable_resources"
            android:persistent="false"
            android:summary="@string/settings_disable_resources_summary"
            android:title="@string/settings_disable_resources" />
<!--
        <CheckBoxPreference
            android:defaultValue="false"
            android:key="performance_experiment"
            android:summary="@string/settings_performance_experiment_summary"
            android:title="@string/settings_performance_experiment" />
-->
    </PreferenceCategory>
</PreferenceScreen>
```

代码通过查找相应控件并处理对应的监听事件即可，例如：
```java
Preference prefTheme = findPreference("theme");
prefTheme.setOnPreferenceChangeListener(new OnPreferenceChangeListener() {
    @Override
    public boolean onPreferenceChange(Preference preference, Object newValue) {
        getActivity().recreate();
        return true;
    }
});
```
LogsFragment、AboutFragment略。


## 参考
- XposedInstaller开源项目地址：https://github.com/rovo89/XposedInstaller
- XposedBridge.jar开源项目地址：https://www.openhub.net/p/xposedbridge
- app_process：https://github.com/rovo89/Xposed
- [Android Hook框架Xposed原理与源代码分析 \- CSDN博客](https://blog.csdn.net/wxyyxc1992/article/details/17320911)
- [xposed源码编译与集成 \- 简书](https://www.jianshu.com/p/6471bab49cb1)
- [Android Hook神器——XPosed入门（登陆劫持演示） \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47659479)
- [Xposed源码剖析——概述 \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47659987)
- [Xposed源码剖析——app\_process作用详解 \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47829657)
- [Xposed源码剖析——Xposed初始化 \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47834077)
- [Xposed源码剖析——hook具体实现 \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47913867)
- [无需Root也能Hook？——Depoxsed框架演示 \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47954479)
- [Android上玩玩Hook？ \- CSDN博客](https://blog.csdn.net/yzzst/article/details/47318751)
- 