---
layout:		post
category:	"springboot"
title:		"springboot极简教程012-RESTful接口"
tags:		[]
---
- Content
{:toc}

整理自：https://www.imooc.com/article/28250?block_id=tuijian_wz

在前面[springboot极简教程005\-URL映射](https://www.zhupite.com/springboot/springboot%E6%9E%81%E7%AE%80%E6%95%99%E7%A8%8B005-URL%E6%98%A0%E5%B0%84.html#controller%E5%92%8Crestcontroller%E7%9A%84%E5%8C%BA%E5%88%AB)中有接触到@RestController，这个Rest就是RESTful的意思。

前后端，客户端与服务端在交互的时候最好形成一个统一的接口，一般要求是接口返回**application/json**格式，而网页返回的格式一般是**text/html**，所以要返回**application/json**格式，需要做一些配置，在springboot里是使用注解来完成的。

- 类注解 @RestController
- 方法注解 @ResponseBody

# 请求方式

## @RequestMapping
在RequestMapping的源码中提到，这种支持任意请求方式，类似于自适应。

## @GetMapping
客户端只能用 GET 方式请求，适用于查询数据

## @PostMapping
客户端只能用 POST方式请求，适用于提交数据。

## @DeleteMapping
客户端只能用 DELETE方式请求，使用于删除数据。

## @PutMapping
客户端只能用 PUT方式请求，使用于修改数据（但在实际使用中，建议还是采用POST方式较为妥当）。

# 接收参数
## @RequestParam
```java
public String getInfo(@RequestParam(name = "param", required = false, defaultValue = "param dafault value") String param)
```
- name代表提交参数名。
- required意思是这个参数是否必需，默认true，没有该参数，无法调用此方法；这里设为false，有无该参数都可以调用。
- defaultValue如果该参数值为空，那么就使用默认值。

## @PathVariable
```java
@RequestMapping("/get-info/{param}")
public String getInfo(@PathVariable("param") Object param)
```
我们可以在请求方法后面直接跟值，省去了 ？参数名= ，这种一般配合 @DeleteMapping、@PutMapping使用。

## @RequestHeader
这个使用了获取提交数据的 Headers 的值。

# json数据
## 封装并提交 POST 数据
```java
@Test
public void testPostData() {
    // int
    int pInt = 0;
    // String
    String pString = "String";
    // String []
    String [] pStrings = {"String [0]", "String [1]"};
    // List
    List<String> pLists = List.of("list[0]", "list[1]");
    // 。。

    Map<String, Object> params = new HashMap<>();
    params.put("p-int", pInt);
    params.put("p-string", pString);
    params.put("p-strings", pStrings);
    params.put("p-list", pLists);

    String url = "http://localhost:8080/api/get-info";

    try {
        String rs = HttpUtil.post(url, null, params);
        System.out.println(rs);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

## 获取POST提交的数据
```java
@RestController
@RequestMapping("/api")
public class APIController {

    @PostMapping("/get-info")
    public String getInfo(HttpServletRequest request) {

        try {
            String jsonStr = RequestUtil.getPostData(request);
            System.out.println(jsonStr);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return "";
    }
}
```