---
layout:		post
category:	"springboot"
title:		"springboot极简教程005-URL映射"
tags:		[]
---
- Content
{:toc}

我发现在很多springboot教程里几乎没有提到过URL映射，主要是很简单，看看代码基本上就明白了，我这里简单说一说，也说一说与Django的一点区别。

# @RequestMapping注册URL映射
在Django中URL的映射是靠project里urls.py中的**urlpatterns**配置的，先说说Django怎么处理请求：
- 一旦生成url页面请求，请求传递到urls.py；
- Django去urlpatterns中匹配链接（Django会在匹配到的第一个就停下来）；
- 一旦匹配成功，就会去执行，path后面的方法，Django便会给出相应的view页面（该页面可以为一个Python的函数，或者基于view（Django内置的）的类），也就是用户看到的页面；
- 若匹配失败，则出现错误的页面。

类似地，在springboot中也要有一个URL映射关系，这样用户在访问URL链接时才能执行不同的**逻辑**， 这里提到的逻辑正是MCV模式里说的控制层（C层），因此URL的映射跟控制层有很大关联，在springboot里是在控制层直接通过注解的方式来完成的。通常的做法是：
- 创建一个名为controller的包
- 然后在这个包下创建各种Controller
- 通过注解 **@RequestMapping** 来注册，实现URL的映射（也即访问URL时所执行的函数）。

可以先看一个简单的例子：
```java
@RestController
@EnableAutoConfiguration
public class HelloController {
    @Value("${version}")
    private String version;

    @Autowired
    private StudentProperties student_default;

    @Autowired
    private StudentTestBean student_test;

    @RequestMapping("/student")
    private String student(String name, Integer age) {
        if (name == null) {
            name = student_default.getName();
        }
        if (age == null) {
            age = student_default.getAge();
        }
        return String.format("Online: %s\nname: %s, age: %d\nname(Test): %s, age(Test): %d", version, name, age, student_test.getName(), student_test.getAge());
    }
}
```

通过@RequestMapping将**/student**映射到了HelloController的student函数，在运行项目时会看到springboot的输出日志：
```java
2018-10-30 14:57:08.116  INFO 13692 --- [           main] s.w.s.m.m.a.RequestMappingHandlerMapping : Mapped "{[/student]}" onto private java.lang.String com.example.useconfigurationproperties.HelloController.student(java.lang.String,java.lang.Integer)
```
在访问http://localhost:8080/student时，会调用HelloController的student函数。
> @RequestMapping中的method没有默认值，如果不配置method，则以任何请求形式（RequestMethod.GET、RequestMethod.POST、RequestMethod.PUT、RequestMethod.DELETE）都可以访问得到。

这种设计方法稍微有点混乱，没有Django这种配置一个通用的表来的方便，Django的url映射关系很容易对比查看。而springboot的这种注解的方式就分散的比较零散，有时需要各个Controller点开查看。当然，也有一个稍微折中的办法，就是可以在Controller类上映射某个子目录URL，由该Controller类统一管理该子URL下的其他子URL，也就是**分模块管理**的思想，里面再做映射就是绑定到具体函数了，这样的效果看上去就不会那么乱了。

例如对于以下的代码，CourseController类统一映射到了**http://localhost:8080/course**，内部函数映射如下：
- 访问http://localhost:8080/course时调用的是course函数
- 访问http://localhost:8080/course/queryCourseList时调用的是queryCourse函数
- 访问http://localhost:8080/course/add时调用的是addCourse函数
- 访问http://localhost:8080/course/update时调用的是updateCourse函数
- 访问http://localhost:8080/course/delete时调用的是deleteCourse函数

```java
@Controller
@RequestMapping("/course")
public class CourseController extends BaseController {
    @Autowired
    private CourseService courseService;
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @RequestMapping("")
    public String course(Model model) {
        model.addAttribute("ctx", getContextPath() + "/");
        return "courses";
    }

    /**
     * 查询教程列表
     *
     * @param page
     * @return
     */
    @RequestMapping(value = "/queryCourseList", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject queryCourse(Page<?> page) {
        PageHelper.startPage(page.getPage(), page.getRows());

        Map<String,Object> pageParams = new HashMap<String,Object>();
        pageParams.put("page", page.getPage());
        pageParams.put("rows", page.getRows());

        List<Course> courseList = courseService.queryList(pageParams);
        PageInfo<Course> pageInfo = new PageInfo<Course>(courseList);
        return AjaxObject.ok().put("page", pageInfo);
    }

    /**
     * 新添教程
     *
     * @param course
     */
    @RequestMapping(value = "/add", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject addCourse(@RequestBody Course course) {
        courseService.save(course);
        return AjaxObject.ok();
    }

    /**
     * 修改教程
     *
     * @param course
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject updateCourse(@RequestBody Course course) {
        logger.info(course.getAuthor() + "");
        courseService.update(course);
        return AjaxObject.ok();
    }

    /**
     * 删除教程
     *
     * @param ids
     */
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    @ResponseBody
    public AjaxObject deleteCourse(@RequestBody Long[] ids) {
        courseService.deleteByIds(ids);
        return AjaxObject.ok();
    }
}
```

> Spring4.3以后为简化@RequestMapping(method = RequestMethod.XXX)的写法，故而将其做了一层包装，也就是现在的GetMapping、PostMapping、PutMapping、DeleteMapping、PatchMapping。

# @Controller和@RestController的区别
> @RestController注解相当于@ResponseBody ＋ @Controller合在一起的作用。

> 如果只是使用@RestController注解Controller，则Controller中的方法无法返回jsp页面，或者html，配置的视图解析器 InternalResourceViewResolver不起作用，返回的内容就是Return 里的内容。

> 如果需要返回到指定页面，则需要用 @Controller配合视图解析器InternalResourceViewResolver才行。如果需要返回JSON，XML或自定义mediaType内容到页面，则需要在对应的方法上加上@ResponseBody注解。

> 使用@Controller 注解，在对应的方法上，视图解析器可以解析return 的jsp,html页面，并且跳转到相应页面。若返回json等内容到页面，则需要加@ResponseBody注解