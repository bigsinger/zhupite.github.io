---
layout:		post
category:	"program"
title:		"C#配置文件"
tags:		[c#]
---

```c#
public static class ConfigHelper {
        //依据连接串名字connectionName返回数据连接字符串  
        public static string GetConnectionStringsConfig(string connectionName) {
            //指定config文件读取
            string file = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;	//System.AppDomain.CurrentDomain.BaseDirectory;
            System.Configuration.Configuration config = ConfigurationManager.OpenExeConfiguration(file);
            string connectionString =
                config.ConnectionStrings.ConnectionStrings[connectionName].ConnectionString.ToString();
            return connectionString;
        }

        ///<summary> 
        ///更新连接字符串  
        ///</summary> 
        ///<param name="newName">连接字符串名称</param> 
        ///<param name="newConString">连接字符串内容</param> 
        ///<param name="newProviderName">数据提供程序名称</param> 
        public static void UpdateConnectionStringsConfig(string newName, string newConString, string newProviderName) {
            //指定config文件读取
            string file = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;
            Configuration config = ConfigurationManager.OpenExeConfiguration(file);

            bool exist = false; //记录该连接串是否已经存在  
            
            //如果要更改的连接串已经存在
            if (config.ConnectionStrings.ConnectionStrings[newName] != null) {
                exist = true;
            }
            
            // 如果连接串已存在，首先删除它  
            if (exist) {
                config.ConnectionStrings.ConnectionStrings.Remove(newName);
            }
           
            //新建一个连接字符串实例  
            ConnectionStringSettings mySettings = new ConnectionStringSettings(newName, newConString, newProviderName);
            
            // 将新的连接串添加到配置文件中.  
            config.ConnectionStrings.ConnectionStrings.Add(mySettings);
            
            // 保存对配置文件所作的更改  
            config.Save(ConfigurationSaveMode.Modified);
            
            // 强制重新载入配置文件的ConnectionStrings配置节  
            ConfigurationManager.RefreshSection("ConnectionStrings");
        }

        ///<summary> 
        ///返回*.exe.config文件中appSettings配置节的value项  
        ///</summary> 
        ///<param name="strKey"></param> 
        ///<returns></returns> 
        public static string getConfig(string strKey, string defaultValue = null) {
            //string file = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;
            string file = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;
            Configuration config = ConfigurationManager.OpenExeConfiguration(file);
            foreach (string key in config.AppSettings.Settings.AllKeys) {
                if (key == strKey) {
                    return config.AppSettings.Settings[strKey].Value.ToString();
                }
            }
            return defaultValue;
        }

        public static int getConfig(string key, int defaultValue) {
            string s = getConfig(key, null);
            if (string.IsNullOrEmpty(s)) {
                return defaultValue;
            }
            return int.Parse(s);
        }

        ///<summary>  
        ///在*.exe.config文件中appSettings配置节增加一对键值对  
        ///</summary>  
        ///<param name="newKey"></param>  
        ///<param name="newValue"></param>  
        public static void updateConfig(string newKey, string newValue) {
            string file = System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName;
            Configuration config = ConfigurationManager.OpenExeConfiguration(file);
            bool exist = false;
            foreach (string key in config.AppSettings.Settings.AllKeys) {
                if (key == newKey) {
                    exist = true;
                }
            }
            if (exist) {
                config.AppSettings.Settings.Remove(newKey);
            }
            config.AppSettings.Settings.Add(newKey, newValue);
            config.Save(ConfigurationSaveMode.Modified);
            ConfigurationManager.RefreshSection("appSettings");
        }
    }
```

使用时添加引用：
System.configuration、System.ServiceModel


```c#
string sOptions = ConfigHelper.GetAppConfig("options");
ConfigHelper.UpdateAppConfig("options", sOptions);
```
