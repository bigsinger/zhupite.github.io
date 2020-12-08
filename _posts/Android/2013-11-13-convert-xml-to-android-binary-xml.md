---
layout:		post
category:	"android"
title:		"How to convert XML to Android Binary XML"
tags:		[axml]
---



Figured this out using the Android packaging tool (aapt.exe)

**aapt.exe package -f -m -J src -M AndroidManifest.xml -S res -A assets -0 "" -I android.jar -F MyApp.apk**

This takes a plain xml manifest and packages it into binary XML and inserts it into the apk.

Unfortunately it requires that the resources and assets be present (if you refer to them within the manifest file itself). I also have to add any other data back into the apk file. Not ideal but it works at least

http://stackoverflow.com/questions/11367314/how-to-convert-xml-to-android-binary-xml



或使用axml开源项目：https://code.google.com/p/axml/

```java
 
import pxb.android.axml.*;
 
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
 
public class AXmlConverter {
	 public static void main(String[] args)
			    throws Exception
			  {
			    if (args.length < 2) {
			      System.err.println("AXmlConverter INxml OUTxml");
			      return;
			    }
			    new AXmlConverter().a(new File(args[0]), new File(args[1]));
			  }
 
			  void a(File a, File b) throws Exception {
			    InputStream is = new FileInputStream(a);
			    byte[] xml = new byte[is.available()];
			    is.read(xml);
			    is.close();
 
			    AxmlReader rd = new AxmlReader(xml);
			    AxmlWriter wr = new AxmlWriter();
			    rd.accept(new AxmlVisitor(wr)
			    {
			      public AxmlVisitor.NodeVisitor first(String ns, String name)		//manifest
			      {
			        return new AxmlVisitor.NodeVisitor(super.first(ns, name))
			        {
			          public AxmlVisitor.NodeVisitor child(String ns, String name)	//manifest's child nodes
			          {
			        	  if (name.equalsIgnoreCase("application")) {				//we got application node
			                  return new NodeVisitor(super.child(ns, name)) {
 
//			                    @Override
//			                    public void attr(String ns, String name, int resourceId, int type, Object obj) {
//			                      if ("http://schemas.android.com/apk/res/android".equals(ns)
//			                          && name.equals("name")) {
//			                        super.attr(ns, name, resourceId, type, "com.secapk.wrapper.MyApplication");
//			                      } else {
//			                        super.attr(ns, name, resourceId, type, obj);
//			                      }
//			                    }
			                    
			                    public void end()
			                    {
			                      super.attr("http://schemas.android.com/apk/res/android", "name", 16842755 , 
			                    		  TYPE_STRING, "com.secapk.wrapper.MyApplication");
			                      super.end();
			                    }
 
			                  };
			              }
			        	  
			              return super.child(ns, name);
			          }
			        };
			      }
			    });
			    byte[] modified = wr.toByteArray();
			    FileOutputStream fos = new FileOutputStream(b);
			    fos.write(modified);
			    fos.close();
			  }
}
```

