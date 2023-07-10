---
layout:		post
category:	"program"
title:		"C#之Blazor用户注册登录鉴权角色管理"

tags:		[c#,blazor,net]
---
- Content
{:toc}


# 注册登录

参考 [BlazorEcommerce](https://github.com/patrickgod/BlazorEcommerce) （视频教程参考 [在 .NET 6 中使用 Blazor WebAssembly 制作电子商务网站](https://www.bilibili.com/video/BV1mr4y1a7s7)  P83 ~ P117）。



复用代码：

```
AuthService（双端）
AuthController
User
UserLogin
UserRegister
UserChangePassword
CustomAuthStateProvider
Register.razor
Login.razor
Profile.razor
```



注册登录的菜单是 `UserButton.razor`，但是没能很好地融入到工程里去，后来改为了这样使用：

```c#
<Header>
    <span class="ms-3 flex-sm-fill d-none d-sm-block">Bootstrap of Blazor</span>
    <div class="flex-fill d-sm-none">
    </div>
    <Logout ImageUrl="_content/StarAdmin.Shared/images/Argo.png" DisplayName="管理员" UserName="Admin">
        <LinkTemplate>
            <AuthorizeView>
                <Authorized>
                    <a href="profile"><i class="fa-solid fa-suitcase"></i>个人中心</a>
                    <a href="setting"><i class="fa-solid fa-cog"></i>选项设置</a>
                    <a href="message"><i class="fa-solid fa-bell"></i>消息通知<span class="badge badge-pill badge-success"></span></a>
                    <button class="dropdown-item" @onclick="Logout">退出登录</button>
                </Authorized>
                <NotAuthorized>
                    <a href="login?returnUrl=@NavigationManager.ToBaseRelativePath(NavigationManager.Uri)" class="dropdown-item">登录</a>
                    <a href="register" class="dropdown-item">注册</a>
                </NotAuthorized>
            </AuthorizeView>
        </LinkTemplate>
    </Logout>
    <Widget></Widget>
    <div class="layout-drawer" @onclick="@(e => IsOpen = !IsOpen)"><i class="fa fa-gears"></i></div>
</Header>
```



前端注册：

```c#
services.AddScoped<IAuthService, AuthService>();
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<AuthenticationStateProvider, CustomAuthStateProvider>();
```

服务端注册：

```c#
services.AddScoped<IAuthService, AuthService>();

services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(System.Text.Encoding.UTF8
                                         .GetBytes(Configuration.GetSection("AppSettings:Token").Value ?? string.Empty)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });
services.AddHttpContextAccessor();

app.UseAuthentication();
app.UseAuthorization();
```



 JWT（Json Web Token）在线解密：[jwt.io](https://jwt.io/)



# 角色管理
