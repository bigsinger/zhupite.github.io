---
layout:		post
category:	"program"
title:		"C#读取命令行（控制台）进程的输出和错误"
tags:		[c#]
---

```c#
//Process.StandardOutput使用注意事项 http://blog.csdn.net/zhangweixing0/article/details/7356841
private void runCmd(string toolFile, string args)
{
    Process p;
    ProcessStartInfo psi;
    psi = new ProcessStartInfo(toolFile);
    psi.WorkingDirectory = System.AppDomain.CurrentDomain.BaseDirectory;
    psi.Arguments = args;
    psi.CreateNoWindow = true;
    psi.WindowStyle = ProcessWindowStyle.Hidden;
    psi.UseShellExecute = false;
    psi.RedirectStandardOutput = true;
    psi.RedirectStandardError = true;
    psi.StandardOutputEncoding = Encoding.UTF8;
    psi.StandardErrorEncoding = Encoding.UTF8;

    p = Process.Start(psi);

    p.OutputDataReceived += new DataReceivedEventHandler(OnDataReceived);
    p.BeginOutputReadLine();

    p.WaitForExit();

    if (p.ExitCode != 0)
    {
        LOGE(p.StandardError.ReadToEnd());
    }
    p.Close();
}

private void OnDataReceived(object Sender, DataReceivedEventArgs e)
{
    if (e.Data != null)
    {
        LOGD(e.Data);
    }
}
```
