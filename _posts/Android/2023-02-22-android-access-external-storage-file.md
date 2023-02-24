---
layout:		post
category:	"android"
title:		"安卓访问外部存储ExternalStorage，DocumentFile及Uri"

tags:		[android]
---
- Content
{:toc}
**关键词**：安卓,权限,ExternalStorage,SDCard



Android R上分区存储的限制得到进一步加强，无论APP的`targetsdkversion`是多少，都将无法访问`Android/data`和`Android/obb`这二个应用私有目录。这无疑对会部分APP的业务场景及用户体验造成冲击，典型的如下：

- 文件管理类软件：微信、QQ传输的文件无法展示给用户以便捷使用
- 垃圾清理类软件：清理缓存功能受阻



声明 [`MANAGE_EXTERNAL_STORAGE`](https://developer.android.com/reference/android/Manifest.permission?hl=zh-cn#MANAGE_EXTERNAL_STORAGE) 权限可以使用`File`遍历除`Android/data`和`Android/obb`之外的目录。如需确定您的应用是否已获得 `MANAGE_EXTERNAL_STORAGE` 权限，请调用 [`Environment.isExternalStorageManager()`](https://developer.android.com/reference/android/os/Environment?hl=zh-cn#isExternalStorageManager())。



[android - Delete Audio From Sdcard - Stack Overflow](https://stackoverflow.com/questions/48527106/delete-audio-from-sdcard/48528465#48528465)：

```java
@Override
public void onActivityResult(int requestCode,int resultCode,Intent resultData) {
    if (resultCode != RESULT_OK)
        return;
    Uri treeUri = resultData.getData();
    DocumentFile pickedDir = DocumentFile.fromTreeUri(this, treeUri);
    grantUriPermission(getPackageName(), treeUri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
    getContentResolver().takePersistableUriPermission(treeUri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);

    DocumentFile YourAudioFile=  pickedDir.findFile("YourAudioFileNameGoesHere");


// And here you can delete YourAudioFile or do whatever you want with it

}
```



# Uri

Uri的构造： “content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3AAndroid%2Fdata”;

外部存储：content://com.android.externalstorage.documents
选择的目录树关键字：/tree/primary
选择的文件关键字：/document/primary

```java
Uri uri = Uri.parse(“content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3AAndroid%2Fdata”);
```



# DocumentFile

[DocumentFile  |  Android Developers](https://developer.android.com/reference/androidx/documentfile/provider/DocumentFile)

```java
// 包名/file目录
public static final String NOTE_BOOK_FILES_URI =
            "content://com.android.externalstorage.documents/tree/primary%3AAndroid%2Fdata/document/primary%3AAndroid%2Fdata%2Fcom.freeme.freemenote%2Ffiles";

//判断文件是否存在 DocumentFile
Uri filesUri = Uri.parse(NOTE_BOOK_FILES_URI);
boolean isExistsFilesDir = DocumentFile.fromSingleUri(mContext, filesUri).exists();

//不存在则创建 packageUri为父目录树
if (!isExistsFilesDir) {
    try {
        filesUri = DocumentsContract.createDocument(mContext.getContentResolver(), packageUri, "vnd.android.document/directory", "files");
    } catch (FileNotFoundException e) {
        e.printStackTrace();
    }
}

//复制文件 File to DocumentFile DocumentsContract
public static void fileToDocumentFile(Context context, File originFile, String fileName, Uri parentUri) {
    //String fileName = originFile.getName();
    try {
        InputStream in = new FileInputStream(originFile);
        Uri documentFile = DocumentsContract.createDocument(context.getContentResolver(), parentUri, "*/*", fileName);
        //DocumentFile写入流
        OutputStream out = context.getContentResolver().openOutputStream(documentFile);
        byte[] buf = new byte[1024];
        int len;
        while ((len = in.read(buf)) > 0) {
            out.write(buf, 0, len);
        }
        in.close();
        out.close();
    } catch (Exception e) {
        e.printStackTrace();
    }
}

// 读取DocumentFile to File
public static List<File> documentFileToFile(Context context) {
    List<File> allFile = new ArrayList<File>();
    Uri dirUri = Uri.parse(Constant.NOTE_BOOK_FILES_URI);
    DocumentFile documentFile = DocumentFile.fromTreeUri(context, dirUri);
    //遍历DocumentFile
    DocumentFile[] files = documentFile.listFiles();
    LogUtil.d(Constant.TAG, "documentFileToFile files count=" + files.length);
    for (DocumentFile file : files) {
        String fileName = file.getName();
        Uri fileUri = file.getUri();
        LogUtil.d(Constant.TAG, "documentFileToFile fileName=" + fileName + " fileUri=" + fileUri);
        try {
            //DocumentFile输入流
            InputStream in = context.getContentResolver().openInputStream(fileUri);
            File newFile = new File(Constant.BACKUP_DIR_PATH, fileName);
            OutputStream out = new FileOutputStream(newFile);
            byte[] buf = new byte[1024];
            int len;
            while ((len = in.read(buf)) > 0) {
                out.write(buf, 0, len);
            }
            in.close();
            out.close();
            allFile.add(newFile);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    return allFile;
}
```



# 参考

- [管理存储设备上的所有文件  |  Android 开发者  |  Android Developers](https://developer.android.com/training/data-storage/manage-all-files?hl=zh-cn)
- [文档访问限制](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.android.com%2Fabout%2Fversions%2F11%2Fprivacy%2Fstorage%23file-directory-restrictions)
  [授予对目录内容的访问权限](https://links.jianshu.com/go?to=https%3A%2F%2Fdeveloper.android.com%2Ftraining%2Fdata-storage%2Fshared%2Fdocuments-files%23grant-access-directory)
- [Android R 如何访问Android/data目录](https://blog.csdn.net/cmyperson/article/details/120015213?spm=1001.2014.3001.5506)
- [android 11后文件读写访问权限申请_android11获得读写文件权限_](https://blog.csdn.net/m0_63587743/article/details/128305408?spm=1001.2014.3001.5506)
- [Android高版本使用DocumentFile读写外置存储的问题](https://blog.csdn.net/toyauko/article/details/122175793?spm=1001.2014.3001.5506)
- [android - Delete Audio From Sdcard - Stack Overflow](https://stackoverflow.com/questions/48527106/delete-audio-from-sdcard/48528465#48528465)
- [Android 11 文件复制流程_android 复制文件](https://blog.csdn.net/u013936727/article/details/128022842)
- [Android11 无Root 访问data目录实现、Android11访问data目录、Android11解除data目录限制、Android11 data空白解决](https://blog.csdn.net/qq_17827627/article/details/113931692)

